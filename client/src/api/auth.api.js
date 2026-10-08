import api from "./axios";

export async function register(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function login(data) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export async function refreshToken() {
  const response = await api.post("/auth/refresh-token");
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function verifyEmail(data) {
  const response = await api.post("/auth/verify-email", data);
  return response.data;
}

export async function resendVerification(data) {
  const response = await api.post("/auth/resend-verification", data);

  return response.data;
}

export async function forgotPassword(data) {
  const response = await api.post("/auth/forgot-password", data);

  return response.data;
}

export async function resetPassword(data) {
  const response = await api.post("/auth/reset-password", data);

  return response.data;
}
