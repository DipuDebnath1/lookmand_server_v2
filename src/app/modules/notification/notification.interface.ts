import { Document, Types } from 'mongoose';
import { TRoles } from '../user';

export interface INotification extends Document {
  user: Types.ObjectId;
  sender: Types.ObjectId;
  title: string;
  description: string;
  service: Types.ObjectId;
  serviceRRequest: Types.ObjectId;
  type:
    | 'general'
    | 'service'
    | 'serviceApproval'
    | 'serviceBooking'
    | 'serviceQuote';
  role: TRoles;
  isViewed: boolean;
}
