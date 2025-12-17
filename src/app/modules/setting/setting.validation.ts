import { z } from 'zod';

export const documentUpdateValidation = z.object({
  body: z
    .object({
      title: z.string().min(10).optional(),
      content: z.string().min(10),
    })
    .strict(),
});
