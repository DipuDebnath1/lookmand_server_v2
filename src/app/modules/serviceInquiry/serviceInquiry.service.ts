/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { SubscriptionAccessFeatures } from '../subscription/const';
import SubscriptionPurchasesService from '../subscriptionPurchases/SubscriptionPurchases.service';
import AppError from '../../ErrorHandler/AppError';
import BusinessProfile from '../businessProfile/businessProfile.model';
import {
  BookingBaseService,
  ProviderBaseService,
  ServiceInquiryBaseService,
} from '../../../service';
import { ServiceInquiryPopulate, ServiceInquiryStatuses } from './const';
import { bookingStatuses } from '../serviceBooking/const';
import { IServiceBooking } from '../serviceBooking/serviceBooking.type';
import mongoose, { Types } from 'mongoose';
import { Region } from '../user/const';
import SocketService from '../../../service/socketService';
import { SocketRoomId } from '../../../service/const';

// all service inquiries for subscribed providers
const AllServiceInquiries = async (providerId: string, query: any) => {
  //   check have Access for service inquiry
  const hasAccess = await SubscriptionPurchasesService.checkAccess(
    providerId,
    SubscriptionAccessFeatures.PostInquiry,
  );
  if (!hasAccess)
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have access service inquiries!',
    );

  // get provider business profile
  const profile = await BusinessProfile.findOne({
    author: providerId,
  }).select('serviceCategory region');

  // get service inquiries related to provider service category
  const ServiceInquiries = await ServiceInquiryBaseService.findWithPagination({
    filters: {
      region: profile?.region,
      category: profile?.serviceCategory,
      status: ServiceInquiryStatuses.active,
      // only future inquiries add 2 day buffer time
      date: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      isDeleted: false,
    },
    select: ServiceInquiryPopulate.fields,
    populate: [
      ServiceInquiryPopulate.author,
      ServiceInquiryPopulate.subCategory,
    ],
    sort: { createdAt: -1 },
    ...query,
  });

  return ServiceInquiries;
};

// provider accept post inquiry
const acceptedPostInquiry = async (
  providerId: string,
  postInquiryId: string,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // check have access for accept inquiry
    const checkHaveAccess = await SubscriptionPurchasesService.checkAccess(
      providerId,
      SubscriptionAccessFeatures.PostInquiry,
    );
    if (!checkHaveAccess)
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have access to accept service inquiries!',
      );

    // check valid service inquiry
    const serviceInquiry = await ServiceInquiryBaseService.findById(
      postInquiryId,
      {
        select:
          '_id status author isDeleted category subCategory region date additionalInfo location',
      },
    );
    if (!serviceInquiry || serviceInquiry.isDeleted)
      throw new AppError(httpStatus.NOT_FOUND, 'Service inquiry not found');

    if (serviceInquiry.status !== ServiceInquiryStatuses.active)
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Service inquiry is not active',
      );

    //   check have provider this service
    const providerService = await ProviderBaseService.findOne({
      filters: {
        author: providerId,
        subCategory: serviceInquiry.subCategory,
        isDeleted: false,
      },
    });

    if (!providerService)
      throw new AppError(httpStatus.BAD_REQUEST, 'You have not this service');

    // create service booking payload
    const serviceBookingPayload = {
      author: serviceInquiry.author as Types.ObjectId,
      details: serviceInquiry.additionalInfo as string,
      service: providerService._id as Types.ObjectId,
      bookingDate: serviceInquiry.date as Date,
      region: serviceInquiry.region as keyof typeof Region,
      location: serviceInquiry.location as string,
      status: bookingStatuses.accepted as keyof typeof bookingStatuses,
    } as Partial<IServiceBooking>;

    // create service booking
    const bookingResponse = await BookingBaseService.create(
      serviceBookingPayload,
      session,
    );

    // update service inquiry status to booked
    serviceInquiry.status = ServiceInquiryStatuses.respond;
    await serviceInquiry.save({ session });

    // commit transaction
    await session.commitTransaction();

    // send post inquiry accepted notification to user with socket
    SocketService.notifyNewServiceInquiryToProviders(
      serviceInquiry.category.toString(),
      serviceInquiry,
    );

    // update service inquiry status notification to user with socket
    SocketService.sendDataToUserWithSocketId({
      userId: serviceInquiry.author.toString(),
      data: serviceInquiry,
      roomId: SocketRoomId.ServiceInquiryStatusUpdate,
    });

    return bookingResponse;
  } catch (error: any) {
    // rollback transaction
    await session.abortTransaction();

    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message || 'Failed to accept service inquiry',
    );
  } finally {
    // end session
    await session.endSession();
  }
};

const serviceInquiryService = {
  acceptedPostInquiry,
  AllServiceInquiries,
};

export default serviceInquiryService;
