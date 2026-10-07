import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/auth.validator.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
const authRouter = express.Router();

authRouter.post("/register",validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema),authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh-token", authController.refreshAccessToken);
authRouter.get("/me", authenticate, authController.getCurrentUser);
export default authRouter;
