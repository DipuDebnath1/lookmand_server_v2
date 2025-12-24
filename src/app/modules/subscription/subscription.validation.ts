import z from 'zod';
import {
  SubscriptionAccessFeatures,
  SubscriptionDurationType,
  SubscriptionPackageName,
} from './const';

export const subscriptionCreateValidation = z.object({
  body: z
    .object({
      title: z.enum(
        Object.values(SubscriptionPackageName) as [string, ...string[]],
        {
          required_error: 'Title is required',
        },
      ),
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
      durationType: z.enum(
        Object.values(SubscriptionDurationType) as [string, ...string[]],
        {
          required_error: 'Type is required',
        },
      ),
      access: z.array(
        z.enum(
          Object.values(SubscriptionAccessFeatures) as [string, ...string[]],
          {
            required_error: 'Access feature is required',
          },
        ),
      ),
    })
    .strict(),
});

export const subscriptionUpdateValidation = z.object({
  body: z
    .object({
      title: z
        .enum(Object.values(SubscriptionPackageName) as [string, ...string[]])
        .optional(),
      price: z.number().optional(),
      duration: z.number().optional(),
      description: z.array(z.string()).optional(),
      durationType: z
        .enum(Object.values(SubscriptionDurationType) as [string, ...string[]])
        .optional(),
      access: z
        .array(
          z.enum(
            Object.values(SubscriptionAccessFeatures) as [string, ...string[]],
          ),
        )
        .optional(),
    })
    .strict(),
});
