import { z } from 'zod';
import { Region } from '../user/const';

// Reusable ability schema
const ability = z
  .object({
    isAvailable: z.boolean(),
    openingTime: z.number().optional(),
    closingTime: z.number().optional(),
  })
  .strict();

// Validation schema for availability
export const availabilitySchemaValidation = z.object({
  body: z
    .object({
      Saturday: ability.optional(),
      Sunday: ability.optional(),
      Monday: ability.optional(),
      Tuesday: ability.optional(),
      Wednesday: ability.optional(),
      Thursday: ability.optional(),
      Friday: ability.optional(),
    })
    .strict(),
});

// Validation schema for business profile
const businessProfileValidation = z.object({
  body: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      description: z.string().optional(),
      region: z.enum(Object.keys(Region) as [string, ...string[]]).optional(),
      location: z.string().optional(),
      serviceCategory: z.string().optional(),
    })
    .strict(), // .strict() will disallow unknown keys
});

export default businessProfileValidation;
