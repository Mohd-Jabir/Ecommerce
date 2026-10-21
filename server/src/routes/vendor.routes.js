
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

/**
 * @swagger
 * tags:
 *   - name: Vendors
 *     description: Vendor applications, store profiles, products, orders, and analytics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VendorBusinessAddress:
 *       type: object
 *       properties:
 *         addressLine1:
 *           type: string
 *           maxLength: 200
 *           example: "12 Civil Lines"
 *         addressLine2:
 *           type: string
 *           maxLength: 200
 *           example: "Near Main Market"
 *         city:
 *           type: string
 *           maxLength: 100
 *           example: Prayagraj
 *         state:
 *           type: string
 *           maxLength: 100
 *           example: Uttar Pradesh
 *         pincode:
 *           type: string
 *           maxLength: 20
 *           example: "211001"
 *         country:
 *           type: string
 *           maxLength: 100
 *           default: India
 *           example: India
 *
 *     VendorApplication:
 *       type: object
 *       required:
 *         - storeName
 *         - contactEmail
 *       properties:
 *         storeName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Jabir Electronics
 *         description:
 *           type: string
 *           maxLength: 2000
 *           example: Electronics, accessories, and gadgets.
 *         logo:
 *           type: string
 *           maxLength: 2048
 *           example: https://example.com/store-logo.png
 *         contactEmail:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: vendor@example.com
 *         contactPhone:
 *           type: string
 *           maxLength: 20
 *           example: "9876543210"
 *         businessAddress:
 *           $ref: '#/components/schemas/VendorBusinessAddress'
 *
 *     UpdateVendorProfile:
 *       type: object
 *       description: Only fields accepted by updateVendorProfileSchema can be updated.
 *       properties:
 *         storeName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Jabir Electronics
 *         description:
 *           type: string
 *           maxLength: 2000
 *           example: Updated store description
 *         logo:
 *           type: string
 *           maxLength: 2048
 *           example: https://example.com/new-logo.png
 *         contactEmail:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: vendor@example.com
 *         contactPhone:
 *           type: string
 *           maxLength: 20
 *           example: "9876543210"
 *         businessAddress:
 *           $ref: '#/components/schemas/VendorBusinessAddress'
 *
 *     Vendor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68f123456789abcdef123456"
 *         user:
 *           type: string
 *           description: MongoDB ID of the vendor's user account
 *           example: "68f123456789abcdef123457"
 *         storeName:
 *           type: string
 *           example: Jabir Electronics
 *         slug:
 *           type: string
 *           example: jabir-electronics
 *         description:
 *           type: string
 *           example: Electronics and accessories
 *         logo:
 *           type: string
 *           example: https://example.com/logo.png
 *         contactEmail:
 *           type: string
 *           format: email
 *           example: vendor@example.com
 *         contactPhone:
 *           type: string
 *           example: "9876543210"
 *         businessAddress:
 *           $ref: '#/components/schemas/VendorBusinessAddress'
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, suspended]
 *           example: pending
 *         rejectionReason:
 *           type: string
 *           example: ""
 *         reviewedBy:
 *           type: string
 *           nullable: true
 *           example: null
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Every vendor route requires authentication.
vendorRouter.use(authenticate);

/**
 * @swagger
 * /api/v1/vendors/apply:
 *   post:
 *     summary: Apply to become a vendor
 *     description: Creates a vendor application. Approval is required to access vendor management endpoints.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorApplication'
 *     responses:
 *       "201":
 *         description: Vendor application created successfully
 *       "400":
 *         description: Invalid application data
 *       "401":
 *         description: Authentication required
 *       "409":
 *         description: Vendor application already exists, if enforced by the application
 *       "500":
 *         description: Internal server error
 */
vendorRouter.post("/apply", validate(applyVendorSchema), applyVendor);

/**
 * @swagger
 * /api/v1/vendors/me:
 *   get:
 *     summary: Get the current user's vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Vendor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       "401":
 *         description: Authentication required
 *       "404":
 *         description: Vendor application not found
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/me", getMyVendor);

/**
 * @swagger
 * /api/v1/vendors/me:
 *   patch:
 *     summary: Update the current vendor's store profile
 *     description: Available only to approved vendors.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorProfile'
 *     responses:
 *       "200":
 *         description: Vendor profile updated successfully
 *       "400":
 *         description: Invalid profile data
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Vendor is not approved
 *       "404":
 *         description: Vendor profile not found
 *       "500":
 *         description: Internal server error
 */
