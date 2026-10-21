
import { Router } from "express";

import {
  getMe,
  updateMe,
  deleteMe,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressById,
  getMyAddresses,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.middleware.js";

import {
  updateMeSchema,
  addressSchema,
  updateAddressSchema,
} from "../validators/user.validator.js";

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Customer profile and address management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddressInput:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - addressLine1
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: Ali Akbar
 *         phone:
 *           type: string
 *           maxLength: 20
 *           example: "9876543210"
 *         addressLine1:
 *           type: string
 *           maxLength: 200
 *           example: "House 12, Civil Lines"
 *         addressLine2:
 *           type: string
 *           maxLength: 200
 *           example: "Near the main market"
 *         city:
 *           type: string
 *           maxLength: 100
 *           example: Prayagraj
 *         state:
 *           type: string
 *           maxLength: 100
 *           example: Uttar Pradesh
 *         pincode:
 *           type: string
 *           maxLength: 20
 *           example: "211001"
 *         country:
 *           type: string
 *           maxLength: 100
 *           default: India
 *           example: India
 *         isDefault:
 *           type: boolean
 *           default: false
 *           example: true
 *
 *     Address:
 *       allOf:
 *         - $ref: '#/components/schemas/AddressInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "68f123456789abcdef123456"
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68f123456789abcdef123456"
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Ali Akbar
 *         email:
 *           type: string
 *           format: email
 *           example: ali@example.com
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         role:
 *           type: string
 *           enum: [customer, vendor, admin]
 *           example: customer
 *         accountStatus:
 *           type: string
 *           enum: [active, suspended, banned, deactivated]
 *           example: active
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *         addresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 *
 *     UpdateUserProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Ali Akbar
 *         phone:
 *           type: string
 *           maxLength: 20
 *           example: "9876543210"
 *
 *     UpdateAddress:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: Ali Akbar
 *         phone:
 *           type: string
 *           maxLength: 20
 *           example: "9876543210"
 *         addressLine1:
 *           type: string
 *           maxLength: 200
 *           example: "House 12, Civil Lines"
 *         addressLine2:
 *           type: string
 *           maxLength: 200
 *           example: "Near the main market"
 *         city:
 *           type: string
 *           maxLength: 100
 *           example: Prayagraj
 *         state:
 *           type: string
 *           maxLength: 100
 *           example: Uttar Pradesh
 *         pincode:
 *           type: string
 *           maxLength: 20
 *           example: "211001"
 *         country:
 *           type: string
 *           maxLength: 100
 *           example: India
 */

/**
 * All user routes require authentication.
 */
userRouter.use(authenticate);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
userRouter.get("/me", getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfile'
 *     responses:
 *       "200":
 *         description: Profile updated successfully
 *       "400":
 *         description: Invalid profile data
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
userRouter.patch("/me", validate(updateMeSchema), updateMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Delete the current user's account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Account deleted successfully
 *       "204":
 *         description: Account deleted with no response body
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
userRouter.delete("/me", deleteMe);

/**
 * @swagger
 * /api/v1/users/me/addresses:
 *   get:
 *     summary: Get all addresses belonging to the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */
userRouter.get("/me/addresses", getMyAddresses);

/**
 * @swagger
 * /api/v1/users/me/addresses/{addressId}:
 *   get:
 *     summary: Get a specific address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the address
 *     responses:
 *       "200":
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       "400":
 *         description: Invalid address ID
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Address not found
 *       "500":
 *         description: Internal server error
 */
userRouter.get("/me/addresses/:addressId", getAddressById);

/**
 * @swagger
 * /api/v1/users/me/addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       "201":
 *         description: Address created successfully
 *       "400":
 *         description: Invalid address data
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */
userRouter.post(
  "/me/addresses",
  validate(addressSchema),
  addAddress
);

/**
 * @swagger
 * /api/v1/users/me/addresses/{addressId}:
 *   patch:
 *     summary: Update an existing address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddress'
 *     responses:
 *       "200":
 *         description: Address updated successfully
 *       "400":
 *         description: Invalid address ID or request data
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Address not found
 *       "500":
 *         description: Internal server error
 */
userRouter.patch(
  "/me/addresses/:addressId",
  validate(updateAddressSchema),
  updateAddress
);

/**
 * @swagger
 * /api/v1/users/me/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the address
 *     responses:
 *       "200":
 *         description: Address deleted successfully
 *       "204":
 *         description: Address deleted with no response body
 *       "400":
 *         description: Invalid address ID
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Address not found
 *       "500":
 *         description: Internal server error
 */
userRouter.delete("/me/addresses/:addressId", deleteAddress);

/**
 * @swagger
 * /api/v1/users/me/addresses/{addressId}/default:
 *   patch:
 *     summary: Set an address as the default address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the address
 *     responses:
 *       "200":
 *         description: Default address updated successfully
 *       "400":
 *         description: Invalid address ID
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Address not found
 *       "500":
 *         description: Internal server error
 */
userRouter.patch(
  "/me/addresses/:addressId/default",
  setDefaultAddress
);

export default userRouter;
