import { ApiError } from "../utils/ApiError.js";
import { Vendor } from "../models/Vendor.js";

export async function requireCategoryManager(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Authentication required.");
    }

    if (user.role === "admin") {
      return next();
    }

    if (user.role !== "vendor") {
      throw new ApiError(
        403,
        "Only admins and approved vendors can manage categories.",
      );
    }

    const vendor = await Vendor.findOne({
      user: user._id,
      status: "approved",
    }).select("_id");

    if (!vendor) {
      throw new ApiError(403, "An approved vendor account is required.");
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
}
