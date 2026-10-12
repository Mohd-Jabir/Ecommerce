
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getImageKitAuth } from "../controllers/upload.controller.js";

const router = Router();

router.get("/imagekit-auth", authenticate, getImageKitAuth);

export default router;
