import mongoose from "mongoose";

import { User } from "../models/User.js";
import { Vendor } from "../models/Vendor.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { ProductReview } from "../models/ProductReview.js";
import { Category } from "../models/Category.js";

// ======================================================
// PAGINATION
// ======================================================

export const getPagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export const getAdminDashboard = async () => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalVendors,
    pendingVendors,
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalReviews,
    pendingReviews,
    totalCategories,
    activeCategories,
    revenueResult,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: "active" }),
    User.countDocuments({ accountStatus: "suspended" }),

    Vendor.countDocuments(),
    Vendor.countDocuments({ status: "pending" }),

    Product.countDocuments(),
    Product.countDocuments({ status: "active" }),

    Order.countDocuments(),
    Order.countDocuments({
      orderStatus: { $in: ["processing", "confirmed"] },
    }),

    ProductReview.countDocuments(),
    ProductReview.countDocuments({ status: "pending" }),

    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),

    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
        },
      },
    ]),

    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber total orderStatus paymentStatus createdAt user")
      .populate("user", "name email")
      .lean(),
  ]);

  return {
    counts: {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalVendors,
      pendingVendors,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalReviews,
      pendingReviews,
      totalCategories,
      activeCategories,
    },
    revenue: revenueResult[0]?.revenue ?? 0,
    recentOrders,
  };
};

// ======================================================
// GENERIC PAGINATED LIST
// ======================================================

export const listDocuments = async ({
  Model,
  query = {},
  searchFields = [],
  extraFilter = {},
  statusField = "status",
}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { ...extraFilter };

  if (query.status) {
    filter[statusField] = query.status;
  }

  if (query.search && searchFields.length) {
    const escapedSearch = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(escapedSearch, "i");

    filter.$or = searchFields.map((field) => ({
      [field]: searchRegex,
    }));
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "name",
    "email",
    "storeName",
    "price",
    "total",
    "rating",
    "orderNumber",
  ];

  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Model.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),

    Model.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ======================================================
// OBJECT ID VALIDATION
// ======================================================

export const assertValidObjectId = (id, label = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(`Invalid ${label}.`);
    error.statusCode = 400;
    throw error;
  }
};

// ======================================================
// FIND DOCUMENT OR THROW 404
// ======================================================

export const findOrThrow = async (Model, id, label = "Record") => {
  assertValidObjectId(id);

  const record = await Model.findById(id);

  if (!record) {
    const error = new Error(`${label} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return record;
};
