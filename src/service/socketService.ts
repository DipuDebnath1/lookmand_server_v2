/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../app/logger';
import Conversation from '../app/modules/conversation/conversation.model';
// send notification to specific user
export const sendSocketNotification = (
  userId: string,
  role: string | undefined,
  notification: any,
) => {
  try {
    const roomId = `notification::${
      role === 'superAdmin' ? 'superAdmin' : role === 'admin' ? 'admin' : userId
    }`;
    io.emit(roomId, notification);
  } catch (error) {
    logger.error(
      `socket notification Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// send conversation to specific users
export const sendSocketConversation = async (conversationId: string) => {
  try {
    const populate = [
      {
        path: 'users',
        select: '_id name image',
      },
      {
        path: 'lastMessage',
        select: '_id author text image type createdAt',
        populate: { path: 'author', select: 'name image' },
      },
    ];
    const conversation = await Conversation.findById(conversationId)
      .select('_id users type createdAt lastMessage')
      .populate(populate)
      .lean();

    if (!conversation)
      return logger.warn(
        `socket conversation: Conversation not found for ID ${conversationId}`,
      );

    for (const user of conversation.users || []) {
      const otherUsers = conversation.users?.filter((u) => u._id !== user._id);

      const roomId = `conversation::${user._id}`;
      io.emit(roomId, { ...conversation, users: otherUsers || [] });
    }
  } catch (error) {
    logger.error(
      `socket conversation Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};

// send conversation to specific users
export const sendSocketMessage = (conversationId: string, message: any) => {
  try {
    const roomId = `message::${conversationId}`;
    io.emit(roomId, message);
  } catch (error) {
    logger.error(`socket message Unexpected error: ${JSON.stringify(error)}`);
  }
};
