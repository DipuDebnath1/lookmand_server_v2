/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';
import BusinessProfileService from './businessProfile.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';

// Controller for handling business profile operations
const BusinessProfileController = {
  // Create or update business profile
  createOrUpdateProfile: catchAsync(async (req: Request, res: Response) => {
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
  }),

  // Set the availability status of the business profile
  setAvailabilityStatus: catchAsync(async (req: Request, res: Response) => {
    const { user }: any = req;
    const { isAvailable } = req.body;

    await BusinessProfileService.setAvailabilityStatus(user._id, isAvailable);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Availability status updated successfully',
      success: true,
      data: {},
    });
  }),

  // Find business profile by authorId
  findProfile: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const profile = await BusinessProfileService.findOrCreateProfile(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Business profile found',
      success: true,
      data: profile,
    });
  }),
};

export default BusinessProfileController;
