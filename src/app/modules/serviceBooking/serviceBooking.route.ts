import express from 'express';
const router = express.Router();

import auth from '../../../middleware/auth';
import ServiceBookingController from './serviceBooking.controller';
import validationRequest from '../../utils/validationRequest';
import { ServiceBookingValidation } from './serviceBooking.validation';
import { Roles } from '../user/const';

router.post(
  '/',
  auth(Roles.USER),
  validationRequest(ServiceBookingValidation),
  ServiceBookingController.BookService,
);

router.get('/user', auth(Roles.USER), ServiceBookingController.GetUserBookings);

router.get(
  '/provider',
  auth(Roles.PROVIDER),
  ServiceBookingController.GetProviderServiceBookingRequests,
);

router.patch(
  '/respond/:bookingId',
  auth(Roles.USER_PROVIDER_COMMON),
  ServiceBookingController.respondToBookingRequest,
);

router.delete(
  '/:bookingId',
  auth(Roles.USER),
  ServiceBookingController.deleteBooking,
);

export default router;
