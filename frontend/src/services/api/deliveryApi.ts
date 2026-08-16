import { apiClient } from '../apiClient';

export interface BackendDriverResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  vehicleId: string | null;
  vehicle: BackendVehicleResponse | null;
  licenseNumber: string | null;
  experienceYears: number | null;
  createdAt: string;
}

export interface BackendVehicleResponse {
  id: string;
  registrationNumber: string;
  type: string;
  capacityKg: number;
  status: string;
}

export interface CreateDriverRequestPayload {
  name: string;
  phone: string;
  email: string;
  vehicleRegistration?: string;
  vehicleType?: string;
  vehicleCapacityKg?: number;
  licenseNumber?: string;
  experienceYears?: number;
  status?: string;
}

export const deliveryApi = {
  getDrivers: () => apiClient.get<BackendDriverResponse[]>('/delivery/drivers'),
  createDriver: (data: CreateDriverRequestPayload) => apiClient.post<BackendDriverResponse>('/delivery/drivers', data),
  getVehicles: () => apiClient.get<BackendVehicleResponse[]>('/delivery/vehicles'),
  getMyDriverProfile: () => apiClient.get<BackendDriverResponse>('/delivery/drivers/me'),
  getMyAssignments: () => apiClient.get<any[]>('/delivery/drivers/me/assignments'),
  assignShipment: (data: any) => apiClient.post<any>('/delivery/assignments', data),
  updateLocation: (driverId: string, locationData: any) => apiClient.post<string>(`/delivery/drivers/${driverId}/location`, locationData),
  getLocation: (driverId: string) => apiClient.get<any>(`/delivery/drivers/${driverId}/location`),
  getActiveDeliveries: () => apiClient.get<BackendDriverResponse[]>('/delivery/active'),
  getDriverCurrentRoute: (driverId: string) => apiClient.get<any>(`/delivery/drivers/${driverId}/current-route`),
};
