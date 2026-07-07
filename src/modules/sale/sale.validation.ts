import { z } from 'zod';

const saleItemSchema = z.object({
  product: z.string().min(1, 'Product id is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const createSaleSchema = z.object({
  body: z.object({
    customer: z.string().min(1, 'Customer id is required'),
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
    discount: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    paymentMethod: z
      .enum(['cash', 'card', 'mobile_banking', 'bank_transfer'])
      .optional(),
  }),
});

export const saleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
