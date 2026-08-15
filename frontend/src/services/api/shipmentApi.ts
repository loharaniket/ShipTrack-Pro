import { apiClient } from './apiClient';

export const shipmentApi = {
  getAll: (assigned?: boolean, page: number = 0, size: number = 20) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (assigned !== undefined) params.append('assigned', assigned.toString());
    return apiClient.get(`/shipments?${params.toString()}`);
  },
  
  getById: (id: string) => apiClient.get(`/shipments/${id}`),
  
  create: (data: any) => apiClient.post('/shipments', data),
  
  update: (id: string, data: any) => apiClient.patch(`/shipments/${id}`, data),
  
  cancel: (id: string) => apiClient.delete(`/shipments/${id}`),
  
  addPackage: (id: string, packageData: any) => apiClient.post(`/shipments/${id}/packages`, packageData),
  
  getHistory: (id: string) => apiClient.get(`/shipments/${id}/history`),
  
  updateStatus: (id: string, status: string) => apiClient.put(`/shipments/${id}/status`, { status }),
};
