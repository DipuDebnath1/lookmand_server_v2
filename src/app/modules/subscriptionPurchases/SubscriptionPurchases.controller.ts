/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SubscriptionPurchasesService from './SubscriptionPurchases.service';
import { Types } from 'mongoose';
import transactionService from '../transaction/transaction.service';

const ObjectId = Types.ObjectId;

// basic purchase subscription
const BasicSubscriptionPurchases = catchAsync(async (req, res) => {
  const { subscriptionId } = req.params;
  const { user }: any = req;

  if (!ObjectId.isValid(subscriptionId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');
  }

  const subscriptionPurchase =
    await SubscriptionPurchasesService.subscriptionPurchase(
      user?._id,
      subscriptionId,
      true, // Check for basic subscription purchase
      true, // Only allow basic subscription purchase
    );

  sendResponse(res, {
    data: subscriptionPurchase,
    message: 'Subscription purchased successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

// paid subscription
const PaidSubscriptionPurchases = catchAsync(async (req, res) => {
  const { subscriptionId } = req.params;
  const { user }: any = req;

  if (!ObjectId.isValid(subscriptionId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');

  // Proceed with purchasing the paid subscription
  const subscriptionPurchase =
    await SubscriptionPurchasesService.subscriptionPurchase(
      user?._id,
      subscriptionId,
      true, // Check for basic subscription purchase
      false, // Only allow basic subscription purchase
    );

  // create transaction for paid subscription
  await transactionService.saveTransactionInfo({
    author: user?._id,
    subscriptionPurchase: subscriptionPurchase._id,
  } as any);

  sendResponse(res, {
    data: subscriptionPurchase,
    message: 'Subscription purchased successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

// provider subscription current plan controller
const ProviderSubscriptionCurrentPlan = catchAsync(async (req, res) => {
  const { user }: any = req;

  const subscriptions =
    await SubscriptionPurchasesService.getProviderSubscriptionCurrentPlan(
      user._id,
    );
  sendResponse(res, {
    data: subscriptions || {},
    message: subscriptions
      ? 'Provider subscriptions retrieved successfully'
      : 'No subscriptions found for this provider',
    statusCode: subscriptions ? httpStatus.OK : httpStatus.NOT_FOUND,
    success: subscriptions ? true : false,
  });
});

const SubscriptionPurchasesController = {
  BasicSubscriptionPurchases,
  PaidSubscriptionPurchases,
  ProviderSubscriptionCurrentPlan,
};

export default SubscriptionPurchasesController;
