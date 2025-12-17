import { Document } from 'mongoose';

export type TRoles = 'user' | 'admin' | 'provider' | 'superAdmin';

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
  region: 'north' | 'south' | 'east' | 'west';
  oneTimeCode: string | null;
  isResetPassword: boolean;
  fcmToken: string | null;
  isDeleted: boolean;
}

export interface TUser extends IUser, Document {
  // eslint-disable-next-line no-unused-vars
  isPasswordMatch(password: string): Promise<boolean>;
}
