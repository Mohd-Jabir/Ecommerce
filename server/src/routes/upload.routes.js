
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getImageKitAuth } from "../controllers/upload.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Authentication and configuration for image uploads
 *
 * components:
 *   schemas:
 *     ImageKitAuthData:
 *       type: object
 *       required:
 *         - token
 *         - expire
 *         - signature
 *         - publicKey
 *       properties:
 *         token:
 *           type: string
 *           description: Temporary token used to authenticate the client-side upload.
 *         expire:
 *           type: integer
 *           description: Unix timestamp representing when the authentication expires.
 *           example: 1792600000
 *         signature:
 *           type: string
 *           description: Signature used by ImageKit to verify the upload request.
 *         publicKey:
 *           type: string
 *           description: ImageKit public key. Safe to expose to the client.
 *           example: public_xxxxxxxxxxxxxxxxxxxxx
 *
 *     ImageKitAuthResponse:
 *       type: object
 *       required:
 *         - success
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: "#/components/schemas/ImageKitAuthData"
 *
 *     UploadError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: ImageKit is not configured
 */

/**
 * @swagger
 * /api/v1/uploads/imagekit-auth:
 *   get:
 *     summary: Get ImageKit upload authentication parameters
 *     description: |
 *       Returns temporary ImageKit authentication parameters for an authenticated
 *       client to perform a direct upload to ImageKit.
 *
 *       The private key is never returned to the client. The endpoint requires
 *       the server environment variables IMAGEKIT_PUBLIC_KEY and
 *       IMAGEKIT_PRIVATE_KEY to be configured.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ImageKit authentication parameters generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ImageKitAuthResponse"
 *             example:
 *               success: true
 *               data:
 *                 token: temporary-upload-token
 *                 expire: 1792600000
 *                 signature: generated-signature
 *                 publicKey: public_xxxxxxxxxxxxxxxxxxxxx
 *       401:
 *         description: Authentication required or access token invalid
 *       500:
 *         description: ImageKit is not configured or authentication parameters could not be generated
 */
router.get("/imagekit-auth", authenticate, getImageKitAuth);

export default router;
