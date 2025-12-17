import { model, Schema } from 'mongoose';
import { IReview } from './review.type';

const reviewSchema = new Schema<IReview>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerService: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ProviderService',
    },
    description: { type: String, required: true },
    rating: { type: Number, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Review = model<IReview>('Review', reviewSchema);
export default Review;
