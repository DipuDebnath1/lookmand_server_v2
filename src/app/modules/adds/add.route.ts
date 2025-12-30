import express from 'express';
import auth from '../../../middleware/auth';
import AddsController from './add.controller';
import fileUploader from '../../../middleware/fileUpload/fileUploader';
import { Roles } from '../user/const';

const fileUploaderMiddleware = fileUploader('adds');

const router = express.Router();

router.post(
  '/create',
  auth(Roles.PROVIDER),
  fileUploaderMiddleware.single('content'),
  AddsController.CreateAdds,
);

router.get('/self', auth(Roles.PROVIDER), AddsController.getSelfAdds);

router.get(
  '/all',
  // auth(Roles.COMMON),
  AddsController.getAllAdds,
);

export default router;
