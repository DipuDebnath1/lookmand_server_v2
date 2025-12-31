import { PipelineStage, Types } from 'mongoose';
const { ObjectId } = Types;
import Adds from './add.model';
import { IAdds } from './add.type';
import BaseService from '../../../service/DBService';
import SubscriptionPurchase from '../subscriptionPurchases/SubscriptionPurchases.model';
import { SubscriptionPurchaseStatus } from '../subscriptionPurchases/const';
import { SubscriptionAccessFeatures } from '../subscription/const';
import { Region } from '../user/const';

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
    select: 'author content',
  });
  return adds;
};

// get all subscribers adds
const getAllAdds = async (query: {
  region: keyof typeof Region;
  category: string;
  limit: number;
}) => {
  const basePipeline: PipelineStage[] = [
    {
      $match: {
        status: SubscriptionPurchaseStatus.active,
        endDate: { $gt: new Date() },
        access: { $in: [SubscriptionAccessFeatures.Adds] },
      },
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'profile',
      },
    },
    { $unwind: '$profile' },
  ];

  // region filter
  const regionPipeline: PipelineStage = {
    $match: { 'profile.region': query.region },
  };

  // category filter
  const categoryPipeline: PipelineStage = {
    $match: { 'profile.serviceCategory': new ObjectId(query.category) },
  };

  if (query.category) basePipeline.push(categoryPipeline);

  // lookup adds
  const addsLookupPipeline: PipelineStage = {
    $lookup: {
      from: 'adds',
      localField: 'author',
      foreignField: 'author',
      as: 'addDetails',
    },
  };
  const unwindAdds: PipelineStage = {
    $unwind: '$addDetails',
  };

  // count total adds after filters
  const countPipeline: PipelineStage[] = [
    ...basePipeline,
    regionPipeline,
    addsLookupPipeline,
    unwindAdds,
    { $count: 'total' },
  ];

  // count with region filter
  let countResult =
    await SubscriptionPurchasesBaseService.aggregate(countPipeline);
  let total = countResult[0]?.total || 0;

  // count without region filters if no total
  if (total === 0) {
    const countPipelineWithoutRegion: PipelineStage[] = [
      ...basePipeline,
      addsLookupPipeline,
      unwindAdds,
      { $count: 'total' },
    ];

    countResult = await SubscriptionPurchasesBaseService.aggregate(
      countPipelineWithoutRegion,
    );
    total = countResult[0]?.total || 0;
    // update base pipeline
  } else {
    basePipeline.push(regionPipeline);
  }

  // calculate total pages
  const limit = query.limit || 10;
  const totalPages = Math.ceil(total / limit);

  // add region and category filter to base pipeline
  if (totalPages === 0) {
    basePipeline.push(addsLookupPipeline, unwindAdds);
  }

  const randomPage = Math.floor(Math.random() * totalPages) + 1;

  // Fetch data for that random page
  const dataPipeline: PipelineStage[] = [
    ...basePipeline,
    addsLookupPipeline,
    unwindAdds,
    {
      $project: {
        _id: '$addDetails._id',
        profileId: '$profile._id',
        content: '$addDetails.content',
        category: '$profile.serviceCategory',
      },
    },
  ];

  const result = await SubscriptionPurchasesBaseService.aggregateWithPagination(
    dataPipeline,
    {
      page: randomPage,
      limit: limit,
    },
  );

  return result.data;
};

const addService = {
  createAdd,
  getSelfAdd,
  getAllAdds,
};

export default addService;
