/* eslint-disable @typescript-eslint/no-explicit-any */
import { Job } from 'agenda';
import SubscriptionPurchase from '../../app/modules/subscriptionPurchases/SubscriptionPurchases.model';
import { logger } from '../../app/logger';
import notificationService from '../../app/modules/notification/notification.service';
import { AgendaJobNames } from '../const';

export interface SendEmailReminderData {
  _id: string;
}

export const subscriptionExpireJob = {
  name: AgendaJobNames.SubscriptionExpire,
  handler: async (job: Job<SendEmailReminderData>) => {
    try {
      const { _id } = job.attrs.data;

      // Fetch the subscription purchase by ID
      const subscription = await SubscriptionPurchase.findById(_id);
      if (!subscription) {
        logger.error(`Subscription with ID ${_id} not found.`);
        return;
      }

      // Update the subscription status to 'expired'
      subscription.status = 'expired';
      await subscription.save();

      // send notification
      notificationService.sendSubscriptionExpireNotification(
        subscription.author.toString(),
      );

      logger.info(`📧 Subscription expired: ${_id}`);
    } catch (error: any) {
      logger.error(`Send email reminder job error: ${error.message}`);
    }
  },
};
