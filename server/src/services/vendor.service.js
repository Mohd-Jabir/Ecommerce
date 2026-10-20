import mongoose from "mongoose";

import { Vendor } from "../models/Vendor.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";
import { ApiError } from "../utils/ApiError.js";

function assertObjectId(id, label = "ID") {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}.`);
  }
}

function vendorIdOf(vendor) {
  const id = vendor?._id ?? vendor;

  assertObjectId(id, "vendor ID");
  return id;
}

function createSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
    .replace(/-+$/g, "");
}

async function generateUniqueVendorSlug(storeName, excludeId = null) {
  const base = createSlug(storeName);

  if (!base) {
    throw new ApiError(400, "Store name must contain letters or numbers.");
  }

  let slug = base.slice(0, 120);
  let suffix = 1;

  while (
    await Vendor.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    suffix += 1;
    const suffixText = `-${suffix}`;
    slug = `${base.slice(0, 120 - suffixText.length)}${suffixText}`;
  }

  return slug;
}

async function generateUniqueProductSlug(name, excludeId = null) {
  const base = createSlug(name);

  if (!base) {
    throw new ApiError(400, "Product name must contain letters or numbers.");
  }

  let slug = base;
  let suffix = 1;

  while (
    await Product.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    suffix += 1;
    const suffixText = `-${suffix}`;
    slug = `${base.slice(0, 180 - suffixText.length)}${suffixText}`;
  }

  return slug;
}

function validateProductPayload(payload, partial = false) {
  const required = ["name", "description", "sku", "price", "stock", "category"];

  if (!partial) {
    for (const key of required) {
      if (payload[key] === undefined) {
        throw new ApiError(400, `Product field '${key}' is required.`);
      }
    }
  }

  if (
    payload.price !== undefined &&
    (!Number.isFinite(Number(payload.price)) || Number(payload.price) < 0)
  ) {
    throw new ApiError(
      400,
      "Product price must be a valid non-negative number.",
    );
  }

  if (
    payload.stock !== undefined &&
    (!Number.isInteger(Number(payload.stock)) || Number(payload.stock) < 0)
  ) {
    throw new ApiError(
      400,
      "Product stock must be a non-negative whole number.",
    );
  }

  if (payload.category !== undefined) {
    assertObjectId(payload.category, "category ID");
  }
}

function orderItemProductId(item) {
  const id = item?.product?._id ?? item?.product;
  return id ? String(id) : "";
}

function orderItemQuantity(item) {
  return Number(item?.quantity ?? 0);
}

function orderItemLineTotal(item) {
  const lineTotal = Number(item?.lineTotal);

  if (Number.isFinite(lineTotal)) {
    return lineTotal;
  }

  return Number(item?.unitPrice ?? 0) * orderItemQuantity(item);
}

function orderHasVendorItems(order, productIds) {
  return (order.items ?? []).some((item) =>
    productIds.has(orderItemProductId(item)),
  );
}

function getVendorItems(order, productIds) {
  return (order.items ?? []).filter((item) =>
    productIds.has(orderItemProductId(item)),
  );
}

async function getVendorProductIdSet(vendorId) {
  const products = await Product.find({ vendor: vendorId })
    .select("_id")
    .lean();
  return new Set(products.map((product) => String(product._id)));
}

async function findVendorOrders(vendorId) {
  const productIds = await getVendorProductIdSet(vendorId);

  if (productIds.size === 0) {
    return { productIds, orders: [] };
  }

  const orders = await Order.find({
    "items.product": { $in: [...productIds] },
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    productIds,
    orders: orders.filter((order) => orderHasVendorItems(order, productIds)),
  };
}

function calculateOrderMetrics(orders, productIds) {
  let revenue = 0;
  let pendingOrders = 0;
  let completedOrders = 0;

  const activeOrders = orders.filter(
    (order) => order.orderStatus !== "cancelled",
  );

  for (const order of activeOrders) {
    if (["processing", "confirmed"].includes(order.orderStatus)) {
      pendingOrders += 1;
    }

    if (order.orderStatus === "delivered") {
      completedOrders += 1;
    }

    if (order.paymentStatus === "paid") {
      for (const item of getVendorItems(order, productIds)) {
        revenue += orderItemLineTotal(item);
      }
    }
  }

  return {
    revenue: Math.round((revenue + Number.EPSILON) * 100) / 100,
    totalOrders: activeOrders.length,
    pendingOrders,
    completedOrders,
  };
}

async function getTopProducts(vendorId) {
  return Product.find({ vendor: vendorId })
    .sort({ salesCount: -1, createdAt: -1 })
    .limit(5)
    .select(
      "name slug price stock images salesCount averageRating ratingsCount status",
    )
    .lean();
}

// ─────────────────────────────────────────
// Vendor application and profile
// ─────────────────────────────────────────

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

  const existing = await Vendor.findByUserId(userId);

  if (existing?.status === "pending") {
    throw new ApiError(409, "Your vendor application is already pending.");
  }

  if (existing?.status === "approved") {
    throw new ApiError(409, "You already have an approved vendor account.");
  }

  if (existing?.status === "suspended") {
    throw new ApiError(403, "Your vendor account is suspended.");
  }

  const values = {
    storeName: payload.storeName,
    slug: await generateUniqueVendorSlug(payload.storeName, existing?._id),
    description: payload.description ?? "",
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone ?? "",
    businessAddress: payload.businessAddress ?? {},
    status: "pending",
    rejectionReason: "",
    reviewedBy: null,
    reviewedAt: null,
    approvedAt: null,
  };

  if (existing) {
    Object.assign(existing, values);
    await existing.save();
    return existing;
  }

  return Vendor.create({
    user: userId,
    ...values,
  });
}

export async function getMyVendorProfile(userId) {
  const vendor = await Vendor.findByUserId(userId);

  if (!vendor) {
    throw new ApiError(404, "Vendor application not found.");
  }

  return vendor;
}


export async function updateMyVendorProfile(vendor, payload) {
  const allowed = [
    "storeName",
    "description",
    "contactEmail",
    "contactPhone",
    "logo",
  ];

  for (const field of allowed) {
    if (payload[field] !== undefined) {
      vendor[field] = payload[field];
    }
  }

  if (payload.businessAddress !== undefined) {
    const addressFields = [
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "country",
    ];

    for (const field of addressFields) {
      if (payload.businessAddress[field] !== undefined) {
        vendor.businessAddress[field] =
          payload.businessAddress[field];
      }
    }
  }

  if (payload.storeName !== undefined) {
    vendor.slug = await generateUniqueVendorSlug(
      payload.storeName,
      vendor._id,
    );
  }

  await vendor.save();

  return vendor;
}


// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────

export async function getVendorDashboard(userId) {
  const vendor = await Vendor.findByUserId(userId);

  if (!vendor) {
    throw new ApiError(404, "Vendor application not found.");
  }

  if (vendor.status !== "approved") {
    return {
      vendor,
      stats: {
        revenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        lowStockProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalCategories: 0,
      },
      topProducts: [],
    };
  }

  const vendorId = vendor._id;

  const [
    totalProducts,
    activeProducts,
    draftProducts,
    lowStockProducts,
    totalCategories,
    orderData,
  ] = await Promise.all([
    Product.countDocuments({ vendor: vendorId }),
    Product.countDocuments({ vendor: vendorId, status: "active" }),
    Product.countDocuments({ vendor: vendorId, status: "draft" }),
    Product.countDocuments({
      vendor: vendorId,
      status: { $ne: "archived" },
      stock: { $lte: 5 },
    }),
    Category.countDocuments({
      createdBy: userId,
      createdByRole: "vendor",
      isActive: true,
    }),
    findVendorOrders(vendorId),
  ]);

  const orderMetrics = calculateOrderMetrics(
    orderData.orders,
    orderData.productIds,
  );

  return {
    vendor,
    stats: {
      totalProducts,
      activeProducts,
      draftProducts,
      lowStockProducts,
      totalCategories,
      ...orderMetrics,
    },
    topProducts: await getTopProducts(vendorId),
  };
}

// ─────────────────────────────────────────
// Vendor products
// ─────────────────────────────────────────

export async function getVendorProducts(vendor, query = {}) {
  const vendorId = vendorIdOf(vendor);

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20),
  );

  const filter = { vendor: vendorId };

  if (query.status && ["draft", "active", "archived"].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.search) {
    const escaped = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: escaped, $options: "i" };
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

export async function createVendorProduct(vendor, payload) {
  const vendorId = vendorIdOf(vendor);
  validateProductPayload(payload);

  const category = await Category.findOne({
    _id: payload.category,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(400, "Selected category was not found or is inactive.");
  }

  const sku = payload.sku.trim().toUpperCase();

  if (await Product.exists({ vendor: vendorId, sku })) {
    throw new ApiError(409, "You already have a product with this SKU.");
  }

  return Product.create({
    name: payload.name.trim(),
    slug: await generateUniqueProductSlug(payload.name),
    description: payload.description.trim(),
    sku,
    price: payload.price,
    compareAtPrice: payload.compareAtPrice ?? null,
    stock: payload.stock,
    category: category._id,
    vendor: vendorId,
    images: payload.images ?? [],
    status: payload.status ?? "draft",
  });
}

export async function updateVendorProduct(vendor, productId, payload) {
  const vendorId = vendorIdOf(vendor);
  assertObjectId(productId, "product ID");
  validateProductPayload(payload, true);

  const product = await Product.findOne({
    _id: productId,
    vendor: vendorId,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (payload.category !== undefined) {
    const category = await Category.findOne({
      _id: payload.category,
      isActive: true,
    });

    if (!category) {
      throw new ApiError(
        400,
        "Selected category was not found or is inactive.",
      );
    }

    product.category = category._id;
  }

  if (payload.name !== undefined) {
    product.name = payload.name.trim();
    product.slug = await generateUniqueProductSlug(payload.name, product._id);
  }

  if (payload.sku !== undefined) {
    const sku = payload.sku.trim().toUpperCase();

    if (
      await Product.exists({
        vendor: vendorId,
        sku,
        _id: { $ne: product._id },
      })
    ) {
      throw new ApiError(409, "You already have a product with this SKU.");
    }

    product.sku = sku;
  }

  for (const field of [
    "description",
    "price",
    "compareAtPrice",
    "stock",
    "images",
    "status",
  ]) {
    if (payload[field] !== undefined) {
      product[field] = payload[field];
    }
  }

  await product.save();
  return product;
}

export async function deleteVendorProduct(vendor, productId) {
  const vendorId = vendorIdOf(vendor);
  assertObjectId(productId, "product ID");

  const product = await Product.findOne({
    _id: productId,
    vendor: vendorId,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  product.status = "archived";
  await product.save();

  return product;
}

// ─────────────────────────────────────────
// Vendor orders
// ─────────────────────────────────────────

export async function getVendorOrders(vendor, query = {}) {
  const vendorId = vendorIdOf(vendor);
  const { productIds, orders: allOrders } = await findVendorOrders(vendorId);

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20),
  );

  let orders = allOrders;

  if (query.status) {
    orders = orders.filter((order) => order.orderStatus === query.status);
  }

  const total = orders.length;
  const selected = orders.slice((page - 1) * limit, page * limit);

  return {
    orders: selected.map((order) => ({
      ...order,
      items: getVendorItems(order, productIds),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getVendorOrderById(vendor, orderId) {
  const vendorId = vendorIdOf(vendor);
  assertObjectId(orderId, "order ID");

  const { productIds } = await findVendorOrders(vendorId);

  const order = await Order.findById(orderId).lean();

  if (!order || !orderHasVendorItems(order, productIds)) {
    throw new ApiError(404, "Order not found.");
  }

  return {
    ...order,
    items: getVendorItems(order, productIds),
  };
}

export async function updateVendorOrderStatus(vendor, orderId, status) {
  const vendorId = vendorIdOf(vendor);
  assertObjectId(orderId, "order ID");

  const allowedStatuses = ["confirmed", "shipped", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid order status.");
  }

  const { productIds } = await findVendorOrders(vendorId);

  const order = await Order.findById(orderId);

  if (!order || !orderHasVendorItems(order, productIds)) {
    throw new ApiError(404, "Order not found.");
  }

  const vendorItems = getVendorItems(order.toObject(), productIds);
  const allItemsBelongToVendor = vendorItems.length === order.items.length;

  if (!allItemsBelongToVendor) {
    throw new ApiError(
      409,
      "This order contains products from multiple vendors. Per-vendor fulfillment must be implemented before changing its status.",
    );
  }

  if (order.orderStatus === "cancelled") {
    throw new ApiError(409, "A cancelled order cannot be updated.");
  }

  const transitions = {
    processing: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  if (!transitions[order.orderStatus]?.includes(status)) {
    throw new ApiError(
      409,
      `Cannot change order status from '${order.orderStatus}' to '${status}'.`,
    );
  }

  if (status === "cancelled" && order.paymentStatus === "paid") {
    throw new ApiError(
      409,
      "A paid order must go through the refund process instead of direct cancellation.",
    );
  }

  order.orderStatus = status;

  if (status === "cancelled") {
    order.cancelledAt = new Date();
  }

  await order.save();

  return {
    ...order.toObject(),
    items: vendorItems,
  };
}

// ─────────────────────────────────────────
// Vendor analytics
// ─────────────────────────────────────────

export async function getVendorAnalytics(vendor, query = {}) {
  const vendorId = vendorIdOf(vendor);
  const { productIds, orders } = await findVendorOrders(vendorId);

  let from;
  let to;

  if (query.from) {
    from = new Date(query.from);
    if (Number.isNaN(from.getTime())) {
      throw new ApiError(400, "Invalid 'from' date.");
    }
  }

  if (query.to) {
    to = new Date(query.to);
    if (Number.isNaN(to.getTime())) {
      throw new ApiError(400, "Invalid 'to' date.");
    }
    to.setHours(23, 59, 59, 999);
  }

  if (from && to && from > to) {
    throw new ApiError(400, "'from' must be before 'to'.");
  }

  const filtered = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return (!from || createdAt >= from) && (!to || createdAt <= to);
  });

  const metrics = calculateOrderMetrics(filtered, productIds);

  const productSales = new Map();

  for (const order of filtered) {
    if (order.paymentStatus !== "paid" || order.orderStatus === "cancelled") {
      continue;
    }

    for (const item of getVendorItems(order, productIds)) {
      const id = orderItemProductId(item);
      const previous = productSales.get(id) ?? {
        productId: id,
        name: item.name,
        quantitySold: 0,
        revenue: 0,
      };

      previous.quantitySold += orderItemQuantity(item);
      previous.revenue += orderItemLineTotal(item);
      productSales.set(id, previous);
    }
  }

  return {
    period: {
      from: from ?? null,
      to: to ?? null,
    },
    metrics,
    salesByProduct: [...productSales.values()]
      .map((item) => ({
        ...item,
        revenue: Math.round((item.revenue + Number.EPSILON) * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}
