import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import settingService from './setting.service';
import httpStatus from 'http-status';

// Get About Us
const getAboutUs = catchAsync(async (req: Request, res: Response) => {
  const aboutUs = await settingService.getDocument('aboutUs');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: aboutUs,
    success: true,
    message: 'About Us fetched successfully',
  });
});

// Get and Update About Us
const updateAboutUs = catchAsync(async (req: Request, res: Response) => {
  const aboutUs = await settingService.updateDocument('aboutUs', req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: aboutUs,
    success: true,
    message: 'About Us updated successfully',
  });
});

// Get Terms and Conditions
const getTermsAndConditions = catchAsync(
  async (req: Request, res: Response) => {
    const termsAndConditions =
      await settingService.getDocument('termsAndConditions');
    sendResponse(res, {
      statusCode: httpStatus.OK,
      data: termsAndConditions,
      success: true,
      message: 'Terms and Conditions fetched successfully',
    });
  },
);

// Get Privacy Policy
const updateTermsAndConditions = catchAsync(
  async (req: Request, res: Response) => {
    const termsAndConditions = await settingService.updateDocument(
      'termsAndConditions',
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      data: termsAndConditions,
      success: true,
      message: 'Terms and Conditions updated successfully',
    });
  },
);

// Get privacy policy
const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const privacyPolicy = await settingService.getDocument('privacyPolicy');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: privacyPolicy,
    success: true,
    message: 'Privacy Policy fetched successfully',
  });
});

// Get Privacy Policy
const updatePrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const privacyPolicy = await settingService.updateDocument(
    'privacyPolicy',
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: privacyPolicy,
    success: true,
    message: 'Privacy Policy updated successfully',
  });
});

// Get host policy
const getHostPolicy = catchAsync(async (req: Request, res: Response) => {
  const hostPolicy = await settingService.getDocument('hostPolicy');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: hostPolicy,
    success: true,
    message: 'Host Policy fetched successfully',
  });
});

// Get Host Policy
const updateHostPolicy = catchAsync(async (req: Request, res: Response) => {
  const hostPolicy = await settingService.updateDocument(
    'hostPolicy',
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: hostPolicy,
    success: true,
    message: 'Host Policy updated successfully',
  });
});
// Get contact
const getContactUs = catchAsync(async (req: Request, res: Response) => {
  const contactUs = await settingService.getDocument('contactUs');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: contactUs,
    success: true,
    message: 'Contact Us fetched successfully',
  });
});

// Get Contact Us
const updateContactUs = catchAsync(async (req: Request, res: Response) => {
  const contactUs = await settingService.updateDocument('contactUs', req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: contactUs,
    success: true,
    message: 'Contact Us updated successfully',
  });
});

// Exporting all controller functions as an objects
const settingController = {
  getAboutUs,
  updateAboutUs,
  getTermsAndConditions,
  updateTermsAndConditions,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getHostPolicy,
  updateHostPolicy,
  getContactUs,
  updateContactUs,
};
export default settingController;
