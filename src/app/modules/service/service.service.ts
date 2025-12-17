/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/providerService/providerService.service.ts

import httpStatus from 'http-status';
import { PipelineStage, Types } from 'mongoose';
import config from '../../../config';
import QueryService from '../../../service/QueryService';
import Roles from '../../const/Roles';
import AppError from '../../ErrorHandler/AppError';
import businessProfileService from '../businessProfile/businessProfile.service';
import Notification from '../notification/notification.model';
import SubscriptionPurchasesService from '../subscriptionPurchases/SubscriptionPurchases.service';
import { TRoles } from '../user';
import Service from './service.model';
import { IService } from './service.type';
const { providerServiceCreateLimit } = config;

const ObjectId = Types.ObjectId;

const ServiceQuery = new QueryService(Service);

// Create a new service by provider
const createService = async (
  authorId: string,
  serviceData: IService,
): Promise<IService> => {
  const getAuthorBusinessProfile =
    await businessProfileService.getBusinessProfileByAuthorId(authorId);

  // check if business profile is complete
  if (!getAuthorBusinessProfile || !getAuthorBusinessProfile.isProfileComplete)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Complete your business profile before adding a service',
    );

  // check valid service category
  if (!ObjectId.isValid(serviceData.subCategory))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sub-category ID');

  // check provider subscription plan current plan
  const providerPlan =
    await SubscriptionPurchasesService.getProviderSubscriptionCurrentPlan(
      authorId,
    );
  // if no plan found
  if (!providerPlan)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provider subscription plan not found! Please subscribe to a plan.',
    );

  // check valid subscription
  if (!SubscriptionPurchasesService.isValidSubscription(authorId))
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You need an active subscription plan to create a service',
    );

  // check if subcategory exists
  const totalExistingServicesCount =
    await getProviderTotalServicesCount(authorId);

  // check service create limit by subscription plan
  switch (providerPlan.subscription.title) {
    // Basic plan allows services
    case 'Basic':
      if (totalExistingServicesCount >= providerServiceCreateLimit.basic)
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `You can only have ${providerServiceCreateLimit.basic} active services on the Basic plan`,
        );
      break;

    // Standard plan allows services
    case 'Standard':
      if (totalExistingServicesCount >= providerServiceCreateLimit.standard)
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `You can only have ${providerServiceCreateLimit.standard} active services on the Standard plan`,
        );
      break;

    // Premium plan allows services
    case 'Premium':
      if (totalExistingServicesCount >= providerServiceCreateLimit.premium)
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `You can only have ${providerServiceCreateLimit.premium} active services on the Premium plan`,
        );
      break;
  }

  // create service
  const newService = await Service.create({
    ...serviceData,
    author: authorId,
  });

  return newService;
};

// get all service requested by admin
const getAllServicesApprovalRequestedB = async (query?: any) => {
  const pipeline = [
    {
      $match: { status: 'pending', isDeleted: false },
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'businessProfile',
      },
    },
    { $unwind: '$businessProfile' },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategoryDetails',
      },
    },
    { $unwind: '$subCategoryDetails' },
    {
      $project: {
        name: 1,
        description: 1,
        image: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        profile: {
          _id: '$businessProfile._id',
          name: '$businessProfile.name',
          phone: '$businessProfile.phone',
          location: '$businessProfile.location',
          image: '$businessProfile.image',
        },
        subCategory: {
          _id: '$subCategoryDetails._id',
          name: '$subCategoryDetails.name',
          description: '$subCategoryDetails.description',
          image: '$subCategoryDetails.image',
        },
      },
    },
  ];

  const services = await ServiceQuery.aggregateWithPagination(pipeline, query);

  return services;
};

// get single service by id
const getSingleServiceApprovalRequested = async (
  serviceId: string,
  query?: { field?: string; categoryField?: string },
): Promise<any> => {
  const select =
    !query?.field || query?.field !== undefined
      ? 'author subCategory name description image startDate'
      : query?.field + ' subCategory';

  const service = await Service.findById(serviceId)
    .select(select)
    .populate([
      {
        path: 'subCategory',
        select: query?.categoryField || 'name description image startDate',
      },
    ])
    .lean();
  return service;
};

