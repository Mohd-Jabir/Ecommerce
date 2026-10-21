
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

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative dashboard and resource management
 */

router.use(authenticate, requireAdmin);

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get("/dashboard", adminController.getDashboard);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/Sort'
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/users",
  validate(adminListQuerySchema, "query"),
  adminController.listUsers,
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: User not found.
 */
router.get("/users/:userId", adminController.getUser);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/status:
 *   patch:
 *     summary: Update user account status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateUserStatus'
 *     responses:
 *       200:
 *         description: User status updated.
 *       400:
 *         description: Invalid status or request body.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: User not found.
 */
router.patch(
  "/users/:userId/status",
  validate(updateUserStatusSchema),
  adminController.updateUserStatus,
);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: User not found.
 */
router.delete("/users/:userId", adminController.deleteUser);

/**
 * @swagger
 * /api/v1/admin/vendors:
 *   get:
 *     summary: List vendors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/Sort'
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/vendors",
  validate(adminListQuerySchema, "query"),
  adminController.listVendors,
);

/**
 * @swagger
 * /api/v1/admin/vendors/{vendorId}:
 *   get:
 *     summary: Get vendor details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.get("/vendors/:vendorId", adminController.getVendor);

/**
 * @swagger
 * /api/v1/admin/vendors/{vendorId}/approve:
 *   patch:
 *     summary: Approve a vendor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor approved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.patch("/vendors/:vendorId/approve", adminController.approveVendor);

/**
 * @swagger
 * /api/v1/admin/vendors/{vendorId}/reject:
 *   patch:
 *     summary: Reject a vendor application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor application rejected.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.patch("/vendors/:vendorId/reject", adminController.rejectVendor);

/**
 * @swagger
 * /api/v1/admin/vendors/{vendorId}/suspend:
 *   patch:
 *     summary: Suspend a vendor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor suspended successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Vendor not found.
 */
router.patch("/vendors/:vendorId/suspend", adminController.suspendVendor);

/**
 * @swagger
 * /api/v1/admin/products:
 *   get:
 *     summary: List products for administration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/Sort'
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/products",
  validate(adminListQuerySchema, "query"),
  adminController.listProducts,
);

/**
 * @swagger
 * /api/v1/admin/products/{productId}/status:
 *   patch:
 *     summary: Update product status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateProductStatus'
 *     responses:
 *       200:
 *         description: Product status updated.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Product not found.
 */
router.patch(
  "/products/:productId/status",
  validate(updateProductStatusSchema),
  adminController.updateProductStatus,
);

/**
 * @swagger
 * /api/v1/admin/products/{productId}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Product not found.
 */
router.delete("/products/:productId", adminController.deleteProduct);

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: List orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/Sort'
 *     responses:
 *       200:
 *         description: Orders retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/orders",
  validate(adminListQuerySchema, "query"),
  adminController.listOrders,
);

/**
 * @swagger
 * /api/v1/admin/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Order not found.
 */
router.get("/orders/:orderId", adminController.getOrder);

/**
 * @swagger
 * /api/v1/admin/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateOrderStatus'
 *     responses:
 *       200:
 *         description: Order status updated.
 *       400:
 *         description: Invalid request body or status transition.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Order not found.
 */
router.patch(
  "/orders/:orderId/status",
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus,
);

/**
 * @swagger
 * /api/v1/admin/reviews:
 *   get:
 *     summary: List reviews
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/Sort'
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/reviews",
  validate(adminListQuerySchema, "query"),
  adminController.listReviews,
);

/**
 * @swagger
 * /api/v1/admin/reviews/{reviewId}/approve:
 *   patch:
 *     summary: Approve a review
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review approved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Review not found.
 */
router.patch("/reviews/:reviewId/approve", adminController.approveReview);

/**
 * @swagger
 * /api/v1/admin/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Review not found.
 */
router.delete("/reviews/:reviewId", adminController.deleteReview);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   get:
 *     summary: List categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/Sort'
 *     responses:
 *       200:
 *         description: Categories retrieved successfully.
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/categories",
  validate(adminListQuerySchema, "query"),
  adminController.listCategories,
);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateCategory'
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       400:
 *         description: Invalid category data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       409:
 *         description: A category with the same unique field already exists.
 */
router.post(
  "/categories",
  validate(createCategorySchema),
  adminController.createCategory,
);

/**
 * @swagger
 * /api/v1/admin/categories/{categoryId}:
 *   patch:
 *     summary: Update a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateCategory'
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       400:
 *         description: Invalid category data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Category not found.
 */
router.patch(
  "/categories/:categoryId",
  validate(updateCategorySchema),
  adminController.updateCategory,
);

/**
 * @swagger
 * /api/v1/admin/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 *       400:
 *         description: Category cannot be deleted in its current state.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Admin access required.
 *       404:
 *         description: Category not found.
 */
router.delete("/categories/:categoryId", adminController.deleteCategory);

export default router;
