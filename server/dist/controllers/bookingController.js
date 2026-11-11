"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getAllBookings = exports.getBookingById = exports.createBooking = exports.lockSlot = void 0;
const store_1 = require("../services/store");
const server_1 = require("../server");
const lockSlot = (req, res) => {
    const { date, timeSlot, partySize, bookingId = `temp_${Date.now()}` } = req.body;
    if (!date || !timeSlot || !partySize) {
        return res.status(400).json({ success: false, message: 'Date, time slot, and party size are required.' });
    }
    const result = store_1.store.lockSlot(date, timeSlot, Number(partySize), bookingId);
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
exports.lockSlot = lockSlot;
const createBooking = (req, res) => {
    const { date, timeSlot, partySize, seatingPreference, guestName, guestPhone, guestEmail, occasion, specialNotes, preOrderId, } = req.body;
    if (!date || !timeSlot || !partySize || !guestName || !guestPhone) {
        return res.status(400).json({ success: false, message: 'Missing required reservation fields.' });
    }
    const bookingRef = `LF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
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
    store_1.store.createBooking(newBooking);
    if (server_1.io) {
        server_1.io.emit('booking:new', newBooking);
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
        icsData: icsCalendarString,
    });
};
exports.createBooking = createBooking;
const getBookingById = (req, res) => {
    const { id } = req.params;
    const booking = store_1.store.getBookingById(id);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
};
exports.getBookingById = getBookingById;
const getAllBookings = (_req, res) => {
    const bookings = store_1.store.getAllBookings();
    res.json({ success: true, count: bookings.length, data: bookings });
};
exports.getAllBookings = getAllBookings;
const updateBookingStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = store_1.store.updateBookingStatus(id, status);
    if (!updated) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (server_1.io) {
        server_1.io.emit('booking:status-changed', { bookingId: id, status, booking: updated });
    }
    res.json({ success: true, message: `Booking status updated to ${status}`, data: updated });
};
exports.updateBookingStatus = updateBookingStatus;
