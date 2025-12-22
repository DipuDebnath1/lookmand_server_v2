/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import providerServiceService from './service.service';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { Types } from 'mongoose';
import notificationService from '../notification/notification.service';
import ProviderService from './service.service';
const ObjectId = Types.ObjectId;

// Create a new service by provider
const createService = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { subCategoryId } = req.params;
  if (!ObjectId.isValid(subCategoryId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sub-category ID');

  const payload = {
    author: user._id,
    subCategory: subCategoryId,
  };

  const newService = await providerServiceService.createService(payload as any);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Service created successfully',
    success: true,
    data: newService,
  });
});

// get all service by all users
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const services = await providerServiceService.getAllServices(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Services retrieved successfully',
    success: true,
    data: services,
  });
});

// get single service by id
const getSingleService = catchAsync(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  if (!ObjectId.isValid(serviceId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');

  const service = await providerServiceService.getSingleService(serviceId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service retrieved successfully',
    success: true,
    data: service,
  });
});

// get services by provider
const ProviderServicesByAuthorId = catchAsync(
  async (req: Request, res: Response) => {
    const { authorId } = req.params;
    const services = await providerServiceService.providerServicesByAuthorId(
      authorId,
      req.query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'provider info retrieved successfully',
      success: true,
      data: services,
    });
  },
);

// delete service by provider or admin
const deleteServiceById = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { serviceId } = req.params;
  if (!ObjectId.isValid(serviceId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');
  const deletedService = await providerServiceService.deleteService(
    serviceId,
    user._id,
    user.role,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service deleted successfully',
    success: true,
    data: deletedService,
  });
});

// provider search quote for own service
const searchServiceQuoteByProvider = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const { serviceCategory, additional, location } = req.body;

    if (!ObjectId.isValid(serviceCategory))
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service category ID');

    const quotes = await ProviderService.serviceQuoteNotification(
      user._id,
      additional,
    );

    // send notification to provider about new service quote
    await notificationService.serviceQuoteNotificationSend(
      quotes,
      serviceCategory,
      location,
    );

    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'service notify sent success',
      success: true,
      data: quotes,
    });
  },
);

const ProviderServiceController = {
  createService,
  deleteServiceById,
  getAllServices,
  getSingleService,
  ProviderServicesByAuthorId,
  searchServiceQuoteByProvider,
};

export default ProviderServiceController;
