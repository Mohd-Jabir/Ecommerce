import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^\+?[0-9\s().-]+$/, "Invalid phone number");

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: phoneSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

const addressFields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: phoneSchema,
  addressLine1: z.string().trim().min(3, "Address line 1 is required").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(100),
};

export const addressSchema = z
  .object({
    ...addressFields,
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = z
  .object({
    name: addressFields.name.optional(),
    phone: addressFields.phone.optional(),
    addressLine1: addressFields.addressLine1.optional(),
    addressLine2: addressFields.addressLine2,
    city: addressFields.city.optional(),
    state: addressFields.state.optional(),
    pincode: addressFields.pincode.optional(),
    country: addressFields.country.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one address field to update",
  });
