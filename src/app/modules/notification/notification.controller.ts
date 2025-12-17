/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import notificationService from './notification.service';

const NotificationController = {
  // get all notifications for a user
  AllNotifications: catchAsync(async (req, res) => {
    const { user }: any = req;
    const userId = user?._id;
    const role = user?.role;
    const notifications = await notificationService.getUserSelfNotifications(
      userId,
      role,
      req.query,
      user?.createdAt,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: notifications,
    });
  }),
};

export default NotificationController;
