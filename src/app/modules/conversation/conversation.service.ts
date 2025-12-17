/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import QueryService from '../../../service/QueryService';
import {
  sendSocketConversation,
  sendSocketMessage,
} from '../../../service/socketService';
import AppError from '../../ErrorHandler/AppError';
import Conversation from './conversation.model';
import Message from './message.model';
const { ObjectId } = Types;
const ConversationQuery = new QueryService(Conversation);
const MessageQuery = new QueryService(Message);

// create a new conversation
const createConversation = async (userId: string, receiverId: string) => {
  // check if conversation already exists
  const existingConversation = await Conversation.findOne({
    users: { $all: [new ObjectId(userId), new ObjectId(receiverId)] },
    type: 'private',
    isDeleted: false,
  })
    .select('_id users type createdAt updatedAt')
    .populate([{ path: 'users', select: '_id name image' }]);

  if (existingConversation) return existingConversation;

  // create new conversation
  const res = await Conversation.create({
    users: [userId, receiverId],
    type: 'private',
  });

  // if conversation creation failed
  if (!res)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create conversation');

  const conversation = await Conversation.findById(res._id)
    .select('_id users type createdAt updatedAt')
    .populate([{ path: 'users', select: '_id name image' }]);

  // if conversation not found
  if (!conversation)
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  // emit socket event
  sendSocketConversation(res._id as string);
  return conversation;
};

//  get all conversations of a user
const getAllConversations = async (userId: string, query: any) => {
  const filters = { users: { $in: [userId] }, isDeleted: false };
  const populate = [
    {
      path: 'users',
      select: '_id name image',
      match: { _id: { $ne: new ObjectId(userId) } },
    },
    {
      path: 'lastMessage',
      select: '_id author text image type createdAt',
      populate: { path: 'author', select: 'name image' },
    },
  ];

  const sort = { updatedAt: -1 };

  const select = '_id users lastMessage type updatedAt';

  const res = await ConversationQuery.findWithQueryParams({
    filters,
    populate,
    sort: sort,
    ...query,
    select,
  });
  return res;
};

// send message to in conversation
const sendMessageInConversation = async (
  userId: string,
  conversationId: string,
  payload: { image?: string; text?: string; type: 'text' | 'image' },
) => {
  const populate = [
    {
      path: 'users',
      select: '_id name image',
      match: { _id: { $ne: new ObjectId(userId) } },
    },
    {
      path: 'lastMessage',
      select: '_id author text image type createdAt',
      populate: { path: 'author', select: 'name image' },
    },
  ];
  const select = '_id users type createdAt lastMessage';
  const conversation = await Conversation.findOne({
    _id: new ObjectId(conversationId),
    users: { $in: [new ObjectId(userId)] },
    isDeleted: false,
  })
    .select(select)
    .populate(populate);
  // if conversation not found
  if (!conversation)
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');

  // send message
  const res = await Message.create({
    conversation: new ObjectId(conversationId),
    author: new ObjectId(userId),
    ...payload,
  });

  // if message sending failed
  if (!res)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to send message');

  // update last message of conversation
  conversation.lastMessage = res._id as Types.ObjectId;
  await conversation.save();

  // get message with author details
  const message = await Message.findById(res._id)
    .select('_id author text image type createdAt')
    .populate({
      path: 'author',
      select: 'name image',
    });

  // send socket event
  sendSocketMessage(conversationId, message);
  sendSocketConversation(conversationId);

  return message;
};

// get all messages of a conversation
const getSingleConversation = async (
  userId: string,
  conversationId: string,
  query: any,
) => {
  // find conversation
  const conversation = await Conversation.findOne({
    _id: new ObjectId(conversationId),
    users: { $in: [new ObjectId(userId)] },
    isDeleted: false,
  })
    .select('_id users type createdAt')
    .lean();

  // if conversation not found
  if (!conversation)
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  const filters = {
    conversation: new ObjectId(conversationId),
    isDeleted: false,
  };
  const populate = [
    {
      path: 'author',
      select: 'name image',
    },
  ];

  const select = '_id author text image type createdAt';

  //  message query
  const res = await MessageQuery.findWithQueryParams({
    filters,
    populate,
    select,
    ...query,
  });

  return { conversation, messages: res.data, pagination: res.pagination };
};

export default {
  createConversation,
  getAllConversations,
  sendMessageInConversation,
  getSingleConversation,
};
