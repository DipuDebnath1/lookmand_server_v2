import { model, Schema } from 'mongoose';
import { IServiceBooking } from './serviceBooking.type';
import { bookingStatuses } from './const';
import { Region } from '../user/const';

const serviceBookingSchema = new Schema<IServiceBooking>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Service',
    },
    details: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    region: {
      type: String,
      required: true,
      enum: Object.keys(Region),
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.keys(bookingStatuses),
      default: bookingStatuses.pending,
    },
    isDeletedBy: { type: [Schema.Types.ObjectId], default: [] },
  },
  {
    timestamps: true,
  },
);

const ServiceBooking = model<IServiceBooking>(
  'ServiceBooking',
  serviceBookingSchema,
);
export default ServiceBooking;
