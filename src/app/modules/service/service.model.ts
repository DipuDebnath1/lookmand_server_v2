import { Schema, model } from 'mongoose';
import { IService } from './service.type';

const serviceSchema = new Schema<IService>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },

    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Service = model<IService>('Service', serviceSchema);
export default Service;
