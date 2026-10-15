import { User } from "../models/User.js";
import { Vendor } from "../models/Vendor.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { ProductReview } from "../models/ProductReview.js";
import { Category } from "../models/Category.js";

import {
  getAdminDashboard,
  listDocuments,
  findOrThrow,
} from "../services/admin.service.js";

// ======================================================
// ERROR HANDLING
// ======================================================

const sendError = (res, error) => {
  const status = error.statusCode || 500;

  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Internal server error."
        : error.message,
  });
};

const run = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A record with this value already exists.",
      });
    }

    return sendError(res, error);
  }
};

// ======================================================
// GENERIC PAGINATED LIST
// ======================================================

const list = (
  Model,
  searchFields = [],
  options = {}
) =>
  run(async (req, res) => {
    const result = await listDocuments({
      Model,
      query: req.validatedQuery ?? req.query,
      searchFields,
      extraFilter: options.extraFilter ?? {},
      statusField: options.statusField ?? "status",
    });

    res.json({
      success: true,
      ...result,
    });
  });

// ======================================================
// GET DOCUMENT BY ID
// ======================================================

const getById = (
  Model,
  param,
  label,
  populate = []
) =>
  run(async (req, res) => {
    const record = await findOrThrow(
      Model,
      req.params[param],
      label
    );

    for (const [path, select] of populate) {
      await record.populate(path, select);
    }

    res.json({
      success: true,
      data: record,
    });
  });

// ======================================================
// GENERIC STATUS UPDATE
// ======================================================

const setStatus = (
  Model,
  param,
  label,
  statusField,
  allowedStatuses
) =>
  run(async (req, res) => {
    const record = await findOrThrow(
      Model,
      req.params[param],
      label
    );

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${label.toLowerCase()} status.`,
        allowedStatuses,
      });
    }

    record[statusField] = status;
    await record.save();

    res.json({
      success: true,
      message: `${label} status updated successfully.`,
      data: record,
    });
  });

// ======================================================
// GENERIC DELETE
// ======================================================

const remove = (Model, param, label) =>
  run(async (req, res) => {
    const record = await findOrThrow(
      Model,
      req.params[param],
      label
    );

    await record.deleteOne();

    res.json({
      success: true,
      message: `${label} deleted successfully.`,
    });
  });

// ======================================================
// DASHBOARD
// ======================================================

export const getDashboard = run(async (_req, res) => {
  const data = await getAdminDashboard();

  res.json({
    success: true,
    data,
  });
});

// ======================================================
// USERS
// ======================================================

export const listUsers = list(
  User,
  ["name", "email", "phone"],
  { statusField: "accountStatus" }
);

export const getUser = getById(
  User,
  "userId",
  "User"
);

export const updateUserStatus = run(async (req, res) => {
  const user = await findOrThrow(
    User,
    req.params.userId,
    "User"
  );

  // Prevent administrators from changing their own status.
  if (String(user._id) === String(req.user?._id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own account status.",
    });
  }

  // Protect administrator accounts.
  if (user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin accounts cannot be changed here.",
    });
  }

  const { status } = req.body;

  const allowedStatuses = [
    "active",
    "suspended",
    "banned",
    "deactivated",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid account status.",
      allowedStatuses,
    });
  }

  user.accountStatus = status;
  await user.save();

  res.json({
    success: true,
    message: "User account status updated successfully.",
    data: user,
  });
});

export const deleteUser = run(async (req, res) => {
  const user = await findOrThrow(
    User,
    req.params.userId,
    "User"
  );

  if (String(user._id) === String(req.user?._id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own account.",
    });
  }

  if (user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin accounts cannot be deleted here.",
    });
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: "User deleted successfully.",
  });
});

// ======================================================
// VENDORS
// ======================================================

export const listVendors = list(Vendor, [
  "storeName",
  "contactEmail",
  "contactPhone",
]);

export const getVendor = getById(
  Vendor,
  "vendorId",
  "Vendor",
  [["user", "name email"]]
);

const changeVendorStatus = (status) =>
  run(async (req, res) => {
    const vendor = await findOrThrow(
      Vendor,
      req.params.vendorId,
      "Vendor"
    );

    const previousStatus = vendor.status;

    vendor.status = status;

    // Record review metadata when the vendor is reviewed.
    if (status === "approved" || status === "rejected") {
      vendor.reviewedBy = req.user._id;
      vendor.reviewedAt = new Date();
    }

    if (status === "approved" && previousStatus !== "approved") {
      vendor.approvedAt = new Date();
    }

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor ${status} successfully.`,
      data: vendor,
    });
  });

