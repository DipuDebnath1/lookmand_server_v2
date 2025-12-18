/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  generateAuthTokens,
  invalidateUserAuthToken,
  refreshUserAuthToken,
} from '../tokens/token.service';
import { TUser, UserServices } from '../user';
import { AuthServices } from './auth.service';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';
import process from 'process';

// Create User
const createUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Handle file upload if present
  const userData: TUser = req.body;

  if (req.file) userData.image = ImageUrl(req.file); // Store the uploaded file name

  // const result = await UserServices.createUserIntoDB(userData);
  const { email } = req.body;
  const isUser = await UserServices.getUserByEmail(email);
  let result;

  if (isUser) {
    if (isUser.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
    } else if (!isUser.isEmailVerified) {
      result = await UserServices.isUpdateUser(isUser.id, { ...req.body });
    }
  } else {
    result = await AuthServices.signUpUser(userData);
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    success: true,
    data:
      config.node === 'production'
        ? undefined
        : { oneTimeCode: result?.oneTimeCode || null },
  });
});

// Login User
const LoginUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Handle profile image update during login if provided
  const loginData = req.body;

  const data = (await AuthServices.loginUser(loginData)) as { _id: string };

  const tokens = await generateAuthTokens(data._id.toString());

  if (loginData?.device === 'web') {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.accessTokenExpires || 7) * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.refreshTokenExpires || 30) * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Sign in successfully',
    data: data,
    tokens: tokens,
  });
});

// Verify OTP
const VerifyOtp: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, oneTimeCode } = req.body;

  const user = await AuthServices.verifyOtp(email, oneTimeCode);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'oneTimeCode verified successfully',
    data: {},
  });
});

// Forgot Password
const ForgotPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const result = await AuthServices.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent to email',
    data:
      config.node === 'production'
        ? undefined
        : { oneTimeCode: result?.oneTimeCode || null },
  });
});

// reset password
const ResetPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await AuthServices.resetPassword(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data:
      config.node === 'production'
        ? undefined
        : { oneTimeCode: result?.oneTimeCode || null },
  });
});

// update password
const UpdatePassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { email } = user;
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.updatePassword(
    email,
    oldPassword,
    newPassword,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: config.node === 'production' ? undefined : result,
  });
});

// Logout User
const LogoutUser: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;
  const { access_token } = req.cookies;

  if (access_token) token = access_token;
  if (!token) token = req.body.refresh_token.split(' ')[1];
  if (!token) throw new AppError(httpStatus.BAD_REQUEST, 'Token is required');

  await invalidateUserAuthToken(token);

  res.clearCookie('access_token');
  res.clearCookie('refresh_token');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully',
    data: null,
  });
});

// Refresh User Token
const RefreshUserToken: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;
  const { access_token } = req.cookies;

  if (access_token) token = access_token;
  if (!token) token = req.body.refresh_token.split(' ')[1];
  if (!token) throw new AppError(httpStatus.BAD_REQUEST, 'Token is required');

  const tokens = await refreshUserAuthToken(token);

  if (req.body?.type === 'web') {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.accessTokenExpires || 7) * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.refreshTokenExpires || 30) * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User token refreshed successfully',
    data: null,
    tokens: tokens,
  });
});

const LoginWithOAuth: RequestHandler = catchAsync(async (req, res, next) => {
  const { role, provider, name, image, email } = req.body;

  // if (!token || !provider)
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Token and provider are required',
  //   );

  let result: any;

  switch (provider) {
    case 'google':
      result = await AuthServices.googleLogin(name, image, email, role);
      break;
    // Add more cases for other providers if needed
    default:
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid provider');
  }

  const tokens = await generateAuthTokens(result._id.toString());

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
    tokens: tokens,
  });
});

export const AuthController = {
  createUser,
  LoginUser,
  LogoutUser,
  LoginWithOAuth,
  UpdatePassword,
  ResetPassword,
  ForgotPassword,
  VerifyOtp,
  RefreshUserToken,
};
