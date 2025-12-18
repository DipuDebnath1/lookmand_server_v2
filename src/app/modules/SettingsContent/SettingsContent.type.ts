import { Document } from 'mongoose';
import { SettingsContentTypes } from './const';

export interface IPolicySettings extends Document {
  content: string;
  type: keyof typeof SettingsContentTypes;
  isDeleted: boolean;
}
