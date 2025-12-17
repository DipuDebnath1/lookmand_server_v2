import { z } from 'zod';

export const ServiceBookingValidation = z.object({
  body: z
    .object({
      service: z.string({
        required_error: 'Service is required',
      }),
      description: z
        .string({
          required_error: 'Description is required',
        })
        .min(1, 'Description cannot be empty'),
      bookingDate: z
        .string({
          required_error: 'Booking date is required',
        })
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
      location: z.enum(['north', 'south', 'east', 'west']),
    })
    .strict(), // .strict() will disallow unknown keys
});
