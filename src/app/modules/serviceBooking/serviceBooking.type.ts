import { Document, Types } from 'mongoose';
import { bookingStatuses } from './const';
import { Region } from '../user/const';

export interface IServiceBooking extends Document {
  author: Types.ObjectId;
  service: Types.ObjectId;
  details: string;
  image: string;
  bookingDate: Date;
  region: keyof typeof Region;
  location: string;
  status: keyof typeof bookingStatuses;
  isDeletedBy: Types.ObjectId[];
}
