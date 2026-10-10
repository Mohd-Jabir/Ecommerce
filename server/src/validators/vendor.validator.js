import { z } from "zod";

const storeName = z.string().trim().min(2).max(100);

const description = z.string().trim().max(2000).optional();

const contactEmail = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const contactPhone = z.string().trim().max(20).optional();

const businessAddressSchema = z
  .object({
    addressLine1: z.string().trim().max(200).optional(),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
    country: z.string().trim().max(100).optional(),
  })
  .strict();

export const applyVendorSchema = z
  .object({
    storeName,
    description,
    contactEmail,
    contactPhone,
    businessAddress: businessAddressSchema.optional(),
  })
  .strict();

export const updateVendorProfileSchema = z
  .object({
    storeName: storeName.optional(),
    description,
    contactEmail: contactEmail.optional(),
    contactPhone,
    logo: z.string().trim().url().max(2048).optional(),
    businessAddress: businessAddressSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });
