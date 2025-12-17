import { Document, Types } from 'mongoose';

export interface IFavoriteService extends Document {
  author: Types.ObjectId;
  providerService: Types.ObjectId;
  isDeleted: boolean;
}
