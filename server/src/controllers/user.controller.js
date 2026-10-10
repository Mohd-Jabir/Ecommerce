
import * as userService from "../services/user.service.js";

const getUserId = (req) => req.user?.id ?? req.user?._id;

const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message,
  });
};

export const getMe = async (req, res) => {
  try {
    const user = await userService.getMe(getUserId(req));
    return res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await userService.updateMe(
      getUserId(req),
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    return sendError(res, error);
  }
};
export const deleteMe = async (req, res) => {
  try {
    const result = await userService.deleteMe(getUserId(req));
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const addAddress = async (req, res) => {
  try {
    const address = await userService.addAddress(
      getUserId(req),
      req.body,
    );
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: { address },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await userService.updateAddress(
      getUserId(req),
      req.params.addressId,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: { address },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const addresses = await userService.deleteAddress(
      getUserId(req),
      req.params.addressId,
    );
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: { addresses },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const result = await userService.setDefaultAddress(
      getUserId(req),
      req.params.addressId,
    );
    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
