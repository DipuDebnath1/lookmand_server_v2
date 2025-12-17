import { model, Schema } from 'mongoose';
import { IDocument } from './document.interface';

const documentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true },
    title: { type: String, required: false },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Document = model<IDocument>('Document', documentSchema);
export default Document;
