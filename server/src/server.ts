import http from 'http';
import { app } from './app';
import { ENV } from './config/env';
import { initSocket, getIO } from './socket';

const PORT = ENV.PORT || 5000;

export const httpServer = http.createServer(app);
export const io = initSocket(httpServer);

// Graceful Shutdown Handler
let isShuttingDown = false;
const gracefulShutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown of The Leaf server...`);

  const currentIO = getIO();
  if (currentIO) {
    currentIO.close(() => {
      console.log('🔌 WebSocket engine closed.');
    });
  }

  httpServer.close(() => {
    console.log('🍃 HTTP server closed. Process exiting cleanly.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Graceful shutdown timed out after 10s. Forcefully terminating.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🍃 The Leaf – Cafe and Brew server running on http://localhost:${PORT}`);
    console.log(`📍 Pure-Vegetarian Sanctuary in Arera Colony, Bhopal`);
  });
}
