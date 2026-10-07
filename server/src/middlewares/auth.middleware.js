import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required."));
  }

  const accessToken = authorization.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY,
    );
  } catch (error) {
    return next(
      new ApiError(401, "Invalid or expired access token."),
    );
  }

  try {
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new ApiError(401, "User not found."));
    }

    // if (!user.canLogin()) {
    //   return next(
    //     new ApiError(
    //       403,
    //       "Account is not allowed to access this resource.",
    //     ),
    //   );
    // }

    req.user = user;
    req.auth = decoded;

    next();
  } catch (error) {
    next(error);
  }
}