import {
  applyToBecomeVendor,
  getMyVendorProfile,
  updateMyVendorProfile,
  getVendorDashboard,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
  getVendorAnalytics,
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

export async function getVendorDashboardData(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const dashboard = await getVendorDashboard(userId);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyVendorProducts(req, res, next) {
  try {
    const data = await getVendorProducts(req.vendor, req.query);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createMyVendorProduct(req, res, next) {
  try {
    const product = await createVendorProduct(req.vendor, req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyVendorProduct(req, res, next) {
  try {
    const product = await updateVendorProduct(
      req.vendor,
      req.params.productId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMyVendorProduct(req, res, next) {
  try {
    await deleteVendorProduct(req.vendor, req.params.productId);

    res.status(200).json({
      success: true,
      message: "Product archived successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyVendorOrders(req, res, next) {
  try {
    const data = await getVendorOrders(req.vendor, req.query);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getMyVendorOrder(req, res, next) {
  try {
    const order = await getVendorOrderById(req.vendor, req.params.orderId);

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyVendorOrderStatus(req, res, next) {
  try {
    const order = await updateVendorOrderStatus(
      req.vendor,
      req.params.orderId,
      req.body.status,
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyVendorAnalytics(req, res, next) {
  try {
    const analytics = await getVendorAnalytics(req.vendor, req.query);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}
