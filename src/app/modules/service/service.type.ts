import { Document, Types } from 'mongoose';

export interface IService extends Document {
  author: Types.ObjectId;
  subCategory: Types.ObjectId;
  isDeleted: boolean;
}
