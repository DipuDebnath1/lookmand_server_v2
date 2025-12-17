import { Schema, model } from 'mongoose';
import { IMessage } from './conversation.type';

// message schema
const messageSchema = new Schema<IMessage>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversation: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Conversation',
    },
    text: { type: String, required: false },
    image: { type: String, required: false },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);
const Message = model<IMessage>('Message', messageSchema);
export default Message;
