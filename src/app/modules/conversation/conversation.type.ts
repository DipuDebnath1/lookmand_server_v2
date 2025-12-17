import { Document, Types } from 'mongoose';

export interface IConversation extends Document {
  users: Array<Types.ObjectId>;
  type: 'private' | 'group';
  lastMessage: Types.ObjectId;
  blockedBy: Types.ObjectId;
  isDeleted: boolean;
}

export interface IMessage extends Document {
  author: Types.ObjectId;
  conversation: Types.ObjectId;
  text: string;
  image: string;
  isDeleted: boolean;
}
