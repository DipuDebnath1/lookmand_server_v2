import { z } from 'zod';

export const serviceCreateValidation = z.object({
  body: z.object({
    subCategory: z.string().min(1, 'SubCategory ID is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters'),
    startDate: z.preprocess((val) => new Date(val as string), z.date()),
  }),
});

export const serviceUpdateValidation = z.object({
  body: z
    .object({
      subCategory: z.string().min(1, 'SubCategory ID is required').optional(),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .optional(),
      startDate: z
        .preprocess(
          (val) => (val ? new Date(val as string) : undefined),
          z.date(),
        )
        .optional(),
    })
    .strict(), // .strict() will disallow unknown keys
});

export const serviceQuoteSearchValidation = z.object({
  body: z
    .object({
      serviceCategory: z.string().min(1, 'Service category is required'),
      additional: z.string().min(1, 'Additional information is required'),
      location: z.enum(['north', 'south', 'east', 'west']).optional(),
    })
    .strict(),
});
