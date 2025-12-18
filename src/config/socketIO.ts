/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import AppError from '../app/ErrorHandler/AppError';
import { logger } from '../app/logger';
import { accessTokenDecoded } from '../app/modules/tokens/tokenDecoded';
import { User } from '../app/modules/user';
import { SocketRoomId } from '../service/const';
import SocketService from '../service/socketService';

export const onlineUsers: Map<string, string> = new Map(); // userId -> socketId

const socketIO = (io: Server): void => {
  // Authentication middleware - runs before connection
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.headers.authorization ||
        (socket.handshake.auth as { token?: string }).token ||
        (socket.handshake.query.token as string | undefined);

      if (!token) {
        logger.warn(
          `Connection rejected: No token provided for socket ${socket.id}`,
        );
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: No token provided',
          ),
        );
      }

      // Verify JWT token and detect activity
      const decoded = accessTokenDecoded(token) as JwtPayload;

      //  Check if decoding was successful
      if (!decoded) {
        logger.warn(
          `Authentication failed: Invalid token format for socket ${socket.id}`,
        );
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: Invalid token',
          ),
        );
      }

      // You could attach decoded info to socket
      (socket as any).user = await User.findById(decoded.sub).select(
        'role isDeleted',
      );

      // Check if user exists and is not deleted
      if (!(socket as any).user || (socket as any).user.isDeleted) {
        logger.warn(
          `Authentication failed: User not found or deleted for socket ${socket.id}`,
        );
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: User not found or deleted',
          ),
        );
      }

      next(); // Allow connection
    } catch (err: unknown) {
      if (err instanceof Error) {
        logger.error(`Authentication failed: ${err.message}`);
        next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: Invalid token',
          ),
        );
      } else {
        logger.error('Authentication failed: Unknown error');
        next(new AppError(httpStatus.UNAUTHORIZED, 'Authentication error'));
      }
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user._id.toString();
    onlineUsers.set(userId, socket.id);

    logger.info(`Socket connected: ID ${socket.id} for User ID ${userId}`);

    // Send unread notification count to the connected user
    SocketService.sendUnreadNotificationCount(userId);
    // Send unread notification count to the connected user
    socket.on(SocketRoomId.UnreadNotificationCount, () =>
      SocketService.sendUnreadNotificationCount(userId),
    );
    // Notify all clients about updated online users
    SocketService.sendOnlineUsers();
    // Send online users list
    socket.on(SocketRoomId.OnlineUsers, () => SocketService.sendOnlineUsers());

    // Handle disconnection
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      // Notify all clients about updated online users
      SocketService.sendOnlineUsers();
      logger.info(`Socket disconnected: ID ${socket.id}`);
    });
  });
};

export default socketIO;
