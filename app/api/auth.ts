import { api } from "./client";
import type { AppUser } from "../types";

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { name: string; email: string; password: string; }
interface AuthSuccessResponse { accessToken: string; refreshToken: string; user: AppUser; }

export const AuthApi = {
  login: (data: LoginPayload) => 
    api.post<AuthSuccessResponse>("/api/v1/auth/login", data),
  register: (data: RegisterPayload) => 
    api.post<AuthSuccessResponse>("/api/v1/auth/register", data),
  logout: () => api.post("/api/v1/auth/logout"),
  refresh: (refreshToken: string) =>
    api.post("/api/v1/auth/refresh", {
        refreshToken
    }),
};
