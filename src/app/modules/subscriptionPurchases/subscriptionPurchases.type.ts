import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.type';
import { Document } from 'mongoose';
import { SubscriptionAccessFeatures } from '../subscription/const';

// subscription purchase interface
export interface ISubscriptionPurchase extends Document {
  author: Types.ObjectId;
  subscription: Types.ObjectId;
  access: (keyof typeof SubscriptionAccessFeatures)[];
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
}

// Populated version
export interface ISubscriptionPurchasePopulated
  extends Omit<ISubscriptionPurchase, 'subscription'> {
  subscription: ISubscription;
}
