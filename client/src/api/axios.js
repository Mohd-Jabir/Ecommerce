import axios from "axios";


import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../utils/authToken.js";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

const refreshClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Request interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| Response interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    /*
     * Never refresh the refresh request itself.
     */
    if (
      originalRequest?.url?.includes(
        "/auth/refresh-token",
      )
    ) {
      clearAccessToken();

      return Promise.reject(error);
    }

    /*
     * Never retry the same request twice.
     */
    if (originalRequest?._retry) {
      clearAccessToken();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /*
       * If another request is already refreshing,
       * wait for that exact same promise.
       */
      if (!refreshPromise) {
        refreshPromise =
          refreshClient
            .post("/auth/refresh-token")
            .then((response) => {
              const newAccessToken =
                response.data?.accessToken;

              if (!newAccessToken) {
                throw new Error(
                  "Access token was not returned.",
                );
              }

              setAccessToken(
                newAccessToken,
              );

              return newAccessToken;
            })
            .catch((refreshError) => {
              clearAccessToken();

              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null;
            });
      }

      const newAccessToken =
        await refreshPromise;

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      return Promise.reject(
        refreshError,
      );
    }
  },
);

export default api;