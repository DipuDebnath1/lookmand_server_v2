import express from 'express';
import { UserController } from './user.controller';
import validationRequest from '../../utils/validationRequest';
import userValidation from './user.validation';
import auth from '../../../middleware/auth';
import fileUploader from '../../../middleware/fileUpload/fileUploader';
import { Roles } from './const';

const router = express.Router();

// File upload configuration
const UPLOADS_FOLDER = 'users';
const fileUpload = fileUploader(UPLOADS_FOLDER);

// **********USER ROUTES**********

// Profile routes

router.get('/self', auth(Roles.COMMON), UserController.GetSelfProfile);

router.put(
  '/update-profile',
  auth(Roles.COMMON),
  fileUpload.single('image'),
  validationRequest(userValidation.updateProfileValidation),
  UserController.UpdateUserProfile,
);

router.get('/all', auth(Roles.COMMON_ADMIN), UserController.AllUsers);
// router delete account
router.delete(
  '/delete-account',
  auth(Roles.COMMON),
  UserController.DeleteAccount,
);

export const UserRoute = router;
