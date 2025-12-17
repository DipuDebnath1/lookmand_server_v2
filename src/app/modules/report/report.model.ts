import { Schema, model } from 'mongoose';
import { IReport } from './report.type';

const reportSchema = new Schema<IReport>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportTo: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'resolve'],
      required: false,
      default: 'pending',
    },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Report = model<IReport>('Report', reportSchema);
export default Report;
