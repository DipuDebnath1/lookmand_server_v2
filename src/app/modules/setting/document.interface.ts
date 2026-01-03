import { Document } from 'mongoose';
import { documentName } from './document.const';

export interface IDocument extends Document {
  name: keyof typeof documentName;
  content: string;
  title: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
