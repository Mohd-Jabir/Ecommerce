
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

const wishlistRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Manage the authenticated customer's wishlist
 */

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Get the current user's wishlist
 *     description: Retrieves wishlist items belonging to the authenticated user.
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68f123456789abcdef123456"
 *                       name:
 *                         type: string
 *                         example: Wireless Headphones
 *                       price:
 *                         type: number
 *                         example: 1499
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *       "401":
 *         description: Authentication required or access token invalid
 *       "500":
 *         description: Internal server error
 */

// All wishlist endpoints require authentication.
wishlistRouter.use(authenticate);

wishlistRouter.get("/", getWishlist);

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   post:
 *     summary: Add a product to the wishlist
 *     description: Adds the specified product to the authenticated user's wishlist.
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: MongoDB ID of the product to add
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       "200":
 *         description: Product added to wishlist successfully
 *       "201":
 *         description: Wishlist item created successfully
 *       "400":
 *         description: Invalid product ID or invalid request
 *       "401":
 *         description: Authentication required or access token invalid
 *       "404":
 *         description: Product not found
 *       "409":
 *         description: Product already exists in the wishlist, if enforced
 *       "500":
 *         description: Internal server error
 */
wishlistRouter.post("/:productId", addToWishlist);

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     description: Removes the specified product from the authenticated user's wishlist.
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: MongoDB ID of the product to remove
 *         schema:
 *           type: string
 *         example: "68f123456789abcdef123456"
 *     responses:
 *       "200":
 *         description: Product removed from wishlist successfully
 *       "400":
 *         description: Invalid product ID
 *       "401":
 *         description: Authentication required or access token invalid
 *       "404":
 *         description: Product or wishlist item not found
 *       "500":
 *         description: Internal server error
 */
wishlistRouter.delete("/:productId", removeFromWishlist);

export default wishlistRouter;
