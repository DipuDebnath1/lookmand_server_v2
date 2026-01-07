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
import ServiceInquiry from './serviceInquiry.model';
import { Types } from 'mongoose';

const ObjectId = Types.ObjectId;

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
  if (subCategory.category.toString() !== serviceInquiryData.category)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Sub-category does not belong to the specified category',
    );
  //check valid date
  const inquiryDate = new Date(serviceInquiryData.date);
  if (inquiryDate < new Date())
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid inquiry date');

  // check already have inquiry for same date
  const existingInquiry = await ServiceInquiry.exists({
    author: user?._id,
    date: {
      $lte: new Date(inquiryDate.getTime() + 24 * 60 * 60 * 1000),
      $gte: inquiryDate,
    },
    subCategory: new ObjectId(serviceInquiryData.subCategory),
    status: ServiceInquiryStatuses.active,
    isDeleted: false,
  });

  if (existingInquiry)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'the inquiry already exists for this date',
    );

  const newServiceInquiry = await ServiceInquiryBaseService.create({
    ...serviceInquiryData,
    author: user?._id,
  });

  // send response
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
    serviceInquiryData.category,
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
        populate: [
          { ...ServiceInquiryPopulate.subCategory, select: 'name image' },
        ],
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

// Accept post inquiry
const DeletePostInquiry = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { inquiryId } = req.params;

  if (!Types.ObjectId.isValid(inquiryId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid inquiry ID');

  // delete service inquiry
  const bookingResponse = await ServiceInquiryBaseService.findOneAndUpdate(
    {
      _id: new ObjectId(inquiryId),
      author: new ObjectId(user._id),
      isDeleted: false,
    },
    { isDeleted: true },
  );

  if (!bookingResponse)
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Service inquiry not found or already deleted',
    );

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deleted service inquiry successfully',
    data: {},
  });
});

const ServiceInquiryController = {
  AddNewServiceInquiry,
  AllServiceInquiries,
  UserSelfServiceInquiries,
  AcceptedPostInquiry,
  DeletePostInquiry,
};

export default ServiceInquiryController;
