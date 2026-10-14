import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

const wishlistRouter = Router();

// All wishlist endpoints require authentication.
wishlistRouter.use(authenticate);

wishlistRouter.get("/", getWishlist);
wishlistRouter.post("/:productId", addToWishlist);
wishlistRouter.delete("/:productId", removeFromWishlist);

export default wishlistRouter;
