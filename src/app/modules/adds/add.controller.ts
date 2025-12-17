/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import addService from './add.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';

// create add
const CreateAdds = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const payload = req.body;

  const image = req.file;
  if (!image)
    throw new AppError(httpStatus.BAD_REQUEST, 'Image file is required');
  payload.image = ImageUrl(image);

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
  const adds = await addService.getSelfAdds(user._id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Adds retrieved successfully',
    data: adds,
  });
});

// add provider adds
const getAllAdds = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const location = user?.location;
  const adds = await addService.getAllAdds(location, req.query);
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
