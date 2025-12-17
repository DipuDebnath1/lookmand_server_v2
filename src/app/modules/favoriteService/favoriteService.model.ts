import { model, Schema } from 'mongoose';
import { IFavoriteService } from './favoriteService.type';

const favoriteServiceSchema = new Schema<IFavoriteService>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerService: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ProviderService',
    },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const FavoriteService = model<IFavoriteService>(
  'FavoriteService',
  favoriteServiceSchema,
);
export default FavoriteService;
