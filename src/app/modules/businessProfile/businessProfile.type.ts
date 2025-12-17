import { Types, Document } from 'mongoose';

export interface IBusinessProfile extends Document {
  author: Types.ObjectId;
  name: string;
  phone: string;
  description: string;
  region: 'north' | 'south' | 'east' | 'west' | '';
  location: string;
  image: string;
  isProfileComplete: boolean;
}
