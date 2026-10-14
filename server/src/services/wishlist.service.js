
import mongoose from "mongoose";
import { Wishlist } from "../models/Wishlist.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

function getUserId(user) {
  const userId = user?._id || user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, "Authentication is required.");
  }

  return userId;
}

// GET: Get the current user's wishlist
export async function getWishlist(user) {
  const userId = getUserId(user);

  const wishlist = await Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      match: { status: "active" },
      select: "name slug price compareAtPrice images stock averageRating ratingsCount",
    })
    .lean();

  return {
    products: wishlist?.products ?? [],
    count: wishlist?.products?.filter(Boolean).length ?? 0,
  };
}

// POST: Add a product to the wishlist
export async function addToWishlist(user, productId) {
  const userId = getUserId(user);

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const product = await Product.findOne({
    _id: productId,
    status: "active",
  }).select("_id");

  if (!product) {
    throw new ApiError(404, "Product not found or unavailable.");
  }

  // Create the wishlist if the user does not have one.
  // $addToSet avoids duplicate product IDs.
  await Wishlist.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId },
      $addToSet: { products: product._id },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return getWishlist(user);
}

// DELETE: Remove a product from the wishlist
export async function removeFromWishlist(user, productId) {
  const userId = getUserId(user);

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
  );

  return getWishlist(user);
}
