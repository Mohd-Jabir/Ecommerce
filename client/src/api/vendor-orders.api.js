import api from "./axios.js";

export async function getVendorOrders(params = {}) {
  const { data } = await api.get("/vendors/me/orders", { params });
  return data.data;
}

export async function getVendorOrder(orderId) {
  const { data } = await api.get(`/vendors/me/orders/${orderId}`);
  return data.data.order;
}

export async function updateVendorOrderStatus({ orderId, orderStatus }) {
  const { data } = await api.patch(`/vendors/me/orders/${orderId}/status`, {
    orderStatus,
  });
  return data.data.order;
}
