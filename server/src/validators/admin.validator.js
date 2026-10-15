import { z } from "zod";
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ID");
export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.string().trim().max(40).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).strict();

export const adminIdParamSchema = z.object({
  userId: objectIdSchema.optional(),
  vendorId: objectIdSchema.optional(),
  productId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  reviewId: objectIdSchema.optional(),
  categoryId: objectIdSchema.optional(),
}).strict();

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "blocked"]),
}).strict();

export const updateProductStatusSchema = z.object({
  status: z.enum(["draft", "active", "archived"]),
}).strict();

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
}).strict();

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional().default(""),
  image: z.string().trim().url().max(2048).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
}).strict();

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  image: z.string().trim().url().max(2048).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one category field to update." }
);
