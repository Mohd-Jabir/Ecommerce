import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

const SHIPPING_FEE = 0;

function validateOrderId(orderId) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }
}

function makeOrderNumber() {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function normalizeAddress(address = {}) {
  const fields = [
    "fullName",
    "phone",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "postalCode",
    "country",
  ];

  const result = {};

  for (const field of fields) {
    if (address[field] !== undefined) {
      if (typeof address[field] !== "string") {
        throw new ApiError(400, `Invalid shipping address field: ${field}.`);
      }

      result[field] = address[field].trim();
    }
  }

  return result;
}

// POST /api/v1/orders
export async function createOrder(req, res) {
  const userId = req.user._id;
  const shippingAddress = normalizeAddress(req.body?.shippingAddress);

  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: cartItem.product,
            status: "active",
            stock: { $gte: cartItem.quantity },
          },
          {
            $inc: { stock: -cartItem.quantity },
          },
          {
            new: true,
            session,
          },
        );

        if (!product) {
          throw new ApiError(
            409,
            "A product is unavailable or has insufficient stock. Please review your cart.",
          );
        }

        const unitPrice = product.price;
        const lineTotal =
          Math.round((unitPrice * cartItem.quantity + Number.EPSILON) * 100) /
          100;

        subtotal =
          Math.round((subtotal + lineTotal + Number.EPSILON) * 100) / 100;

        orderItems.push({
          product: product._id,
          name: product.name,
          sku: product.sku || "",
          image: product.images?.[0]?.url || "",
          quantity: cartItem.quantity,
          unitPrice,
          lineTotal,
        });
      }

      const total =
        Math.round((subtotal + SHIPPING_FEE + Number.EPSILON) * 100) / 100;

      const [order] = await Order.create(
        [
          {
            orderNumber: makeOrderNumber(),
            user: userId,
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingFee: SHIPPING_FEE,
            total,
            paymentMethod: "cod",
            paymentStatus: "pending",
            orderStatus: "processing",
          },
        ],
        { session },
      );

      const clearedCart = await Cart.updateOne(
        { _id: cart._id, user: userId },
        { $set: { items: [] } },
        { session },
      );

      if (clearedCart.matchedCount !== 1) {
        throw new ApiError(409, "Cart changed. Please try again.");
      }

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    data: createdOrder,
  });
}

// GET /api/v1/orders
export async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("-__v");

  return res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
}

// GET /api/v1/orders/:orderId
export async function getOrderById(req, res) {
  const { orderId } = req.params;
  validateOrderId(orderId);

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  }).select("-__v");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return res.status(200).json({
    success: true,
    data: order,
  });
}

// PATCH /api/v1/orders/:orderId/cancel
export async function cancelOrder(req, res) {
  const { orderId } = req.params;
  validateOrderId(orderId);

  const session = await mongoose.startSession();
  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
      }).session(session);

      if (!order) {
        throw new ApiError(404, "Order not found.");
      }

      if (!["processing", "confirmed"].includes(order.orderStatus)) {
        throw new ApiError(400, "This order can no longer be cancelled.");
      }

      // Restore inventory for each item in the order.
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session },
        );
      }

      order.orderStatus = "cancelled";
      order.cancelledAt = new Date();

      await order.save({ session });
      cancelledOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    data: cancelledOrder,
  });
}
