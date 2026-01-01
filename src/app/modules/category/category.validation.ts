import { z } from 'zod';

// Category creation validation
export const categoryCreateValidation = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: 'Category name is required',
        })
        .min(3, 'Category name must be at least 3 characters long'),
    })
    .strict(),
});

// Category update validation
export const categoryUpdateValidation = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: 'Category name is required',
        })
        .min(3, 'Category name must be at least 3 characters long')
        .optional(),
    })
    .strict(),
});

// SubCategory creation validation
export const subCategoryCreateValidation = z.object({
  body: z
    .object({
      category: z
        .string({
          required_error: 'Category ID is required',
        })
        .min(24, 'Category ID must be a valid Mongo ObjectId'),

      name: z
        .string({
          required_error: 'SubCategory name is required',
        })
        .min(3, 'SubCategory name must be at least 3 characters long'),

      description: z
        .string({
          required_error: 'SubCategory description is required',
        })
        .min(5, 'SubCategory description must be at least 5 characters long'),
    })
    .strict(),
});

// SubCategory update validation
export const subCategoryUpdateValidation = z.object({
  body: z
    .object({
      category: z
        .string()
        .min(24, 'Category ID must be a valid Mongo ObjectId')
        .optional(),

      name: z
        .string({
          required_error: 'SubCategory name is required',
        })
        .min(3, 'SubCategory name must be at least 3 characters long')
        .optional(),

      description: z
        .string({
          required_error: 'SubCategory description is required',
        })
        .min(5, 'SubCategory description must be at least 5 characters long')
        .optional(),
    })
    .strict(),
});
