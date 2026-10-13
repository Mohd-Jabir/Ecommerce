import api from "./axios.js";

// Fetch products
export async function getProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data.data;
}

// Fetch one product by slug
export async function getProductBySlug(slug) {
  const { data } = await api.get(`/products/${encodeURIComponent(slug)}`);
  return data.data.product;
}

// Create product
export async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data.data.product;
}

// Update product
export async function updateProduct(productId, payload) {
  const { data } = await api.patch(`/products/${productId}`, payload);
  return data.data.product;
}

// Archive product
export async function archiveProduct(productId) {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
}

// Fetch approved product reviews
export async function getProductReviews(productId, params = {}) {
  const { data } = await api.get(`/products/${productId}/reviews`, { params });
  return data.data;
}

// Submit a product review
export async function createProductReview(productId, payload) {
  const { data } = await api.post(`/products/${productId}/reviews`, payload);
  return data.data.review;
}

// Fetch the authenticated vendor's products
export async function getMyProducts(params = {}) {
  const { data } = await api.get("/products/vendor/me", { params });
  return data.data;
}
