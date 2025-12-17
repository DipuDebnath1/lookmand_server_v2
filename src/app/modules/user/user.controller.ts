/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';
import ProviderService from '../service/service.service';

// *************USER CONTROLLERS*********
// AllUsers
const AllUsers: RequestHandler = catchAsync(async (req, res, next) => {
  const result = await UserServices.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

// Find Single User
const FindSingleUser: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');

  const data = await UserServices.getUserById(id);

  if (!data) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: data,
  });
});

// Update User Profile
const UpdateUserProfile: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { _id } = user;
  const updateData = req.body;

  // Handle file upload if present
  if (req.file) {
    updateData.image = ImageUrl(req.file);
  }

  const data = await UserServices.updateUserProfile(_id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: data,
  });
});

// get self profile
const GetSelfProfile: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { _id } = user;

  const select = 'name email role image phone location';

  const data = await UserServices.getUserById(_id, { ...req.query, select });

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: data,
  });
});

// provider self reviews
const GetSelfReviews: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { _id } = user;
  const result = await ProviderService.getProviderAllReviews(_id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

// account delete
const DeleteAccount: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { _id, role } = user;
  if (role === 'admin')
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Admin account can not be deleted!',
    );
  await UserServices.deleteAccount(_id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User account deleted successfully',
    data: {},
  });
});

export const UserController = {
  AllUsers,
  FindSingleUser,
  UpdateUserProfile,
  GetSelfProfile,
  GetSelfReviews,
  DeleteAccount,
};
