import mongoose, { Document, Schema, Model } from 'mongoose';
import { tokenTypes } from './token.type';

// Define the Token Document interface
interface IToken extends Document {
  token: string;
  user: mongoose.Schema.Types.ObjectId; // Reference to User model
  type: (typeof tokenTypes)[keyof typeof tokenTypes];
  expires: Date;
  blacklisted: boolean;
}

// Token schema definition
const tokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(tokenTypes),
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Token: Model<IToken> = mongoose.model<IToken>('Token', tokenSchema);

export default Token;
