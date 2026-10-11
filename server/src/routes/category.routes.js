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

// Public routes
categoryRouter.get("/", listCategories);
categoryRouter.get("/:slug", getCategory);

// Admin and approved vendor routes
categoryRouter.post(
  "/",
  authenticate,
  requireCategoryManager,
  validate(createCategorySchema),
  createCategory,
);

categoryRouter.patch(
  "/:categoryId",
  authenticate,
  requireCategoryManager,
  validate(updateCategorySchema),
  updateCategory,
);

categoryRouter.delete(
  "/:categoryId",
  authenticate,
  requireCategoryManager,
  deleteCategory,
);

export default categoryRouter;
