import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { validate } from "../middlewares/auth.validator.middleware.js";
import * as adminController from "../controllers/admin.controller.js";

import {
  adminListQuerySchema,
  updateUserStatusSchema,
  updateProductStatusSchema,
  updateOrderStatusSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/admin.validator.js";

const router = Router();

router.use(authenticate, requireAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Users
router.get(
  "/users",
  validate(adminListQuerySchema, "query"),
  adminController.listUsers,
);
router.get("/users/:userId", adminController.getUser);
router.patch(
  "/users/:userId/status",
  validate(updateUserStatusSchema),
  adminController.updateUserStatus,
);
router.delete("/users/:userId", adminController.deleteUser);

// Vendors
router.get(
  "/vendors",
  validate(adminListQuerySchema, "query"),
  adminController.listVendors,
);
router.get("/vendors/:vendorId", adminController.getVendor);
router.patch("/vendors/:vendorId/approve", adminController.approveVendor);
router.patch("/vendors/:vendorId/reject", adminController.rejectVendor);
router.patch("/vendors/:vendorId/suspend", adminController.suspendVendor);

// Products
router.get(
  "/products",
  validate(adminListQuerySchema, "query"),
  adminController.listProducts,
);
router.patch(
  "/products/:productId/status",
  validate(updateProductStatusSchema),
  adminController.updateProductStatus,
);
router.delete("/products/:productId", adminController.deleteProduct);

// Orders
router.get(
  "/orders",
  validate(adminListQuerySchema, "query"),
  adminController.listOrders,
);
router.get("/orders/:orderId", adminController.getOrder);
router.patch(
  "/orders/:orderId/status",
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus,
);

// Reviews
router.get(
  "/reviews",
  validate(adminListQuerySchema, "query"),
  adminController.listReviews,
);
router.patch("/reviews/:reviewId/approve", adminController.approveReview);
router.delete("/reviews/:reviewId", adminController.deleteReview);

// Categories
// Categories
router.get(
  "/categories",
  validate(adminListQuerySchema, "query"),
  adminController.listCategories,
);

router.post(
  "/categories",
  validate(createCategorySchema),
  adminController.createCategory,
);

router.patch(
  "/categories/:categoryId",
  validate(updateCategorySchema),
  adminController.updateCategory,
);

router.delete(
  "/categories/:categoryId",
  adminController.deleteCategory,
);
export default router;
