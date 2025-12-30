import { model, Schema } from 'mongoose';
import { IAdds } from './add.type';

const AddsSchema = new Schema<IAdds>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Adds = model<IAdds>('Adds', AddsSchema);
export default Adds;
