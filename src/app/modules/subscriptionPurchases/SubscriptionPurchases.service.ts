import httpStatus from 'http-status';
import { setAgendaSchedule } from '../../../agenda/AgendaJobDefine';
import { AgendaJobNames } from '../../../agenda/const';
import AppError from '../../ErrorHandler/AppError';
import calculateEndDate from '../../utils/calculateEndDate';
import {
  SubscriptionAccessFeatures,
  SubscriptionDirectPurchasePermission,
  SubscriptionPackageName,
} from '../subscription/const';
import { SubscriptionPurchaseStatus } from './const';
import SubscriptionPurchase from './SubscriptionPurchases.model';
import { ISubscriptionPurchasePopulated } from './subscriptionPurchases.type';
import { ISubscription } from '../subscription/subscription.type';
import mongoose from 'mongoose';

// Main function to create a subscription purchase
const subscriptionPurchase = async (payload: {
  author: string;
  subscriptionId: string;
  directPurchase: boolean;
  subscription: Partial<ISubscription>;
  session: mongoose.ClientSession | null;
}) => {
  // const subscription = await Subscription.findById(subscriptionId).select(
  //   'title duration durationType access',
  // );

  // // Check if subscription exists
  // if (!subscription)
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Subscription not found');

  // If it's a direct purchase, check if the subscription allows it
  if (
    payload.directPurchase &&
    !Object.keys(SubscriptionDirectPurchasePermission).includes(
      payload.subscription.title as string,
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'need payment for this subscription',
    );
  }

  // check is active any subscription purchase exists can't purchase basic

  if (payload.subscription.title === SubscriptionPackageName.Basic) {
    //
    const existingActivePurchase = await SubscriptionPurchase.findOne({
      author: payload.author,
      status: SubscriptionPurchaseStatus.active,
      endDate: { $gt: new Date() },
    });

    //
    if (existingActivePurchase) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You already have an active subscription',
      );
    }
  }

  // Calculate the endDate based on the subscription duration and type
  const endDate = calculateEndDate(
    payload!.subscription!.duration!,
    payload!.subscription!.durationType!,
  );

  const subscriptionPurchaseCreatePayload = {
    author: payload.author,
    subscription: payload.subscriptionId,
    startDate: new Date(),
    endDate: endDate,
    access: payload.subscription.access,
    status: SubscriptionPurchaseStatus.active,
  };

  // Create the subscription purchase document
  const subscriptionPurchase = await SubscriptionPurchase.create(
    [subscriptionPurchaseCreatePayload],
    {
      session: payload.session || undefined,
    },
  );

  // Schedule a job to handle subscription expiration
  setAgendaSchedule(AgendaJobNames.SubscriptionExpire, endDate, {
    _id: subscriptionPurchase[0]._id,
  });

  return subscriptionPurchase;
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
    subscription.status !== SubscriptionPurchaseStatus.active || // subscription not active
    new Date(subscription.endDate) < new Date() // subscription expired
  )
    return false; // invalid subscription

  return true; // valid subscription
};

const checkAccess = async (
  author: string,
  feature: keyof typeof SubscriptionAccessFeatures,
) => {
  const subscribeData = await SubscriptionPurchase.findOne({
    author,
    status: SubscriptionPurchaseStatus.active,
    endDate: { $gt: new Date() },
  })
    .select('access')
    .sort({ createdAt: -1 });

  if (!subscribeData) return false;
  const access = subscribeData.access.includes(feature);
  return access;
};

const SubscriptionPurchasesService = {
  subscriptionPurchase,
  getProviderSubscriptionCurrentPlan,
  isValidSubscription,
  checkAccess,
};

export default SubscriptionPurchasesService;
