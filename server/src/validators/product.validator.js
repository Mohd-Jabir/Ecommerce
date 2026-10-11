import { z } from "zod";

const imageSchema = z.object({
  url: z.string().trim().url().max(2048),
  alt: z.string().trim().max(200).optional().default(""),
});

const productFields = {
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(1).max(10000),
  sku: z.string().trim().min(1).max(80),
  price: z.coerce.number().finite().min(0),
  compareAtPrice: z.coerce.number().finite().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
  images: z.array(imageSchema).max(10).optional(),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
  status: z.enum(["draft", "active", "archived"]).optional(),
};

export const createProductSchema = z.object(productFields).strict();

export const updateProductSchema = z
  .object({
    name: productFields.name.optional(),
    description: productFields.description.optional(),
    sku: productFields.sku.optional(),
    price: productFields.price.optional(),
    compareAtPrice: productFields.compareAtPrice,
    stock: productFields.stock.optional(),
    images: productFields.images,
    category: productFields.category.optional(),
    status: productFields.status,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export const productListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().optional(),
  vendor: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  minPrice: z.coerce.number().finite().min(0).optional(),
  maxPrice: z.coerce.number().finite().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "rating", "popular"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
