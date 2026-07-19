import { api } from '~/shared/api/client';
import type { AppUser, AuditLog, Page, AdminUserDetail } from '~/types';

export interface UserUpdateDTO {
  status: string;
}

export interface AuditQueryParams {
  headView?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export const AdminApi = {
  // Users management
  listUsers: (params: { page?: number; size?: number; sort?: string; search?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    if (params.sort) query.set('sort', params.sort);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    return api.get<Page<AdminUserDetail>>(`/api/v1/users?${query.toString()}`);
  },

  getUserById: (id: string) =>
    api.get<AdminUserDetail>(`/api/v1/users/${id}`),

  updateUser: (id: string, dto: UserUpdateDTO) =>
    api.put<AdminUserDetail>(`/api/v1/users/${id}`, dto),

  // Audit logs
  getAuditLogs: (params: AuditQueryParams = {}) => {
    const query = new URLSearchParams();
    if (params.headView !== undefined) query.set('headView', String(params.headView));
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    if (params.sort) query.set('sort', params.sort);
    return api.get<Page<AuditLog>>(`/api/v1/admin/audit?${query.toString()}`);
  },
};
