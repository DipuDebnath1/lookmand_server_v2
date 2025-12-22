/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';
import BusinessProfileService from './businessProfile.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';

// Controller for handling business profile operations
// Create or update business profile
const CreateOrUpdateProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req; // Get authorId from user object

    if (req.file) {
      // Handle file upload if present (for image)
      req.body.image = ImageUrl(req.file);
    }

    const updatedProfile = await BusinessProfileService.updateProfile(
      user._id,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Business profile updated successfully',
      success: true,
      data: updatedProfile,
    });
  },
);

// Find business profile by authorId
const FindProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const profile = await BusinessProfileService.findOrCreateProfile(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Business profile found',
    success: true,
    data: profile,
  });
});

// Find business profile by authorId
const ProviderSelfProfile = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req;

  const profile = await BusinessProfileService.findOrCreateProfile(user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Business profile found!',
    success: true,
    data: profile,
  });
});

// set ability
const SetAbility = catchAsync(async (req: Request, res: Response) => {
  const { user }: any = req; // Get authorId from user object

  const updatedProfile = await BusinessProfileService.updateProfile(user._id, {
    availability: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile updated successfully',
    success: true,
    data: updatedProfile,
  });
});

export default {
  CreateOrUpdateProfile,
  FindProfile,
  ProviderSelfProfile,
  SetAbility,
};
