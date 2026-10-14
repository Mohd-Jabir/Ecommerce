import api from "./axios.js";

export async function createPaymentOrder({ orderId, checkoutKey }) {
  const { data } = await api.post("/payments/create-order", {
    orderId,
    checkoutKey,
  });

  return data.data;
}

export async function verifyPayment(payload) {
  const { data } = await api.post("/payments/verify", payload);
  return data.data;
}

export async function getPaymentStatus(paymentId) {
  const { data } = await api.get(
    `/payments/${encodeURIComponent(paymentId)}/status`,
  );

  return data.data;
}
