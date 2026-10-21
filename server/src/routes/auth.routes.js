
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
 * tags:
 *   name: Authentication
 *   description: Customer authentication, email verification, and password management
 */

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
 *             required:
 *               - name
 *               - email
 *               - password
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
 *       "409":
 *         description: Email already exists, if returned by the application
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/register",
  validate(registerSchema),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify a customer's email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide the verification fields required by verifyEmailSchema.
 *             additionalProperties: true
 *           example:
 *             token: "your-email-verification-token"
 *     responses:
 *       "200":
 *         description: Email verification processed successfully
 *       "400":
 *         description: Invalid, expired, or missing verification details
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail
);

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     summary: Resend the email verification message
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide the fields required by resendVerificationSchema.
 *             additionalProperties: true
 *           example:
 *             email: "ali@example.com"
 *     responses:
 *       "200":
 *         description: Verification request processed
 *       "400":
 *         description: Invalid request
 *       "429":
 *         description: Too many requests, if rate limiting is enabled
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerificationEmail
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       "200":
 *         description: Login successful
 *       "400":
 *         description: Invalid input
 *       "401":
 *         description: Invalid credentials
 *       "403":
 *         description: Account verification or access restriction
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/login",
  validate(loginSchema),
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out a customer
 *     tags: [Authentication]
 *     description: Logs out according to the application's refresh-token or cookie strategy.
 *     responses:
 *       "200":
 *         description: Logout processed successfully
 *       "401":
 *         description: Authentication required, if enforced by the controller
 *       "500":
 *         description: Internal server error
 */
authRouter.post("/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide the fields required by forgotPasswordSchema.
 *             additionalProperties: true
 *           example:
 *             email: "ali@example.com"
 *     responses:
 *       "200":
 *         description: Password reset request processed
 *       "400":
 *         description: Invalid request
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset a customer's password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide the reset token and new-password fields required by resetPasswordSchema.
 *             additionalProperties: true
 *     responses:
 *       "200":
 *         description: Password reset successful
 *       "400":
 *         description: Invalid or expired reset token or invalid input
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token
 *     tags: [Authentication]
 *     description: Refreshes the access token using the refresh-token mechanism configured by the application.
 *     responses:
 *       "200":
 *         description: Access token refreshed successfully
 *       "401":
 *         description: Missing, invalid, or expired refresh token
 *       "500":
 *         description: Internal server error
 */
authRouter.post(
  "/refresh-token",
  authController.refreshAccessToken
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get the currently authenticated customer
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Current customer retrieved successfully
 *       "401":
 *         description: Missing or invalid access token
 *       "500":
 *         description: Internal server error
 */
authRouter.get(
  "/me",
  authenticate,
  authController.getCurrentUser
);

export default authRouter;
