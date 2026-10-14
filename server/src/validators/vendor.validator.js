
import { z } from "zod";

// Vendor application validation
export const applyVendorSchema = z
  .object({
    storeName: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional().default(""),
    contactEmail: z.string().trim().email().max(254),
    contactPhone: z.string().trim().max(30).optional().default(""),
    businessAddress: z
      .object({
        street: z.string().trim().max(200).optional().default(""),
        city: z.string().trim().max(100).optional().default(""),
        state: z.string().trim().max(100).optional().default(""),
        postalCode: z.string().trim().max(20).optional().default(""),
        country: z.string().trim().max(100).optional().default(""),
      })
      .optional()
      .default({}),
  })
  .strict();

// Update vendor profile validation
export const updateVendorProfileSchema = z
  .object({
    storeName: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    contactEmail: z.string().trim().email().max(254).optional(),
    contactPhone: z.string().trim().max(30).optional(),
    logo: z.string().trim().url().max(2048).nullable().optional(),
    businessAddress: z
      .object({
        street: z.string().trim().max(200).optional(),
        city: z.string().trim().max(100).optional(),
        state: z.string().trim().max(100).optional(),
        postalCode: z.string().trim().max(20).optional(),
        country: z.string().trim().max(100).optional(),
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one vendor profile field to update.",
  });

// Create vendor product
export const createVendorProductSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().min(1).max(10000),
    sku: z.string().trim().min(1).max(80),
    price: z.coerce.number().finite().min(0),
    compareAtPrice: z.coerce.number().finite().min(0).nullable().optional(),
    stock: z.coerce.number().int().min(0),
    category: z.string().regex(/^[a-f\d]{24}$/i),
    images: z
      .array(
        z
          .object({
            url: z.string().trim().url().max(2048),
            alt: z.string().trim().max(200).optional(),
          })
          .strict(),
      )
      .max(10)
      .optional(),
    status: z.enum(["draft", "active"]).optional(),
  })
  .strict();

// Update vendor product
export const updateVendorProductSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(1).max(10000).optional(),
    sku: z.string().trim().min(1).max(80).optional(),
    price: z.coerce.number().finite().min(0).optional(),
    compareAtPrice: z.coerce.number().finite().min(0).nullable().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    category: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .optional(),
    images: z
      .array(
        z
          .object({
            url: z.string().trim().url().max(2048),
            alt: z.string().trim().max(200).optional(),
          })
          .strict(),
      )
      .max(10)
      .optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one product field to update.",
  });

// Update vendor order status
export const updateVendorOrderStatusSchema = z
  .object({
    status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]),
  })
  .strict();
