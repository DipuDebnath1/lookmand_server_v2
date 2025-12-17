import { Document, Types } from 'mongoose';

export interface IServiceBooking extends Document {
  author: Types.ObjectId;
  service: Types.ObjectId;
  details: string;
  image: string;
  bookingDate: Date;
  location: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'cancelled';
  isDeleted: boolean;
}
