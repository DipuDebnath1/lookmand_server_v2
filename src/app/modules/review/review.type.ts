import { Document, Types } from 'mongoose';

export interface IReview extends Document {
  author: Types.ObjectId;
  service: Types.ObjectId;
  booking: Types.ObjectId;
  description: string;
  rating: number;
  isDeleted: boolean;
}
