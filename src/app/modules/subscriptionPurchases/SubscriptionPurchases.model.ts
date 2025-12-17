import { model, Schema } from 'mongoose';
import { ISubscriptionPurchase } from './subscriptionPurchases.type';

// subscription purchase schema
const subscriptionPurchaseSchema = new Schema<ISubscriptionPurchase>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Subscription',
    },
    access: { type: [String], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
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
