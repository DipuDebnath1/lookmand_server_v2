/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { PipelineStage, Types } from 'mongoose';
import AppError from '../../ErrorHandler/AppError';
import ServiceBooking from './serviceBooking.model';
import { IServiceBooking } from './serviceBooking.type';
import Service from '../service/service.model';
import { BookingBaseService } from '../../../service';
import { bookingStatuses } from './const';
const ObjectId = Types.ObjectId;

const { accepted, pending, cancelled, completed, declined } = bookingStatuses;

// dashboardService.dashboardServiceStatistics();

// Book a service
const bookService = async (payload: IServiceBooking) => {
  return ServiceBooking.create(payload);
};

// get user bookings
const getUserBookings = async (authorId: string, query: any) => {
  const filter: any = {
    author: new ObjectId(authorId),
    isDeletedBy: { $ne: new ObjectId(authorId) },
    status: { $in: [accepted, pending, cancelled] },
  };
  if (query?.status) filter.status = query.status;

  const pipeLine: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'service',
      },
    },
    {
      $unwind: {
        path: '$service',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'service.subCategory',
        foreignField: '_id',
        as: 'service.subCategory',
      },
    },
    {
      $unwind: {
        path: '$service.subCategory',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: 'service.author',
        foreignField: 'author',
        as: 'service.profile',
      },
    },
    {
      $unwind: {
        path: '$service.profile',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'service.author',
        foreignField: '_id',
        as: 'service.author',
      },
    },
    {
      $unwind: {
        path: '$service.author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        status: 1,
        bookingDate: 1,
        details: 1,
        location: 1,
        region: 1,
        createdAt: 1,
        service: {
          _id: '$service._id',
          name: '$service.name',
          description: '$service.description',
          image: '$service.image',

          subCategory: {
            _id: '$service.subCategory._id',
            name: '$service.subCategory.name',
          },
          author: {
            authorId: '$service.author._id',
            _id: '$service.profile._id',
            name: '$service.profile.name',
            image: '$service.profile.image',
            phone: '$service.profile.phone',
            email: '$service.author.email',
          },
        },
      },
    },
  ];

  const bookings = await BookingBaseService.aggregateWithPagination(
    pipeLine,
    query,
  );

  return { bookings: bookings.data, pagination: bookings.pagination };
};

// get provider service booking requests
const getProviderServiceBookingRequests = async (
  providerId: string,
  query: any,
) => {
  const filter: any = {};

  if (query.status) filter.status = query.status;
  if (!query.status) filter.status = { $in: [pending, accepted] };

  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'service',
      },
    },
    {
      $unwind: {
        path: '$service',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: { 'service.author': new ObjectId(providerId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'service.subCategory',
        foreignField: '_id',
        as: 'subcategory',
      },
    },
    {
      $unwind: {
        path: '$subcategory',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        author: {
          _id: '$author._id',
          name: '$author.name',
          image: '$author.image',
          phone: '$author.phone',
          email: '$author.email',
        },
        status: 1,
        bookingDate: 1,
        details: 1,
        location: 1,
        region: 1,
        createdAt: 1,
        subcategory: {
          _id: '$subcategory._id',
          name: '$subcategory.name',
        },
      },
    },
  ];

  const res = await BookingBaseService.aggregateWithPagination(pipeline, query);
  return res;
};

// provider responds to booking (accept, decline, complete, cancel)
const respondToBookingByProvider = async (
  bookingId: string,
  authorId: string,
  status: 'accepted' | 'declined' | 'completed' | 'cancelled',
) => {
  // validate status
  if (![accepted, declined, completed, cancelled].includes(status))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status');

  // validate booking ID
  const booking = await ServiceBooking.findById(bookingId);
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');

  // booking must be pending to accept or decline
  if (
    booking.status !== pending &&
    (status === accepted || status === declined)
  )
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking is not pending');

  /// booking must be accepted to complete
  if (
    (status === completed || status === cancelled) &&
    booking.status !== accepted
  )
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Only accepted bookings can be marked as completed or cancelled',
    );

  // service must belong to provider
  const service = await Service.findById(booking.service);
  if (!service) throw new AppError(httpStatus.NOT_FOUND, 'Service not found');

  if (service.author.toString() !== authorId.toString())
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Not authorized to respond to this booking',
    );

  // update booking status
  booking.status = status;
  await booking.save();

  return { booking, service };
};

// user responds to booking (cancel or mark as completed)
const respondToBookingByUser = async (
  bookingId: string,
  userId: string,
  status: 'cancelled' | 'completed',
) => {
  // validate status
  if (![cancelled, completed].includes(status))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status');

  // validate booking ID
  const booking = await ServiceBooking.findOne({
    _id: new ObjectId(bookingId),
    author: new ObjectId(userId),
  });
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');

  if (booking.status === completed || booking.status === cancelled)
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already closed');

  // booking status update
  booking.status = status;
  await booking.save();

  const service = await Service.findById(booking.service);

  return { booking, service };
};

// delete booking (soft delete) - user delete only own pending bookings
const deleteBooking = async (bookingId: string, userId: string) => {
  const booking = await ServiceBooking.findOne({
    _id: new ObjectId(bookingId),
    author: new ObjectId(userId),
    isDeletedBy: { $ne: new ObjectId(userId) },
  }).select('status');
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');

  const deletableStatuses = [pending, cancelled, completed] as const;
  if (
    deletableStatuses.includes(
      booking!.status as (typeof deletableStatuses)[number],
    )
  )
    throw new AppError(httpStatus.BAD_REQUEST, 'Only history can be deleted');

  // soft delete booking
  booking.isDeletedBy.push(new ObjectId(userId));
  await booking.save();
  return booking;
};

export default {
  bookService,
  getUserBookings,
  getProviderServiceBookingRequests,
  respondToBookingByProvider,
  respondToBookingByUser,
  deleteBooking,
};
