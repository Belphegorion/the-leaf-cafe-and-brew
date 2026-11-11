"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Controllers
const menuCtrl = __importStar(require("./controllers/menuController"));
const orderCtrl = __importStar(require("./controllers/orderController"));
const paymentCtrl = __importStar(require("./controllers/paymentController"));
const bookingCtrl = __importStar(require("./controllers/bookingController"));
const tableCtrl = __importStar(require("./controllers/tableController"));
exports.app = (0, express_1.default)();
// Security Middlewares
exports.app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
exports.app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}));
// Body Parser
exports.app.use(express_1.default.json());
// Basic Rate Limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.app.use('/api', apiLimiter);
// Health check
exports.app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        cafe: 'The Leaf – Cafe and Brew',
        location: 'Arera Colony, Bhopal',
        timestamp: new Date().toISOString(),
    });
});
// === REST ROUTES ===
// 1. Menu
exports.app.get('/api/v1/menu/categories', menuCtrl.getCategories);
exports.app.get('/api/v1/menu/items', menuCtrl.getMenuItems);
exports.app.get('/api/v1/menu/items/:id', menuCtrl.getMenuItemById);
exports.app.patch('/api/v1/menu/items/:id/availability', menuCtrl.toggleItemAvailability);
// 2. Orders
exports.app.post('/api/v1/orders', orderCtrl.createOrder);
exports.app.get('/api/v1/orders', orderCtrl.getAllOrders);
exports.app.get('/api/v1/orders/:id', orderCtrl.getOrderById);
exports.app.patch('/api/v1/orders/:id/status', orderCtrl.updateOrderStatus);
exports.app.post('/api/v1/orders/:id/iam-here', orderCtrl.notifyArrival);
// 3. Payments
exports.app.post('/api/v1/payments/create-order', paymentCtrl.createPaymentOrder);
exports.app.post('/api/v1/payments/verify', paymentCtrl.verifyPayment);
// 4. Bookings
exports.app.post('/api/v1/bookings/lock-slot', bookingCtrl.lockSlot);
exports.app.post('/api/v1/bookings', bookingCtrl.createBooking);
exports.app.get('/api/v1/bookings', bookingCtrl.getAllBookings);
exports.app.get('/api/v1/bookings/:id', bookingCtrl.getBookingById);
exports.app.patch('/api/v1/bookings/:id/status', bookingCtrl.updateBookingStatus);
// 5. Tables & QR
exports.app.get('/api/v1/tables', tableCtrl.getTables);
exports.app.get('/api/v1/tables/:tableNumber', tableCtrl.getTableByNumber);
exports.app.post('/api/v1/tables/:tableNumber/alert', tableCtrl.triggerTableAlert);
