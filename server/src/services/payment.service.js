import crypto from "node:crypto";
import mongoose from "mongoose";

import { razorpay, razorpayKeyId } from "../config/razorpay.js";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";
import { ApiError } from "../utils/ApiError.js";
import { ProcessedWebhook } from "../models/ProcessedWebhook.js";

function userIdOf(user) {
  const id = user?._id ?? user?.id;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(401, "Authentication is required.");
  }

  return id;
}

function safeEqualHex(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    !/^[a-f0-9]+$/i.test(a) ||
    !/^[a-f0-9]+$/i.test(b) ||
    a.length % 2 !== 0 ||
    b.length % 2 !== 0
  ) {
    return false;
  }

  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  return (
    left.length === right.length &&
    left.length > 0 &&
    crypto.timingSafeEqual(left, right)
  );
}

function paymentSignature(orderId, paymentId) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new ApiError(500, "Payment configuration is incomplete.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

function webhookSignature(rawBody) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new ApiError(500, "Webhook configuration is incomplete.");
  }

  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

// Order.total is in rupees.
// Razorpay expects the amount in paise.
function amountInPaise(rupees) {
  const amount = Number(rupees);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Order total is invalid.");
  }

  const paise = Math.round(amount * 100);

  if (
    !Number.isSafeInteger(paise) ||
    paise <= 0 ||
    Math.abs(amount * 100 - paise) > 0.000001
  ) {
    throw new ApiError(400, "Order total has invalid precision.");
  }

  return paise;
}

async function findOwnedOrder(orderId, userId) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return order;
}

async function getOrCreateAttempt({ order, userId, checkoutKey, amount }) {
  let attempt;

  try {
    attempt = await Payment.findOneAndUpdate(
      {
        user: userId,
        checkoutKey,
      },
      {
        $setOnInsert: {
          order: order._id,
          user: userId,
          checkoutKey,
          amount,
          currency: "INR",
          status: "creating",
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      },
    );
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    attempt = await Payment.findOne({
      user: userId,
      checkoutKey,
    });

    if (!attempt) {
      throw error;
    }
  }

  if (!attempt) {
    throw new ApiError(
      500,
      "Could not create or retrieve the payment attempt.",
    );
  }

  if (
    String(attempt.order) !== String(order._id) ||
    attempt.amount !== amount ||
    attempt.currency !== "INR"
  ) {
    throw new ApiError(
      409,
      "Checkout details changed. Please restart checkout.",
    );
  }

  return attempt;
}

function paymentOrderResponse(payment) {
  return {
    paymentId: payment._id,
    keyId: razorpayKeyId,
    razorpayOrderId: payment.razorpayOrderId,
    amount: payment.amount,
    currency: payment.currency,
  };
}

export async function createPaymentOrder(user, input) {
  const userId = userIdOf(user);
  const { orderId, checkoutKey } = input ?? {};

  if (
    typeof checkoutKey !== "string" ||
    checkoutKey.length < 16 ||
    checkoutKey.length > 128
  ) {
    throw new ApiError(400, "A valid checkout key is required.");
  }

  if (!razorpayKeyId || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Payment configuration is incomplete.");
  }

  const order = await findOwnedOrder(orderId, userId);

  if (order.paymentStatus === "paid") {
    throw new ApiError(409, "This order has already been paid.");
  }

  if (order.orderStatus === "cancelled") {
    throw new ApiError(409, "This order has been cancelled.");
  }

  // Your Order schema uses `total`, not `totalAmount`.
  const amount = amountInPaise(order.total);

  const attempt = await getOrCreateAttempt({
    order,
    userId,
    checkoutKey,
    amount,
  });

  if (
    attempt.razorpayOrderId &&
    ["created", "authorized", "captured"].includes(attempt.status)
  ) {
    return paymentOrderResponse(attempt);
  }

  if (attempt.status !== "creating") {
    throw new ApiError(
      409,
      "Payment setup is already in progress or needs reconciliation. Please check before retrying.",
    );
  }

  // Claim the attempt before creating a Razorpay order.
  const claim = await Payment.updateOne(
    {
      _id: attempt._id,
      status: "creating",
      razorpayOrderId: null,
    },
    {
      $set: {
        status: "verification_pending",
      },
    },
  );

  if (claim.modifiedCount !== 1) {
    const latest = await Payment.findById(attempt._id);

    if (
      latest?.razorpayOrderId &&
      ["created", "authorized", "captured"].includes(latest.status)
    ) {
      return paymentOrderResponse(latest);
    }

    throw new ApiError(
      409,
      "Payment setup is already in progress. Please check again shortly.",
    );
  }

  let razorpayOrder;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: String(attempt._id),
      notes: {
        localPaymentId: String(attempt._id),
        localOrderId: String(order._id),
      },
    });
  } catch {
    // A network failure may leave the remote result uncertain.
    // Do not blindly create another remote order.
    throw new ApiError(
      503,
      "Payment setup could not be confirmed. Check payment status before retrying.",
    );
  }

  const saved = await Payment.updateOne(
    {
      _id: attempt._id,
      status: "verification_pending",
      razorpayOrderId: null,
    },
    {
      $set: {
        razorpayOrderId: razorpayOrder.id,
        status: "created",
      },
    },
  );

  if (saved.modifiedCount !== 1) {
    throw new ApiError(
      503,
      "Payment order needs reconciliation before continuing.",
    );
  }

  return {
    paymentId: attempt._id,
    keyId: razorpayKeyId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  };
}

