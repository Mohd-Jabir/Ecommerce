import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkoutKey: {
      type: String,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true, // smallest currency unit: paise for INR
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "creating",
        "created",
        "authorized",
        "captured",
        "failed",
        "verification_pending",
      ],
      default: "creating",
      required: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// A checkout retry with the same key must not create another attempt.
paymentSchema.index({ user: 1, checkoutKey: 1 }, { unique: true });

// A Razorpay order belongs to one local payment attempt.
paymentSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayOrderId: { $type: "string" },
    },
  },
);

// The same Razorpay payment cannot be credited twice.
paymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayPaymentId: { $type: "string" },
    },
  },
);

export const Payment = model("Payment", paymentSchema);
