/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import FavoriteService from './favoriteService.model';
import { Types } from 'mongoose';
import { FavoriteServiceBaseService } from '../../../service';
const ObjectId = Types.ObjectId;

// Create Favorite Service
const createFavoriteService = async (
  author: string,
  providerService: string,
) => {
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

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'providerservices',
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
        from: 'businessprofiles',
        localField: 'providerService.author',
        foreignField: 'author',
        as: 'providerService.author',
      },
    },
    {
      $unwind: {
        path: '$providerService.author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: 'providerService._id',
        foreignField: 'providerService',
        as: 'providerService.reviews',
        pipeline: [{ $match: { isDeleted: false } }],
      },
    },

    {
      $project: {
        _id: 1,
        providerService: {
          _id: '$providerService._id',
          name: '$providerService.name',
          title: '$providerService.title',
          description: '$providerService.description',
          image: '$providerService.image',
          location: '$providerService.author.location',
          totalRating: { $size: '$providerService.reviews' },
          averageRating: { $avg: '$providerService.reviews.rating' },
        },
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
