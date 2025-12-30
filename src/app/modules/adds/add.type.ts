import { Document, Types } from 'mongoose';

export interface IAdds extends Document {
  author: Types.ObjectId;
  content: string;
  isDeleted: boolean;
}
