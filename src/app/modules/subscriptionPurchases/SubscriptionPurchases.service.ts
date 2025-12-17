import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import SubscriptionPurchase from './SubscriptionPurchases.model';
import calculateEndDate from '../../utils/calculateEndDate';
import Subscription from '../subscription/subscription.model';
import { setAgendaSchedule } from '../../../agenda/AgendaJobDefine';
import { Types } from 'mongoose';
import { ISubscriptionPurchasePopulated } from './subscriptionPurchases.type';

const { ObjectId } = Types;

// Main function to create a subscription purchase
const subscriptionPurchase = async (
  author: string,
  subscriptionId: string,
  checkBasicSubscription: boolean,
  onlyBasicSubscription: boolean,
) => {
  const subscription = await Subscription.findById(subscriptionId);

  // Check if subscription exists
  if (!subscription)
    throw new AppError(httpStatus.BAD_REQUEST, 'Subscription not found');

  // If onlyBasicSubscription is true, ensure the subscription is "Basic"
  if (onlyBasicSubscription && subscription.title !== 'Basic')
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Only Basic subscription can be purchased.',
    );

  // Prevent multiple purchases of the "Basic" subscription
  if (checkBasicSubscription && subscription.title === 'Basic') {
    const alreadyPurchased = await alreadyPurchasedBasicSubscription(author);
    if (alreadyPurchased) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Sorry, You can only purchase the Basic subscription once.',
      );
    }
  }

  // Calculate the endDate based on the subscription duration and type
  const endDate = calculateEndDate(
    subscription.duration,
    subscription.durationType,
  );

  // Create the subscription purchase document
  const subscriptionPurchase = await SubscriptionPurchase.create({
    author,
    subscription: subscriptionId,
    startDate: new Date(),
    endDate: endDate,
    status: 'active',
  });

  // Schedule a job to handle subscription expiration
  setAgendaSchedule('subscription expire', endDate, {
    _id: subscriptionPurchase._id,
  });

  return subscriptionPurchase;
};

// Helper function to check if a user has already purchased the "Basic" subscription
const alreadyPurchasedBasicSubscription = async (author: string) => {
  const existingPurchase = await Subscription.aggregate([
    {
      $match: {
        title: 'Basic',
      },
    },
    {
      $lookup: {
        from: 'subscriptionpurchases',
        localField: '_id',
        foreignField: 'subscription',
        as: 'purchases',
      },
    },
    {
      $unwind: '$purchases',
    },
    { $match: { 'purchases.author': new ObjectId(author) } },
  ]);

  if (existingPurchase.length > 0) {
    return true; // User has already purchased the Basic subscription
  }
  return false; // User has not purchased the Basic subscription
};

// get provider subscription current plan
const getProviderSubscriptionCurrentPlan = async (providerId: string) => {
  const res = (await SubscriptionPurchase.findOne({ author: providerId })
    .select('subscription startDate endDate status createdAt')
    .populate('subscription', 'title')
    .sort({ createdAt: -1 })) as ISubscriptionPurchasePopulated | null;

  return res;
};

// check if provider has a valid subscription
const isValidSubscription = async (providerId: string) => {
  const subscription = await getProviderSubscriptionCurrentPlan(providerId);
  if (
    !subscription || // no subscription found
    subscription === null ||
    subscription.status !== 'active' || // subscription not active
    new Date(subscription.endDate) < new Date() // subscription expired
  )
    return false; // invalid subscription

  return true; // valid subscription
};

const SubscriptionPurchasesService = {
  subscriptionPurchase,
  getProviderSubscriptionCurrentPlan,
  isValidSubscription,
};

export default SubscriptionPurchasesService;
