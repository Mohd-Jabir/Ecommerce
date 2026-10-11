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
  listMyProducts,
} from "../controllers/product.controller.js";

const productRouter = Router();

// Public routes
productRouter.get("/", listProducts);

// Product reviews: use productId, not slug
productRouter.get("/:productId/reviews", listProductReviews);

// Product detail: keep this after the more specific route
productRouter.get("/:slug", getProduct);

// Approved vendors can create products
productRouter.post(
  "/",
  authenticate,
  requireApprovedVendor,
  validate(createProductSchema),
  createProduct,
);

// Vendor owner or admin permissions are checked in the service
productRouter.patch(
  "/:productId",
  authenticate,
  validate(updateProductSchema),
  updateProduct,
);

productRouter.delete("/:productId", authenticate, deleteProduct);
productRouter.get(
  "/vendor/me",
  authenticate,
  requireApprovedVendor,
  listMyProducts,
);
export default productRouter;
