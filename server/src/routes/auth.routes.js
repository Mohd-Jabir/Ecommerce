import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,forgotPasswordSchema,resetPasswordSchema
} from "../validators/auth.validator.js";
const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerificationEmail,
);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

authRouter.post("/refresh-token", authController.refreshAccessToken);
authRouter.get("/me", authenticate, authController.getCurrentUser);
export default authRouter;
