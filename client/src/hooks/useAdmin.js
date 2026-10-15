import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUser,
  updateAdminUserStatus,
  deleteAdminUser,
  getAdminVendors,
  getAdminVendor,
  approveAdminVendor,
  rejectAdminVendor,
  suspendAdminVendor,
  getAdminProducts,
  updateAdminProductStatus,
  deleteAdminProduct,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  getAdminReviews,
  approveAdminReview,
  deleteAdminReview,
  getAdminCategories,
  getAdminCategory,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "../api/admin.api";

// ======================================================
// QUERY KEYS
// ======================================================

export const adminKeys = {
  all: ["admin"],

  dashboard: () => [...adminKeys.all, "dashboard"],

  users: () => [...adminKeys.all, "users"],
  userLists: () => [...adminKeys.users(), "list"],
  userList: (params) => [...adminKeys.userLists(), params],
  user: (id) => [...adminKeys.users(), "detail", id],

  vendors: () => [...adminKeys.all, "vendors"],
  vendorLists: () => [...adminKeys.vendors(), "list"],
  vendorList: (params) => [...adminKeys.vendorLists(), params],
  vendor: (id) => [...adminKeys.vendors(), "detail", id],

  products: () => [...adminKeys.all, "products"],
  productLists: () => [...adminKeys.products(), "list"],
  productList: (params) => [...adminKeys.productLists(), params],

  orders: () => [...adminKeys.all, "orders"],
  orderLists: () => [...adminKeys.orders(), "list"],
  orderList: (params) => [...adminKeys.orderLists(), params],
  order: (id) => [...adminKeys.orders(), "detail", id],

  reviews: () => [...adminKeys.all, "reviews"],
  reviewLists: () => [...adminKeys.reviews(), "list"],
  reviewList: (params) => [...adminKeys.reviewLists(), params],

  categories: () => [...adminKeys.all, "categories"],
  categoryLists: () => [...adminKeys.categories(), "list"],
  categoryList: (params) => [...adminKeys.categoryLists(), params],
  category: (id) => [...adminKeys.categories(), "detail", id],
};

// ======================================================
// DASHBOARD
// ======================================================

export const useAdminDashboard = () =>
  useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: getAdminDashboard,
  });

// ======================================================
// USERS
// ======================================================

export const useAdminUsers = (params = {}) =>
  useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => getAdminUsers(params),
  });

export const useAdminUser = (id) =>
  useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => getAdminUser(id),
    enabled: Boolean(id),
  });

export const useUpdateAdminUserStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }) => updateAdminUserStatus(userId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useDeleteAdminUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

// ======================================================
// VENDORS
// ======================================================

export const useAdminVendors = (params = {}) =>
  useQuery({
    queryKey: adminKeys.vendorList(params),
    queryFn: () => getAdminVendors(params),
  });

export const useAdminVendor = (id) =>
  useQuery({
    queryKey: adminKeys.vendor(id),
    queryFn: () => getAdminVendor(id),
    enabled: Boolean(id),
  });

const useVendorAction = (action) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.vendors() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useApproveAdminVendor = () => useVendorAction(approveAdminVendor);

export const useRejectAdminVendor = () => useVendorAction(rejectAdminVendor);

export const useSuspendAdminVendor = () => useVendorAction(suspendAdminVendor);

// ======================================================
// PRODUCTS
// ======================================================

export const useAdminProducts = (params = {}) =>
  useQuery({
    queryKey: adminKeys.productList(params),
    queryFn: () => getAdminProducts(params),
  });

export const useUpdateAdminProductStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, status }) =>
      updateAdminProductStatus(productId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useDeleteAdminProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

// ======================================================
// ORDERS
// ======================================================

export const useAdminOrders = (params = {}) =>
  useQuery({
    queryKey: adminKeys.orderList(params),
    queryFn: () => getAdminOrders(params),
  });

export const useAdminOrder = (id) =>
  useQuery({
    queryKey: adminKeys.order(id),
    queryFn: () => getAdminOrder(id),
    enabled: Boolean(id),
  });

export const useUpdateAdminOrderStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) =>
      updateAdminOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.orders() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

// ======================================================
// PRODUCT REVIEWS
// ======================================================

export const useAdminReviews = (params = {}) =>
  useQuery({
    queryKey: adminKeys.reviewList(params),
    queryFn: () => getAdminReviews(params),
  });

export const useApproveAdminReview = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: approveAdminReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.reviews() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useDeleteAdminReview = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.reviews() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

// ======================================================
// CATEGORIES
// ======================================================

export const useAdminCategories = (params = {}) =>
  useQuery({
    queryKey: adminKeys.categoryList(params),
    queryFn: () => getAdminCategories(params),
  });

export const useAdminCategory = (id) =>
  useQuery({
    queryKey: adminKeys.category(id),
    queryFn: () => getAdminCategory(id),
    enabled: Boolean(id),
  });

export const useCreateAdminCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useUpdateAdminCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }) => updateAdminCategory(categoryId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useDeleteAdminCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};
