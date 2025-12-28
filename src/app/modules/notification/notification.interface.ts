import { Document, Types } from 'mongoose';
import { TRoles } from '../user';
import { notificationTypes } from './notification.const';

export interface INotification extends Document {
  user: Types.ObjectId;
  sender: Types.ObjectId;
  title: string;
  description: string;
  service: Types.ObjectId;
  serviceRRequest: Types.ObjectId;
  type: keyof typeof notificationTypes;
  role: TRoles;
  isViewed: boolean;
}
