import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "../utils/auth.utils.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.service.js";

export async function register(userData) {
  const { name, email, password } = userData;

  const userEmailExists = await User.isEmailTaken(email);

  if (userEmailExists) {
    throw new ApiError(409, "Email already exists.");
  }

  let user;

  try {
    user = await User.create({
      name,
      email,
      passwordHash: password,
      isEmailVerified: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Email already exists.");
    }

    throw error;
  }

  try {
    const verificationToken = generateEmailVerificationToken(user);

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);

    console.error("Verification email failed:", error);

    throw new ApiError(
      500,
      "Account could not be created because verification email could not be sent.",
    );
  }

  return {
    success: true,
    message:
      "Registration successful. Please check your email to verify your account.",
  };
}
export async function verifyEmail(token) {
  if (!token) {
    throw new ApiError(400, "Verification token is required.");
  }

  let decoded;

  try {
    decoded = verifyEmailVerificationToken(token);
  } catch (error) {
    throw new ApiError(400, "Invalid or expired verification link.");
  }

  if (decoded.purpose !== "email-verification") {
    throw new ApiError(400, "Invalid verification token.");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.email !== decoded.email) {
    throw new ApiError(400, "Invalid verification token.");
  }

  if (user.isEmailVerified) {
    return {
      success: true,
      message: "Email is already verified.",
    };
  }

  user.isEmailVerified = true;

  await user.save();

  return {
    success: true,
    message: "Email verified successfully. You can now log in.",
  };
}
export async function resendVerificationEmail(email) {
  const user = await User.findByEmail(email);

  if (!user) {
    throw new ApiError(404, "No account found with this email.");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified.");
  }

  const verificationToken = generateEmailVerificationToken(user);

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    });
  } catch (error) {
    console.error("Resend verification email failed:", error);

    throw new ApiError(500, "Could not send verification email.");
  }

  return {
    success: true,
    message: "Verification email sent successfully.",
  };
}

export async function login(credentials) {
  const { email, password } = credentials;
const user = await User.findByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  if (!user.canLogin()) {
    throw new ApiError(403, "Account is not allowed to access this resource.");
  }

  user.lastLoginAt = new Date();

  await user.save();

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
    message: "Login successful.",

    accessToken,

    refreshToken,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  };
}
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized.");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const tokenHash = hashRefreshToken(refreshToken);

  /*
   * IMPORTANT:
   *
   * This is an atomic operation.
   *
   * Only one concurrent request can successfully
   * revoke this refresh token.
   */
  const revokedToken = await RefreshToken.revokeValidToken(tokenHash);

  if (!revokedToken) {
    throw new ApiError(
      401,
      "Refresh token is invalid or has already been used.",
    );
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email is not verified.");
  }

  if (!user.canLogin()) {
    throw new ApiError(403, "Account is not allowed to access this resource.");
  }

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
      isEmailVerified: user.isEmailVerified,
    },
  };
}
export async function logout(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized.");
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(
      401,
      "Invalid or expired refresh token.",
    );
  }

  const tokenHash =
    hashRefreshToken(refreshToken);

  await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  return {
    message: "Logged out successfully.",
  };
}

export async function getCurrentUser(userData) {
  return {
    success: true,

    user: {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isEmailVerified: userData.isEmailVerified,
    },
  };
}

export async function forgotPassword(email) {
  const user = await User.findByEmail(email);
  if (!user) {
    return {
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    };
  }

  const resetToken = generatePasswordResetToken(user);

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken,
    });
  } catch (error) {
    console.error("Password reset email failed:", error);

    throw new ApiError(500, "Could not send password reset email.");
  }

  return {
    success: true,
    message:
      "If an account exists with this email, a password reset link has been sent.",
  };
}

export async function resetPassword({ token, password }) {
  let decoded;

  try {
    decoded = verifyPasswordResetToken(token);
  } catch (error) {
    throw new ApiError(400, "Invalid or expired password reset link.");
  }

  if (decoded.purpose !== "password-reset") {
    throw new ApiError(400, "Invalid password reset token.");
  }

  const user = await User.findById(decoded.userId).select("+passwordHash");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.email !== decoded.email) {
    throw new ApiError(400, "Invalid password reset token.");
  }

  if (!user.isPasswordResetTokenValid(decoded.iat)) {
    throw new ApiError(400, "This password reset link is no longer valid.");
  }
  user.passwordHash = password;
  await user.save();
  await RefreshToken.updateMany(
    {
      user: user._id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  return {
    success: true,
    message: "Password reset successfully. Please log in again.",
  };
}
