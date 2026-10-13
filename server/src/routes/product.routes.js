
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";
import { requireApprovedVendor } from "../middlewares/vendor.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";

import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listProductReviews,
  createProductReview,
  listMyProducts,
} from "../controllers/product.controller.js";

const productRouter = Router();

// Public: list products
productRouter.get("/", listProducts);

// Product reviews: use productId, not slug
productRouter.get("/:productId/reviews", listProductReviews);

// Authenticated customers can submit reviews
productRouter.post(
  "/:productId/reviews",
  authenticate,
  createProductReview,
);

// Product detail: keep after the more specific review routes
productRouter.get("/:slug", getProduct);

// Approved vendors can create products
productRouter.post(
  "/",
  authenticate,
  requireApprovedVendor,
  validate(createProductSchema),
  createProduct,
);

// Update product
productRouter.patch(
  "/:productId",
  authenticate,
  validate(updateProductSchema),
  updateProduct,
);

// Delete/archive product
productRouter.delete(
  "/:productId",
  authenticate,
  deleteProduct,
);

// Vendor's products
productRouter.get(
  "/vendor/me",
  authenticate,
  requireApprovedVendor,
  listMyProducts,
);

export default productRouter;
