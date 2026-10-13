import mongoose from "mongoose";
import { ProductReview } from "../models/ProductReview.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

export async function listProductReviews(productId, query = {}) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const productExists = await Product.exists({
    _id: productId,
    status: "active",
  });

  if (!productExists) {
    throw new ApiError(404, "Product not found.");
  }

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);

  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit, 10) || 10),
  );

  const filter = {
    product: productId,
    status: "approved",
  };

  const [reviews, total] = await Promise.all([
    ProductReview.find(filter)
      .populate("user", "name")
      .select("rating title comment user createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    ProductReview.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function createProductReview(productId, user, payload) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const userId = user?._id || user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, "Please log in to submit a review.");
  }

  // Only customers can write reviews.
  if (user.role !== "customer") {
    throw new ApiError(403, "Only customers can submit product reviews.");
  }

  const rating = Number(payload.rating);
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const comment =
    typeof payload.comment === "string" ? payload.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be an integer from 1 to 5.");
  }

  if (title.length > 120) {
    throw new ApiError(400, "Review title cannot exceed 120 characters.");
  }

  if (comment.length > 3000) {
    throw new ApiError(400, "Review comment cannot exceed 3000 characters.");
  }

  if (!title && !comment) {
    throw new ApiError(400, "Please enter a review title or comment.");
  }

  const product = await Product.findOne({
    _id: productId,
    status: "active",
  }).select("_id");

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  try {
    const review = await ProductReview.create({
      product: product._id,
      user: userId,
      rating,
      title,
      comment,
      status: "pending",
    });

    return review;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "You have already reviewed this product.");
    }

    throw error;
  }
}

// Recalculate using approved reviews only.
export async function refreshProductRating(productId) {
  const [result] = await ProductReview.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(String(productId)),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        averageRating: result ? Math.round(result.averageRating * 10) / 10 : 0,
        ratingsCount: result?.ratingsCount || 0,
      },
    },
  );
}
