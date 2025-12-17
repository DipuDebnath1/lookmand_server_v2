import express from 'express';
import auth from '../../../middleware/auth';
import Roles from '../../const/Roles';
import validationRequest from '../../utils/validationRequest';
import AddsController from './add.controller';
import { createAddValidation } from './add.validation';
import fileUploader from '../../../middleware/fileUpload/fileUploader';

const fileUploaderMiddleware = fileUploader('adds');

const router = express.Router();

router.post(
  '/create',
  auth(Roles.PROVIDER),
  fileUploaderMiddleware.single('image'),
  validationRequest(createAddValidation),
  AddsController.CreateAdds,
);

router.get('/self', auth(Roles.PROVIDER), AddsController.getSelfAdds);

router.get(
  '/all',
  // auth(Roles.COMMON),
  AddsController.getAllAdds,
);

export default router;
