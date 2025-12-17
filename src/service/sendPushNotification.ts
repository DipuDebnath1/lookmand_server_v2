/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../app/logger';
import admin from '../config/firebase';

// Send push notification
const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
): Promise<void> => {
  try {
    // Ensure the token is not empty or null
    if (!token) return;

    const message = {
      notification: {
        title,
        body,
      },
      token, // device FCM token
    };

    // Send the notification using Firebase Admin SDK
    await admin.messaging().send(message);
  } catch (error: any) {
    // Log error with additional context
    logger.error('❌ Error sending notification:', error);
  }
};

export default sendPushNotification;
