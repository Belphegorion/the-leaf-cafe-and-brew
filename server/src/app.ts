import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken, requireRoles } from './middleware/auth';

// Controllers
import * as authCtrl from './controllers/authController';
import * as menuCtrl from './controllers/menuController';
import * as orderCtrl from './controllers/orderController';
import * as paymentCtrl from './controllers/paymentController';
import * as bookingCtrl from './controllers/bookingController';
import * as tableCtrl from './controllers/tableController';
import * as adminCtrl from './controllers/adminController';

export const app = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // In development, allow localhost origins
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin === ENV.CLIENT_ORIGIN
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/audit mode
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  })
);

// Body Parser with RAW body retention for webhook signature verification
app.use(
  express.json({
    limit: '2mb',
    verify: (req: Request, _res: Response, buf: Buffer) => {
      (req as any).rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login attempts per 15 mins per IP
  message: { success: false, error: { message: 'Too many authentication attempts. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// === HEALTH & READINESS ENDPOINTS ===
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    cafe: 'The Leaf – Cafe and Brew',
    location: 'Arera Colony, Bhopal',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

const handleReady = (_req: Request, res: Response) => {
  res.json({
    status: 'ready',
    database: 'in-memory-ready',
    sockets: 'ready',
    timestamp: new Date().toISOString(),
  });
};

app.get('/ready', handleReady);
app.get('/api/ready', handleReady);

// === REST ROUTES (API v1) ===

// 0. Staff Authentication
app.post('/api/v1/auth/login', authLimiter, authCtrl.login);
app.post('/api/v1/auth/refresh', authCtrl.refresh);
app.post('/api/v1/auth/logout', authCtrl.logout);
app.get('/api/v1/auth/me', authenticateToken, authCtrl.getMe);

// 1. Menu Management
app.get('/api/v1/menu', menuCtrl.getMenuItems);
app.get('/api/v1/menu/categories', menuCtrl.getCategories);
app.get('/api/v1/menu/items', menuCtrl.getMenuItems);
app.get('/api/v1/menu/items/:id', menuCtrl.getMenuItemById);
app.post('/api/v1/menu/items', authenticateToken, requireRoles('owner', 'manager'), menuCtrl.createMenuItem);
app.put('/api/v1/menu/items/:id', authenticateToken, requireRoles('owner', 'manager'), menuCtrl.updateMenuItem);
app.delete('/api/v1/menu/items/:id', authenticateToken, requireRoles('owner', 'manager'), menuCtrl.deleteMenuItem);
app.patch('/api/v1/menu/items/:id/availability', authenticateToken, requireRoles('owner', 'manager', 'kitchen'), menuCtrl.toggleItemAvailability);
app.post('/api/v1/menu/import-csv', authenticateToken, requireRoles('owner', 'manager'), menuCtrl.importCsv);
app.get('/api/v1/menu/export-csv', authenticateToken, requireRoles('owner', 'manager'), menuCtrl.exportCsv);

// 2. Orders & Kitchen Display System (KDS)
app.post('/api/v1/orders', orderCtrl.createOrder);
app.get('/api/v1/orders', orderCtrl.getAllOrders);
app.get('/api/v1/orders/:id', orderCtrl.getOrderById);
app.patch('/api/v1/orders/:id/status', authenticateToken, requireRoles('owner', 'manager', 'kitchen', 'waiter'), orderCtrl.updateOrderStatus);
app.post('/api/v1/orders/:id/iam-here', orderCtrl.notifyArrival);

// 3. Payments & Gateway
app.post('/api/v1/payments/create-order', paymentCtrl.createPaymentOrder);
app.post('/api/v1/payments/verify', paymentCtrl.verifyPayment);
app.post('/api/v1/payments/webhook', paymentCtrl.handleWebhook);
app.post('/api/v1/payments/refund', authenticateToken, requireRoles('owner', 'manager'), paymentCtrl.processRefund);

// 4. Table Bookings & 5-Min Hold Engine
app.post('/api/v1/bookings/lock-slot', bookingCtrl.lockSlot);
app.post('/api/v1/bookings', bookingCtrl.createBooking);
app.post('/api/v1/bookings/confirm', bookingCtrl.createBooking);
app.get('/api/v1/bookings', bookingCtrl.getAllBookings);
app.get('/api/v1/bookings/:id', bookingCtrl.getBookingById);
app.patch('/api/v1/bookings/:id/status', authenticateToken, requireRoles('owner', 'manager', 'waiter'), bookingCtrl.updateBookingStatus);

// 5. Tables & Contactless Dining Alerts
app.get('/api/v1/tables', tableCtrl.getTables);
app.get('/api/v1/tables/:tableNumber', tableCtrl.getTableByNumber);
app.post('/api/v1/tables/:tableNumber/alert', tableCtrl.triggerTableAlert);

// 6. Administrative Analytics, Settings & Audit Logs
app.get('/api/v1/admin/reports', authenticateToken, requireRoles('owner', 'manager'), adminCtrl.getReports);
app.get('/api/v1/admin/reports/export-csv', authenticateToken, requireRoles('owner', 'manager'), adminCtrl.exportReportsCsv);
app.get('/api/v1/admin/audit-logs', authenticateToken, requireRoles('owner', 'manager'), adminCtrl.getAuditLogs);
app.get('/api/v1/admin/settings', authenticateToken, requireRoles('owner', 'manager'), adminCtrl.getSettings);
app.patch('/api/v1/admin/settings', authenticateToken, requireRoles('owner'), adminCtrl.updateSettings);

// 404 Fallback Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
});

// Central Error Handler
app.use(errorHandler);
