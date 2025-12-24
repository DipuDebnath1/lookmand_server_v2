import { model, Schema } from 'mongoose';
import { ISubscriptionPurchase } from './subscriptionPurchases.type';
import { SubscriptionPurchaseStatus } from './const';
import { SubscriptionAccessFeatures } from '../subscription/const';

// subscription purchase schema
const subscriptionPurchaseSchema = new Schema<ISubscriptionPurchase>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Subscription',
    },
    access: {
      type: [String],
      enum: Object.values(SubscriptionAccessFeatures),
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(SubscriptionPurchaseStatus),
      required: true,
    },
  },
  { timestamps: true },
);

const SubscriptionPurchase = model<ISubscriptionPurchase>(
  'SubscriptionPurchase',
  subscriptionPurchaseSchema,
);

export default SubscriptionPurchase;
