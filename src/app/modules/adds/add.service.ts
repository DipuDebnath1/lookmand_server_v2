/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { PipelineStage, Types } from 'mongoose';
import QueryService from '../../../service/QueryService';
import AppError from '../../ErrorHandler/AppError';
import Adds from './add.model';
import { IAdds } from './add.type';
import SubscriptionPurchase from '../subscriptionPurchases/SubscriptionPurchases.model';
import config from '../../../config';

const AddsServiceQuery = new QueryService(Adds);

// create add
const createAdd = async (payload: IAdds) => {
  let maxAAllowedAdds = 0; // Set to 0 to disable limit for now
  // check active subscription
  const userPurchasedSubscription: any = await SubscriptionPurchase.findOne({
    author: payload.author,
    status: 'active',
    endDate: { $gt: new Date() },
    title: { $ne: 'Basic' },
  }).populate([
    {
      path: 'subscription',
      select: 'title',
    },
  ]);

  if (!userPurchasedSubscription)
    throw new AppError(
      httpStatus.FORBIDDEN,
      'only subscribed users can create adds.',
    );

  // determine max active adds based on subscription type
  switch (userPurchasedSubscription.subscription.title) {
    case 'Basic':
      maxAAllowedAdds = config.providerAddCreateLimit.basic || 0;
      break;
    case 'Standard':
      maxAAllowedAdds = config.providerAddCreateLimit.standard || 0;
      break;
    case 'Premium':
      maxAAllowedAdds = config.providerAddCreateLimit.premium || 0;
      break;
    default:
      maxAAllowedAdds = 0;
      break;
  }

  // count existing adds
  const isExistAdds = await Adds.countDocuments({
    author: payload.author,
    isDeleted: false,
  });

  if (maxAAllowedAdds === 0)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `your current subscription plan does not allow creating adds.`,
    );

  if (maxAAllowedAdds <= isExistAdds)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `sorry your add limit has been reached.`,
    );
  return Adds.create({ ...payload });
};

// self Adds
const getSelfAdds = async (authorId: Types.ObjectId, query?: any) => {
  const filter = { author: authorId, isDeleted: false };
  const adds = await AddsServiceQuery.findWithQueryParams({
    filters: filter,
    ...query,
    select: 'title image description createdAt',
  });
  return adds;
};

// get all subscribers adds
const getAllAdds = async (location: string, query: any) => {
  const pipeLine: PipelineStage[] = [
    {
      $match: { isDeleted: false },
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'profile',
      },
    },
    {
      $unwind: '$profile',
    },
  ];

  // filter by location if provided
  if (location) {
    pipeLine.push({
      $match: { 'profile.location': location }, // filter by user location
    });
  }

  // additional stages to ensure only subscribed providers' adds are fetched
  const moreStage = [
    {
      $lookup: {
        from: 'subscriptionpurchases',
        localField: 'author',
        foreignField: 'author',
        as: 'subscriptionInfo',
      },
    },
    {
      $unwind: {
        path: '$subscriptionInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'subscriptionInfo.title': { $ne: 'Basic' }, // exclude basic plan providers
        'subscriptionInfo.status': { $eq: 'active' }, // only active subscriptions
      },
    },
    {
      $project: {
        author: 1,
        profile: '$profile._id',
        title: 1,
        image: 1,
        description: 1,
      },
    },
  ];

  const adds = await AddsServiceQuery.aggregateWithPagination(
    [...pipeLine, ...moreStage],
    query,
  );

  return adds;
};

const addService = {
  createAdd,
  getSelfAdds,
  getAllAdds,
};

export default addService;
