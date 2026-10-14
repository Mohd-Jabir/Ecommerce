import * as wishlistService from "../services/wishlist.service.js";

export async function getWishlist(req, res, next) {
  try {
    const result = await wishlistService.getWishlist(req.user);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const result = await wishlistService.addToWishlist(
      req.user,
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const result = await wishlistService.removeFromWishlist(
      req.user,
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
