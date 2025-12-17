import { Document, Types } from 'mongoose';

export interface IServiceInquiry extends Document {
  author: Types.ObjectId;
  subCategory: Types.ObjectId;
  date: Date;
  region: 'east' | 'west' | 'north' | 'south';
  isDeleted: boolean;
  status: 'respond' | 'active' | 'closed';
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