// get all service requested by admin
const getAllServices = async (query?: any) => {
  // base match criteria
  const ServiceInfoMatch: any = { isDeleted: false, status: 'approved' };
  // filters by subcategory
  if (query?.subcategory && ObjectId.isValid(query.subcategory))
    ServiceInfoMatch.subCategory = new ObjectId(query.subcategory);
  // filter by author
  if (query?.author && ObjectId.isValid(query.author))
    ServiceInfoMatch.author = new ObjectId(query.author);
  // regex by name filter
  if (query?.name) {
    ServiceInfoMatch.name = { $regex: new RegExp(query.name, 'i') };
  }

  // aggregation pipeline
  const pipeline: PipelineStage[] = [
    {
      $match: ServiceInfoMatch,
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'businessProfile',
      },
    },
    { $unwind: '$businessProfile' },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategoryDetails',
      },
    },
    { $unwind: '$subCategoryDetails' },
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
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // match available services Filter by location and author if query.location exists
  const profileMatch: any = { 'businessProfile.isAvailable': true };
  if (query?.location) {
    profileMatch['businessProfile.location'] = {
      $regex: new RegExp(query.location, 'i'),
    };
  }
  // apply profile match if there are any conditions

  pipeline.push({
    $match: profileMatch,
  });

  // repositioning $project stage to the end of the pipeline
  pipeline.push(
    {
      $group: {
        _id: '$_id', // Group by the service's _id
        name: { $first: '$name' },
        description: { $first: '$description' },
        image: { $first: '$image' },
        subCategory: { $first: '$subCategoryDetails.name' },
        location: { $first: '$businessProfile.location' },
        reviews: { $push: '$reviews' },
        author: { $first: '$author' },
      },
    },
    // Add the aggregation for rating and ratingCount
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
        subCategory: 1,
        location: 1,
        rating: { $avg: '$reviews.rating' },
        ratingCount: { $size: '$reviews' },

        author: 1,
      },
    },
    // sorting by average rating descending and rating count descending
    { $sort: { rating: -1, ratingCount: -1 } },
  );

  const services = await ServiceQuery.aggregateWithPagination(pipeline, query);
  return services;
};

// get all service requested by admin
const getSingleService = async (id: string) => {
  const pipeline: PipelineStage[] = [
    {
      $match: { _id: new ObjectId(id) },
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'author',
        foreignField: 'author',
        as: 'businessProfile',
      },
    },
    { $unwind: '$businessProfile' },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategoryDetails',
      },
    },
    { $unwind: '$subCategoryDetails' },
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
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // repositioning $project stage to the end of the pipeline
  pipeline.push(
    {
      $group: {
        _id: '$_id', // Group by the service's _id
        name: { $first: '$name' },
        description: { $first: '$description' },
        image: { $first: '$image' },
        subCategory: { $first: '$subCategoryDetails.name' },
        businessProfile: { $first: '$businessProfile' },
        reviews: { $push: '$reviews' },
        author: { $first: '$author' },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        image: 1,
        subCategory: 1,
        rating: { $avg: '$reviews.rating' }, // Placeholder for rating
        ratingCount: { $size: '$reviews' }, // Placeholder for rating count
        author: 1,
      },
    },
  );

  const services = await Service.aggregate(pipeline);
  return services[0];
};

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

  return await ServiceQuery.findWithQueryParams({
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

// Admin reviews the service (approve or decline)
const actionServiceRequest = async (
  serviceId: string,
  status: 'approved' | 'declined',
): Promise<IService> => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  // Ensure the service is still pending before being reviewed
  if (service.status !== 'pending') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Service is already reviewed');
  }

  // Change the status of the service
  service.status = status;

  await service.save();
  return service;
};

// Provider updates their service if it's declined
const updateServiceById = async (
  serviceId: string,
  author: string,
  updates: Partial<IService>,
): Promise<IService> => {
  const service = await Service.findOne({
    _id: new ObjectId(serviceId),
    author: new ObjectId(author),
  });
  if (!service || service.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  if (service.status !== 'declined') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Only declined services can be updated',
    );
  }

  Object.assign(service, updates);
  service.status = 'pending'; // Once updated, the status goes back to pending
  await service.save();

  return service;
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
  const reviews = await ServiceQuery.aggregateWithPagination(pipeline, query);
  return reviews;
};

getProviderAllReviews('68c662d39d2edb3f7181ea96', { page: 1, limit: 10 });
const ProviderService = {
  createService,
  getAllServicesApprovalRequestedB,
  getSingleServiceApprovalRequested,
  getProviderTotalServicesCount,
  getAllServices,
  getSingleService,
  getProviderSelfServices,
  actionServiceRequest,
  updateServiceById,
  deleteService,
  getServiceById,
  serviceQuoteNotification,
  getProviderAllReviews,
};

export default ProviderService;
