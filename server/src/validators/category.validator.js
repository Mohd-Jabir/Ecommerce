import { z } from "zod";

export const createCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).optional().default(""),
    image: z.string().trim().url().max(2048).optional().or(z.literal("")),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(500).optional(),
    image: z.string().trim().url().max(2048).optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });
