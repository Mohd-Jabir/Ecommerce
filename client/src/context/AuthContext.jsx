import { createContext, useCallback, useEffect, useState } from "react";

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshToken,
} from "../api/auth.api.js";

import { clearAccessToken, setAccessToken } from "../utils/authToken.js";

import { queryClient } from "../app/providers.jsx";

export const AuthContext = createContext(null);

let authInitializationPromise = null;

async function initializeAuthentication() {
  if (!authInitializationPromise) {
    authInitializationPromise = (async () => {
      try {
        const refreshResponse = await refreshToken();

        if (!refreshResponse?.accessToken) {
          throw new Error("Unable to refresh access token.");
        }

        setAccessToken(refreshResponse.accessToken);

        const meResponse = await getCurrentUser();

        return meResponse.user;
      } finally {
        authInitializationPromise = null;
      }
    })();
  }

  return authInitializationPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isInitializing, setIsInitializing] = useState(true);

  const initializeAuth = useCallback(async () => {
    try {
      const currentUser = await initializeAuthentication();

      setUser(currentUser);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials) => {
    const response = await loginApi(credentials);

    setAccessToken(response.accessToken);

    setUser(response.user);

    queryClient.setQueryData(["currentUser"], {
      success: true,
      user: response.user,
    });

    return response;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      clearAccessToken();

      setUser(null);

      queryClient.clear();
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