vendorRouter.patch(
  "/me",
  requireApprovedVendor,
  validate(updateVendorProfileSchema),
  updateMyVendor
);

// All remaining endpoints require an approved vendor.
vendorRouter.use(requireApprovedVendor);

/**
 * @swagger
 * /api/v1/vendors/me/categories:
 *   get:
 *     summary: List categories available to the vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Categories retrieved successfully
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/me/categories", listMyCategories);

/**
 * @swagger
 * /api/v1/vendors/dashboard:
 *   get:
 *     summary: Get vendor dashboard data
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Dashboard data retrieved successfully
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/dashboard", getVendorDashboardData);

/**
 * @swagger
 * /api/v1/vendors/me/products:
 *   get:
 *     summary: List the current vendor's products
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Vendor products retrieved successfully
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/me/products", listVendorProducts);

/**
 * @swagger
 * /api/v1/vendors/me/products:
 *   post:
 *     summary: Create a product for the vendor's store
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Product fields accepted by createVendorProductSchema.
 *             additionalProperties: true
 *     responses:
 *       "201":
 *         description: Product created successfully
 *       "400":
 *         description: Invalid product data
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "500":
 *         description: Internal server error
 */
vendorRouter.post(
  "/me/products",
  validate(createVendorProductSchema),
  addVendorProduct
);

/**
 * @swagger
 * /api/v1/vendors/me/products/{productId}:
 *   patch:
 *     summary: Update a vendor's product
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Product fields accepted by updateVendorProductSchema.
 *             additionalProperties: true
 *     responses:
 *       "200":
 *         description: Product updated successfully
 *       "400":
 *         description: Invalid product ID or request data
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "404":
 *         description: Product not found
 *       "500":
 *         description: Internal server error
 */
vendorRouter.patch(
  "/me/products/:productId",
  validate(updateVendorProductSchema),
  editVendorProduct
);

/**
 * @swagger
 * /api/v1/vendors/me/products/{productId}:
 *   delete:
 *     summary: Delete a vendor's product
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the product
 *     responses:
 *       "200":
 *         description: Product deleted successfully
 *       "400":
 *         description: Invalid product ID
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "404":
 *         description: Product not found
 *       "500":
 *         description: Internal server error
 */
vendorRouter.delete(
  "/me/products/:productId",
  removeVendorProduct
);

/**
 * @swagger
 * /api/v1/vendors/me/orders:
 *   get:
 *     summary: List orders containing the vendor's products
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Vendor orders retrieved successfully
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/me/orders", listVendorOrders);

/**
 * @swagger
 * /api/v1/vendors/me/orders/{orderId}:
 *   get:
 *     summary: Get a specific vendor order
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the order
 *     responses:
 *       "200":
 *         description: Vendor order retrieved successfully
 *       "400":
 *         description: Invalid order ID
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "404":
 *         description: Order not found
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/me/orders/:orderId", getVendorOrder);

/**
 * @swagger
 * /api/v1/vendors/me/orders/{orderId}/status:
 *   patch:
 *     summary: Update the status of a vendor order
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Status fields accepted by updateVendorOrderStatusSchema.
 *             additionalProperties: true
 *     responses:
 *       "200":
 *         description: Order status updated successfully
 *       "400":
 *         description: Invalid status or order ID
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "404":
 *         description: Order not found
 *       "500":
 *         description: Internal server error
 */
vendorRouter.patch(
  "/me/orders/:orderId/status",
  validate(updateVendorOrderStatusSchema),
  changeVendorOrderStatus
);

/**
 * @swagger
 * /api/v1/vendors/me/analytics:
 *   get:
 *     summary: Get vendor analytics
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Vendor analytics retrieved successfully
 *       "401":
 *         description: Authentication required
 *       "403":
 *         description: Approved vendor access required
 *       "500":
 *         description: Internal server error
 */
vendorRouter.get("/me/analytics", getVendorAnalyticsData);

export default vendorRouter;
