
import ImageKit from "@imagekit/nodejs";
import { ApiError } from "../utils/ApiError.js";

export async function getImageKitAuth(req, res) {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new ApiError(500, "ImageKit is not configured");
  }

  const imageKit = new ImageKit({ privateKey });

  const { token, expire, signature } =
    imageKit.helper.getAuthenticationParameters();

  if (!token || !expire || !signature) {
    throw new ApiError(
      500,
      "Failed to generate ImageKit authentication parameters"
    );
  }

  return res.status(200).json({
    success: true,
    data: {
      token,
      expire,
      signature,
      publicKey,
    },
  });
}
