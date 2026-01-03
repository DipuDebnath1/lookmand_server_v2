import { Document, Types } from 'mongoose';
import { transactionStatuses } from './transation.const';

export interface ITransaction extends Document {
  author: Types.ObjectId;
  subscriptionPurchase: Types.ObjectId;
  amount: number;
  transactionId: string;
  status: keyof typeof transactionStatuses;
}
