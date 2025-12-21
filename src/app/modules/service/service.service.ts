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
  const matchSubCategory = {
    isDeleted: false,
    subCategory:
      subCategory && ObjectId.isValid(subCategory)
        ? new ObjectId(subCategory)
        : query.subCategoryIds,
  };

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
        as: 'authorDetails',
      },
    },
    {
      $unwind: '$authorDetails',
    },

    // filter by region and profile completion
    {
      $match: region
        ? {
            'authorDetails.region': region,
            'authorDetails.isProfileComplete': true,
          }
        : { 'authorDetails.isProfileComplete': true },
    },
    {
      $project: {
        _id: 1,
        author: 1,
        subCategory: {
          name: '$subCategoryDetails.name',
          _id: '$subCategoryDetails._id',
          description: '$subCategoryDetails.description',
        },
        authorDetails: {
          _id: '$authorDetails._id',
          businessName: '$authorDetails.businessName',
          region: '$authorDetails.region',
          location: '$authorDetails.location',
          image: '$authorDetails.image',
          description: '$authorDetails.description',
          phone: '$authorDetails.phone',
        },
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
  ];

  const services = await ProviderBaseService.aggregateWithPagination(
    pipeline,
    query,
  );
  // console.log(services.data);
  return services;
};

// get all service requested by admin
const getSingleService = async (id: string) => {};

// get services by Id
const getServiceById = async (id: string) => {
  return await Service.findById(id);
};

// get self service by provider
const getProviderSelfServices = async (
  authorId: string,
  query?: any,
): Promise<any> => {
  const filters: any = { author: new ObjectId(authorId), isDeleted: false };
  if (query?.status) filters.status = query.status;

  const select =
    query?.field !== undefined
      ? query?.select + ' subCategory'
      : 'subCategory name description image status';

  const populate = [{ path: 'subCategory', select: 'name' }];

  return await ProviderBaseService.findWithPagination({
    filters,
    select,
    ...query,
    populate,
  });
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
    service.author.toString() !== authorId &&
    role !== Roles.ADMIN &&
    role !== Roles.SUPER_ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own service',
    );
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

const ProviderService = {
  createService,
  getProviderTotalServicesCount,
  getAllServices,
  getSingleService,
  getProviderSelfServices,
  deleteService,
  getServiceById,
  serviceQuoteNotification,
  getProviderAllReviews,
};

export default ProviderService;

//  add services in profile
const temp = async () => {
  const providers = await ProfileBaseService.findOne({
    select: 'serviceCategory',
    filters: { author: new ObjectId('6943c2cce4eb2f6f65e51e6b') },
  });

  const subCategories = await SubCategoryBaseService.findMany({
    filters: {
      category: providers?.serviceCategory,
      isDeleted: false,
    },
    select: '_id',
  });
  console.log(subCategories);

  for (const subCategory of subCategories) {
    const res = await Service.create({
      author: '6943c2cce4eb2f6f65e51e6b',
      subCategory: subCategory._id,
    } as any);
    console.log(res);
  }

  console.log(providers);
};
// temp();
