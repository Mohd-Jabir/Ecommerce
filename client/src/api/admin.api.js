import api from "./axios.js";

// ======================================================
// BASE URL
// ======================================================

// Assumes your Express admin router is mounted at /api/admin.
// Change this one value if your backend uses another prefix.
const ADMIN_URL = "/admin";

// ======================================================
// HELPERS
// ======================================================

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const get = async (url, params) => {
  const response = await api.get(`${url}${buildQueryString(params)}`);
  return response.data;
};

const post = async (url, data) => {
  const response = await api.post(url, data);
  return response.data;
};

const patch = async (url, data) => {
  const response = await api.patch(url, data);
  return response.data;
};

const del = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

// ======================================================
// DASHBOARD
// GET /admin/dashboard
// ======================================================

export const getAdminDashboard = () => get(`${ADMIN_URL}/dashboard`);

// ======================================================
// USERS
// ======================================================

export const getAdminUsers = (params = {}) => get(`${ADMIN_URL}/users`, params);

export const getAdminUser = (userId) => get(`${ADMIN_URL}/users/${userId}`);

export const updateAdminUserStatus = (userId, status) =>
  patch(`${ADMIN_URL}/users/${userId}/status`, { status });

export const deleteAdminUser = (userId) => del(`${ADMIN_URL}/users/${userId}`);

// ======================================================
// VENDORS
// ======================================================

export const getAdminVendors = (params = {}) =>
  get(`${ADMIN_URL}/vendors`, params);

export const getAdminVendor = (vendorId) =>
  get(`${ADMIN_URL}/vendors/${vendorId}`);

export const approveAdminVendor = (vendorId) =>
  patch(`${ADMIN_URL}/vendors/${vendorId}/approve`, {});

export const rejectAdminVendor = (vendorId) =>
  patch(`${ADMIN_URL}/vendors/${vendorId}/reject`, {});

export const suspendAdminVendor = (vendorId) =>
  patch(`${ADMIN_URL}/vendors/${vendorId}/suspend`, {});

// ======================================================
// PRODUCTS
// ======================================================

export const getAdminProducts = (params = {}) =>
  get(`${ADMIN_URL}/products`, params);

export const updateAdminProductStatus = (productId, status) =>
  patch(`${ADMIN_URL}/products/${productId}/status`, {
    status,
  });

export const deleteAdminProduct = (productId) =>
  del(`${ADMIN_URL}/products/${productId}`);

// ======================================================
// ORDERS
// ======================================================

export const getAdminOrders = (params = {}) =>
  get(`${ADMIN_URL}/orders`, params);

export const getAdminOrder = (orderId) => get(`${ADMIN_URL}/orders/${orderId}`);

export const updateAdminOrderStatus = (orderId, status) =>
  patch(`${ADMIN_URL}/orders/${orderId}/status`, { status });

// ======================================================
// PRODUCT REVIEWS
// ======================================================

export const getAdminReviews = (params = {}) =>
  get(`${ADMIN_URL}/reviews`, params);

export const approveAdminReview = (reviewId) =>
  patch(`${ADMIN_URL}/reviews/${reviewId}/approve`, {});

export const deleteAdminReview = (reviewId) =>
  del(`${ADMIN_URL}/reviews/${reviewId}`);

// ======================================================
// CATEGORIES
// ======================================================

export const getAdminCategories = (params = {}) =>
  get(`${ADMIN_URL}/categories`, params);

export const getAdminCategory = (categoryId) =>
  get(`${ADMIN_URL}/categories/${categoryId}`);

export const createAdminCategory = (data) =>
  post(`${ADMIN_URL}/categories`, data);

export const updateAdminCategory = (categoryId, data) =>
  patch(`${ADMIN_URL}/categories/${categoryId}`, data);

export const deleteAdminCategory = (categoryId) =>
  del(`${ADMIN_URL}/categories/${categoryId}`);
