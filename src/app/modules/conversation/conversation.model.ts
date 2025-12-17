import { Schema, model } from 'mongoose';
import { IConversation } from './conversation.type';

// conversation schema
const conversationSchema = new Schema<IConversation>(
  {
    users: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['private', 'group'],
      required: false,
      default: 'private',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'Message',
    },
    blockedBy: { type: Schema.Types.ObjectId, required: false, ref: 'User' },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
