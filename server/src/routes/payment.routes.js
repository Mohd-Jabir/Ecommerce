import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  createPaymentOrder,
  verifyPayment,
  paymentStatus,
  razorpayWebhook,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

// Webhook is authenticated by its HMAC signature, not a user token.
// Its raw-body middleware is configured in the app entry point below.
paymentRouter.post("/webhook", razorpayWebhook);

paymentRouter.use(authenticate);

paymentRouter.post("/create-order", createPaymentOrder);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.get("/:paymentId/status", paymentStatus);

export default paymentRouter;
