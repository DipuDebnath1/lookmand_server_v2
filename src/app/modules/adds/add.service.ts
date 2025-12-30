/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage, Types } from 'mongoose';
import Adds from './add.model';
import { IAdds } from './add.type';
import BaseService from '../../../service/DBService';
import SubscriptionPurchase from '../subscriptionPurchases/SubscriptionPurchases.model';
import { SubscriptionPurchaseStatus } from '../subscriptionPurchases/const';
import { SubscriptionAccessFeatures } from '../subscription/const';

const SubscriptionPurchasesBaseService = new BaseService(SubscriptionPurchase);
const AddsBaseServiceBaseService = new BaseService(Adds);

// create add
const createAdd = async (payload: IAdds) => {
  // check exist add
  const existAdd = await Adds.findOne({
    author: payload.author,
    isDeleted: false,
  });
  if (existAdd) throw new Error('You have already created an add!');

  return Adds.create(payload);
};

// self Adds
const getSelfAdd = async (authorId: Types.ObjectId) => {
  const filter = { author: authorId, isDeleted: false };
  const adds = await AddsBaseServiceBaseService.findOne({
    filters: filter,
    select: 'author image createdAt',
  });
  return adds;
};

// get all subscribers adds
const getAllAdds = async (location: string, query: any) => {
  const pipeLine: PipelineStage[] = [
    {
      $match: {
        status: SubscriptionPurchaseStatus.active,
        endDate: { $gt: new Date() },
        access: { $in: SubscriptionAccessFeatures.Adds },
      },
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'profile',
        pipeline: [
          { $match: { isDeleted: false } },
          {
            $project: {
              location: 1,
            },
          },
        ],
      },
    },
    { $unwind: '$profile' },
    { $match: { 'profile.location': location } },
    {
      $lookup: {
        from: 'adds',
        localField: 'author',
        foreignField: 'author',
        as: 'addDetails',
      },
    },
    { $unwind: '$addDetails' },
    {
      $project: {
        _id: '$addDetails._id',
        profileId: '$profile._id',
        content: '$addDetails.content',
      },
    },
  ];

  const adds = await SubscriptionPurchasesBaseService.aggregateWithPagination(
    [...pipeLine],
    query,
  );

  return adds;
};

const addService = {
  createAdd,
  getSelfAdd,
  getAllAdds,
};

export default addService;
