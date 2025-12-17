/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import providerServiceService from './service.service';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { Types } from 'mongoose';
import businessProfileService from '../businessProfile/businessProfile.service';
import notificationService from '../notification/notification.service';
import ProviderService from './service.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';
const ObjectId = Types.ObjectId;

// Create a new service by provider
const createService = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;

  // handle file upload
  if (!req.file)
    throw new AppError(httpStatus.BAD_REQUEST, 'Service image is required');
  // time validation
  if (new Date(req.body.startDate) < new Date())
    throw new AppError(httpStatus.BAD_REQUEST, 'start time Invalid time range');

  req.body.image = ImageUrl(req.file);
  const newService = await providerServiceService.createService(
    user._id,
    req.body,
  );
  // const newService = await createService(user._id, req.body);

  //  send notification to admin about new service request
  notificationService.sendNotification({
    sender: user._id.toString(),
    title: 'New Service Request',
    description: `${user.name} has requested a new service.`,
    service: newService?._id as any,
    type: 'serviceApproval',
    role: 'admin',
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Service created successfully',
    success: true,
    data: newService,
  });
});

// get all service requested by admin
const getAllServicesApprovalRequested = catchAsync(
  async (req: Request, res: Response) => {
    const services =
      await providerServiceService.getAllServicesApprovalRequestedB(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Services retrieved successfully',
      success: true,
      data: services,
    });
  },
);

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
const getServicesByProvider = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const services = await providerServiceService.getProviderSelfServices(
      user._id,
      req.query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Services retrieved successfully',
      success: true,
      data: services,
    });
  },
);

// get service by id
const getSingleServiceApprovalRequested = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    if (!ObjectId.isValid(serviceId))
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');

    const service =
      await providerServiceService.getSingleServiceApprovalRequested(
        serviceId,
        req.query,
      );

    const profile = await businessProfileService.getBusinessProfileByAuthorId(
      service!.author!.toString(),
    );

    service!.profile! = profile;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Service retrieved successfully',
      success: true,
      data: service,
    });
  },
);

// action service by id
const actionServiceById = catchAsync(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const { status } = req.body;

  if (!ObjectId.isValid(serviceId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');
  // validate status value
  if (!['approved', 'declined'].includes(status))
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Status must be either 'approved' or 'declined'",
    );

  const service = await providerServiceService.actionServiceRequest(
    serviceId,
    status,
  );

  //  send notification to admin about new service request
  notificationService.sendNotification(
    {
      sender: service.author.toString() as any,
      title:
        'Service Request ' + status.charAt(0).toUpperCase() + status.slice(1),
      description: `requested a new service.`,
      service: service?._id as any,
      type: 'serviceApproval',
      role: 'admin',
    },
    { pushNotification: true },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `Service ${status} successfully`,
    success: true,
    data: service,
  });
});

// update service by provider
const updateServiceById = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { serviceId } = req.params;
  if (!ObjectId.isValid(serviceId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');
  // handle file upload
  if (req.file) {
    req.body.image = ImageUrl(req.file);
  }
  const updatedService = await providerServiceService.updateServiceById(
    serviceId,
    user._id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Service updated successfully',
    success: true,
    data: updatedService,
  });
});

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
  getAllServicesApprovalRequested,
  getSingleServiceApprovalRequested,
  actionServiceById,
  updateServiceById,
  deleteServiceById,
  getAllServices,
  getSingleService,
  getServicesByProvider,
  searchServiceQuoteByProvider,
};

export default ProviderServiceController;
