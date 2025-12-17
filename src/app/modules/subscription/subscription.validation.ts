import z from 'zod';

export const subscriptionCreateValidation = z.object({
  body: z
    .object({
      title: z.enum(['Basic', 'Standard', 'Premium'], {
        required_error: 'Title is required',
      }),
      price: z.number({
        required_error: 'Price is required',
      }),
      duration: z.number({
        required_error: 'Duration is required',
      }),
      description: z.array(
        z.string({
          required_error: 'Description is required',
        }),
      ),
      durationType: z.enum(['day', 'week', 'month', 'year'], {
        required_error: 'Type is required',
      }),
    })
    .strict(),
});

export const subscriptionUpdateValidation = z.object({
  body: z
    .object({
      title: z.string().optional(),
      price: z.number().optional(),
      duration: z.number().optional(),
      description: z.array(z.string()).optional(),
      durationType: z.enum(['day', 'week', 'month', 'year']).optional(),
    })
    .strict(),
});
