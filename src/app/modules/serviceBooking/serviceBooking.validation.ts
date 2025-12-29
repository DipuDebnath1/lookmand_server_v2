import { z } from 'zod';
import { Region } from '../user/const';

export const ServiceBookingValidation = z.object({
  body: z
    .object({
      service: z.string({
        required_error: 'Service is required',
      }),
      details: z
        .string({
          required_error: 'Description is required',
        })
        .min(1, 'Description cannot be empty'),
      bookingDate: z
        .string({
          required_error: 'Booking date is required',
        })
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
      region: z.enum(Object.keys(Region) as [string, ...string[]]),
      location: z.string({
        required_error: 'Location is required',
      }),
    })
    .strict(), // .strict() will disallow unknown keys
});
