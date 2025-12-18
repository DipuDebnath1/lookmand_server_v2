import { z } from 'zod';
import { Region } from '../user/const';

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
