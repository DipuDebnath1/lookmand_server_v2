import express from 'express';
const router = express.Router();

import validationRequest from '../../utils/validationRequest';
import auth from '../../../middleware/auth';
import Roles from '../../const/Roles';
import {
  serviceCreateValidation,
  serviceQuoteSearchValidation,
  serviceUpdateValidation,
} from './service.validation';
import ProviderServiceController from './service.controller';
import fileUploader from '../../../middleware/fileUpload/fileUploader';
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
  '/admin/approval_requested',
  auth(Roles.COMMON_ADMIN),
  ProviderServiceController.getAllServicesApprovalRequested,
);

router.get(
  '/admin/approval_requested/:serviceId',
  auth(Roles.COMMON_ADMIN),
  ProviderServiceController.getSingleServiceApprovalRequested,
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

router.post(
  '/:serviceId/action',
  auth(Roles.ADMIN),
  ProviderServiceController.actionServiceById,
);

router.put(
  '/:serviceId',
  auth(Roles.PROVIDER),
  fileUpload.single('image'),
  validationRequest(serviceUpdateValidation),
  ProviderServiceController.updateServiceById,
);

router.delete(
  '/:serviceId',
  auth(Roles.COMMON_ADMIN_PROVIDER),
  ProviderServiceController.deleteServiceById,
);

export default router;
