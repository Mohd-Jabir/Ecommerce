import mongoose from "mongoose";
import {User} from "../models/User.js";
import {RefreshToken} from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";

const getUserOrThrow = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
};

const validateAddressId = (addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new ApiError(400, "Invalid address ID.");
  }
};

const getAddressOrThrow = (user, addressId) => {
  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found.");
  }
  return address;
};

export const getMe = async (userId) => {
  return await getUserOrThrow(userId);
};

export const updateMe = async (userId, updates) => {
  const user = await getUserOrThrow(userId);
  const { name, phone } = updates;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  return user;
};

export const deleteMe = async (userId) => {
  const user = await getUserOrThrow(userId);
  user.accountStatus = "deactivated";
  await user.save();
  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  return { message: "Account deactivated successfully" };
};

export const addAddress = async (userId, addressData) => {
  const user = await getUserOrThrow(userId);
  const { isDefault, ...addressFields } = addressData;
  const shouldBeDefault = isDefault === true || user.addresses.length === 0;
  if (shouldBeDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }
  user.addresses.push({ ...addressFields, isDefault: shouldBeDefault });
  await user.save();
  return user.addresses[user.addresses.length - 1];
};

export const updateAddress = async (userId, addressId, updates) => {
  validateAddressId(addressId);
  const user = await getUserOrThrow(userId);
  const address = getAddressOrThrow(user, addressId);
  Object.assign(address, updates);
  await user.save();
  return address;
};

export const deleteAddress = async (userId, addressId) => {
  validateAddressId(addressId);
  const user = await getUserOrThrow(userId);
  const address = getAddressOrThrow(user, addressId);
  const wasDefault = address.isDefault === true;
  user.addresses.pull({ _id: addressId });
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }
  await user.save();
  return user.addresses;
};

export const setDefaultAddress = async (userId, addressId) => {
  validateAddressId(addressId);
  const user = await getUserOrThrow(userId);
  const targetAddress = getAddressOrThrow(user, addressId);
  user.addresses.forEach((address) => {
    address.isDefault = address._id.equals(targetAddress._id);
  });
  await user.save();
  return { address: targetAddress, addresses: user.addresses };
};
