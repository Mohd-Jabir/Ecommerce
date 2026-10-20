import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Vendor } from "../models/Vendor.js";
import { ApiError } from "../utils/ApiError.js";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function createUniqueCategorySlug(name, excludeId = null) {
  const base = slugify(name);

  if (!base) {
    throw new ApiError(400, "Category name cannot generate a valid slug.");
  }

  let slug = base;
  let suffix = 1;

  while (
    await Category.exists({
      slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

function handleDuplicate(error) {
  if (error?.code === 11000) {
    throw new ApiError(409, "A category with these details already exists.");
  }

  throw error;
}

/**
 * Resolve the authenticated user's category-management permissions.
 * Admins can manage every category.
 * Vendors must have an approved Vendor document.
 */
async function getCategoryManager(user) {
  if (!user?._id) {
    throw new ApiError(401, "Authentication required.");
  }

  if (user.role === "admin") {
    return {
      userId: user._id,
      role: "admin",
      vendorId: null,
    };
  }

  if (user.role !== "vendor") {
    throw new ApiError(
      403,
      "Only admins and approved vendors can manage categories.",
    );
  }

  const vendor = await Vendor.findOne({
    user: user._id,
    status: "approved",
  }).select("_id");

  if (!vendor) {
    throw new ApiError(403, "An approved vendor account is required.");
  }

  return {
    userId: user._id,
    role: "vendor",
    vendorId: vendor._id,
  };
}

/**
 * Ensure the current manager can modify this category.
 * Admins can manage all categories.
 * Vendors can manage only categories they created.
 */
function assertCanManageCategory(category, manager) {
  if (manager.role === "admin") {
    return;
  }

  const isOwner =
    category.createdByRole === "vendor" &&
    category.createdBy &&
    category.createdBy.toString() === manager.userId.toString();

  if (!isOwner) {
    throw new ApiError(
      403,
      "You can only manage categories created by your account.",
    );
  }
}

export async function listCategories() {
  return Category.find({ isActive: true })
    .select("name slug description image")
    .sort({ name: 1 })
    .lean();
}

export async function getCategoryBySlug(slug) {
  const category = await Category.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
}

export async function createCategory(payload, user) {
  const manager = await getCategoryManager(user);
  const slug = await createUniqueCategorySlug(payload.name);

  try {
    return await Category.create({
      ...payload,
      slug,
      createdBy: manager.userId,
      createdByRole: manager.role,
    });
  } catch (error) {
    handleDuplicate(error);
  }
}

export async function updateCategory(categoryId, payload, user) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const manager = await getCategoryManager(user);

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  assertCanManageCategory(category, manager);

  if (payload.name && payload.name !== category.name) {
    payload.slug = await createUniqueCategorySlug(payload.name, category._id);
  }

  // Prevent clients from changing ownership fields through the payload.
  delete payload.createdBy;
  delete payload.createdByRole;
  delete payload._id;

  try {
    Object.assign(category, payload);
    await category.save();

    return category;
  } catch (error) {
    handleDuplicate(error);
  }
}

export async function deleteCategory(categoryId, user) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const manager = await getCategoryManager(user);

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  assertCanManageCategory(category, manager);

  const productsUsingCategory = await Product.exists({
    category: category._id,
    status: { $ne: "archived" },
  });

  if (productsUsingCategory) {
    throw new ApiError(
      409,
      "This category has products. Reassign or archive those products first.",
    );
  }

  category.isActive = false;
  await category.save();

  return {
    message: "Category deactivated successfully.",
  };
}
export async function listMyCategories(user) {
  const manager = await getCategoryManager(user);

  if (manager.role === "admin") {
    return Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
  }

  return Category.find({
    isActive: true,
    createdBy: manager.userId,
    createdByRole: "vendor",
  })
    .sort({ name: 1 })
    .lean();
}