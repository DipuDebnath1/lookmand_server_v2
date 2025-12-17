import { model, Schema } from 'mongoose';
import { ISubscription } from './subscription.type';

// subscription schema
const subscriptionSchema = new Schema<ISubscription>(
  {
    title: {
      type: String,
      enum: ['Basic', 'Standard', 'Premium'],
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: [String], required: true },
    durationType: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      required: true,
    },
    access: { type: [String], required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Subscription = model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
