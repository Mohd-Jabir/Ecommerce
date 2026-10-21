
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Authenticated shopping cart management
 *
 * components:
 *   schemas:
 *     CartItemInput:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: MongoDB ObjectId of the product.
 *           example: 66b123456789012345678901
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           oneOf:
 *             - type: string
 *             - $ref: "#/components/schemas/CartProduct"
 *           description: Product ObjectId or populated product object.
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *
 *     CartProduct:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66b123456789012345678901
 *         name:
 *           type: string
 *           example: Wireless Headphones
 *         slug:
 *           type: string
 *           example: wireless-headphones
 *         price:
 *           type: number
 *           example: 2499
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               alt:
 *                 type: string
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66b123456789012345678903
 *         user:
 *           type: string
 *           description: MongoDB ObjectId of the cart owner.
 *           example: 66b123456789012345678902
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CartItem"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CartResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: "#/components/schemas/Cart"
 *
 *     CartMessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Cart cleared successfully
 *
 *     CartError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Product not found
 */

// All cart endpoints require authentication.
router.use(authenticate);

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get the current user's cart
 *     description: Retrieves the authenticated user's cart and its items.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CartResponse"
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get("/", getCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add a product to the cart
 *     description: Adds a product or updates its quantity if it is already in the cart, depending on controller behavior.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CartItemInput"
 *           example:
 *             productId: 66b123456789012345678901
 *             quantity: 2
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CartResponse"
 *       201:
 *         description: Product added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CartResponse"
 *       400:
 *         description: Invalid product ID or quantity
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.post("/items", addCartItem);

/**
 * @swagger
 * /api/v1/cart/items/{productId}:
 *   patch:
 *     summary: Update a cart item's quantity
 *     description: Updates the quantity of a product in the authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: MongoDB ObjectId of the product in the cart.
 *         schema:
 *           type: string
 *         example: 66b123456789012345678901
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CartResponse"
 *       400:
 *         description: Invalid product ID or quantity
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product or cart item not found
 */
router.patch("/items/:productId", updateCartItem);

/**
 * @swagger
 * /api/v1/cart/items/{productId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: MongoDB ObjectId of the product to remove.
 *         schema:
 *           type: string
 *         example: 66b123456789012345678901
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CartResponse"
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
 */
router.delete("/items/:productId", removeCartItem);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear the current user's cart
 *     description: Removes all items from the authenticated user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CartMessageResponse"
 *       204:
 *         description: Cart cleared successfully with no response body
 *       401:
 *         description: Authentication required
 */
router.delete("/", clearCart);

export default router;
