import { Types, Document } from 'mongoose';
import { Region } from '../user/const';

export interface IBusinessProfile extends Document {
  author: Types.ObjectId;
  name: string;
  phone: string;
  description: string;
  region: keyof typeof Region;
  location: string;
  image: string;
  serviceCategory: Types.ObjectId;
  isProfileComplete: boolean;
}
