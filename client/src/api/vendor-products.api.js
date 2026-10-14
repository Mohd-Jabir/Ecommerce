import api from "./axios.js";

export async function getVendorProducts(params = {}) {
  const { data } = await api.get("/vendors/me/products", { params });
  return data.data;
}

export async function getVendorProduct(productId) {
  const { data } = await api.get(`/vendors/me/products/${productId}`);
  return data.data.product;
}

export async function createVendorProduct(payload) {
  const { data } = await api.post("/vendors/me/products", payload);
  return data.data.product;
}

export async function updateVendorProduct({ productId, payload }) {
  const { data } = await api.patch(
    `/vendors/me/products/${productId}`,
    payload,
  );
  return data.data.product;
}

export async function deleteVendorProduct(productId) {
  const { data } = await api.delete(`/vendors/me/products/${productId}`);
  return data;
}
