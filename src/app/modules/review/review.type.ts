import { Document, Types } from 'mongoose';

export interface IReview extends Document {
  author: Types.ObjectId;
  providerService: Types.ObjectId;
  description: string;
  rating: number;
  isDeleted: boolean;
}
