/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SubscriptionPurchasesService from './SubscriptionPurchases.service';
import mongoose, { Types } from 'mongoose';
import transactionService from '../transaction/transaction.service';
import Subscription from '../subscription/subscription.model';
import { transactionStatuses } from '../transaction/transation.const';

const ObjectId = Types.ObjectId;

// basic purchase subscription
const SubscriptionPurchasesWithoutPayment = catchAsync(async (req, res) => {
  //  ******** mock payment result start ********
  const paymentResult = {
    amount: 100,
    transactionId: Date.now().toString(),
    status: transactionStatuses.success,
  }; // Mock payment result
  //  ******** mock payment result end ********

  const session = await mongoose.startSession();
  session.startTransaction();
  let subscriptionPurchase;

  try {
    const { subscriptionId } = req.params;
    const { user }: any = req;

    // subscription is validations
    if (!ObjectId.isValid(subscriptionId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');
    }

    // Validate that the subscription exists
    const subscription = await Subscription.findById(subscriptionId).select(
      'title duration durationType access',
    );

    // Check if subscription exists
    if (!subscription)
      throw new AppError(httpStatus.BAD_REQUEST, 'Subscription not found');

    // Proceed with purchasing the basic subscription
    const subscriptionPurchase =
      await SubscriptionPurchasesService.subscriptionPurchase(
        {
          author: user?._id,
          subscriptionId,
          directPurchase: true,
          subscription,
          session,
        }, // Check for basic subscription purchase
      );

    // create transaction for paid subscription
    await transactionService.saveTransactionInfo(
      {
        ...paymentResult,
        author: user?._id,
        subscriptionPurchase: subscriptionPurchase[0]._id,
      } as any,
      session,
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Subscription purchase failed:: ${error}`,
    );
  } finally {
    await session.endSession();
  }
  // send response
  sendResponse(res, {
    data: subscriptionPurchase,
    message: 'Subscription purchased successfully',
    statusCode: httpStatus.OK,
    success: true,
  });
});

// paid subscription
const SubscriptionPurchasesWithPayment = catchAsync(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let subscriptionPurchase;

  try {
    const { userId, subscriptionId }: any = req.body;

    if (!ObjectId.isValid(subscriptionId))
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription id');

    // Validate that the subscription exists
    const subscription = await Subscription.findById(subscriptionId).select(
      'title duration durationType access',
    );

    // Check if subscription exists
    if (!subscription)
      throw new AppError(httpStatus.BAD_REQUEST, 'Subscription not found');

    // Proceed with purchasing the paid subscription
    subscriptionPurchase =
      await SubscriptionPurchasesService.subscriptionPurchase(
        {
          author: userId,
          subscriptionId,
          directPurchase: false,
          subscription,
          session,
        }, // direct purchase set to true for webhook
      );

    // create transaction for paid subscription
    await transactionService.saveTransactionInfo(
      {
        author: userId,
        subscriptionPurchase: subscriptionPurchase[0]._id,
      } as any,
      session,
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Subscription purchase failed:: ${error}`,
    );
  } finally {
    await session.endSession();
  }
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
  SubscriptionPurchasesWithoutPayment,
  SubscriptionPurchasesWithPayment,
  ProviderSubscriptionCurrentPlan,
};

export default SubscriptionPurchasesController;
