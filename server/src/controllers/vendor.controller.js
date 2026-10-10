import {
  applyToBecomeVendor,
  getMyVendorProfile,
  updateMyVendorProfile,
} from "../services/vendor.service.js";

export async function applyVendor(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    const vendor = await applyToBecomeVendor(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Vendor application submitted successfully.",
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyVendor(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const vendor = await getMyVendorProfile(userId);

    res.status(200).json({
      success: true,
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyVendor(req, res, next) {
  try {
    const vendor = await updateMyVendorProfile(req.vendor, req.body);

    res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully.",
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
}
