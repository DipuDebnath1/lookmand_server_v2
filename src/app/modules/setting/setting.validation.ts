import { z } from 'zod';

export const documentUpdateValidation = z.object({
  body: z
    .object({
      title: z.string(),
      content: z.string(),
    })
    .strict(),
});
