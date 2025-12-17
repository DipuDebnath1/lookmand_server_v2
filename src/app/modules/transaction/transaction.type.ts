import { Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  author: Types.ObjectId;
  subscriptionPurchase: Types.ObjectId;
  amount: number;
  transactionId: string;
  status: 'success' | 'failed' | 'cancelled';
}