async function confirmCapturedPayment({ payment, razorpayPaymentId }) {
  const remotePayment = await razorpay.payments.fetch(razorpayPaymentId);

  if (
    remotePayment.order_id !== payment.razorpayOrderId ||
    remotePayment.amount !== payment.amount ||
    remotePayment.currency !== payment.currency
  ) {
    throw new ApiError(400, "Payment details do not match the order.");
  }

  if (remotePayment.status !== "captured") {
    if (remotePayment.status === "failed") {
      await Payment.updateOne(
        {
          _id: payment._id,
          status: {
            $nin: ["captured", "failed"],
          },
        },
        {
          $set: {
            status: "failed",
            razorpayPaymentId,
          },
        },
      );

      return {
        paid: false,
        status: "failed",
      };
    }

    await Payment.updateOne(
      {
        _id: payment._id,
        status: {
          $nin: ["captured", "failed"],
        },
      },
      {
        $set: {
          status:
            remotePayment.status === "authorized"
              ? "authorized"
              : "verification_pending",
          razorpayPaymentId,
        },
      },
    );

    return {
      paid: false,
      status: remotePayment.status,
    };
  }

  const existing = await Payment.findOne({
    razorpayPaymentId,
    _id: {
      $ne: payment._id,
    },
  });

  if (existing) {
    throw new ApiError(409, "Payment has already been processed.");
  }

  const paymentUpdate = await Payment.updateOne(
    {
      _id: payment._id,
      razorpayOrderId: remotePayment.order_id,
      status: {
        $nin: ["captured", "failed"],
      },
      $or: [{ razorpayPaymentId: null }, { razorpayPaymentId }],
    },
    {
      $set: {
        status: "captured",
        razorpayPaymentId,
      },
    },
  );

  if (paymentUpdate.modifiedCount === 1) {
    await Order.updateOne(
      {
        _id: payment.order,
        user: payment.user,
        paymentStatus: {
          $ne: "paid",
        },
      },
      {
        $set: {
          paymentStatus: "paid",
        },
      },
    );
  }

  const currentOrder = await Order.findById(payment.order).select(
    "paymentStatus",
  );

  if (currentOrder?.paymentStatus !== "paid") {
    throw new ApiError(
      503,
      "Payment was captured but order confirmation needs reconciliation.",
    );
  }

  return {
    paid: true,
    status: "captured",
  };
}

export async function verifyCheckoutPayment(user, input) {
  const userId = userIdOf(user);

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: signature,
  } = input ?? {};

  if (
    typeof razorpayOrderId !== "string" ||
    typeof razorpayPaymentId !== "string" ||
    typeof signature !== "string"
  ) {
    throw new ApiError(400, "Payment verification details are required.");
  }

  const payment = await Payment.findOne({
    user: userId,
    razorpayOrderId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment attempt not found.");
  }

  const expectedSignature = paymentSignature(
    payment.razorpayOrderId,
    razorpayPaymentId,
  );

  if (!safeEqualHex(expectedSignature, signature)) {
    throw new ApiError(400, "Payment signature is invalid.");
  }

  return confirmCapturedPayment({
    payment,
    razorpayPaymentId,
  });
}

export async function getPaymentStatus(user, paymentId) {
  const userId = userIdOf(user);

  if (!mongoose.isValidObjectId(paymentId)) {
    throw new ApiError(400, "Invalid payment ID.");
  }

  const payment = await Payment.findOne({
    _id: paymentId,
    user: userId,
  }).select(
    "order amount currency status razorpayOrderId razorpayPaymentId createdAt updatedAt",
  );

  if (!payment) {
    throw new ApiError(404, "Payment attempt not found.");
  }

  return payment;
}

export async function processRazorpayWebhook(rawBody, signature, eventId) {
  if (
    !Buffer.isBuffer(rawBody) ||
    typeof signature !== "string" ||
    !process.env.RAZORPAY_WEBHOOK_SECRET
  ) {
    throw new ApiError(400, "Invalid webhook request.");
  }

  const expectedSignature = webhookSignature(rawBody);

  if (!safeEqualHex(expectedSignature, signature)) {
    throw new ApiError(400, "Invalid webhook signature.");
  }

  let event;

  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new ApiError(400, "Invalid webhook JSON.");
  }

  if (typeof eventId !== "string" || !eventId.trim()) {
    throw new ApiError(400, "Missing webhook event ID.");
  }

  if (await ProcessedWebhook.exists({ eventId })) {
    return {
      received: true,
      duplicate: true,
    };
  }

  const paymentEntity = event.payload?.payment?.entity;

  if (
    ["payment.captured", "order.paid"].includes(event.event) &&
    paymentEntity?.id &&
    paymentEntity?.order_id
  ) {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });

    if (payment) {
      await confirmCapturedPayment({
        payment,
        razorpayPaymentId: paymentEntity.id,
      });
    }
  }

  try {
    await ProcessedWebhook.create({
      eventId,
      eventType: event.event ?? "unknown",
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }
  }

  return {
    received: true,
    duplicate: false,
  };
}
