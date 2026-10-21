
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer order creation, history, details, and cancellation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - product
 *         - name
 *         - quantity
 *         - unitPrice
 *         - lineTotal
 *       properties:
 *         product:
 *           type: string
 *           description: MongoDB ID of the product
 *           example: "68f123456789abcdef123456"
 *         name:
 *           type: string
 *           example: Wireless Headphones
 *         sku:
 *           type: string
 *           example: WH-1001
 *         image:
 *           type: string
 *           example: "https://example.com/headphones.jpg"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         unitPrice:
 *           type: number
 *           minimum: 0
 *           example: 1499
 *         lineTotal:
 *           type: number
 *           minimum: 0
 *           example: 2998
 *
 *     OrderShippingAddress:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           example: Ali Akbar
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         addressLine1:
 *           type: string
 *           example: "House 12, Civil Lines"
 *         addressLine2:
 *           type: string
 *           example: "Near Main Market"
 *         city:
 *           type: string
 *           example: Prayagraj
 *         state:
 *           type: string
 *           example: Uttar Pradesh
 *         postalCode:
 *           type: string
 *           example: "211001"
 *         country:
 *           type: string
 *           default: India
 *           example: India
 *
 *     CreateOrderInput:
 *       type: object
 *       description: >
 *         Order creation request. The controller determines which fields
 *         are accepted and whether prices, totals, items, and the shipping
 *         address are derived from the authenticated user's cart.
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 example: "68f123456789abcdef123456"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *         shippingAddress:
 *           $ref: "#/components/schemas/OrderShippingAddress"
 *         paymentMethod:
 *           type: string
 *           enum: [cod]
 *           default: cod
 *           example: cod
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68f223456789abcdef123456"
 *         orderNumber:
 *           type: string
 *           example: "ORD-20261021-10001"
 *         user:
 *           type: string
 *           example: "68f023456789abcdef123456"
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *         shippingAddress:
 *           $ref: "#/components/schemas/OrderShippingAddress"
 *         subtotal:
 *           type: number
 *           minimum: 0
 *           example: 2998
 *         shippingFee:
 *           type: number
 *           minimum: 0
 *           example: 50
 *         total:
 *           type: number
 *           minimum: 0
 *           example: 3048
 *         paymentMethod:
 *           type: string
 *           enum: [cod]
 *           example: cod
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           example: pending
 *         orderStatus:
 *           type: string
 *           enum: [processing, confirmed, shipped, delivered, cancelled]
 *           example: processing
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     OrderError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Invalid order request
 */

// All order endpoints require authentication.
router.use(authenticate);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     description: >
 *       Creates an order for the authenticated customer.
 *       Only cash on delivery (COD) is supported by the Order model.
 *       The exact request fields and cart-clearing behavior depend on
 *       the createOrder controller.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateOrderInput"
 *           example:
 *             items:
 *               - product: "68f123456789abcdef123456"
 *                 quantity: 2
 *             shippingAddress:
 *               fullName: Ali Akbar
 *               phone: "9876543210"
 *               addressLine1: "House 12, Civil Lines"
 *               addressLine2: ""
 *               city: Prayagraj
 *               state: Uttar Pradesh
 *               postalCode: "211001"
 *               country: India
 *             paymentMethod: cod
 *     responses:
 *       "201":
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Order"
 *       "400":
 *         description: Invalid order data, empty cart, or unavailable product
 *       "401":
 *         description: Authentication required or access token invalid
 *       "404":
 *         description: Product or cart not found
 *       "500":
 *         description: Internal server error
 */
router.post("/", createOrder);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get the authenticated customer's orders
 *     description: Returns the orders belonging to the currently authenticated user.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Customer orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Order"
 *       "401":
 *         description: Authentication required or access token invalid
 *       "500":
 *         description: Internal server error
 */
router.get("/", getMyOrders);

/**
 * @swagger
 * /api/v1/orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     description: Retrieves an order using its MongoDB ID. Access is restricted according to the controller's authorization checks.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: MongoDB ID of the order
 *         schema:
 *           type: string
 *         example: "68f223456789abcdef123456"
 *     responses:
 *       "200":
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Order"
 *       "400":
 *         description: Invalid order ID
 *       "401":
 *         description: Authentication required or access token invalid
 *       "403":
 *         description: User is not authorized to access this order
 *       "404":
 *         description: Order not found
 *       "500":
 *         description: Internal server error
 */
router.get("/:orderId", getOrderById);

/**
 * @swagger
 * /api/v1/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     description: >
 *       Requests cancellation of an order belonging to the authenticated
 *       customer. The controller determines which order statuses are
 *       eligible for cancellation and whether a request body is needed.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: MongoDB ID of the order to cancel
 *         schema:
 *           type: string
 *         example: "68f223456789abcdef123456"
 *     responses:
 *       "200":
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Order"
 *       "400":
 *         description: Order cannot be cancelled in its current state
 *       "401":
 *         description: Authentication required or access token invalid
 *       "403":
 *         description: User is not authorized to cancel this order
 *       "404":
 *         description: Order not found
 *       "500":
 *         description: Internal server error
 */
router.patch("/:orderId/cancel", cancelOrder);

export default router;
