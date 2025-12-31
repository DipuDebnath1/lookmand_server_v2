import { z } from 'zod';
import { Region } from '../user/const';

export const ServiceInquiryValidation = z.object({
  body: z
    .object({
      category: z.string({
        required_error: 'Category is required',
      }),
      subCategory: z.string({
        required_error: 'Sub-category is required',
      }),
      region: z.enum(Object.values(Region) as [string, ...string[]], {
        required_error: 'Region is required',
      }),
      location: z.string({
        required_error: 'Location is required',
      }),
      date: z
        .string({
          required_error: 'Date is required',
        })
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        }),
      additionalInfo: z.string({
        required_error: 'Additional info is required',
      }),
    })
    .strict(),
});
