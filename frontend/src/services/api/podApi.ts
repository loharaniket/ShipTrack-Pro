import { apiClient } from '../apiClient';

export const podApi = {
  uploadPhoto: (formData: FormData) => apiClient.postForm('/pod/upload-photo', formData),
  submit: (data: any) => apiClient.post('/pod/submit', data),
  getRecords: (page: number = 0, size: number = 20) => apiClient.get(`/pod/records?page=${page}&size=${size}`),
  verify: (id: string) => apiClient.post(`/pod/${id}/verify`),
  reject: (id: string, reason: string) => apiClient.post(`/pod/${id}/reject`, { reason }),
};
