/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';
import generateOtp from '../../utils/genarateOtp';
import { UserBaseService } from '../../../service';
import { PipelineStage, Types } from 'mongoose';
const { ObjectId } = Types;

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

// get all users
const getAllUsers = async (query: any) => {
  const allowRoles = ['user', 'provider'];

  const filter: any = { isDeleted: false, role: { $ne: 'admin' } };

  if (query.role && allowRoles.includes(query.role)) {
    filter.role = query.role;
  }
  const result = await UserBaseService.aggregateWithPagination([
    { $match: filter },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: '_id',
        foreignField: 'author',
        as: 'businessProfile',
      },
    },
    {
      $unwind: {
        path: '$businessProfile',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'businessProfile.serviceCategory',
        foreignField: '_id',
        as: 'businessProfile.serviceCategory',
      },
    },
    {
      $unwind: {
        path: '$businessProfile.serviceCategory',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        image: 1,
        phone: 1,
        location: 1,
        createdAt: 1,
        businessProfile: {
          _id: 1,
          name: 1,
          phone: 1,
          description: 1,
          region: 1,
          location: 1,
          image: 1,
          serviceCategory: {
            name: 1,
            image: 1,
          },
          isProfileComplete: 1,
          availability: 1,
        },
      },
    },
  ]);
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

// get featured providers
const getFeaturedProviders = async (category: string) => {
  const pipeline: PipelineStage[] = [
    { $match: { role: 'provider', isDeleted: false } },
    {
      $lookup: {
        from: 'businessprofiles',
        localField: '_id',
        foreignField: 'author',
        as: 'businessProfile',
      },
    },
    {
      $unwind: {
        path: '$businessProfile',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (category) {
    pipeline.push({
      $match: {
        'businessProfile.serviceCategory': new ObjectId(category),
      },
    });
  }

  pipeline.push(
    // get services and average rating
    {
      $lookup: {
        from: 'services',
        localField: 'businessProfile.author',
        foreignField: 'author',
        as: 'services',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: 'services._id',
        foreignField: 'service',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        totalRatings: { $size: '$reviews' },
      },
    },

    // Project necessary fields
    {
      $project: {
        name: '$businessProfile.name',
        email: '$businessProfile.email',
        phone: '$businessProfile.phone',
        image: '$businessProfile.image',
        description: '$businessProfile.description',
        region: '$businessProfile.region',
        author: '$businessProfile.author',
        averageRating: 1,
        totalRatings: 1,
      },
    },
    {
      $sort: { totalRatings: -1, averageRating: -1 },
    },
    {
      $limit: 10,
    },
  );

  const providers = await UserBaseService.aggregate(pipeline);

  return providers;
};

export const UserServices = {
  createUser,
  getUserByEmail,
  isUpdateUser,
  getUserById,
  updateUserProfile,
  getAllUsers,
  deleteAccount,
  getFeaturedProviders,
};
