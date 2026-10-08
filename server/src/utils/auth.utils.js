import jwt from "jsonwebtoken";
import crypto from "crypto";
export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: "20m",
    },
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: "30d",
    },
  );
}

export function hashRefreshToken(refreshToken) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}
export function verifyRefreshToken(refreshToken) {
  return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
}
export function getTokenExpiry(refreshToken) {
  const decoded = jwt.decode(refreshToken);
  return new Date(decoded.exp * 1000);
}

export function generateEmailVerificationToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      purpose: "email-verification",
    },
    process.env.EMAIL_VERIFICATION_SECRET,
    {
      expiresIn: "15m",
    },
  );
}

export function verifyEmailVerificationToken(token) {
  return jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
}

export function generatePasswordResetToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      purpose: "password-reset",
    },

    process.env.PASSWORD_RESET_SECRET,

    {
      expiresIn: "15m",
    },
  );
}


export function verifyPasswordResetToken(token) {
  return jwt.verify(
    token,
    process.env.PASSWORD_RESET_SECRET,
  );
}