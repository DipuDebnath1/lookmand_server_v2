import { Region } from './../user/const';
import { Document, Types } from 'mongoose';
import { ServiceInquiryStatuses } from './const';

export interface IServiceInquiry extends Document {
  author: Types.ObjectId;
  subCategory: Types.ObjectId;
  date: Date;
  region: keyof typeof Region;
  isDeleted: boolean;
  status: keyof typeof ServiceInquiryStatuses;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
