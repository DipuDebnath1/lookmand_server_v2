/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from '../user/user.interface';
import { UserServices } from '../user';
import generateOtp from '../../utils/genarateOtp';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';

// Create User in Database
const signUpUser = async (userData: TUser) => {
  const code = generateOtp();
  userData.oneTimeCode = code;

  const res = await UserServices.createUser(userData);
  sendOtpVerificationMail(res.email, code);
  return res;
};

// Login User
const loginUser = async (loginData: { email: string; password: string }) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await UserServices.getUserByEmail(email, {
    select: 'name image role isDeleted isEmailVerified password',
  });
  // console.log(user);

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  if (user.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'User account is deleted !');
  if (!user.isEmailVerified)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Email is not verified !');
  const isPasswordMatch = await user.isPasswordMatch(password);
  if (!isPasswordMatch)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password is incorrect !');

  return user;
};

//forget password
const forgotPassword = async (email: string) => {
  const user = await UserServices.getUserByEmail(email);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');

  const code = generateOtp();
  user.oneTimeCode = code;
  user.isResetPassword = true;
  await user.save();

  sendOtpVerificationMail(user.email, code);
  return user;
};

// reset password
const resetPassword = async (email: string, newPassword: string) => {
  const user = await UserServices.getUserByEmail(email, {
    select: 'isResetPassword',
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  if (!user.isResetPassword)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User is not in reset password state !',
    );
  user.password = newPassword;
  user.isResetPassword = false;
  await user.save();

  return user;
};

// change password
const updatePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await UserServices.getUserByEmail(email, { select: 'password' });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  const isOldPasswordMatch = await user.isPasswordMatch(oldPassword);
  if (!isOldPasswordMatch)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Old password is incorrect !');
  user.password = newPassword;
  await user.save();

  return user;
};

//  verify OTP
const verifyOtp = async (email: string, otp: string) => {
  const user = await UserServices.getUserByEmail(email, {
    select: 'oneTimeCode',
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  if (user.oneTimeCode !== otp)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid OTP !');
  user.isEmailVerified = true;
  user.oneTimeCode = null;
  await user.save();
  return user;
};

// google login
const googleLogin = async (
  name: string,
  image: string,
  email: string,
  role: 'user' | 'provider',
) => {
  const data: any = {
    name,
    email,
    image,
    role: role || 'user',
  };

  let user;

  user = await UserServices.getUserByEmail(data.email!);
  if (!user) user = await UserServices.createUser(data);

  return user;
};

export const AuthServices = {
  signUpUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyOtp,
  googleLogin,
};
