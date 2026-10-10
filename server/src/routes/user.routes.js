import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";

import {
  getMe,
  updateMe,
  deleteMe,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/user.controller.js";

import {
  updateMeSchema,
  addressSchema,
  updateAddressSchema,
} from "../validators/user.validator.js";

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me", getMe);
userRouter.patch("/me", validate(updateMeSchema), updateMe);
userRouter.delete("/me", deleteMe);

userRouter.post("/me/addresses", validate(addressSchema), addAddress);

userRouter.patch(
  "/me/addresses/:addressId",
  validate(updateAddressSchema),
  updateAddress,
);

userRouter.delete("/me/addresses/:addressId", deleteAddress);

userRouter.patch("/me/addresses/:addressId/default", setDefaultAddress);

export default userRouter;
