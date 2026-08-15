import { apiClient } from '../apiClient';

export const routeApi = {
  getAll: () => apiClient.get('/routes'),
  getDriverCurrentRoute: () => apiClient.get('/routes/driver/me'),
  planRoute: (data: any) => apiClient.post('/routes/plan', data),
  optimizeRoute: (data: any) => apiClient.post('/routes/optimize', data),
  getGeofences: () => apiClient.get('/routes/geofences'),
  createGeofence: (data: any) => apiClient.post('/routes/geofences', data),
  getById: (id: string) => apiClient.get(`/routes/${id}`),
  updateStatus: (id: string, status: string) => apiClient.put(`/routes/${id}/status`, { status }),
  addStop: (id: string, data: any) => apiClient.post(`/routes/${id}/stops`, data),
  updateStopStatus: (id: string, stopId: string, status: string) => apiClient.put(`/routes/${id}/stops/${stopId}`, { status }),
};
