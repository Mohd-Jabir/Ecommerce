
import * as productService from "../services/product.service.js";
import * as productReviewService from "../services/productReview.service.js";


// List products
export async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Get a single product by slug
export async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

// Create product
export async function createProduct(req, res, next) {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(403).json({
        success: false,
        message: "Approved vendor information is required.",
      });
    }

    const product = await productService.createProduct(
      vendorId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
}

// Update product
export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(
      req.params.productId,
      req.user,
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

// Delete/archive product
export async function deleteProduct(req, res, next) {
  try {
    const result = await productService.deleteProduct(
      req.params.productId,
      req.user,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

// Get approved reviews for a product
export async function listProductReviews(req, res, next) {
  try {
    const result = await productReviewService.listProductReviews(
      req.params.productId,
      req.query,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Submit a product review
export async function createProductReview(req, res, next) {
  try {
    const review = await productReviewService.createProductReview(
      req.params.productId,
      req.user,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Review submitted and awaiting approval.",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

// List products belonging to the authenticated vendor
export async function listMyProducts(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    const result = await productService.listMyVendorProducts(
      userId,
      req.query,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}