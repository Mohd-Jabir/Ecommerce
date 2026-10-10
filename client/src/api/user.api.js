import api from "./axios.js";

export const getMyProfile = async () => {
  const { data } = await api.get("/users/me");
  return data.data.user;
};

export const updateMyProfile = async (payload) => {
  const { data } = await api.patch("/users/me", payload);
  return data.data.user;
};

export const deactivateMyAccount = async () => {
  const { data } = await api.delete("/users/me");
  return data;
};

export const addAddress = async (payload) => {
  const { data } = await api.post("/users/me/addresses", payload);
  return data.data.address;
};

export const updateAddress = async (addressId, payload) => {
  const { data } = await api.patch(`/users/me/addresses/${addressId}`, payload);
  return data.data.address;
};

export const deleteAddress = async (addressId) => {
  const { data } = await api.delete(`/users/me/addresses/${addressId}`);
  return data.data.addresses;
};

export const setDefaultAddress = async (addressId) => {
  const { data } = await api.patch(`/users/me/addresses/${addressId}/default`);
  return data.data;
};
