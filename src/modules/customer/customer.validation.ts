import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(6, 'Phone must be at least 6 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const customerIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
