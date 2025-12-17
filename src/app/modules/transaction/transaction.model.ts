import { Schema, model } from 'mongoose';
import { ITransaction } from './transaction.type';

const transactionSchema = new Schema<ITransaction>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriptionPurchase: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionPurchase',
    },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['success', 'failed', 'cancelled'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
