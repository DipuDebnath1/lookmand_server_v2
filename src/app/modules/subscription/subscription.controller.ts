import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SubscriptionService from './subscription.service';
import AppError from '../../ErrorHandler/AppError';
import { Types } from 'mongoose';

const ObjectId = Types.ObjectId;

// create subscription
const CreateSubscription = catchAsync(async (req, res) => {
  const subscription = req.body;
  const result = await SubscriptionService.createSubscription(subscription);
  sendResponse(res, {
    data: result,
    message: 'Subscription created successfully',
    statusCode: httpStatus.CREATED,
    success: true,
  });
});

// get all subscriptions
const GetAllSubscriptions = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getAllSubscriptions(req.query);
  sendResponse(res, {
    data: result,
    message: 'All subscriptions retrieved successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

// get single subscription
const GetSingleSubscription = catchAsync(async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');

  const result = await SubscriptionService.getSingleSubscription(id);
  sendResponse(res, {
    data: result,
    message: 'Subscription retrieved successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

// update subscription
const UpdateSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  // validate id
  if (!ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');
  }
  await SubscriptionService.updateSubscription(id, req.body);
  sendResponse(res, {
    data: {},
    message: 'Subscription updated successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

// delete subscription
const DeleteSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;

  // validate id
  if (!ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');
  }

  await SubscriptionService.deleteSubscription(id);
  sendResponse(res, {
    data: {},
    message: 'Subscription deleted successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

const SubscriptionController = {
  CreateSubscription,
  GetAllSubscriptions,
  GetSingleSubscription,
  UpdateSubscription,
  DeleteSubscription,
};

export default SubscriptionController;
