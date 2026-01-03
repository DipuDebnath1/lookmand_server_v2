import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import settingService from './setting.service';
import httpStatus from 'http-status';
import { documentName } from './document.const';
import AppError from '../../ErrorHandler/AppError';

// Get About Us
const getContent = catchAsync(async (req: Request, res: Response) => {
  const content = req.params.name;

  if (Object.keys(documentName).indexOf(content) === -1) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid document request');
  }

  const aboutUs = await settingService.getContent(
    content as keyof typeof documentName,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: aboutUs,
    success: true,
    message: `${content} fetched successfully`,
  });
});

// Get and Update About Us
const updateContent = catchAsync(async (req: Request, res: Response) => {
  const content = req.params.name;

  if (Object.keys(documentName).indexOf(content) === -1) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid document request');
  }
  const contentData = await settingService.updateContent(
    content as keyof typeof documentName,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: contentData,
    success: true,
    message: `${content} updated successfully`,
  });
});

// Exporting all controller functions as an objects
const settingController = {
  getContent,
  updateContent,
};
export default settingController;
