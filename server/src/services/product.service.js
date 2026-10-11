import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Vendor } from "../models/Vendor.js";
import { ApiError } from "../utils/ApiError.js";
import { productListQuerySchema } from "../validators/product.validator.js";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

async function createUniqueSlug(name, excludeId = null) {
  const base = slugify(name);

  if (!base) {
    throw new ApiError(400, "Product name cannot generate a valid slug.");
  }

  let slug = base;
  let suffix = 1;

  while (
    await Product.exists({
      slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function handleDuplicateKey(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];

    if (field === "sku") {
      throw new ApiError(409, "This SKU already exists in your store.");
    }

    if (field === "slug") {
      throw new ApiError(
        409,
        "A product with a similar slug already exists. Please try again.",
      );
    }

    throw new ApiError(409, "A record with these details already exists.");
  }

  throw error;
}

export async function listProducts(queryParams) {
  const parsed = productListQuerySchema.safeParse(queryParams);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid product filters.",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const {
    search,
    category,
    vendor,
    minPrice,
    maxPrice,
    rating,
    sort,
    page,
    limit,
  } = parsed.data;

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new ApiError(400, "minPrice cannot exceed maxPrice.");
  }

  const filter = { status: "active" };

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  if (vendor) {
    const approvedVendor = await Vendor.exists({
      _id: vendor,
      status: "approved",
    });

    if (!approvedVendor) {
      return {
        products: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    filter.vendor = vendor;
  } else {
    const approvedVendorIds = await Vendor.find({ status: "approved" })
      .select("_id")
      .lean();

    filter.vendor = { $in: approvedVendorIds.map((item) => item._id) };
  }

  if (category) {
    let categoryId = null;

    if (mongoose.isValidObjectId(category)) {
      categoryId = category;
    } else {
      const categoryDoc = await Category.findOne({
        slug: category,
        isActive: true,
      }).select("_id");

      categoryId = categoryDoc?._id;
    }

    if (!categoryId) {
      return {
        products: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    filter.category = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (rating !== undefined) {
    filter.averageRating = { $gte: rating };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: 1 },
    rating: { averageRating: -1, ratingsCount: -1 },
    popular: { salesCount: -1, createdAt: -1 },
  };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .populate({
        path: "vendor",
        select: "storeName slug",
        match: { status: "approved" },
      })
      .sort(sortOptions[sort])
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: products.filter((product) => product.vendor),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getProductBySlug(slug) {
  const product = await Product.findOne({
    slug,
    status: "active",
  })
    .populate("category", "name slug description")
    .populate({
      path: "vendor",
      select: "storeName slug status",
      match: { status: "approved" },
    })
    .lean();

  if (!product || !product.vendor) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
}

export async function createProduct(vendorId, payload) {
  const category = await Category.findOne({
    _id: payload.category,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(400, "Please select an active category.");
  }

  const vendor = await Vendor.findOne({
    _id: vendorId,
    status: "approved",
  });

  if (!vendor) {
    throw new ApiError(403, "An approved vendor account is required.");
  }

  const slug = await createUniqueSlug(payload.name);

  try {
    return await Product.create({
      ...payload,
      sku: payload.sku.trim().toUpperCase(),
      slug,
      vendor: vendor._id,
      status: payload.status || "active",
    });
  } catch (error) {
    handleDuplicateKey(error);
  }
}

export async function updateProduct(productId, user, payload) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const isAdmin = user.role === "admin";

  if (!isAdmin) {
    if (user.role !== "vendor") {
      throw new ApiError(403, "You are not allowed to update products.");
    }

    const vendor = await Vendor.findOne({
      user: user._id,
      status: "approved",
    }).select("_id");

    if (!vendor || !product.vendor.equals(vendor._id)) {
      throw new ApiError(403, "You do not own this product.");
    }
  }

  if (payload.category) {
    const category = await Category.findOne({
      _id: payload.category,
      isActive: true,
    });

    if (!category) {
      throw new ApiError(400, "Please select an active category.");
    }
  }

  if (payload.name && payload.name !== product.name) {
    payload.slug = await createUniqueSlug(payload.name, product._id);
  }

  if (payload.sku) {
    payload.sku = payload.sku.trim().toUpperCase();
  }

  try {
    Object.assign(product, payload);
    await product.save();
    return product;
  } catch (error) {
    handleDuplicateKey(error);
  }
}

export async function deleteProduct(productId, user) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (user.role !== "admin") {
    if (user.role !== "vendor") {
      throw new ApiError(403, "You are not allowed to delete products.");
    }

    const vendor = await Vendor.findOne({
      user: user._id,
      status: "approved",
    }).select("_id");

    if (!vendor || !product.vendor.equals(vendor._id)) {
      throw new ApiError(403, "You do not own this product.");
    }
  }

  // Archive rather than physically delete. This preserves order references.
  product.status = "archived";
  await product.save();

  return { message: "Product archived successfully." };
}

export async function listMyVendorProducts(userId, query = {}) {
  const vendor = await Vendor.findOne({
    user: userId,
    status: "approved",
  }).select("_id");

  if (!vendor) {
    throw new ApiError(403, "An approved vendor account is required.");
  }

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 10),
  );

  const filter = { vendor: vendor._id };

  if (query.status && ["active", "draft", "archived"].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.search?.trim()) {
    const search = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
