import { Document } from 'mongoose';

export interface IPolicySettings extends Document {
  content: string;
  type: 'terms' | 'privacy' | 'host' | 'contact';
  isDeleted: boolean;
}
