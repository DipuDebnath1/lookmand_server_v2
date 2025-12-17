import { model, Schema } from 'mongoose';
import { IServiceBooking } from './serviceBooking.type';

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
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'declined', 'cancelled'],
      default: 'pending',
    },
    isDeleted: { type: Boolean, default: false },
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