export const approveVendor = changeVendorStatus("approved");
export const rejectVendor = changeVendorStatus("rejected");
export const suspendVendor = changeVendorStatus("suspended");

// ======================================================
// PRODUCTS
// ======================================================

export const listProducts = list(
  Product,
  ["name", "sku"]
);

export const updateProductStatus = setStatus(
  Product,
  "productId",
  "Product",
  "status",
  ["draft", "active", "archived"]
);

export const deleteProduct = remove(
  Product,
  "productId",
  "Product"
);

// ======================================================
// ORDERS
// ======================================================

export const listOrders = list(
  Order,
  [],
  { statusField: "orderStatus" }
);

export const getOrder = getById(
  Order,
  "orderId",
  "Order",
  [["user", "name email"]]
);

export const updateOrderStatus = run(async (req, res) => {
  const order = await findOrThrow(
    Order,
    req.params.orderId,
    "Order"
  );

  const allowedStatuses = [
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status.",
      allowedStatuses,
    });
  }

  // Delivered and cancelled orders are treated as final.
  if (
    ["delivered", "cancelled"].includes(order.orderStatus) &&
    order.orderStatus !== status
  ) {
    return res.status(409).json({
      success: false,
      message: "This order has reached a final status.",
    });
  }

  order.orderStatus = status;
  await order.save();

  res.json({
    success: true,
    message: "Order status updated successfully.",
    data: order,
  });
});

// ======================================================
// PRODUCT REVIEWS
// ======================================================

export const listReviews = list(
  ProductReview,
  ["title", "comment"]
);

export const approveReview = run(async (req, res) => {
  const review = await findOrThrow(
    ProductReview,
    req.params.reviewId,
    "Product review"
  );

  review.status = "approved";
  await review.save();

  res.json({
    success: true,
    message: "Product review approved successfully.",
    data: review,
  });
});

export const deleteReview = remove(
  ProductReview,
  "reviewId",
  "Product review"
);

// ======================================================
// CATEGORIES
// ======================================================

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const listCategories = list(
  Category,
  ["name", "slug", "description"],
  { statusField: "isActive" }
);

export const getCategory = getById(
  Category,
  "categoryId",
  "Category"
);

export const createCategory = run(async (req, res) => {
  const {
    name,
    slug,
    description,
    image,
    isActive,
  } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Category name is required.",
    });
  }

  const category = await Category.create({
    name: name.trim(),
    slug: slug ? createSlug(slug) : createSlug(name),
    description,
    image,
    isActive: isActive ?? true,
    createdBy: req.user._id,
    createdByRole: "admin",
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully.",
    data: category,
  });
});

export const updateCategory = run(async (req, res) => {
  const category = await findOrThrow(
    Category,
    req.params.categoryId,
    "Category"
  );

  const {
    name,
    slug,
    description,
    image,
    isActive,
  } = req.body;

  // Only update fields explicitly supported by the category schema.
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name must be a non-empty string.",
      });
    }

    category.name = name.trim();
  }

  if (slug !== undefined) {
    if (typeof slug !== "string" || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category slug must be a non-empty string.",
      });
    }

    category.slug = createSlug(slug);
  } else if (name !== undefined) {
    category.slug = createSlug(name);
  }

  if (description !== undefined) {
    category.description = description;
  }

  if (image !== undefined) {
    category.image = image;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean.",
      });
    }

    category.isActive = isActive;
  }

  await category.save();

  res.json({
    success: true,
    message: "Category updated successfully.",
    data: category,
  });
});

export const deleteCategory = remove(
  Category,
  "categoryId",
  "Category"
);