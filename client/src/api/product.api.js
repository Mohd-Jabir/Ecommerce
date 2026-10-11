import api from "./axios.js";

export async function getProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data.data;
}

export async function getProductBySlug(slug) {
  const { data } = await api.get(`/products/${encodeURIComponent(slug)}`);
  return data.data.product;
}

export async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data.data.product;
}

export async function updateProduct(productId, payload) {
  const { data } = await api.patch(`/products/${productId}`, payload);
  return data.data.product;
}

export async function archiveProduct(productId) {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
}

export async function getProductReviews(productId, params = {}) {
  const { data } = await api.get(`/products/${productId}/reviews`, { params });
  return data.data;
}
export async function getMyProducts(params = {}) {
  const { data } = await api.get("/products/vendor/me", { params });
  return data.data;
}
