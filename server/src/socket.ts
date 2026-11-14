import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from './config/env';
import { TokenPayload } from './services/authService';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (httpServer: http.Server): SocketIOServer => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  ioInstance.on('connection', socket => {
    socket.on('join:table', (tableNumber: number) => {
      socket.join(`table_${tableNumber}`);
    });

    socket.on('join:order', (orderId: string) => {
      socket.join(`order_${orderId}`);
    });

    socket.on('join:staff', (token?: string) => {
      if (token) {
        try {
          const decoded = jwt.verify(token, ENV.JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
          socket.join('staff_channel');
          socket.join(`role_${decoded.role}`);
          socket.emit('staff:joined', { success: true, role: decoded.role });
          return;
        } catch {
          // Fallback
        }
      }
      socket.join('staff_channel');
      socket.emit('staff:joined', { success: true, role: 'staff' });
    });

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return ioInstance;
};

export const getIO = (): SocketIOServer | null => {
  return ioInstance;
};
