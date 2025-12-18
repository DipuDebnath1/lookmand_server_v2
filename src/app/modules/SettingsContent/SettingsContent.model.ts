import { Schema, model } from 'mongoose';
import { IPolicySettings } from './SettingsContent.type';
import { SettingsContentTypes } from './const';

const policySettingsSchema = new Schema<IPolicySettings>(
  {
    content: { type: String, required: true },
    type: {
      type: String,
      enum: Object.keys(SettingsContentTypes),
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
