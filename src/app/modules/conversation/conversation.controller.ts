/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import conversationService from './conversation.service';
import { Types } from 'mongoose';
import SubscriptionPurchasesService from '../subscriptionPurchases/SubscriptionPurchases.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';
import { Roles } from '../user/const';
const { ObjectId } = Types;

// create a new conversation
const CreateConversation = catchAsync(async (req, res) => {
  const { user }: any = req;
  const userId = user?._id;
  const { receiverId } = req.body;

  if (!receiverId || !ObjectId.isValid(receiverId) || receiverId === userId)
    throw new Error('Invalid receiver ID');

  // if provider, check subscription
  if (
    user.role === Roles.PROVIDER &&
    !(await SubscriptionPurchasesService.haveMessageAccess(userId))
  )
    throw new AppError(
      httpStatus.FORBIDDEN,
      `You don't have message access! 
       Please subscribe to a plan.`,
    );

  const conversation = await conversationService.createConversation(
    userId,
    receiverId,
  );

  sendResponse(res, {
    success: true,
    message: 'Conversation created successfully',
    data: conversation,
    statusCode: 200,
  });
});

// get all conversations of a user
const GetAllConversations = catchAsync(async (req, res) => {
  const { user }: any = req;
  const userId = user?._id;
  const conversations = await conversationService.getAllConversations(
    userId,
    req.query,
  );
  sendResponse(res, {
    success: true,
    message: 'Conversations fetched successfully',
    data: conversations,
    statusCode: 200,
  });
});

// send message in a conversation
const SendMessageInConversation = catchAsync(async (req, res) => {
  const { user }: any = req;
  const userId = user?._id;
  const { conversationId } = req.params;

  // validate conversationId
  if (!ObjectId.isValid(conversationId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Conversation ID is required');

  // if message type is image, add url to image object
  if (req.file) {
    const imageUrl = ImageUrl(req.file);
    req.body.image = imageUrl;
  }

  // if no text or image
  if (!req.body.text && !req.body.image)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Message text or image is required',
    );

  // if provider, check subscription
  if (
    user.role === Roles.PROVIDER &&
    !(await SubscriptionPurchasesService.haveMessageAccess(userId))
  )
    throw new AppError(
      httpStatus.FORBIDDEN,
      `You don't have message access! 
       Please subscribe to a plan.`,
    );

  // send message
  await conversationService.sendMessageInConversation(
    userId,
    conversationId,
    req.body,
  );

  // send response
  sendResponse(res, {
    success: true,
    message: 'Message sent successfully',
    data: {},
    statusCode: 200,
  });
});

// get single conversation
const GetSingleConversation = catchAsync(async (req, res) => {
  const { user }: any = req;
  const userId = user?._id;
  const { conversationId } = req.params;

  if (!ObjectId.isValid(conversationId))
    throw new Error('Conversation ID is required');
  const conversationData = await conversationService.getSingleConversation(
    userId,
    conversationId,
    req.query,
  );

  sendResponse(res, {
    success: true,
    message: 'Conversation fetched successfully',
    data: conversationData,
    statusCode: 200,
  });
});

export default {
  CreateConversation,
  GetAllConversations,
  SendMessageInConversation,
  GetSingleConversation,
};
