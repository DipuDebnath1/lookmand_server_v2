/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import AppError from '../../ErrorHandler/AppError';
import sendResponse from '../../utils/sendResponse';
import { Types } from 'mongoose';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';
import serviceBookingService from './serviceBooking.service';
import ProviderService from '../providerService/providerService.service';
import notificationService from '../notification/notification.service';
const ObjectId = Types.ObjectId;

// Book a service
const BookService = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { service: serviceId, bookingDate } = req.body;
  // validate service ID
  if (!ObjectId.isValid(serviceId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid service ID');

  // validate booking date
  if (
    !bookingDate ||
    isNaN(Date.parse(bookingDate)) ||
    new Date(bookingDate) < new Date()
  )
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid booking date');

  // check if service exists and is approved
  const service = await ProviderService.getServiceById(serviceId);
  // check if service exists and is approved
  if (!service || service.isDeleted || service.status !== 'approved')
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');

  // create booking
  const bookingData = {
    ...req.body,
    author: user._id,
    service: serviceId,
  };
  const booking = await serviceBookingService.bookService(bookingData);

  // notify provider about new booking
  notificationService.sendNotification(
    {
      user: service.author,
      sender: user._id,
      title: 'New Service Booking',
      description: `${user.name} has sent a booking request for your service.`,
      service: service._id as any,
      type: 'serviceBooking',
      role: 'provider',
    },
    { pushNotification: true },
  );

  // send response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Service booked successfully',
    success: true,
    data: booking,
  });
});

// get user bookings
const GetUserBookings = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const bookings = await serviceBookingService.getUserBookings(
    user._id,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Bookings retrieved successfully',
    success: true,
    data: bookings,
  });
});

// get provider service booking requests
const GetProviderServiceBookingRequests = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const bookings =
      await serviceBookingService.getProviderServiceBookingRequests(
        user._id,
        req.query,
      );

    // check if bookings exist
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Bookings retrieved successfully',
      success: true,
      data: bookings,
    });
  },
);

// provider responds to booking request
const respondToBookingRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status)
      throw new AppError(httpStatus.BAD_REQUEST, 'Status is required');

    let result;
    // validate booking ID
    if (!ObjectId.isValid(bookingId))
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid booking ID');
    // check user role and call appropriate service method
    switch (user.role) {
      case 'provider':
        result = await serviceBookingService.respondToBookingByProvider(
          bookingId,
          user._id,
          status,
        );
        break;
      case 'user':
        result = await serviceBookingService.respondToBookingByUser(
          bookingId,
          user._id,
          status,
        );
        break;

      default:
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Not authorized to respond to this booking',
        );
    }

    // send notification to user about booking status update
    const { booking, service } = result;
    const notifiedUserId =
      user.role === 'provider' ? booking.author : service!.author;

    notificationService.sendNotification(
      {
        user: notifiedUserId,
        sender: user._id,
        title: 'Booking ' + status.charAt(0).toUpperCase() + status.slice(1),
        description: `Your booking has been ${status} by the ${user.role}.`,
        service: result!.service as any,
        type: 'serviceBooking',
        role: 'user',
      },
      { pushNotification: true },
    );

    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Booking status updated successfully',
      success: true,
      data: booking,
    });
  },
);

// delete booking (soft delete) - user delete only own pending bookings
const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;
  const { bookingId } = req.params;
  if (!ObjectId.isValid(bookingId))
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid booking ID');
  await serviceBookingService.deleteBooking(bookingId, user._id);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Booking deleted successfully',
    success: true,
    data: null,
  });
});

const BookingController = {
  BookService,
  GetUserBookings,
  GetProviderServiceBookingRequests,
  respondToBookingRequest,
  deleteBooking,
};
export default BookingController;
