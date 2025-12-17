import { Types } from 'mongoose';
import { ISubscription } from '../subscription/subscription.type';
import { Document } from 'mongoose';

// subscription purchase interface
export interface ISubscriptionPurchase extends Document {
  author: Types.ObjectId;
  subscription: Types.ObjectId;
  access: Array<string>;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
}

// Populated version
export interface ISubscriptionPurchasePopulated extends Omit<
  ISubscriptionPurchase,
  'subscription'
> {
  subscription: ISubscription;
}
