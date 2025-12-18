import express from 'express';
const router = express.Router();

import validationRequest from '../../utils/validationRequest';
import auth from '../../../middleware/auth';
import {
  serviceCreateValidation,
  serviceQuoteSearchValidation,
} from './service.validation';
import ProviderServiceController from './service.controller';
import fileUploader from '../../../middleware/fileUpload/fileUploader';
import { Roles } from '../user/const';
// File upload configuration
const UPLOADS_FOLDER = 'services';
const fileUpload = fileUploader(UPLOADS_FOLDER);

router.post(
  '/',
  auth(Roles.PROVIDER),
  fileUpload.single('image'),
  validationRequest(serviceCreateValidation),
  ProviderServiceController.createService,
);

router.post(
  '/search',
  validationRequest(serviceQuoteSearchValidation),
  auth(Roles.USER),
  ProviderServiceController.searchServiceQuoteByProvider,
);

router.get(
  '/all',
  // auth(Roles.COMMON),
  ProviderServiceController.getAllServices,
);
router.get(
  '/single/:serviceId',
  // auth(Roles.COMMON),
  ProviderServiceController.getSingleService,
);

router.get(
  '/provider/self',
  auth(Roles.PROVIDER),
  ProviderServiceController.getServicesByProvider,
);

router.delete(
  '/:serviceId',
  auth(Roles.COMMON_ADMIN_PROVIDER),
  ProviderServiceController.deleteServiceById,
);

export default router;
