import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store';
import { BookingStatus, SeatingPreference, TableBooking } from '../../../shared/types';
import { getIO } from '../socket';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const lockSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(3, 'Time slot is required'),
  partySize: z.coerce.number().min(1).max(20),
  bookingId: z.string().optional(),
});

export const lockSlot = (req: Request, res: Response) => {
  const parsed = lockSlotSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid slot reservation request', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const { date, timeSlot, partySize, bookingId = `temp_${Date.now()}` } = parsed.data;

  const result = store.lockSlot(date, timeSlot, partySize, bookingId);
  if (!result.success) {
    throw new AppError(result.message || 'Slot currently unavailable', 409, 'SLOT_UNAVAILABLE');
  }

  res.json({
    success: true,
    message: 'Slot locked for 5 minutes during reservation checkout.',
    data: {
      bookingId,
      expiresAt: result.expiresAt,
    },
  });
};

const createBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(3, 'Time slot is required'),
  partySize: z.coerce.number().min(1).max(20),
  seatingPreference: z.enum([
    'indoor-main',
    'arched-window',
    'quiet-corner',
    'group-table',
    'indoor',
    'window',
    'quiet_corner',
    'group_table',
  ] as [SeatingPreference, ...SeatingPreference[]]).default('indoor-main'),
  guestName: z.string().min(2, 'Guest name is required'),
  guestPhone: z.string().min(10, 'Guest phone is required'),
  guestEmail: z.string().email().optional().or(z.literal('')),
  occasion: z.enum(['birthday', 'anniversary', 'date', 'meeting', 'casual', 'other']).optional(),
  specialNotes: z.string().optional(),
  preOrderId: z.string().optional(),
});

export const createBooking = (req: Request, res: Response) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid booking details', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const data = parsed.data;
  const bookingRef = `LEAF-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: TableBooking = {
    id: `BK-${Date.now()}`,
    bookingRef,
    bookingReference: bookingRef,
    date: data.date,
    timeSlot: data.timeSlot,
    partySize: data.partySize,
    seatingPreference: data.seatingPreference,
    guestName: data.guestName,
    guestPhone: data.guestPhone,
    guestEmail: data.guestEmail || '',
    occasion: data.occasion,
    specialNotes: data.specialNotes,
    specialRequests: data.specialNotes,
    preOrderId: data.preOrderId,
    status: 'confirmed',
    depositAmount: store.getSettings().tableDepositDefault,
    depositPaymentStatus: store.getSettings().tableDepositDefault > 0 ? 'paid' : 'none',
    createdAt: new Date().toISOString(),
  };

  store.createBooking(newBooking);

  const io = getIO();
  if (io) {
    io.emit('booking:new', newBooking);
  }

  // Generate RFC 5545 iCalendar string
  const icsCalendarString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Leaf Cafe and Brew//Reservation Engine//EN',
    'BEGIN:VEVENT',
    `SUMMARY:Table at The Leaf – Cafe and Brew (${bookingRef})`,
    `DESCRIPTION:Reservation for ${data.guestName} (${data.partySize} guests). 100% Pure Vegetarian Cafe in Arera Colony, Bhopal.`,
    'LOCATION:1st Floor, E7/161, E-7, Arera Colony, Bhopal, MP 462016',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  res.status(201).json({
    success: true,
    message: 'Table reservation confirmed! We look forward to hosting you.',
    data: newBooking,
    booking: newBooking,
    icsData: icsCalendarString,
  });
};

export const getBookingById = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const booking = store.getBookingById(id);
  if (!booking) {
    throw new AppError(`Booking '${id}' not found`, 404, 'NOT_FOUND');
  }
  res.json({ success: true, data: booking });
};

export const getAllBookings = (req: Request, res: Response) => {
  const date = req.query.date as string | undefined;
  const status = req.query.status as BookingStatus | undefined;
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
  const page = Math.max(1, Number(req.query.page) || 1);

  const { bookings, total } = store.getAllBookings(date, status, limit, page);

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const updateBookingStatusSchema = z.object({
  status: z.enum(['locked', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show']),
});

export const updateBookingStatus = (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = updateBookingStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid booking status', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const { status } = parsed.data;
  const before = store.getBookingById(id);
  const updated = store.updateBookingStatus(id, status);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'UPDATE_BOOKING_STATUS',
      entity: 'TableBooking',
      entityId: id,
      before: { status: before?.status },
      after: { status: updated.status },
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const io = getIO();
  if (io) {
    io.emit('booking:status-changed', { bookingId: id, status, booking: updated });
  }

  res.json({
    success: true,
    message: `Booking status updated to ${status}`,
    data: updated,
  });
};
