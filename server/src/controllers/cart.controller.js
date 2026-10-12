import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_QUANTITY = 99;

function validateProductId(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }
}

function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new ApiError(
      400,
      `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`,
    );
  }
}

async function findPurchasableProduct(productId) {
  const product = await Product.findOne({
    _id: productId,
    status: "active",
  });

  if (!product) {
    throw new ApiError(404, "Product not found or unavailable.");
  }

  return product;
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
}

async function populateCart(cart) {
  await cart.populate({
    path: "items.product",
    select: "name slug price compareAtPrice stock images status",
  });

  return cart;
}

// GET /api/v1/cart
export async function getCart(req, res) {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { items: [] },
    });
  }

  await populateCart(cart);

  return res.status(200).json({
    success: true,
    data: cart,
  });
}

// POST /api/v1/cart/items
// Body: { "productId": "...", "quantity": 2 }
export async function addCartItem(req, res) {
  const { productId, quantity } = req.body;

  validateProductId(productId);
  validateQuantity(quantity);

  const product = await findPurchasableProduct(productId);

  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock.");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    validateQuantity(newQuantity);

    if (newQuantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock.");
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ product: product._id, quantity });
  }

  await cart.save();
  await populateCart(cart);

  return res.status(200).json({
    success: true,
    message: "Cart updated successfully.",
    data: cart,
  });
}

// PATCH /api/v1/cart/items/:productId
// Body: { "quantity": 3 }
export async function updateCartItem(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;

  validateProductId(productId);
  validateQuantity(quantity);

  const product = await findPurchasableProduct(productId);

  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock.");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  const item = cart.items.find(
    (entry) => entry.product.toString() === productId,
  );

  if (!item) {
    throw new ApiError(404, "Product is not in your cart.");
  }

  item.quantity = quantity;

  await cart.save();
  await populateCart(cart);

  return res.status(200).json({
    success: true,
    message: "Cart item quantity updated.",
    data: cart,
  });
}

// DELETE /api/v1/cart/items/:productId
export async function removeCartItem(req, res) {
  const { productId } = req.params;

  validateProductId(productId);

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  const previousLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  if (cart.items.length === previousLength) {
    throw new ApiError(404, "Product is not in your cart.");
  }

  await cart.save();
  await populateCart(cart);

  return res.status(200).json({
    success: true,
    message: "Product removed from cart.",
    data: cart,
  });
}

// DELETE /api/v1/cart
export async function clearCart(req, res) {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return res.status(200).json({
    success: true,
    message: "Cart cleared successfully.",
    data: { items: [] },
  });
}
