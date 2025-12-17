import { Document, Types } from 'mongoose';

export interface IReport extends Document {
  author: Types.ObjectId;
  reportTo: Types.ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'resolve';
  isDeleted: boolean;
}
