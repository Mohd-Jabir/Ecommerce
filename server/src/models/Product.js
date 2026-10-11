import { Schema, model } from "mongoose";

const productImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 80,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number.",
      },
    },
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: (images) => images.length <= 10,
        message: "A product can have at most 10 images.",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active",
      index: true,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    salesCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ status: 1, category: 1, price: 1 });
productSchema.index({ vendor: 1, createdAt: -1 });
productSchema.index({ status: 1, averageRating: -1 });

productSchema.index({ vendor: 1, sku: 1 }, { unique: true });

export const Product = model("Product", productSchema);
