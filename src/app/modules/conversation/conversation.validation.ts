import { z } from 'zod';

export const CreateConversationValidation = z.object({
  body: z
    .object({
      userId: z.string().min(1),
      type: z.enum(['private', 'group']),
    })
    .strict(),
});

export const SendMessageInConversationValidation = z.object({
  body: z
    .object({
      text: z.string().min(1).optional(),
      type: z.enum(['text', 'image']),
    })
    .strict(),
});
