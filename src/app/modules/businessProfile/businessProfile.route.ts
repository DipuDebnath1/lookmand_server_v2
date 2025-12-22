// src/modules/businessProfile/businessProfile.routes.ts

import express from 'express';
import validationRequest from '../../utils/validationRequest';
import businessProfileValidation, {
  availabilitySchemaValidation,
} from './businessProfile.validation';
import BusinessProfileController from './businessProfile.controller';

import auth from '../../../middleware/auth';
import fileUploader from '../../../middleware/fileUpload/fileUploader';
import { Roles } from '../user/const';

// File upload configuration
const UPLOADS_FOLDER = 'businessProfile';
const fileUpload = fileUploader(UPLOADS_FOLDER);

const router = express.Router();

// Route to create or update business profile
router.put(
  '/',
  auth('provider'),
  fileUpload.single('image'), // Handle image upload
  validationRequest(businessProfileValidation),
  BusinessProfileController.CreateOrUpdateProfile,
);

router.put(
  '/ability',
  auth('provider'),
  validationRequest(availabilitySchemaValidation),
  BusinessProfileController.SetAbility,
);

// Route to find business profile
router.get(
  '/self',
  auth(Roles.PROVIDER),
  BusinessProfileController.ProviderSelfProfile,
);

// Route to find business profile
router.get('/:id', BusinessProfileController.FindProfile);
export default router;
