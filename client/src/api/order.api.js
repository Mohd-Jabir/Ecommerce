import api from "./axios.js";

export const createOrder = async (shippingAddress) => {
  const { data } = await api.post("/orders", {
    shippingAddress,
  });
  return data.data;
};

export const getMyOrders = async () => {
  const { data } = await api.get("/orders");
  return data.data;
};

export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data.data;
};

export const cancelOrder = async (orderId) => {
  const { data } = await api.patch(`/orders/${orderId}/cancel`);
  return data.data;
};
