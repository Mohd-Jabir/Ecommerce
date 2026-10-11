import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ProductReview } from "../models/ProductReview.js";
import * as productService from "../services/product.service.js";

export async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(
      req.vendor._id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(
      req.params.productId,
      req.user,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const result = await productService.deleteProduct(
      req.params.productId,
      req.user,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function listProductReviews(req, res, next) {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      throw new ApiError(400, "Invalid product ID.");
    }

    const product = await productService.getProductForReviews?.(productId);

    // If you have not added a separate helper, verify the product directly.
    if (!product) {
      const { Product } = await import("../models/Product.js");
      const exists = await Product.exists({
        _id: productId,
        status: "active",
      });

      if (!exists) {
        throw new ApiError(404, "Product not found.");
      }
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
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

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyProducts(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    const result = await listMyVendorProducts(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
