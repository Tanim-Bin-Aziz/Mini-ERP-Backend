import { z } from 'zod';

const numericString = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val))
  .refine((val) => !Number.isNaN(val), { message: 'Must be a valid number' });

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    sku: z.string().min(2, 'SKU must be at least 2 characters'),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    price: numericString.refine((val) => val >= 0, 'Price cannot be negative'),
    costPrice: numericString.optional(),
    stock: numericString.refine((val) => val >= 0, 'Stock cannot be negative'),
    lowStockThreshold: numericString.optional(),
    unit: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.string().min(1).optional(),
    price: numericString.refine((val) => val >= 0, 'Price cannot be negative').optional(),
    costPrice: numericString.optional(),
    stock: numericString.refine((val) => val >= 0, 'Stock cannot be negative').optional(),
    lowStockThreshold: numericString.optional(),
    unit: z.string().optional(),
    // Comma-separated publicIds of existing images the client wants removed
    removeImages: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    quantity: numericString,
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
