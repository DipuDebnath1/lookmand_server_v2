import { model, Schema } from 'mongoose';
import { ISubscription } from './subscription.type';
import {
  SubscriptionAccessFeatures,
  SubscriptionDurationType,
  SubscriptionPackageName,
} from './const';

// subscription schema
const subscriptionSchema = new Schema<ISubscription>(
  {
    title: {
      type: String,
      enum: Object.values(SubscriptionPackageName),
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: [String], required: true },
    durationType: {
      enum: Object.values(SubscriptionDurationType),
      type: String,
      required: true,
    },
    access: {
      type: [String],
      enum: Object.values(SubscriptionAccessFeatures),
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Subscription = model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
