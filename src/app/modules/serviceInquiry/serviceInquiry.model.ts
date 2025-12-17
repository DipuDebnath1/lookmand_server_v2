import { model, Schema } from 'mongoose';
import { IServiceInquiry } from './serviceInquiry.interface';

const serviceInquirySchema = new Schema<IServiceInquiry>(
  {
    author: { type: Schema.Types.ObjectId, required: false },
    subCategory: { type: Schema.Types.ObjectId, required: false },
    date: { type: Date, required: true },
    region: {
      type: String,
      enum: ['east', 'west', 'north', 'south'],
      required: true,
    },
    status: {
      type: String,
      enum: ['respond', 'active', 'closed'],
      default: 'active',
      required: false,
    },
    additionalInfo: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ServiceInquiry = model<IServiceInquiry>(
  'ServiceInquiry',
  serviceInquirySchema,
);
export default ServiceInquiry;
