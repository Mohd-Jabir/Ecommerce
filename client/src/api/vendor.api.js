import api from "./axios.js";

export async function applyToBecomeVendor(payload) {
  const { data } = await api.post("/vendors/apply", payload);
  return data.data.vendor;
}

export async function getMyVendorProfile() {
  const { data } = await api.get("/vendors/me");
  return data.data.vendor;
}

export async function updateMyVendorProfile(payload) {
  const { data } = await api.patch("/vendors/me", payload);
  return data.data.vendor;
}
