import { Vendor } from "../models/Vendor.js";
import { ApiError } from "../utils/ApiError.js";

export async function requireApprovedVendor(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return next(new ApiError(401, "Authentication required."));
    }
    const vendor = await Vendor.findApprovedByUserId(userId);
    if (!vendor) {
      return next(new ApiError(403, "An approved vendor account is required."));
    }
    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
}
