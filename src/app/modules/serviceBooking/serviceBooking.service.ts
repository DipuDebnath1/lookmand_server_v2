/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { PipelineStage, Types } from 'mongoose';
import QueryService from '../../../service/QueryService';
import AppError from '../../ErrorHandler/AppError';
import dashboardService from '../dashboard/dashboard.service';
import Service from '../providerService/providerService.model';
import ServiceBooking from './serviceBooking.model';
import { IServiceBooking } from './serviceBooking.type';
const ObjectId = Types.ObjectId;
const ServiceBookingQuery = new QueryService(ServiceBooking);
const ServiceQuery = new QueryService(Service);

dashboardService.dashboardServiceStatistics();

// Book a service
const bookService = async (payload: IServiceBooking) => {
  return ServiceBooking.create(payload);
};

// get user bookings
const getUserBookings = async (userId: string, query: any) => {
  const filter: any = { author: new ObjectId(userId), isDeleted: false };
  if (query?.status) filter.status = query.status;

  const select = 'service status createdAt';

  const populate = [
    {
      path: 'service',
      select: 'name description image subCategory',
      populate: [{ path: 'subCategory', select: 'name' }],
    },
  ];
  const bookings = await ServiceBookingQuery.findWithQueryParams({
    filters: filter,
    select,
    ...query,
    populate,
  });
  return bookings;
};

// get provider service booking requests
const getProviderServiceBookingRequests = async (
  providerId: string,
  query: any,
) => {
  const filter: any = {
    author: new ObjectId(providerId),
    status: 'approved',
    isDeleted: false,
  };

  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: 'servicebookings',
        localField: '_id',
        foreignField: 'service',
        as: 'bookings',
      },
    },
    {
      $unwind: {
        path: '$bookings',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // filter by booking status
  if (query?.status) {
    pipeline.push({
      $match: { 'bookings.status': query.status },
    });
  }

  // lookup user details
  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'bookings.author',
        foreignField: '_id',
        as: 'bookedAuthor',
      },
    },
    {
      $unwind: {
        path: '$bookedAuthor',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  // grouping data
  pipeline.push({
    $project: {
      _id: '$bookings._id',
      author: {
        name: '$bookedAuthor.name',
        image: '$bookedAuthor.image',
      },
      description: '$bookings.description',
      location: '$bookings.location',
      bookingDate: '$bookings.bookingDate',
      status: '$bookings.status',
      category: {
        _id: '$category._id',
        name: '$category.name',
      },
    },
  });
  const res = await ServiceQuery.aggregateWithPagination(pipeline, query);
  return res;
};

// provider responds to booking (accept, decline, complete, cancel)
const respondToBookingByProvider = async (
  bookingId: string,
  authorId: string,
  status: 'accepted' | 'declined' | 'completed' | 'cancelled',
) => {
  // validate status
  if (!['accepted', 'declined', 'completed', 'cancelled'].includes(status))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status');

  // validate booking ID
  const booking = await ServiceBooking.findById(bookingId);
  if (!booking || booking.isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');

  // booking must be pending to accept or decline
  if (
    booking.status !== 'pending' &&
    (status === 'accepted' || status === 'declined')
  )
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking is not pending');

  /// booking must be accepted to complete
  if (
    (status === 'completed' || status === 'cancelled') &&
    booking.status !== 'accepted'
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
  if (service.isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, 'Service is no longer available');

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
  if (!['cancelled', 'completed'].includes(status))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status');

  // validate booking ID
  const booking = await ServiceBooking.findOne({
    _id: new ObjectId(bookingId),
    isDeleted: false,
    author: new ObjectId(userId),
  });
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');

  if (booking.status === 'completed' || booking.status === 'cancelled')
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
    isDeleted: false,
    author: new ObjectId(userId),
  });
  if (!booking) throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');

  if (booking.status !== 'pending')
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you can only delete pending bookings',
    );

  // soft delete booking
  booking.isDeleted = true;
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
