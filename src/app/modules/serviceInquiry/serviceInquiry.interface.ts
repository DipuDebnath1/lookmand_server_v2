import { Region } from './../user/const';
import { Document, Types } from 'mongoose';
import { ServiceInquiryStatuses } from './const';

export interface IServiceInquiry extends Document {
  author: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  date: Date;
  region: keyof typeof Region;
  location: string;
  isDeleted: boolean;
  status: keyof typeof ServiceInquiryStatuses;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
