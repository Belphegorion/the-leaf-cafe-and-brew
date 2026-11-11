import { Request, Response } from 'express';
import { store } from '../services/store';
import { TableBooking } from '../../../shared/types';
import { io } from '../server';

export const lockSlot = (req: Request, res: Response) => {
  const { date, timeSlot, partySize, bookingId = `temp_${Date.now()}` } = req.body;

  if (!date || !timeSlot || !partySize) {
    return res.status(400).json({ success: false, message: 'Date, time slot, and party size are required.' });
  }

  const result = store.lockSlot(date, timeSlot, Number(partySize), bookingId);
  if (!result.success) {
    return res.status(409).json({ success: false, message: result.message });
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

export const createBooking = (req: Request, res: Response) => {
  const {
    date,
    timeSlot,
    partySize,
    seatingPreference,
    guestName,
    guestPhone,
    guestEmail,
    occasion,
    specialNotes,
    preOrderId,
  } = req.body;

  if (!date || !timeSlot || !partySize || !guestName || !guestPhone) {
    return res.status(400).json({ success: false, message: 'Missing required reservation fields.' });
  }

  const bookingRef = `LF-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: TableBooking = {
    id: `BK-${Date.now()}`,
    bookingRef,
    date,
    timeSlot,
    partySize: Number(partySize),
    seatingPreference: seatingPreference || 'indoor-main',
    guestName,
    guestPhone,
    guestEmail: guestEmail || '',
    occasion,
    specialNotes,
    preOrderId,
    status: 'confirmed',
    depositAmount: 0, // default deposit waived
    depositPaymentStatus: 'none',
    createdAt: new Date().toISOString(),
  };

  store.createBooking(newBooking);

  if (io) {
    io.emit('booking:new', newBooking);
  }

  // Generate .ics calendar download string
  const icsCalendarString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Leaf Cafe and Brew//Booking System//EN',
    'BEGIN:VEVENT',
    `SUMMARY:Table at The Leaf – Cafe and Brew (${bookingRef})`,
    `DESCRIPTION:Reservation for ${guestName} (${partySize} guests). 100% Pure Vegetarian Cafe in Arera Colony Bhopal.`,
    'LOCATION:1st Floor, E7/161, E-7, Arera Colony, Bhopal, MP 462016',
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  res.status(201).json({
    success: true,
    message: 'Reservation confirmed! A 2-hour reminder and directions have been prepared.',
    data: newBooking,
    booking: newBooking,
    icsData: icsCalendarString,
  });
};

export const getBookingById = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const booking = store.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, data: booking });
};

export const getAllBookings = (_req: Request, res: Response) => {
  const bookings = store.getAllBookings();
  res.json({ success: true, count: bookings.length, data: bookings });
};

export const updateBookingStatus = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;

  const updated = store.updateBookingStatus(id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (io) {
    io.emit('booking:status-changed', { bookingId: id, status, booking: updated });
  }

  res.json({ success: true, message: `Booking status updated to ${status}`, data: updated });
};
