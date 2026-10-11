import api from "./axios.js";

export async function getCategories() {
  const { data } = await api.get("/categories");
  return data.data.categories;
}

export async function getCategoryBySlug(slug) {
  const { data } = await api.get(`/categories/${encodeURIComponent(slug)}`);
  return data.data.category;
}

export async function createCategory(payload) {
  const { data } = await api.post("/categories", payload);
  return data.data.category;
}

export async function updateCategory(categoryId, payload) {
  const { data } = await api.patch(`/categories/${categoryId}`, payload);
  return data.data.category;
}

export async function deactivateCategory(categoryId) {
  const { data } = await api.delete(`/categories/${categoryId}`);
  return data;
}
