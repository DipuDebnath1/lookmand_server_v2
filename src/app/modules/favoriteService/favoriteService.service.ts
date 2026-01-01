/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import FavoriteService from './favoriteService.model';
import { PipelineStage, Types } from 'mongoose';
import { FavoriteServiceBaseService } from '../../../service';
import Service from '../service/service.model';
import {
  SubscriptionAccessFeatures,
  SubscriptionPackageName,
} from '../subscription/const';
const ObjectId = Types.ObjectId;

// Create Favorite Service
const createFavoriteService = async (
  author: string,
  providerService: string,
) => {
  const productInfo = await Service.aggregate([
    { $match: { _id: new ObjectId(providerService), isDeleted: false } },
    {
      $lookup: {
        from: 'subscriptionpurchases',
        localField: 'author',
        foreignField: 'author',
        as: 'subscribedInfo',
      },
    },
    { $unwind: { path: '$subscribedInfo' } },

    { $project: { _id: 1, access: '$subscribedInfo.access' } },
    { $sort: { 'subscribedInfo.createdAt': -1 } },
  ]);

  // check subscription status & access
  if (
    productInfo.length === 0 ||
    productInfo[0]?.access.includes(SubscriptionAccessFeatures.AddFavorites) ===
      false
  )
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you can add favorite only subscribed providers service',
    );

  const existingFavorite = await FavoriteService.findOne({
    author: new ObjectId(author),
    providerService: new ObjectId(providerService),
  });

  if (!existingFavorite || existingFavorite.isDeleted)
    return FavoriteService.create({ author, providerService });

  return existingFavorite;
};

// Get All Favorite Service
const getAllFavoriteService = async (author: string, query?: any) => {
  const match = { author: new ObjectId(author), isDeleted: false };

  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: 'services',
        localField: 'providerService',
        foreignField: '_id',
        as: 'providerService',
      },
    },
    {
      $unwind: {
        path: '$providerService',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'providerService.subCategory',
        foreignField: '_id',
        as: 'subCategoryDetails',
        pipeline: [{ $match: { isDeleted: false } }],
      },
    },
    {
      $unwind: '$subCategoryDetails',
    },

    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'providerService.author',
        foreignField: 'author',
        as: 'profile',
      },
    },
    {
      $unwind: {
        path: '$profile',
        preserveNullAndEmptyArrays: true,
      },
    },

    // review average rating calculation
    {
      $lookup: {
        from: 'reviews',
        let: { serviceId: '$providerService._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$service', '$$serviceId'] },
                  { $eq: ['$isDeleted', false] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        as: 'reviewStats',
      },
    },
    {
      $unwind: {
        path: '$reviewStats',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        averageRating: { $ifNull: ['$reviewStats.averageRating', 0] },
        totalReviews: { $ifNull: ['$reviewStats.totalReviews', 0] },
      },
    },

    // Lookup subscription purchase for the author
    {
      $lookup: {
        from: 'subscriptionpurchases',
        let: { authorId: '$providerService.author' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$author', '$$authorId'] },
                  { $eq: ['$status', 'active'] },
                ],
              },
            },
          },
          { $sort: { endDate: -1 } },
          { $limit: 1 },
        ],
        as: 'subscriptionPurchase',
      },
    },
    {
      $unwind: {
        path: '$subscriptionPurchase',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: 'subscriptionPurchase.subscription',
        foreignField: '_id',
        as: 'subscriptionDetails',
      },
    },
    {
      $unwind: {
        path: '$subscriptionDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        subCategory: {
          name: '$subCategoryDetails.name',
          _id: '$subCategoryDetails._id',
          description: '$subCategoryDetails.description',
        },
        profile: {
          author: '$profile.author',
          _id: '$profile._id',
          image: '$profile.image',
          phone: '$profile.phone',
          businessName: '$profile.name',
          region: '$profile.region',
          location: '$profile.location',
          description: '$profile.description',
        },
        accessibleBySubscription: '$subscriptionPurchase.access',
        isSponsored: {
          $cond: {
            if: {
              $eq: [
                '$subscriptionDetails.title',
                SubscriptionPackageName.Premium,
              ],
            },

            then: true,
            else: false,
          },
        },
        isSubscribed: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$subscriptionDetails.title', 'Premium'] },
                { $eq: ['$subscriptionDetails.title', 'Standard'] },
              ],
            },
            then: true,
            else: false,
          },
        },
        averageRating: 1,
        totalReviews: 1,
      },
    },
  ];

  const res = await FavoriteServiceBaseService.aggregateWithPagination(
    pipeline,
    {
      ...query,
    },
  );

  return res;
};

// Remove Favorite Service
const removeFavoriteService = async (author: string, id: string) => {
  const res = await FavoriteService.findOneAndUpdate(
    { author: new ObjectId(author), _id: new ObjectId(id) },
    { isDeleted: true },
    { new: true },
  );

  if (!res)
    throw new AppError(httpStatus.NOT_FOUND, 'Favorite service not found');
  return res;
};

export default {
  createFavoriteService,
  getAllFavoriteService,
  removeFavoriteService,
};
