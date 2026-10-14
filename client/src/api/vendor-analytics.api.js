import api from "./axios.js";

export async function getVendorAnalytics(params = {}) {
  const { data } = await api.get("/vendors/me/analytics", { params });
  return data.data;
}
