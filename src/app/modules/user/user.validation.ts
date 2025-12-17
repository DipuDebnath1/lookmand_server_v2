import { z } from 'zod';

// Update Profile Validation
const updateProfileValidation = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      phone: z.string().optional(),
      location: z.enum(['north', 'south', 'east', 'west']).optional(),
      image: z.string().optional(),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .optional(),
    })
    .strict(), // .strict() will disallow unknown keys
});

const userValidation = {
  updateProfileValidation,
};

export default userValidation;
