import express from 'express';
const router = express.Router();

import validationRequest from '../../utils/validationRequest';
import auth from '../../../middleware/auth';
import { serviceQuoteSearchValidation } from './service.validation';
import ProviderServiceController from './service.controller';
import { Roles } from '../user/const';
// File upload configuration

router.post(
  '/:subCategoryId',
  auth(Roles.PROVIDER),
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
  '/provider/:authorId',
  ProviderServiceController.ProviderServicesByAuthorId,
);

router.get(
  '/self',
  auth(Roles.PROVIDER),
  ProviderServiceController.ProviderSelfServices,
);

router.delete(
  '/:serviceId',
  auth(Roles.COMMON_ADMIN_PROVIDER),
  ProviderServiceController.deleteServiceById,
);

export default router;
