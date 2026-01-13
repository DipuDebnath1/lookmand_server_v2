/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import { PipelineStage, Types } from 'mongoose';
import AppError from '../../ErrorHandler/AppError';
import Notification from '../notification/notification.model';
import { TRoles } from '../user';
import Service from './service.model';
import { IService } from './service.type';
import { Roles } from '../user/const';
import {
  ProfileBaseService,
  ProviderBaseService,
  SubCategoryBaseService,
} from '../../../service';
import { SubscriptionPurchaseStatus } from '../subscriptionPurchases/const';
import { SubscriptionPackageName } from '../subscription/const';

const ObjectId = Types.ObjectId;

// Create a new service by provider
const createService = async (payload: IService) => {
  //  business profile completed check
  const provider = await ProfileBaseService.findOne({
    filters: { author: new ObjectId(payload.author) },
    select: '_id isProfileComplete serviceCategory',
  });

  // check business profile exists
  if (!provider)
    throw new AppError(httpStatus.BAD_REQUEST, 'Business profile not found');

  // check business profile completed
  if (!provider.isProfileComplete)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'complete your business profile before',
    );

  // check valid subcategory
  const subCategory = await SubCategoryBaseService.findOne({
    filters: {
      _id: payload.subCategory,
      isDeleted: false,
    },
    select: 'category',
  });

  // check subcategory exists

  if (!subCategory)
    throw new AppError(httpStatus.BAD_REQUEST, 'sub-category not found');

  // check service category match
  if (provider.serviceCategory.toString() !== subCategory.category.toString())
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'service mismatch with your profile category',
    );

  // isExist check
  const isExist = await ProviderBaseService.findOne({
    filters: {
      author: new ObjectId(payload.author),
      subCategory: new ObjectId(payload.subCategory),
      isDeleted: false,
    },
  });

  // check already exists
  if (isExist)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already added this service',
    );

  // create service
  const newService = await Service.create(payload);

  return newService;
};

