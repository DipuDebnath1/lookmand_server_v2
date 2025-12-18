import express from 'express';
import auth from '../../../middleware/auth';
import settingController from './setting.controller';
import validationRequest from '../../utils/validationRequest';
import { documentUpdateValidation } from './setting.validation';
import { Roles } from '../user/const';

const router = express.Router();
// About  Us
router.get('/about_us', settingController.getAboutUs);
router.put(
  '/about_us',
  validationRequest(documentUpdateValidation),
  auth(Roles.COMMON_ADMIN),
  settingController.updateAboutUs,
);
//  Terms and Conditions
router.get('/terms_and_conditions', settingController.getTermsAndConditions);
router.put(
  '/terms_and_conditions',
  validationRequest(documentUpdateValidation),
  auth(Roles.COMMON_ADMIN),
  settingController.updateTermsAndConditions,
);
// Privacy Policy
router.get('/privacy_policy', settingController.getPrivacyPolicy);
router.put(
  '/privacy_policy',
  validationRequest(documentUpdateValidation),
  auth(Roles.COMMON_ADMIN),
  settingController.updatePrivacyPolicy,
);
// Host Policy
router.get('/host_policy', settingController.getHostPolicy);
router.put(
  '/host_policy',
  validationRequest(documentUpdateValidation),
  auth(Roles.COMMON_ADMIN),
  settingController.updateHostPolicy,
);
// Contact Us
router.get('/contact_us', settingController.getContactUs);
router.put(
  '/contact_us',
  validationRequest(documentUpdateValidation),
  auth(Roles.COMMON_ADMIN),
  settingController.updateContactUs,
);

export default router;
