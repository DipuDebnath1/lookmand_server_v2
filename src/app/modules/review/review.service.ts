/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import ServiceBooking from '../serviceBooking/serviceBooking.model';
import Review from './review.model';
import { IReview } from './review.type';
import { Types } from 'mongoose';
import { ReviewBaseService } from '../../../service';
import { bookingStatuses } from '../serviceBooking/const';
const { ObjectId } = Types;

// create review
const createReview = async (payload: IReview, bookingId: string) => {
  const booking = await ServiceBooking.findOne({
    author: new ObjectId(payload.author),
    _id: new ObjectId(bookingId),
  });

  if (!booking)
    throw new AppError(httpStatus.BAD_REQUEST, 'service booking not found !');

  if (booking.status !== bookingStatuses.completed)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'service booking is not completed yet',
    );

  // check exist review
  const isExist = await Review.findOne({
    author: new ObjectId(payload.author),
    service: booking.service,
    booking: new ObjectId(bookingId),
    isDeleted: false,
  });

  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'you have already reviewed');
  }

  return await Review.create({
    ...payload,
    service: booking.service,
    booking: new ObjectId(bookingId),
  });
};

// update review
const updateReview = async (
  id: string,
  author: string,
  payload: Partial<IReview>,
) => {
  const review = await Review.findOne({
    _id: new ObjectId(id),
    author: new ObjectId(author),
    isDeleted: false,
  });

  if (!review) throw new AppError(httpStatus.NOT_FOUND, 'Review not found!');

  Object.assign(review, payload);
  await review.save();

  return review;
};

// delete review
const deleteReview = async (id: string, author: string) => {
  const review = await Review.findOne({
    _id: new ObjectId(id),
    author: new ObjectId(author),
    isDeleted: false,
  });
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  review.isDeleted = true;
  await review.save();
  return review;
};

// get all reviews by service id
const getAllReviewsByServiceId = async (serviceId: string, query: any) => {
  const filter = { service: new ObjectId(serviceId), isDeleted: false };
  return await ReviewBaseService.findWithPagination({
    filters: filter,
    populate: [
      {
        path: 'author',
        select: 'name image',
      },
    ],
    select: 'author description rating createdAt',

    ...query,
  });
};

export default {
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsByServiceId,
};