// get all service requested by admin
const getAllServices = async (query?: any) => {
  const { category, subCategory, region } = query;
  if (category && ObjectId.isValid(category)) {
    const subCategories = await SubCategoryBaseService.findMany({
      filters: { category: new ObjectId(category), isDeleted: false },
      select: '_id',
    });
    const subCategoryIds = subCategories.map((sc) => sc._id);
    query.subCategoryIds = { $in: subCategoryIds };
  }

  // match conditions
  const matchSubCategory: any = {
    isDeleted: false,
  };

  if (subCategory && ObjectId.isValid(subCategory)) {
    matchSubCategory.subCategory = new ObjectId(subCategory);
  } else if (query.subCategoryIds) {
    matchSubCategory.subCategory = query.subCategoryIds;
  } else {
    delete query.subCategoryIds;
  }

  const pipeline: PipelineStage[] = [
    {
      $match: matchSubCategory,
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
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
        localField: 'author',
        foreignField: 'author',
        as: 'profileDetails',
      },
    },
    {
      $unwind: '$profileDetails',
    },

    // review average rating calculation
    {
      $lookup: {
        from: 'reviews',
        let: { serviceId: '$_id' },
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

    // filter by region and profile completion
    {
      $match: region
        ? {
            'profileDetails.region': region,
            'profileDetails.isProfileComplete': true,
          }
        : { 'profileDetails.isProfileComplete': true },
    },
    // Lookup subscription purchase for the author
    {
      $lookup: {
        from: 'subscriptionpurchases',
        let: { authorId: '$author' },
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
    // only show subscribed users
    {
      $match: {
        $and: [
          { 'subscriptionPurchase.endDate': { $gt: new Date() } },
          { 'subscriptionPurchase.status': SubscriptionPurchaseStatus.active },
        ],
      },
    },

    // Lookup subscription details
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

    // project required fields
    {
      $project: {
        _id: 1,
        author: 1,
        subCategory: {
          name: '$subCategoryDetails.name',
          _id: '$subCategoryDetails._id',
          description: '$subCategoryDetails.description',
        },
        profileDetails: {
          _id: '$profileDetails._id',
          businessName: '$profileDetails.businessName',
          region: '$profileDetails.region',
          location: '$profileDetails.location',
          image: '$profileDetails.image',
          description: '$profileDetails.description',
          phone: '$profileDetails.phone',
        },
        averageRating: '$averageRating',
        totalReviews: '$totalReviews',
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
        accessibleBySubscription: '$subscriptionPurchase.access',
      },
    },
    //  send one service per provider
    {
      $group: {
        _id: '$author',
        service: { $first: '$$ROOT' },
      },
    },
    // Reshape the output to match the original structure
    {
      $replaceRoot: { newRoot: '$service' },
    },
    {
      $sort: { isSponsored: -1, isSubscribed: -1 },
    },
  ];

  const services = await ProviderBaseService.aggregateWithPagination(
    pipeline,
    query,
  );
  // console.log(services.data);
  return services;
};

// get all service requested by admin
const getSingleService = async (serviceId: string) => {
  if (!serviceId || !ObjectId.isValid(serviceId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');
  // match conditions
  const matchSubCategory = {
    _id: new ObjectId(serviceId),
    isDeleted: false,
  };

  const pipeline: PipelineStage[] = [
    {
      $match: matchSubCategory,
    },
    // Lookup sub-category details
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategoryDetails',
      },
    },
    {
      $unwind: '$subCategoryDetails',
    },

    // review average rating calculation
    {
      $lookup: {
        from: 'reviews',
        let: { serviceId: '$_id' },
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
    // Lookup author details
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorDetails',
      },
    },
    {
      $unwind: '$authorDetails',
    },
    // Lookup business profile details
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'profileDetails',
      },
    },
    {
      $unwind: '$profileDetails',
    },

    // filter by region and profile completion
    {
      $match: { 'profileDetails.isProfileComplete': true },
    },
    // Lookup subscription purchase for the author
    {
      $lookup: {
        from: 'subscriptionpurchases',
        let: { authorId: '$author' },
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
    // only show subscribed users
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
        author: {
          _id: '$authorDetails._id',
          name: '$authorDetails.name',
        },
        subCategory: {
          name: '$subCategoryDetails.name',
          _id: '$subCategoryDetails._id',
          description: '$subCategoryDetails.description',
          image: '$subCategoryDetails.image',
        },
        profileDetails: {
          _id: '$profileDetails._id',
          name: '$profileDetails.name',
          region: '$profileDetails.region',
          location: '$profileDetails.location',
          image: '$profileDetails.image',
          description: '$profileDetails.description',
          phone: '$profileDetails.phone',
          availability: '$profileDetails.availability',
          averageRating: '$averageRating',
          totalReviews: '$totalReviews',
        },
        isSponsored: {
          $cond: {
            if: ['$subscriptionDetails.title', SubscriptionPackageName.Premium],
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
        accessibleBySubscription: '$subscriptionPurchase.access',
      },
    },
  ];

  const result = await ProviderBaseService.aggregate(pipeline);
  if (!result || result.length === 0)
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  return result[0];
};

// get self service by provider
const providerServicesByAuthorId = async (
  authorId: string,
  query?: any,
): Promise<any> => {
  const filters: any = { author: new ObjectId(authorId) };

  const profile = await ProfileBaseService.findOne({
    filters: filters,
    select: 'name image region isProfileComplete location ability phone email',
    populate: [
      {
        path: 'author',
        select: 'name image email',
      },
    ],
  });

  const services = ProviderBaseService.aggregateWithPagination(
    [
      { $match: { ...filters, isDeleted: false } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategoryDetails',
        },
      },
      {
        $unwind: '$subCategoryDetails',
      },
      {
        $project: {
          _id: 1,
          name: '$subCategoryDetails.name',
          description: '$subCategoryDetails.description',
          image: '$subCategoryDetails.image',
        },
      },
    ],
    query,
  );

  const [profileData, servicesData] = await Promise.all([profile, services]);

  // console.log(services.data);
  return {
    profile: profileData,
    services: servicesData.data,
    pagination: servicesData.pagination,
  };
};

// provider total services available count
const getProviderTotalServicesCount = async (authorId: string) => {
  const res = await Service.countDocuments({
    author: new ObjectId(authorId),
    isDeleted: false,
  });
  return res;
};

// Provider deletes their service
const deleteService = async (
  serviceId: string,
  authorId: string,
  role: TRoles,
): Promise<IService> => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  if (
    service.author.toString() !== authorId.toString() &&
    role !== Roles.ADMIN &&
    role !== Roles.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized!');
  }

  service.isDeleted = true;
  await service.save();
  return service;
};

// service quote notifications send to provider
const serviceQuoteNotification = async (
  authorId: string,
  description: string,
) => {
  const notification = await Notification.create({
    sender: authorId,
    role: Roles.PROVIDER,
    title: 'New Service Quote Request',
    description,
    type: 'serviceQuote',
  });

  await notification.populate('sender', 'name');

  return notification;
};

// get provider all reviews
const getProviderAllReviews = async (providerId: string, query: any) => {
  const pipeline: PipelineStage[] = [
    {
      $match: { author: new ObjectId(providerId) },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'providerService',
        as: 'reviews',
        pipeline: [{ $match: { isDeleted: false } }],
      },
    },
    {
      $unwind: {
        path: '$reviews',
      },
    },
    {
      $group: {
        _id: '$reviews._id', // Group by the review's _id
        author: { $first: '$reviews.author' },
        description: { $first: '$reviews.description' },
        rating: { $first: '$reviews.rating' },
        service: { $first: '$_id' },
        createdAt: { $first: '$reviews.createdAt' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorDetails',
      },
    },
    {
      $unwind: '$authorDetails',
    },
    {
      $project: {
        _id: 1,
        description: 1,
        rating: 1,
        author: {
          _id: '$authorDetails._id',
          name: '$authorDetails.name',
          image: '$authorDetails.image',
        },
        serviceId: '$service',
        createdAt: 1,
      },
    },
  ];
  const reviews = await ProviderBaseService.aggregateWithPagination(
    pipeline,
    query,
  );
  return reviews;
};

// get provider service by get service id
const getServiceById = async (serviceId: string) => {
  const service = await ProviderBaseService.findOne({
    filters: { _id: new ObjectId(serviceId) },
    select: '_id isDeleted author',
  });
  return service;
};

const ProviderService = {
  createService,
  getProviderTotalServicesCount,
  getAllServices,
  getSingleService,
  providerServicesByAuthorId,
  deleteService,
  serviceQuoteNotification,
  getProviderAllReviews,
  getServiceById,
};

export default ProviderService;

// const createServices = async (authorId: string) => {
//   const profile = await BusinessProfile.findOne({
//     author: new ObjectId(authorId),
//   }).select('serviceCategory');

//   const subcategory = await SubCategoryBaseService.findMany({
//     filters: { category: profile?.serviceCategory, isDeleted: false },
//     select: '_id',
//   });

//   for (const service of subcategory) {
//     const isExist = await Service.findOne({
//       author: new ObjectId(authorId),
//       subCategory: service._id,
//       isDeleted: false,
//     });

//     if (isExist) continue;
//     const newService = await Service.create({
//       author: new ObjectId(authorId),
//       subCategory: service._id,
//     });

//     console.log(newService);
//   }
// };
// createServices('6954afde08f8f1212842bcb5');
