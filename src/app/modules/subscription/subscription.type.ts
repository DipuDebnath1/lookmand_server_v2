import { Document } from 'mongoose';
import {
  SubscriptionAccessFeatures,
  SubscriptionDurationType,
  SubscriptionPackageName,
} from './const';

// subscription interface
export interface ISubscription extends Document {
  title: keyof typeof SubscriptionPackageName;
  price: number;
  durationType: keyof typeof SubscriptionDurationType;
  duration: number;
  access: (keyof typeof SubscriptionAccessFeatures)[];
  description: string[];
  isDeleted: boolean;
}
