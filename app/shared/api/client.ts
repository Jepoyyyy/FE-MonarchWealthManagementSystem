import axios from "axios";
import { useAuthStore } from "~/stores/authStore";
import { AuthApi } from "~/api/auth";

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

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "result" in response.data && "code" in response.data) {
      response.data = response.data.result;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Don't intercept 401s on auth endpoints
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const res = await AuthApi.refresh(refreshToken);
          const { accessToken: newToken, refreshToken: newRefreshToken, user } = res.data;
          useAuthStore.getState().setAuth(newToken, newRefreshToken, user);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth();
          delete api.defaults.headers.common["Authorization"];
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
        useAuthStore.getState().clearAuth();
        delete api.defaults.headers.common["Authorization"];
      }
    }
    return Promise.reject(error);
  }
);
