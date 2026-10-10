import { Vendor } from "../models/Vendor.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

function createSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

async function generateUniqueSlug(storeName) {
  const baseSlug = createSlug(storeName);

  if (!baseSlug) {
    throw new ApiError(400, "Store name must contain letters or numbers.");
  }
  let slug = baseSlug;
  let suffix = 1;
  while (await Vendor.exists({ slug })) {
    suffix += 1;
    const suffixText = `-${suffix}`;
    slug = `${baseSlug.slice(0, 120 - suffixText.length)}${suffixText}`;
  }
  return slug;
}
export async function applyToBecomeVendor(userId, payload) {
  const user = await User.findActiveById(userId);

  if (!user) {
    throw new ApiError(403, "Your account is not active.");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      "Verify your email before applying to become a vendor.",
    );
  }

  const existingVendor = await Vendor.findByUserId(userId);

  if (existingVendor) {
    if (existingVendor.status === "pending") {
      throw new ApiError(409, "Your vendor application is already pending.");
    }

    if (existingVendor.status === "approved") {
      throw new ApiError(409, "You already have an approved vendor account.");
    }

    if (existingVendor.status === "suspended") {
      throw new ApiError(403, "Your vendor account is suspended.");
    }

    // Allow a rejected applicant to submit a new application.
    existingVendor.storeName = payload.storeName;
    existingVendor.slug = await generateUniqueSlug(payload.storeName);
    existingVendor.description = payload.description ?? "";
    existingVendor.contactEmail = payload.contactEmail;
    existingVendor.contactPhone = payload.contactPhone ?? "";
    existingVendor.businessAddress = payload.businessAddress ?? {};
    existingVendor.status = "pending";
    existingVendor.rejectionReason = "";
    existingVendor.reviewedBy = null;
    existingVendor.reviewedAt = null;
    existingVendor.approvedAt = null;

    await existingVendor.save();
    return existingVendor;
  }

  const vendor = await Vendor.create({
    user: userId,
    storeName: payload.storeName,
    slug: await generateUniqueSlug(payload.storeName),
    description: payload.description ?? "",
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone ?? "",
    businessAddress: payload.businessAddress ?? {},
    status: "pending",
  });

  return vendor;
}

export async function getMyVendorProfile(userId) {
  const vendor = await Vendor.findByUserId(userId);

  if (!vendor) {
    throw new ApiError(404, "Vendor application not found.");
  }

  return vendor;
}

export async function updateMyVendorProfile(vendor, payload) {
  const allowedFields = [
    "storeName",
    "description",
    "contactEmail",
    "contactPhone",
    "logo",
    "businessAddress",
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      vendor[field] = payload[field];
    }
  }

  if (payload.storeName !== undefined) {
    vendor.slug = await generateUniqueSlug(payload.storeName);
  }

  await vendor.save();

  return vendor;
}
