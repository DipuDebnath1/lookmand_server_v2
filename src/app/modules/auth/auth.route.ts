import express from 'express';
import validationRequest from '../../utils/validationRequest';
import auth from '../../../middleware/auth';
import { AuthController } from './auth.controller';
import AuthValidation from './auth.validation';
import fileUploader from '../../../middleware/fileUpload/fileUploader';

const router = express.Router();

// File upload configuration
const UPLOADS_FOLDER = 'users';
const fileUpload = fileUploader(UPLOADS_FOLDER);

// Authentication routes

// User Registration
router.post(
  '/signup',
  fileUpload.single('image'), // Allow profile image during signup
  validationRequest(AuthValidation.userSignUpValidation),
  AuthController.createUser,
);

// User Login
router.post(
  '/signin',
  validationRequest(AuthValidation.userSignInValidation),
  AuthController.LoginUser,
);

router.post(
  '/login_with_oauth',
  validationRequest(AuthValidation.loginWithOAuthValidation),
  AuthController.LoginWithOAuth,
);

// OTP Verification
router.post(
  '/verify_otp',
  validationRequest(AuthValidation.VerifyOtpValidation),
  AuthController.VerifyOtp,
);

// Forgot Password
router.post(
  '/forgot_password',
  validationRequest(AuthValidation.ForgotPasswordValidation),
  AuthController.ForgotPassword,
);

// Reset Password
router.post(
  '/reset_password',
  validationRequest(AuthValidation.ResetPasswordValidation),
  AuthController.ResetPassword,
);

// update Password
router.post(
  '/update_password',
  validationRequest(AuthValidation.updatePasswordValidation),
  auth('common'),
  AuthController.UpdatePassword,
);

// User Logout
router.post('/logout', AuthController.LogoutUser);

// Update Password
router.post(
  '/refresh_token',
  validationRequest(AuthValidation.refreshTokenVerification),
  auth('common'),
  AuthController.RefreshUserToken,
);

export const AuthRoute = router;
