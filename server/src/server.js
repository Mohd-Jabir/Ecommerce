
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { connectDB } from "./config/db.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import vendorRouter from "./routes/vendor.routes.js";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import paymentRouter from "./routes/payment.routes.js";

import { razorpayWebhook } from "./controllers/payment.controller.js";

import adminRoutes from "./routes/admin.routes.js";
const app = express();

await connectDB();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preserve the raw body for Razorpay signature verification.
// This MUST be registered before express.json().
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Parse JSON for the rest of the API.
app.use(express.json());
app.use(cookieParser());

// Apply security headers to the application.
app.use(helmet());

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "E-commerce API Docs",
  })
);

// Existing API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ecommerce API is running",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: err.success ?? false,
    message: err.message || "Internal Server Error",
    ...(err.errors && { errors: err.errors }),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
