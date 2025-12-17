/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryService from '../../../service/QueryService';
import sendPushNotification from '../../../service/sendPushNotification';
import { sendSocketNotification } from '../../../service/socketService';
import { logger } from '../../logger';
import { SubCategoryService } from '../category/category.service';
import { User } from '../user';
import { INotification } from './notification.interface';
import Notification from './notification.model';
import { Types } from 'mongoose';
const { ObjectId } = Types;

const NotificationQuery = new QueryService(Notification);

class NotificationService {
  // Define your controller methods here
  async sendNotification(
    payload: Partial<INotification>,
    notificationType?: { pushNotification: boolean },
  ) {
    // Implementation for sending notification
    try {
      // create notification
      const res = await Notification.create(payload);
      if (!res) return null;
      const notificationData = await Notification.findById(res._id).populate(
        'sender',
        'name image',
      );

      //send notification
      sendSocketNotification(
        payload.user?.toString() || '',
        payload.role,
        notificationData,
      );

      // Send push notification
      if (notificationType?.pushNotification) {
        const user = await User.findById(payload.user).select('fcmToken');
        if (!user || !user.fcmToken) return notificationData;

        sendPushNotification(
          user.fcmToken,
          payload.title || 'New Notification',
          payload.description || '',
        );
      }

      return notificationData;
    } catch (err: any) {
      logger.error(err?.message || 'Error occurred while sending notification');
    }
  }

  // get user notifications
  async getUserSelfNotifications(
    userId: string,
    role: string,
    query: any,
    SearchQuoteDate: string,
  ) {
    const select = '-__v -role';
    const populate = [
      {
        path: 'sender',
        select: 'name image',
      },
      {
        path: 'service',
        select: 'name image',
      },
      {
        path: 'serviceRRequest',
        select: 'title description status',
        populate: {
          path: 'service',
          select: 'name image',
        },
      },
    ];

    // base filters
    let filters: any = { user: new Object(userId) };

    // admin and superAdmin can see all notifications
    if (role === 'admin' || role === 'superAdmin')
      filters = {
        $or: [{ role: 'admin' }, { user: new Object(userId) }],
        isDeleted: false,
      };

    // provider can see provider and general notifications
    if (role === 'provider') {
      filters = {
        createdAt: {
          $gte: new Date(SearchQuoteDate),
        },
        $or: [{ type: 'serviceQuote' }, { user: new Object(userId) }],
      };
    }

    // { type: 'serviceQuote' }
    const res = await NotificationQuery.findWithQueryParams({
      filters: filters,
      ...query,
      select,
      populate,
    });

    this.markAllNotificationAsRead(userId);

    return res;
  }

  // mark all notification as read
  async markAllNotificationAsRead(userId: string) {
    return await Notification.updateMany(
      { user: new Object(userId), isViewed: false },
      { $set: { isViewed: true } },
    );
  }

  // subscription expire notification
  async sendSubscriptionExpireNotification(userId: string) {
    try {
      const payload: Partial<INotification> = {
        user: userId as string as any,
        title: 'Subscription Expired',
        description:
          'Your subscription has expired. Please renew to continue enjoying our services.',
      };

      await this.sendNotification(payload, { pushNotification: true });
    } catch (error: any) {
      logger.error(
        `Error sending subscription expire notification: ${error.message}`,
      );
    }
  }

  // subscription purchase notification
  async sendSubscriptionPurchaseNotification(userId: string) {
    try {
      const payload: Partial<INotification> = {
        user: userId as string as any,
        title: 'Subscription Purchased',
        description:
          'Thank you for purchasing a subscription. Enjoy our services!',
      };

      await this.sendNotification(payload, { pushNotification: true });
    } catch (error: any) {
      logger.error(
        `Error sending subscription purchase notification: ${error.message}`,
      );
    }
  }

  // service quote notification send to subscribed provider
  async serviceQuoteNotificationSend(
    payload: any,
    serviceCategory: string,
    location: string,
  ) {
    try {
      // find all providers of the service category
      const providers = await User.aggregate([
        {
          $match: {
            role: 'provider',
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: 'subscriptionpurchases', //SubscriptionPurchase
            localField: '_id',
            foreignField: 'author',
            as: 'subscribedproviders',
          },
        },
        {
          $unwind: '$subscribedproviders',
        },
        {
          $match: {
            'subscribedproviders.status': 'active',
            'subscribedproviders.locations': location,
          },
        },
        {
          $lookup: {
            from: 'providerservices', //Subscription
            localField: '_id',
            foreignField: 'author',
            as: 'providerservices',
          },
        },
        { $unwind: '$providerservices' },
        {
          $match: {
            'providerservices.status': 'approved',
            'providerservices.subCategory': new ObjectId(serviceCategory),
            'providerservices.isDeleted': false, // '64b64c6f3f9dcb001c8e4b8a' is the category ID for 'Quotes' category
          },
        },
        {
          $group: {
            _id: '$_id',
            fcmToken: { $first: '$fcmToken' },
          },
        },
      ]);

      const category =
        await SubCategoryService.getSubCategoryById(serviceCategory);

      // send notification to each provider
      for (const provider of providers) {
        sendPushNotification(
          provider?.fcmToken,
          `New Service Quote in ${category?.name}`,
          `A new service quote has been posted in ${category?.name}.`,
        );

        sendSocketNotification(provider._id.toString(), 'provider', {
          ...payload,
        });
      }
    } catch (error: any) {
      logger.error(
        `Error sending service quote notification: ${error.message}`,
      );
    }
  }
}

export default new NotificationService();
