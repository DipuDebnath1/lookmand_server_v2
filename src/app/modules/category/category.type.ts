import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  image: string;
  isDeleted: boolean;
}

export interface ISubCategory extends Document {
  category: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  isDeleted: boolean;
}
