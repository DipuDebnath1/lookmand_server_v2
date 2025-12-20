import { z } from 'zod';

export const serviceQuoteSearchValidation = z.object({
  body: z
    .object({
      serviceCategory: z.string().min(1, 'Service category is required'),
      additional: z.string().min(1, 'Additional information is required'),
      location: z.enum(['north', 'south', 'east', 'west']).optional(),
    })
    .strict(),
});
