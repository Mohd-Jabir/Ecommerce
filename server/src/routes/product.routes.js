
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

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog, vendor product management, and product reviews
 *
 * components:
 *   schemas:
 *     ProductImageInput:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         url:
 *           type: string
 *           maxLength: 2048
 *           format: uri
 *           example: https://example.com/images/headphones.jpg
 *         alt:
 *           type: string
 *           maxLength: 200
 *           default: ""
 *           example: Wireless headphones, front view
 *
 *     ProductImage:
 *       allOf:
 *         - $ref: "#/components/schemas/ProductImageInput"
 *
 *     ProductCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - sku
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 150
 *           example: Wireless Headphones
 *         slug:
 *           type: string
 *           maxLength: 180
 *           description: URL-friendly product identifier, if accepted by the validator.
 *           example: wireless-headphones
 *         description:
 *           type: string
 *           maxLength: 10000
 *           example: Comfortable wireless headphones with noise isolation.
 *         sku:
 *           type: string
 *           maxLength: 80
 *           example: WH-1001
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 2499
 *         compareAtPrice:
 *           type: number
 *           nullable: true
 *           minimum: 0
 *           example: 2999
 *         stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 50
 *         images:
 *           type: array
 *           maxItems: 10
 *           items:
 *             $ref: "#/components/schemas/ProductImageInput"
 *         category:
 *           type: string
 *           description: MongoDB ObjectId of the category.
 *           example: 66b123456789012345678901
 *         status:
 *           type: string
 *           enum: [draft, active, archived]
 *           default: active
 *
 *     ProductUpdate:
 *       type: object
 *       description: Only fields permitted by updateProductSchema can be changed.
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 150
 *         slug:
 *           type: string
 *           maxLength: 180
 *         description:
 *           type: string
 *           maxLength: 10000
 *         sku:
 *           type: string
 *           maxLength: 80
 *         price:
 *           type: number
 *           minimum: 0
 *         compareAtPrice:
 *           type: number
 *           nullable: true
 *           minimum: 0
 *         stock:
 *           type: integer
 *           minimum: 0
 *         images:
 *           type: array
 *           maxItems: 10
 *           items:
 *             $ref: "#/components/schemas/ProductImageInput"
 *         category:
 *           type: string
 *           description: MongoDB ObjectId of the category.
 *         status:
 *           type: string
 *           enum: [draft, active, archived]
 *
 *     Product:
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
 *         description:
 *           type: string
 *         sku:
 *           type: string
 *           example: WH-1001
 *         price:
 *           type: number
 *           example: 2499
 *         compareAtPrice:
 *           type: number
 *           nullable: true
 *           example: 2999
 *         stock:
 *           type: integer
 *           example: 50
 *         images:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/ProductImage"
 *         category:
 *           oneOf:
 *             - type: string
 *             - type: object
 *           description: Category ObjectId or populated category, depending on the endpoint.
 *         vendor:
 *           oneOf:
 *             - type: string
 *             - type: object
 *           description: Vendor ObjectId or populated vendor, depending on the endpoint.
 *         status:
 *           type: string
 *           enum: [draft, active, archived]
 *         averageRating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           example: 4.5
 *         ratingsCount:
 *           type: integer
 *           example: 24
 *         salesCount:
 *           type: integer
 *           example: 120
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ProductReviewCreate:
 *       type: object
 *       description: Review payload fields depend on the review controller and its validation rules.
 *       additionalProperties: true
 *       example:
 *         rating: 5
 *         comment: Excellent product and quality.
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Request failed
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List products
 *     description: Retrieve products from the public catalog. Filtering and pagination depend on the controller implementation.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: "#/components/schemas/Product"
 *                 - type: object
 *                   description: Paginated or wrapped product response.
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Product"
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Product"
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
productRouter.get("/", listProducts);

/**
 * @swagger
 * /api/v1/products/{productId}/reviews:
 *   get:
 *     summary: List reviews for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.get("/:productId/reviews", listProductReviews);

/**
 * @swagger
 * /api/v1/products/{productId}/reviews:
 *   post:
 *     summary: Create a product review
 *     description: Requires authentication. The controller should enforce any customer, purchase, and duplicate-review rules.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductReviewCreate"
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid review data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not allowed to review this product
 *       404:
 *         description: Product not found
 *       409:
 *         description: Review already exists, if duplicate reviews are prevented
 */
productRouter.post(
  "/:productId/reviews",
  authenticate,
  createProductReview,
);

/**
 * @swagger
 * /api/v1/products/vendor/me:
 *   get:
 *     summary: List the authenticated vendor's products
 *     description: Requires an authenticated, approved vendor.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Product"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: An approved vendor account is required
 */
productRouter.get(
  "/vendor/me",
  authenticate,
  requireApprovedVendor,
  listMyProducts,
);

/**
 * @swagger
 * /api/v1/products/{slug}:
 *   get:
 *     summary: Get product details by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: wireless-headphones
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.get("/:slug", getProduct);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a product
 *     description: Requires an authenticated, approved vendor.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductCreate"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: An approved vendor account is required
 *       409:
 *         description: Product SKU or slug already exists
 */
productRouter.post(
  "/",
  authenticate,
  requireApprovedVendor,
  validate(createProductSchema),
  createProduct,
);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   patch:
 *     summary: Update a product
 *     description: Requires authentication. The controller should verify that the current user owns the product or has administrator privileges.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductUpdate"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid product data or product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not allowed to update this product
 *       404:
 *         description: Product not found
 *       409:
 *         description: SKU or slug already exists
 */
productRouter.patch(
  "/:productId",
  authenticate,
  validate(updateProductSchema),
  updateProduct,
);

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   delete:
 *     summary: Delete or archive a product
 *     description: Requires authentication. The controller should verify product ownership or administrator privileges. Whether this permanently deletes or archives the product depends on the controller.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product
 *     responses:
 *       200:
 *         description: Product deleted or archived successfully
 *       204:
 *         description: Product deleted or archived successfully with no response body
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not allowed to delete this product
 *       404:
 *         description: Product not found
 */
productRouter.delete(
  "/:productId",
  authenticate,
  deleteProduct,
);

export default productRouter;
