import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";
import { requireApprovedVendor } from "../middlewares/vendor.middleware.js";

import {
  applyVendor,
  getMyVendor,
  updateMyVendor,
} from "../controllers/vendor.controller.js";

import {
  applyVendorSchema,
  updateVendorProfileSchema,
} from "../validators/vendor.validator.js";

const vendorRouter = Router();
vendorRouter.use(authenticate);
vendorRouter.post("/apply", validate(applyVendorSchema), applyVendor);
vendorRouter.get("/me", getMyVendor);
vendorRouter.patch(
  "/me",
  requireApprovedVendor,
  validate(updateVendorProfileSchema),
  updateMyVendor,
);

export default vendorRouter;
