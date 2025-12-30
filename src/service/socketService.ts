import { onlineUsers } from '../config/socketIO';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { logger } from '../app/logger';
import Notification from '../app/modules/notification/notification.model';
import { SocketRoomId } from './const';
import {
  IConversation,
  IMessage,
} from '../app/modules/conversation/conversation.type';

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

type TConversationPayload = {
  conversation: IConversation;
  message?: IMessage;
};

// socket message to specific user by socket id
const sendDataToUserWithSocketId = (payload: TSendDataToUserWithSocketId) => {
  try {
    const onlineUsersSocketId = onlineUsers.get(payload.userId.toString());
    if (!onlineUsersSocketId) return; // user is
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
      user: new ObjectId(userId),
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

// socket message to specific user by socket id
const sendNotificationBySocket = (payload: { userId: string; data: any }) => {
  try {
    const onlineUsersSocketId = onlineUsers.get(payload.userId.toString());
    if (!onlineUsersSocketId) return; // user is
    io.to(onlineUsersSocketId).emit(SocketRoomId.Notification, payload.data);
    // also send unread notification count
    sendUnreadNotificationCount(payload.userId);
  } catch (error) {
    logger.error(
      `socket message sending failed Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// socket message to specific user by socket id
const sendConversationDataToUserWithSocketId = (
  payload: TConversationPayload,
) => {
  try {
    payload.conversation.users.forEach((user: any) => {
      // skip sending to self
      const users = payload.conversation.users.filter(
        (u) => u._id.toString() !== user._id.toString(),
      );

      const conversationData = {
        ...payload.conversation.toObject(),
        users,
      };

      // get socket id
      const onlineUsersSocketId = onlineUsers.get(user._id.toString());

      if (!onlineUsersSocketId) return; // user is
      // send conversation data to user
      io.to(onlineUsersSocketId).emit(
        SocketRoomId.Conversation,
        conversationData,
      );

      // send new message to user
      if (payload.message)
        io.to(onlineUsersSocketId).emit(SocketRoomId.Message, {
          newMessage: payload.message,
        });
    });
  } catch (error) {
    logger.error(
      `socket message sending failed Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// export socket service
const SocketService = {
  sendDataToUserWithSocketId,
  sendDataToUsersWithSocketId,
  sendDataToRoom,
  sendOnlineUsers,
  sendUnreadNotificationCount,
  sendNotificationBySocket,
  sendConversationDataToUserWithSocketId,
};

export default SocketService;
