import { z } from 'zod';

const businessProfileValidation = z.object({
  body: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      description: z.string().optional(),
      location: z.enum(['north', 'south', 'east', 'west']).optional(),
    })
    .strict(), // .strict() will disallow unknown keys
});

export default businessProfileValidation;
