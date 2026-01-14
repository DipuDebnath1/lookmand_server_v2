/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from 'mongoose';
import {
  IAvailability,
  IBusinessProfile,
  IDayAbility,
} from './businessProfile.type';
import { Region } from '../user/const';
import { defaultAbilities } from './const';

// Reusable day schema
const dayAbilitySchema = new Schema<IDayAbility>(
  {
    isAvailable: { type: Boolean, required: true, default: false },
    openingTime: { type: Number, required: false },
    closingTime: { type: Number, required: false },
  },
  { _id: false },
);

// Weekly availability schema
const availabilitySchema = new Schema<IAvailability>(
  {
    Saturday: { type: dayAbilitySchema, required: false },
    Sunday: { type: dayAbilitySchema, required: false },
    Monday: { type: dayAbilitySchema, required: false },
    Tuesday: { type: dayAbilitySchema, required: false },
    Wednesday: { type: dayAbilitySchema, required: false },
    Thursday: { type: dayAbilitySchema, required: false },
    Friday: { type: dayAbilitySchema, required: false },
  },
  { _id: false },
);

//  main business profile schema
const businessProfileSchema = new Schema<IBusinessProfile>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: false, default: '' },
    phone: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
    region: {
      type: String,
      enum: Object.keys(Region),
      required: false,
    },
    location: { type: String, required: false },
    image: { type: String, required: false },
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      required: false,
    },
    availability: {
      type: availabilitySchema,
      required: false,
      default: () => ({ ...defaultAbilities }),
    },
    isProfileComplete: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

businessProfileSchema.set('toJSON', {
  transform(_doc, ret) {
    if (ret.availability && typeof ret.availability === 'object') {
      Object.values(ret.availability).forEach((day: any) => {
        if (day && day.isAvailable === false) {
          delete day.openingTime;
          delete day.closingTime;
        }
      });
    }
    return ret;
  },
});

const BusinessProfile = mongoose.model<IBusinessProfile>(
  'BusinessProfile',
  businessProfileSchema,
);
export default BusinessProfile;
