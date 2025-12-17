import { Document } from 'mongoose';

// subscription interface
export interface ISubscription extends Document {
  title: 'Basic' | 'Standard' | 'Premium';
  price: number;
  durationType: 'day' | 'week' | 'month' | 'year';
  duration: number;
  access: Array<string>;
  description: Array<string>;
  isDeleted: boolean;
}
