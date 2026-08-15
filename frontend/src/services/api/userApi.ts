import { apiClient } from '../apiClient';

export const userApi = {
  getAll: (page: number = 0, size: number = 20) => apiClient.get(`/users?page=${page}&size=${size}`),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
  changePassword: (id: string, data: any) => apiClient.patch(`/users/${id}/password`, data),
};
