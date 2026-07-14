import { api } from "./client";
import type { AppUser } from "~/types";

export const AuthApi = {
  login: (data: any) => api.post<{ token: string; refreshToken: string; user: AppUser }>("/login", data),
  register: (data: any) => api.post<{ token: string; refreshToken: string; user: AppUser }>("/register", data),
  logout: () => api.post("/logout"),
};