/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import Subscription from './subscription.model';
import { ISubscription } from './subscription.type';
import { SubscriptionBaseService } from '../../../service';

// create subscription
const createSubscription = async (subscription: ISubscription) => {
  const res = await Subscription.create(subscription);
  if (!res)
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create subscription');
  return res;
};

// get all subscriptions
const getAllSubscriptions = async (query: any) => {
  const select = 'title price duration description durationType access';
  const filter = { isDeleted: false };
  const res = await SubscriptionBaseService.findWithPagination({
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
    'title price duration description access durationType',
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

const SubscriptionService = {
  createSubscription,
  getAllSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
};

export default SubscriptionService;
