import mongoose, { Schema } from 'mongoose';
import { IBusinessProfile } from './businessProfile.type';

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
      enum: ['north', 'south', 'east', 'west'],
      required: false,
    },
    location: { type: String, required: false },
    image: { type: String, required: false },
    isProfileComplete: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const BusinessProfile = mongoose.model<IBusinessProfile>(
  'BusinessProfile',
  businessProfileSchema,
);
export default BusinessProfile;
