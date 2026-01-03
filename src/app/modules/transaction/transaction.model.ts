import { Schema, model } from 'mongoose';
import { ITransaction } from './transaction.type';
import { transactionStatuses } from './transation.const';

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
      enum: Object.values(transactionStatuses),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
