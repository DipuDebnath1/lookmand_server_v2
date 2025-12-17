/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';
import generateOtp from '../../utils/genarateOtp';
import QueryService from '../../../service/QueryService';

const UserQuery = new QueryService(User);
// **********USER SERVICES**********

// create User
const createUser = async (payload: TUser) => {
  return await User.create(payload);
};

// Find Single User
const getUserById = async (id: string, query?: any) => {
  const select = query?.select || ' name email role image phone';

  return await User.findById(id).select(select);
};

// Find User by Email
const getUserByEmail = async (email: string, query?: any) => {
  const select = query?.select || ' name email role image phone';
  return await User.findOne({ email }).select(select);
};

// Update User
const isUpdateUser = async (userId: string, updateBody: Partial<TUser>) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const code = generateOtp();

  // Send OTP email
  sendOtpVerificationMail(user?.email, code);

  Object.assign(user, updateBody, {
    isDeleted: false,
    isSuspended: false,
    isEmailVerified: false,
    isResetPassword: false,
    isPhoneNumberVerified: false,
    oneTimeCode: code,
  });
  await user.save();
  return user;
};

// Update User Profile
const updateUserProfile = async (
  userId: string,
  updateData: Partial<TUser>,
) => {
  // Remove sensitive fields that shouldn't be updated directly
  const { password, role, isDeleted, ...safeUpdateData } = updateData;

  // Handle password update separately if provided

  const updatedUser = await User.findByIdAndUpdate(userId, safeUpdateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

const getAllUsers = async (query: any) => {
  const allowRoles = ['user', 'provider'];

  const filter: any = { isDeleted: false, role: { $ne: 'admin' } };

  if (query.role && allowRoles.includes(query.role)) {
    filter.role = query.role;
  }
  const result = await UserQuery.findWithQueryParams({
    filters: filter,
    ...query,
    select: 'name email role image phone createdAt',
  });
  return result;
};

// delete account
const deleteAccount = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.isDeleted = true;
  await user.save();
  return user;
};

// const updateAll = async () => {
//   const res = await User.updateMany(
//     {},
//     { image: 'users/scaled_35-1763441494935.jpg' },
//   );
//   console.log(res);
// };

// updateAll();

export const UserServices = {
  createUser,
  getUserByEmail,
  isUpdateUser,
  getUserById,
  updateUserProfile,
  getAllUsers,
  deleteAccount,
};
