import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { RefreshToken } from "../models/RefreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getTokenExpiry,
  verifyRefreshToken,
} from "../utils/auth.utils.js";
export async function register(userData) {
  const { name, email, password } = userData;
  const userEmailExists = await User.isEmailTaken(email);
  if (userEmailExists) {
    throw new ApiError(409, "Email already exists");
  }
  let user;
  try {
    user = await User.create({
      name,
      email,
      passwordHash: password,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Email already exists");
    }
    throw error;
  }

  return {
    success: true,
    message: "Registration successful.You can now log in.",
  };
}
export async function login(credentials) {
  const { email, password } = credentials;
  const user = await User.findByEmail(email);
  if (!user) {
    throw new ApiError(404, "Invalid email or password");
  }
  const isPasswordCoreect = await user.comparePassword(password);
  if (!isPasswordCoreect) {
    throw new ApiError(404, "Invalid email or password");
  }
  user.lastLoginAt = Date.now();
  await user.save();

  //tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const tokenHash = hashRefreshToken(refreshToken);
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt: getTokenExpiry(refreshToken),
  });

  return {
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
export async function logout(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized");
  }
  try {
    verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }
  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await RefreshToken.findValidToken(tokenHash);

  if (storedToken) {
    await storedToken.revoke();
  }
  return {
    message: "Logged out successfully",
  };
}
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }
  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await RefreshToken.findValidToken(tokenHash);
  if (!storedToken) {
    throw new ApiError(401, "Refresh token is invalid or revoked.");
  }
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, "User not found.");
  }
  await storedToken.revoke();
  // new tokens
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const newTokenHash = hashRefreshToken(newRefreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt: getTokenExpiry(newRefreshToken),
  });

  return {
    success: true,
    message: "Access token refreshed successfully.",
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
export async function getCurrentUser(userData) {
  return {
    id: userData._id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };
}
