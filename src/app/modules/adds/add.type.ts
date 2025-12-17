import { Document, Types } from 'mongoose';

export interface IAdds extends Document {
  author: Types.ObjectId;
  title: string;
  image: string;
  description: string;
  isDeleted: boolean;
}
