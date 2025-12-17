import http from 'http';
import mongoose from 'mongoose';
import socketIo, { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { logger } from './app/logger';
import config from './config';
import { soketCorsOption } from './config/corsOptions';
import socketIO from './config/socketIO'; // <-- your custom socket handler
import { verifyEmailTransport } from './config/mailService/email';
import process from 'process';

let server: http.Server;

async function main() {
  const { ipAddress, socketPort, serverPort } = config;

  try {
    // Connect to MongoDB
    await mongoose.connect(config.databaseUri);
    logger.info('Database connected successfully');

    // Start Express server
    server = app.listen(serverPort, ipAddress, () => {
      logger.info(`Listening at http://${ipAddress}:${serverPort}`);
    });

    // Initialize Socket.io server
    const socketServer = http.createServer();
    const io: SocketIOServer = new socketIo.Server(socketServer, {
      cors: soketCorsOption,
    });

    // Attach your custom socket logic
    socketIO(io);

    // Make io globally available
    globalThis.io = io;

    socketServer.listen(socketPort, ipAddress, () => {
      logger.info(`Socket.IO listening at port:${socketPort}`);
    });
  } catch (err: unknown) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
verifyEmailTransport();

main();

/**
 * Graceful exit handler
 */
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.error('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

/**
 * Unexpected error handler
 */
const unexpectedErrorHandler = (error: unknown) => {
  logger.error('Unexpected error:', error);
  exitHandler();
};

// Catch uncaught errors
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

// Extend global type for Socket.IO
declare global {
  var io: SocketIOServer;
}
