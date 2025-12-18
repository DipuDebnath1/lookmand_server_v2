/* eslint-disable no-undef */
import { onlineUsers } from '../config/socketIO';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { logger } from '../app/logger';
import Notification from '../app/modules/notification/notification.model';
import { SocketRoomId } from './const';

const { ObjectId } = Types;

type TSendDataToUserWithSocketId = {
  roomId: string;
  userId: string;
  data: any;
};

type TSendDataToUsersWithSocketId = {
  roomId: string;
  usersId: string[];
  data: any;
};

// socket message to specific user by socket id
const sendDataToUserWithSocketId = (payload: TSendDataToUserWithSocketId) => {
  const onlineUsersSocketId = onlineUsers.get(payload.userId);
  if (!onlineUsersSocketId) return; // user is
  try {
    io.to(onlineUsersSocketId).emit(payload.roomId, payload.data);
  } catch (error) {
    logger.error(
      `socket message sending failed Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// send data to specific users by socket id
const sendDataToUsersWithSocketId = (payload: TSendDataToUsersWithSocketId) => {
  try {
    payload.usersId.forEach((userId) => {
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit(payload.roomId, payload.data);
      }
    });
  } catch (error) {
    logger.error(
      `socket message sending to multiple users failed Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// send message to specific room
const sendDataToRoom = (roomId: string, data: any) => {
  try {
    io.emit(roomId, data);
  } catch (error) {
    logger.error(
      `socket message to room failed Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// send all online users
const sendOnlineUsers = () => {
  try {
    setTimeout(() => {
      io.emit(SocketRoomId.OnlineUsers, {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    }, 10);
  } catch (error) {
    logger.error(
      `socket onlineUsers Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// unread notification count
const sendUnreadNotificationCount = async (userId: string) => {
  try {
    const onlineUsersSocketId = onlineUsers.get(userId);

    if (!userId) return;
    const unreadNotificationCount = await Notification.countDocuments({
      author: new ObjectId(userId),
      isViewed: false,
    });

    if (!onlineUsersSocketId) return; // user is offline
    io.to(onlineUsersSocketId).emit(SocketRoomId.UnreadNotificationCount, {
      unreadNotificationCount,
    });
  } catch (error) {
    logger.error(
      `socket unreadNotificationCount Unexpected error: ${JSON.stringify(
        error,
      )}`,
    );
  }
};

const SocketService = {
  sendDataToUserWithSocketId,
  sendDataToUsersWithSocketId,
  sendDataToRoom,
  sendOnlineUsers,
  sendUnreadNotificationCount,
};

export default SocketService;
