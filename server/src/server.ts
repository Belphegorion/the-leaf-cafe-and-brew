import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  console.log(`🔌 Client connected to The Leaf live feed: ${socket.id}`);

  // Patrons or kitchen joining specific rooms
  socket.on('join:table', (tableNumber: number) => {
    socket.join(`table_${tableNumber}`);
  });

  socket.on('join:order', (orderId: string) => {
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
