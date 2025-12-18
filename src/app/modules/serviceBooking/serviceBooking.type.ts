import { Document, Types } from 'mongoose';
import { bookingStatuses } from './const';

export interface IServiceBooking extends Document {
  author: Types.ObjectId;
  service: Types.ObjectId;
  details: string;
  image: string;
  bookingDate: Date;
  location: string;
  status: keyof typeof bookingStatuses;
  isDeleted: boolean;
}
