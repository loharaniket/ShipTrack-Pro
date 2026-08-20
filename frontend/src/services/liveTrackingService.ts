import { apiClient } from './apiClient';

export interface DriverLocationDto {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  connectionStatus: 'CONNECTED' | 'CONNECTION_LOST';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  shipmentStatus: string;
  startedAt: string;
  endedAt?: string;
  endedReason?: string;
  lastPingAt: string;
  updatedAt: string;
}

export interface ActiveDriverTrackingDto {
  trackingId: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverPhone?: string;
  shipmentId: string;
  trackingNumber: string;
  receiverName: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  connectionStatus: 'CONNECTED' | 'CONNECTION_LOST';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  lastPingAt: string;
}

export const liveTrackingService = {
  startTracking: async (shipmentId: string): Promise<DriverLocationDto> => {
    return apiClient.post<DriverLocationDto>('/v1/tracking/start', { shipmentId });
  },

  updateLocation: async (
    shipmentId: string,
    latitude: number,
    longitude: number,
    accuracy?: number
  ): Promise<DriverLocationDto> => {
    return apiClient.post<DriverLocationDto>('/v1/tracking/location', {
      shipmentId,
      latitude,
      longitude,
      accuracy,
    });
  },

  stopTracking: async (shipmentId: string, reason: string = 'DELIVERED'): Promise<DriverLocationDto> => {
    return apiClient.post<DriverLocationDto>(`/v1/tracking/end/${shipmentId}?reason=${encodeURIComponent(reason)}`);
  },

  getShipmentLiveLocation: async (shipmentId: string): Promise<DriverLocationDto> => {
    return apiClient.get<DriverLocationDto>(`/v1/tracking/shipment/${shipmentId}`);
  },

  getActiveDrivers: async (): Promise<ActiveDriverTrackingDto[]> => {
    return apiClient.get<ActiveDriverTrackingDto[]>('/v1/tracking/active-drivers');
  },
};
