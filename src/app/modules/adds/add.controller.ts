/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import addService from './add.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';
import { SubscriptionAccessFeatures } from '../subscription/const';
import SubscriptionPurchasesService from '../subscriptionPurchases/SubscriptionPurchases.service';
import { Roles } from '../user/const';

// create add
const CreateAdds = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const payload = req.body;

  const content = req.file;
  if (!content)
    throw new AppError(httpStatus.BAD_REQUEST, 'Image file is required');
  payload.content = ImageUrl(content);

  // check access
  if (user?.role !== Roles.PROVIDER)
    throw new AppError(httpStatus.FORBIDDEN, 'You are not an add provider');
  if (
    !(await SubscriptionPurchasesService.checkAccess(
      user._id,
      SubscriptionAccessFeatures.Adds,
    ))
  )
    throw new AppError(httpStatus.FORBIDDEN, 'You are not an add provider');

  const result = await addService.createAdd({
    ...payload,
    author: user._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Add created successfully',
    data: result,
  });
});

// self adds
const getSelfAdds = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const adds = await addService.getSelfAdd(user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Add retrieved successfully',
    data: adds,
  });
});

// add provider adds
const getAllAdds = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const adds = await addService.getAllAdds(query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Adds retrieved successfully',
    data: adds,
  });
});

const AddsController = {
  CreateAdds,
  getSelfAdds,
  getAllAdds,
};

export default AddsController;
