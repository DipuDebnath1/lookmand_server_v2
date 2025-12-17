/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import reviewService from './review.service';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import sendResponse from '../../utils/sendResponse';
const { ObjectId } = Types;

// create review
const CreateReview = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { bookingId } = req.params;
  const reviewData = req.body;

  if (!ObjectId.isValid(bookingId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid booking ID');
  const result = await reviewService.createReview(
    {
      ...reviewData,
      author: user._id,
    },
    bookingId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

// update review
const UpdateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid review ID');
  const result = await reviewService.updateReview(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

// delete review
const DeleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user }: any = req;

  if (!ObjectId.isValid(id))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid review ID');
  await reviewService.deleteReview(id, user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: {},
  });
});

// get all reviews by service id
const GetAllReviewsByServiceId = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    if (!ObjectId.isValid(serviceId))
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');
    const result = await reviewService.getAllReviewsByServiceId(
      serviceId,
      req.query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reviews fetched successfully',
      data: result,
    });
  },
);

export default {
  CreateReview,
  UpdateReview,
  DeleteReview,
  GetAllReviewsByServiceId,
};
