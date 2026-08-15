import { apiClient } from '../apiClient';

export const deliveryApi = {
  getDrivers: () => apiClient.get('/delivery/drivers'),
  getMyDriverProfile: () => apiClient.get('/delivery/drivers/me'),
  getMyAssignments: () => apiClient.get('/delivery/drivers/me/assignments'),
  assignShipment: (data: any) => apiClient.post('/delivery/assignments', data),
  updateLocation: (driverId: string, locationData: any) => apiClient.post(`/delivery/drivers/${driverId}/location`, locationData),
  getLocation: (driverId: string) => apiClient.get(`/delivery/drivers/${driverId}/location`),
  getVehicles: () => apiClient.get('/delivery/vehicles'),
  getActiveDeliveries: () => apiClient.get('/delivery/active'),
  getDriverCurrentRoute: (driverId: string) => apiClient.get(`/delivery/drivers/${driverId}/current-route`),
};
