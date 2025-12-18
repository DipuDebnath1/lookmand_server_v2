import { Document } from 'mongoose';
import { Region } from './const';
import { allRoles } from '../../utils/roles';

export type RoleKey = keyof typeof allRoles;
export type TRoles = (typeof allRoles)[RoleKey][number];

export interface IUser {
  name: string;
  role: TRoles;
  email: string;
  image: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  password: string;
  location: string;
  region: keyof typeof Region;
  oneTimeCode: string | null;
  isResetPassword: boolean;
  fcmToken: string | null;
  isDeleted: boolean;
}

export interface TUser extends IUser, Document {
  // eslint-disable-next-line no-unused-vars
  isPasswordMatch(password: string): Promise<boolean>;
}
