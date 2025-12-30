import {
  populateConversationPipeline,
  populateMessagePipeline,
} from './conversation.const';
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { Types } from 'mongoose';

import AppError from '../../ErrorHandler/AppError';
import Conversation from './conversation.model';
import Message from './message.model';
import {
  ConversationBaseService,
  MessageBaseService,
  UserBaseService,
} from '../../../service';
import SocketService from '../../../service/socketService';
const { ObjectId } = Types;

// create a new conversation
const createConversation = async (userId: string, receiverId: string) => {
  // check if conversation already exists
  const existingConversation = await Conversation.findOne({
    users: { $all: [new ObjectId(userId), new ObjectId(receiverId)] },
    type: 'private',
    isDeleted: false,
  })
    .select('_id users type createdAt updatedAt')
    .populate([
      {
        ...populateConversationPipeline.users,
        match: { _id: { $ne: new ObjectId(userId) } },
      },
    ]);

  if (existingConversation) return existingConversation;

  const receiver = await UserBaseService.findById(receiverId, {
    select: '_id isDeleted',
  });

  if (!receiver || receiver.isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver not found');

  // create new conversation
  const conversation = await Conversation.create({
    users: [userId, receiverId],
    type: 'private',
  });

  // if conversation creation failed
  if (!conversation)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create conversation');

  const conversationPopulate = await conversation.populate([
    {
      ...populateConversationPipeline.users,
      match: { _id: { $ne: new ObjectId(userId) } },
    },
  ]);

  // if conversation not found
  if (!conversationPopulate)
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
  // emit socket event
  return conversationPopulate;
};

//  get all conversations of a user
const getAllConversations = async (userId: string, query: any) => {
  const res = await ConversationBaseService.findMany({
    filters: { users: { $in: [userId] } },
    populate: [
      {
        ...populateConversationPipeline.users,
        match: { _id: { $ne: new ObjectId(userId) } },
      },
      populateConversationPipeline.lastMessage,
    ],
    ...query,
    select: populateConversationPipeline.felid,
  });
  return res;
};

// send message to in conversation
const sendMessageInConversation = async (
  userId: string,
  conversationId: string,
  payload: { image?: string; text?: string; type: 'text' | 'image' },
) => {
  // const populate = [
  //   {
  //     path: 'users',
  //     select: '_id name image',
  //     match: { _id: { $ne: new ObjectId(userId) } },
  //   },
  //   {
  //     path: 'lastMessage',
  //     select: '_id author text image type createdAt',
  //     populate: { path: 'author', select: 'name image' },
  //   },
  // ];
  // const select = '_id users type createdAt lastMessage';
  // const conversation = await Conversation.findOne({
  //   _id: new ObjectId(conversationId),
  //   users: { $in: [new ObjectId(userId)] },
  //   isDeleted: false,
  // })
  //   .select(select)
  //   .populate(populate);

  const conversation = await Conversation.findOne({
    _id: new ObjectId(conversationId),
    users: { $in: [new ObjectId(userId)] },
  });

  // if conversation not found
  if (!conversation)
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');

  // send message
  const message = await Message.create({
    conversation: new ObjectId(conversationId),
    author: new ObjectId(userId),
    ...payload,
  });

  // if message sending failed
  if (!message)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to send message');

  // update last message of conversation
  conversation.lastMessage = message!._id as Types.ObjectId;
  await conversation.save();

  // get message with author details
  const messagePopulate = await message.populate(
    populateMessagePipeline.author,
  );

  // get message with author details
  const conversationPopulate = await conversation.populate([
    populateConversationPipeline.users,
    populateConversationPipeline.lastMessage,
  ]);

  // emit socket event
  SocketService.sendConversationDataToUserWithSocketId({
    conversation: conversationPopulate,
    message: messagePopulate,
  });

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
    .select(populateConversationPipeline.felid)
    .lean();

  // if conversation not found
  if (!conversation)
    throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');

  //  message query
  const res = await MessageBaseService.findWithPagination({
    filters: {
      conversation: new ObjectId(conversationId),
      isDeleted: false,
    },
    populate: [populateMessagePipeline.author],
    select: populateMessagePipeline.felid,
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
