import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

export default router;
