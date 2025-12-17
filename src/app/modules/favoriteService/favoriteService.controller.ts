/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import favoriteServiceService from './favoriteService.service';

// Add Favorite Service
const AddFFavoriteService = catchAsync(async (req, res) => {
  const { user }: any = req;
  const author = user?._id;
  const { id } = req.params;

  const favorite = await favoriteServiceService.createFavoriteService(
    author,
    id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite service added successfully',
    data: favorite,
  });
});

// fund self favorite service
const getSelfFavoriteService = catchAsync(async (req, res) => {
  const { user }: any = req;
  const author = user?._id;

  const favorites = await favoriteServiceService.getAllFavoriteService(
    author,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite services retrieved successfully',
    data: favorites,
  });
});

// remove favorite service
const removeFavoriteService = catchAsync(async (req, res) => {
  const { user }: any = req;
  const { id } = req.params;
  await favoriteServiceService.removeFavoriteService(user?._id, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite service removed successfully',
    data: {},
  });
});

export default {
  AddFFavoriteService,
  getSelfFavoriteService,
  removeFavoriteService,
};
