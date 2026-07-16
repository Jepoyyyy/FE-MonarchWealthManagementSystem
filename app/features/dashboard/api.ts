import { api } from '~/shared/api/client';
import type { UserDashboardDTO, AdminDashboardDTO } from '~/types';

export const DashboardApi = {
  getUserDashboard: () => api.get<UserDashboardDTO>("/api/v1/me/dashboard"),
  getAdminDashboard: () => api.get<AdminDashboardDTO>("/api/v1/admin-dashboard"),
};