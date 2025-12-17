/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import Subscription from './subscription.model';
import { ISubscription } from './subscription.type';

import QueryService from '../../../service/QueryService';
const SubscriptionQuery = new QueryService<ISubscription>(Subscription);

// create subscription
const createSubscription = async (subscription: ISubscription) => {
  const res = await Subscription.create(subscription);
  if (!res)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create subscription');
  return res;
};

// get all subscriptions
const getAllSubscriptions = async (query: any) => {
  const select = 'title price duration description durationType';
  const filter = { isDeleted: false };
  const res = await SubscriptionQuery.findWithQueryParams({
    ...query,
    filters: filter,
    select,
    sort: { price: 1 },
  });
  return res;
};

// get single subscription
const getSingleSubscription = async (id: string) => {
  const res = await Subscription.findById(id).select(
    'title price duration description durationType',
  );
  return res;
};

// update subscription
const updateSubscription = async (id: string, data: Partial<ISubscription>) => {
  const res = await Subscription.findById(id);
  if (!res) throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  Object.assign(res, data);
  const updatedRes = await res.save();
  if (!updatedRes)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update subscription');
  return updatedRes;
};

// delete subscription
const deleteSubscription = async (id: string) => {
  const res = await Subscription.findById(id);
  if (!res) throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  res.isDeleted = true;
  const deletedRes = await res.save();
  return deletedRes;
};

// subscription service object

// const basic = {
//   price: 0,
//   service: [
//     'Unlimited conversations',
//     '2 Service creations',
//     '❌ Add creations',
//     '❌ User quote search notifications',
//   ],
// };

// const standard = {
//   price: 9.99,
//   service: [
//     'Unlimited conversations',
//     '5 Service creations',
//     '❌ Add creations',
//     'User quote search notifications',
//   ],
// };
// const premium = {
//   price: 19.99,
//   service: [
//     'Unlimited conversations',
//     '10 Service creations',
//     '1 Add creations',
//     'User quote search notifications',
//   ],
// };

// const updateAllSubscriptions = async () => {
//   const subscriptions = await Subscription.find();
//   for (const sub of subscriptions) {
//     if (sub.title === 'Basic') {
//       sub.description = basic.service;
//       sub.price = basic.price;
//     } else if (sub.title === 'Standard') {
//       sub.description = standard.service;
//       sub.price = standard.price;
//     } else if (sub.title === 'Premium') {
//       sub.description = premium.service;
//       sub.price = premium.price;
//     }
//   }
//   const res = await Promise.all(
//     subscriptions.map(async (sub) => {
//       await sub.save();
//     }),
//   );
//   console.log(res);
// };
// updateAllSubscriptions();

const SubscriptionService = {
  createSubscription,
  getAllSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
};

export default SubscriptionService;
