import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
const authRouter = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Akbar
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       "201":
 *         description: Registration successful
 *       "400":
 *         description: Invalid input or email already registered
 */
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
