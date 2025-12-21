import { Types, Document } from 'mongoose';
import { Region } from '../user/const';

export interface IDayAbility {
  isAvailable: boolean;
  openingTime?: number;
  closingTime?: number;
}

export interface IAvailability {
  Saturday: IDayAbility;
  Sunday: IDayAbility;
  Monday: IDayAbility;
  Tuesday: IDayAbility;
  Wednesday: IDayAbility;
  Thursday: IDayAbility;
  Friday: IDayAbility;
}
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
  availability: IAvailability;
}
