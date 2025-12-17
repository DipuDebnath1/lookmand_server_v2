import { Document } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  content: string;
  title: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
