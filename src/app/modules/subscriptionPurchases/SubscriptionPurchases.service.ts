import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import SubscriptionPurchase from './SubscriptionPurchases.model';
import calculateEndDate from '../../utils/calculateEndDate';
import Subscription from '../subscription/subscription.model';
import { setAgendaSchedule } from '../../../agenda/AgendaJobDefine';
import { ISubscriptionPurchasePopulated } from './subscriptionPurchases.type';
import {
  SubscriptionAccessFeatures,
  SubscriptionDirectPurchasePermission,
  SubscriptionPackageName,
} from '../subscription/const';
import { SubscriptionPurchaseStatus } from './const';
import { AgendaJobNames } from '../../../agenda/const';

// Main function to create a subscription purchase
const subscriptionPurchase = async (
  author: string,
  subscriptionId: string,
  directPurchase: boolean,
) => {
  const subscription = await Subscription.findById(subscriptionId).select(
    'title duration durationType access',
  );

  // Check if subscription exists
  if (!subscription)
    throw new AppError(httpStatus.BAD_REQUEST, 'Subscription not found');

  // If it's a direct purchase, check if the subscription allows it
  if (
    directPurchase &&
    !Object.keys(SubscriptionDirectPurchasePermission).includes(
      subscription.title,
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'need payment for this subscription',
    );
  }

  // check is active any subscription purchase exists can't purchase basic

  if (subscription.title === SubscriptionPackageName.Basic) {
    //
    const existingActivePurchase = await SubscriptionPurchase.findOne({
      author,
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
    subscription.duration,
    subscription.durationType,
  );

  // Create the subscription purchase document
  const subscriptionPurchase = await SubscriptionPurchase.create({
    author,
    subscription: subscriptionId,
    startDate: new Date(),
    endDate: endDate,
    access: subscription.access,
    status: SubscriptionPurchaseStatus.active,
  });

  // Schedule a job to handle subscription expiration
  setAgendaSchedule(AgendaJobNames.SubscriptionExpire, endDate, {
    _id: subscriptionPurchase._id,
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

const haveMessageAccess = async (author: string) => {
  const subscribeData = await SubscriptionPurchase.findOne({
    author,
    status: SubscriptionPurchaseStatus.active,
    endDate: { $gt: new Date() },
  })
    .select('access')
    .sort({ createdAt: -1 });

  if (!subscribeData) return false;
  const access = subscribeData.access.includes(
    SubscriptionAccessFeatures.Massaging,
  );
  return access;
};

const SubscriptionPurchasesService = {
  subscriptionPurchase,
  getProviderSubscriptionCurrentPlan,
  isValidSubscription,
  haveMessageAccess,
};

export default SubscriptionPurchasesService;
