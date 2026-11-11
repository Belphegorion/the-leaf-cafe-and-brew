"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const PORT = process.env.PORT || 5000;
const httpServer = http_1.default.createServer(app_1.app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io.on('connection', socket => {
    console.log(`🔌 Client connected to The Leaf live feed: ${socket.id}`);
    // Patrons or kitchen joining specific rooms
    socket.on('join:table', (tableNumber) => {
        socket.join(`table_${tableNumber}`);
    });
    socket.on('join:order', (orderId) => {
        socket.join(`order_${orderId}`);
    });
    socket.on('disconnect', () => {
        // disconnected
    });
});
httpServer.listen(PORT, () => {
    console.log(`🍃 The Leaf – Cafe and Brew server running on http://localhost:${PORT}`);
    console.log(`📍 Pure-Vegetarian Sanctuary in Arera Colony, Bhopal`);
});
