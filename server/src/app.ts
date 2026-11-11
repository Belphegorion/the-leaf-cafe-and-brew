import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Controllers
import * as menuCtrl from './controllers/menuController';
import * as orderCtrl from './controllers/orderController';
import * as paymentCtrl from './controllers/paymentController';
import * as bookingCtrl from './controllers/bookingController';
import * as tableCtrl from './controllers/tableController';

export const app = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  })
);

// Body Parser
app.use(express.json());

// Basic Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    cafe: 'The Leaf – Cafe and Brew',
    location: 'Arera Colony, Bhopal',
    timestamp: new Date().toISOString(),
  });
});

// === REST ROUTES ===

// 1. Menu
app.get('/api/v1/menu', menuCtrl.getMenuItems);
app.get('/api/v1/menu/categories', menuCtrl.getCategories);
app.get('/api/v1/menu/items', menuCtrl.getMenuItems);
app.get('/api/v1/menu/items/:id', menuCtrl.getMenuItemById);
app.patch('/api/v1/menu/items/:id/availability', menuCtrl.toggleItemAvailability);

// 2. Orders
app.post('/api/v1/orders', orderCtrl.createOrder);
app.get('/api/v1/orders', orderCtrl.getAllOrders);
app.get('/api/v1/orders/:id', orderCtrl.getOrderById);
app.patch('/api/v1/orders/:id/status', orderCtrl.updateOrderStatus);
app.post('/api/v1/orders/:id/iam-here', orderCtrl.notifyArrival);

// 3. Payments
app.post('/api/v1/payments/create-order', paymentCtrl.createPaymentOrder);
app.post('/api/v1/payments/verify', paymentCtrl.verifyPayment);

// 4. Bookings
app.post('/api/v1/bookings/lock-slot', bookingCtrl.lockSlot);
app.post('/api/v1/bookings', bookingCtrl.createBooking);
app.post('/api/v1/bookings/confirm', bookingCtrl.createBooking);
app.get('/api/v1/bookings', bookingCtrl.getAllBookings);
app.get('/api/v1/bookings/:id', bookingCtrl.getBookingById);
app.patch('/api/v1/bookings/:id/status', bookingCtrl.updateBookingStatus);

// 5. Tables & QR
app.get('/api/v1/tables', tableCtrl.getTables);
app.get('/api/v1/tables/:tableNumber', tableCtrl.getTableByNumber);
app.post('/api/v1/tables/:tableNumber/alert', tableCtrl.triggerTableAlert);
