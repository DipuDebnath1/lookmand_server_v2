import { model, Schema } from 'mongoose';
import { INotification } from './notification.interface';
import { roles } from '../../utils/roles';

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    role: { type: String, enum: roles, required: false },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderService',
      required: false,
    },
    serviceRRequest: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: false,
    },
    type: {
      type: String,
      enum: [
        'general',
        'service',
        'serviceApproval',
        'serviceBooking',
        'serviceQuote',
      ],
      required: true,
    },
    isViewed: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
