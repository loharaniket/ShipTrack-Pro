import { apiClient } from '../apiClient';

export interface BackendRouteResponse {
  id: string;
  name: string;
  organizationId: string;
  driverId: string | null;
  status: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  stopsCount?: number;
  createdAt: string;
  updatedAt: string;
  stops?: BackendRouteStopResponse[];
}

export interface BackendRouteStopResponse {
  id: string;
  routeId: string;
  shipmentId: string;
  trackingNumber?: string;
  recipientName?: string;
  destinationAddressLabel?: string;
  stopOrder: number;
  status: string;
  plannedArrival?: string | null;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const routeApi = {
  getAll: (status?: string) =>
    apiClient.get<BackendRouteResponse[]>(status ? `/routes?status=${status}` : '/routes'),

  getById: (id: string) =>
    apiClient.get<BackendRouteResponse>(`/routes/${id}`),

  getDriverCurrentRoute: () =>
    apiClient.get<BackendRouteResponse[]>('/routes/driver/me'),

  planRoute: (data: { name: string; shipmentIds: string[]; driverId?: string; plannedStart?: string; plannedEnd?: string }) =>
    apiClient.post<BackendRouteResponse>('/routes/plan', data),

  assignDriver: (id: string, data: { driverId: string }) =>
    apiClient.post<BackendRouteResponse>(`/routes/${id}/assign-driver`, data),

  dispatch: (id: string) =>
    apiClient.post<BackendRouteResponse>(`/routes/${id}/dispatch`, {}),

  updateStatus: (id: string, status: string) =>
    apiClient.put<BackendRouteResponse>(`/routes/${id}/status`, { status }),

  updateStopStatus: (id: string, stopId: string, data: { status: string; actualArrival?: string; actualDeparture?: string } | string) => {
    const payload = typeof data === 'string' ? { status: data } : data;
    return apiClient.put<BackendRouteStopResponse>(`/routes/${id}/stops/${stopId}`, payload);
  },

  optimizeRoute: (id: string, data?: { optimizedStopSequence?: string[] }) =>
    apiClient.post<BackendRouteResponse>(`/routes/${id}/optimize`, data || {}),
};
