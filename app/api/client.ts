import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { AuthApi } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Don't intercept 401s on auth endpoints
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const res = await AuthApi.refresh(refreshToken);
          const { accessToken: newToken, refreshToken: newRefreshToken, user } = res.data as any;
          useAuthStore.getState().setAuth(newToken, newRefreshToken, user);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().clearAuth();
        }
      }
    }
    return Promise.reject(error);
  }
);
