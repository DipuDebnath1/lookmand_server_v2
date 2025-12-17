import { z } from 'zod';

export const createReviewValidation = z.object({
  body: z
    .object({
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters'),
      rating: z
        .number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
    })
    .strict(), // .strict() will disallow unknown keys
});

export const updateReviewValidation = z.object({
  body: z
    .object({
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .optional(),
      rating: z
        .number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .optional(),
    })
    .strict(), // .strict() will disallow unknown keys
});
