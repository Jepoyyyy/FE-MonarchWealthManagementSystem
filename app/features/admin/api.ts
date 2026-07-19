import { api } from '~/shared/api/client';
import type { AppUser, AuditLog, Page, AdminUserDetail, Product } from '~/types';
import type { AdminProductCreateDTO, AdminProductUpdateDTO } from './admin.types';

export interface UserUpdateDTO {
  status: string;
}

export interface AuditQueryParams {
  headView?: boolean;
  page?: number;
  size?: number;
  sort?: string;
  category?: string;
  search?: string;
  from?: string;
  to?: string;
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

  searchAuditLogs: (params: AuditQueryParams = {}) => {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    if (params.sort) query.set('sort', params.sort);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    return api.get<Page<AuditLog>>(`/api/v1/admin/audit/search?${query.toString()}`);
  },

  // Products management
  listAdminProducts: (params: { search?: string; type?: string; page?: number; size?: number } = {}) => {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    return api.get<Page<Product>>(`/api/v1/admin/products?${query.toString()}`);
  },

  createProduct: (dto: AdminProductCreateDTO) =>
    api.post<Product>('/api/v1/admin/products', dto),

  updateAdminProduct: (id: string, dto: AdminProductUpdateDTO) =>
    api.put<Product>(`/api/v1/admin/products/${id}`, dto),
};
