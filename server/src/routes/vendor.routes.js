
import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";
import { requireApprovedVendor } from "../middlewares/vendor.middleware.js";
import { listMyCategories } from "../controllers/category.controller.js";
import {
  applyVendor,
  getMyVendor,
  updateMyVendor,
  getVendorDashboardData,

  listMyVendorProducts as listVendorProducts,
  createMyVendorProduct as addVendorProduct,
  updateMyVendorProduct as editVendorProduct,
  deleteMyVendorProduct as removeVendorProduct,

  listMyVendorOrders as listVendorOrders,
  getMyVendorOrder as getVendorOrder,
  updateMyVendorOrderStatus as changeVendorOrderStatus,

  getMyVendorAnalytics as getVendorAnalyticsData,
} from "../controllers/vendor.controller.js";

import {
  applyVendorSchema,
  updateVendorProfileSchema,
  createVendorProductSchema,
  updateVendorProductSchema,
  updateVendorOrderStatusSchema,
} from "../validators/vendor.validator.js";

const vendorRouter = Router();

vendorRouter.use(authenticate);

// Application and own profile.
vendorRouter.post("/apply", validate(applyVendorSchema), applyVendor);
vendorRouter.get("/me", getMyVendor);
vendorRouter.patch(
  "/me",
  requireApprovedVendor,
  validate(updateVendorProfileSchema),
  updateMyVendor,
);

// All remaining endpoints require an approved vendor.
vendorRouter.use(requireApprovedVendor);
vendorRouter.get("/me/categories", listMyCategories);
vendorRouter.get("/dashboard", getVendorDashboardData);

// Products.
vendorRouter.get("/me/products", listVendorProducts);
vendorRouter.post(
  "/me/products",
  validate(createVendorProductSchema),
  addVendorProduct,
);
vendorRouter.patch(
  "/me/products/:productId",
  validate(updateVendorProductSchema),
  editVendorProduct,
);
vendorRouter.delete("/me/products/:productId", removeVendorProduct);

// Orders.
vendorRouter.get("/me/orders", listVendorOrders);
vendorRouter.get("/me/orders/:orderId", getVendorOrder);
vendorRouter.patch(
  "/me/orders/:orderId/status",
  validate(updateVendorOrderStatusSchema),
  changeVendorOrderStatus,
);

// Analytics.
vendorRouter.get("/me/analytics", getVendorAnalyticsData);

export default vendorRouter;
