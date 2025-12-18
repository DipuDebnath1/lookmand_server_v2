/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import conversationService from './conversation.service';
import { Types } from 'mongoose';
import SubscriptionPurchasesService from '../subscriptionPurchases/SubscriptionPurchases.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';
import BusinessProfile from '../businessProfile/businessProfile.model';
import { Roles } from '../user/const';
const { ObjectId } = Types;

// create a new conversation
const CreateConversation = catchAsync(async (req, res) => {
  const { user }: any = req;
  const userId = user?._id;
  const { receiverId } = req.body;

  if (!receiverId || !ObjectId.isValid(receiverId))
    throw new Error('Invalid receiver ID');

  const author = await BusinessProfile.findById(receiverId).select('author');

  const conversation = await conversationService.createConversation(
    userId,
    author!?.author.toString(),
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
  const { user, role }: any = req;
  const userId = user?._id;
  const { conversationId } = req.params;

  // if provider, check subscription
  if (
    role === Roles.PROVIDER &&
    !SubscriptionPurchasesService.isValidSubscription(userId)
  )
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You need an active subscription to send messages. Please subscribe to a plan.',
    );

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

  // send message
  const message = await conversationService.sendMessageInConversation(
    userId,
    conversationId,
    req.body,
  );

  // send response
  sendResponse(res, {
    success: true,
    message: 'Message sent successfully',
    data: message,
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
