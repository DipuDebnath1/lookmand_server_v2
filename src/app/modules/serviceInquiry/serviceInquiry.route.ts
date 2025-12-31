import express from 'express';
import ServiceInquiryController from './serviceInquiry.controller';
import auth from '../../../middleware/auth';
import { Roles } from '../user/const';
import validationRequest from '../../utils/validationRequest';
import { ServiceInquiryValidation } from './serviceInquiry.validation';

const router = express.Router();

router.post(
  '/',
  auth(Roles.USER),
  validationRequest(ServiceInquiryValidation),
  ServiceInquiryController.AddNewServiceInquiry,
);

router.get(
  '/self',
  auth(Roles.USER),
  ServiceInquiryController.UserSelfServiceInquiries,
);

router.get(
  '/',
  auth(Roles.PROVIDER),
  ServiceInquiryController.UserSelfServiceInquiries,
);
router.post(
  '/:inquiryId/accept',
  auth(Roles.PROVIDER),
  ServiceInquiryController.AcceptedPostInquiry,
);

export default router;
