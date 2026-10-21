
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";
import { requireCategoryManager } from "../middlewares/category.middleware.js";

import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

const categoryRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Public category browsing and category management
 *
 * components:
 *   schemas:
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 80
 *           example: Electronics
 *         slug:
 *           type: string
 *           maxLength: 100
 *           description: URL-friendly category identifier, if accepted by the validator.
 *           example: electronics
 *         description:
 *           type: string
 *           maxLength: 500
 *           default: ""
 *           example: Electronic devices and accessories.
 *         image:
 *           type: string
 *           maxLength: 2048
 *           default: ""
 *           example: https://example.com/images/electronics.jpg
 *         isActive:
 *           type: boolean
 *           default: true
 *           example: true
 *
 *     CategoryUpdate:
 *       type: object
 *       description: Only fields permitted by updateCategorySchema can be changed.
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 80
 *           example: Home Appliances
 *         slug:
 *           type: string
 *           maxLength: 100
 *           example: home-appliances
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: Appliances for everyday home use.
 *         image:
 *           type: string
 *           maxLength: 2048
 *           example: https://example.com/images/appliances.jpg
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66b123456789012345678901
 *         name:
 *           type: string
 *           example: Electronics
 *         slug:
 *           type: string
 *           example: electronics
 *         description:
 *           type: string
 *           example: Electronic devices and accessories.
 *         image:
 *           type: string
 *           example: https://example.com/images/electronics.jpg
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdBy:
 *           type: string
 *           description: MongoDB ObjectId of the user who created the category.
 *           example: 66b123456789012345678902
 *         createdByRole:
 *           type: string
 *           enum: [admin, vendor]
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CategoryError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Category not found
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: List categories
 *     description: Retrieve categories available in the public catalog. Filtering and pagination depend on the controller implementation.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: "#/components/schemas/Category"
 *                 - type: object
 *                   description: Wrapped or paginated category response.
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Category"
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Category"
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
categoryRouter.get("/", listCategories);

/**
 * @swagger
 * /api/v1/categories/{slug}:
 *   get:
 *     summary: Get a category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: URL-friendly category slug.
 *         schema:
 *           type: string
 *         example: electronics
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Category"
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
categoryRouter.get("/:slug", getCategory);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a category
 *     description: Requires authentication and category-manager permission. According to your middleware naming, this is intended for admins and approved vendors.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoryCreate"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Category"
 *       400:
 *         description: Invalid category data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not permitted to manage categories
 *       409:
 *         description: Category slug already exists
 */
categoryRouter.post(
  "/",
  authenticate,
  requireCategoryManager,
  validate(createCategorySchema),
  createCategory,
);

/**
 * @swagger
 * /api/v1/categories/{categoryId}:
 *   patch:
 *     summary: Update a category
 *     description: Requires authentication and category-manager permission.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: MongoDB ObjectId of the category.
 *         schema:
 *           type: string
 *         example: 66b123456789012345678901
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoryUpdate"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid category ID or request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not permitted to manage this category
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category slug already exists
 */
categoryRouter.patch(
  "/:categoryId",
  authenticate,
  requireCategoryManager,
  validate(updateCategorySchema),
  updateCategory,
);

/**
 * @swagger
 * /api/v1/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     description: Requires authentication and category-manager permission.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: MongoDB ObjectId of the category.
 *         schema:
 *           type: string
 *         example: 66b123456789012345678901
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       204:
 *         description: Category deleted successfully with no response body
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not permitted to delete this category
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category cannot be deleted, for example because it is in use
 */
categoryRouter.delete(
  "/:categoryId",
  authenticate,
  requireCategoryManager,
  deleteCategory,
);

export default categoryRouter;
