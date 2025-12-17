import { Schema, model } from 'mongoose';
import { IPolicySettings } from './policySetting.type';

const policySettingsSchema = new Schema<IPolicySettings>(
  {
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['terms', 'privacy', 'host', 'contact'],
      required: true,
    },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const PolicySettings = model<IPolicySettings>(
  'PolicySettings',
  policySettingsSchema,
);
export default PolicySettings;
