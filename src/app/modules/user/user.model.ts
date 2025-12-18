/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import { Schema, model } from 'mongoose';
// import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import { TUser } from './user.interface';
import { roles } from '../../utils/roles';
import { Region, Roles } from './const';

// Simple User Schema
const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
      default: Roles.USER,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    password: {
      type: String,
      required: false,
      private: true,
    },
    region: {
      type: String,
      enum: Object.keys(Region),
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    oneTimeCode: {
      type: String,
      default: null,
      required: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
      required: false,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// Instance method to check password match
userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  const res = await bcrypt.compare(password, user.password);
  return res;
};

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password!, 8);
  }
  next();
});

userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform: function (doc, ret, options) {
    (ret as any).password = undefined;
    return ret;
  },
});

export const User = model<TUser>('User', userSchema);
