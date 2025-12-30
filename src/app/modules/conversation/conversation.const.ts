// message Type
export const MessageType = {
  text: 'text',
  image: 'image',
  info: 'info',
} as const;

// message Populate
export const populateMessagePipeline = {
  felid: 'author conversation text image createdAt isDeleted ',
  author: { path: 'author', select: 'name image' },
};

// conversation Populate
export const populateConversationPipeline = {
  felid: '_id users lastMessage type createdAt updatedAt',
  users: {
    path: 'users',
    select: 'name image',
  },
  lastMessage: {
    path: 'lastMessage',
    select: populateMessagePipeline.felid,
    populate: [populateMessagePipeline.author],
  },
};
