import { model, Schema } from 'mongoose';
import { IAdds } from './add.type';

const AddsSchema = new Schema<IAdds>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Adds = model<IAdds>('Adds', AddsSchema);
export default Adds;
