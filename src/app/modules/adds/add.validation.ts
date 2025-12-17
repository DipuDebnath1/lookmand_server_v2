import { z } from 'zod';

export const createAddValidation = z.object({
  body: z
    .object({
      title: z.string().min(5, 'Title must be at least 5 characters'),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters'),
    })
    .strict(), // .strict() will disallow unknown keys
});
