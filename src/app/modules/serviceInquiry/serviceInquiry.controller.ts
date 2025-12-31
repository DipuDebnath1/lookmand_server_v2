/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import {
  ServiceInquiryBaseService,
  SubCategoryBaseService,
} from '../../../service';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import SocketService from '../../../service/socketService';
import { ServiceInquiryPopulate, ServiceInquiryStatuses } from './const';
import serviceInquiryService from './serviceInquiry.service';

// add new service inquiry
const AddNewServiceInquiry = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const serviceInquiryData = req.body;

  const subCategory = await SubCategoryBaseService.findById(
    serviceInquiryData.subCategory,
    {
      select: 'category isDeleted ',
    },
  );
  // Validate subCategory existence
  if (!subCategory || subCategory.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sub-category ID');

  // Validate category-subcategory relationship
  if (subCategory.category.toString() !== serviceInquiryData.categoryId)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Sub-category does not belong to the specified category',
    );
  //check valid date
  const inquiryDate = new Date(serviceInquiryData.date);
  if (inquiryDate > new Date())
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid inquiry date');

  const newServiceInquiry = await ServiceInquiryBaseService.create({
    ...serviceInquiryData,
    author: user?._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Service inquiry created successfully',
    data: {},
  });

  const populateService = await newServiceInquiry.populate([
    ServiceInquiryPopulate.author,
    ServiceInquiryPopulate.subCategory,
  ]);
  // Notify relevant parties about the new service inquiry with socket
  SocketService.notifyNewServiceInquiryToProviders(
    serviceInquiryData.categoryId,
    populateService,
  );
});

// get user service inquiries Data
const UserSelfServiceInquiries = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const ServiceInquiries = await ServiceInquiryBaseService.findWithPagination(
      {
        filters: {
          author: user._id,
          date: { $gte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
          status: ServiceInquiryStatuses.active,
          isDeleted: false,
        },
        select: ServiceInquiryPopulate.fields,
        populate: [],
        sort: { createdAt: -1 },
        ...req.query,
      },
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Service inquiries retrieved successfully',
      data: ServiceInquiries,
    });
  },
);

// get all service inquiries data for all subscribed providers
const AllServiceInquiries = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const result = await serviceInquiryService.AllServiceInquiries(
    user._id,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service inquiries retrieved successfully',
    data: result,
  });
});

// Accept post inquiry
const AcceptedPostInquiry = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { inquiryId } = req.params;
  const bookingResponse = await serviceInquiryService.acceptedPostInquiry(
    user._id,
    inquiryId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service inquiry accepted successfully',
    data: bookingResponse,
  });
});

const ServiceInquiryController = {
  AddNewServiceInquiry,
  AllServiceInquiries,
  UserSelfServiceInquiries,
  AcceptedPostInquiry,
};

export default ServiceInquiryController;
