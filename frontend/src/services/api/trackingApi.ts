import { apiClient } from '../apiClient';

export const trackingApi = {
  recordEvent: (data: any) => apiClient.post('/tracking/events', data),
  getTrackingEvents: (shipmentId: string) => apiClient.get(`/tracking/shipments/${shipmentId}/events`),
  getCurrentLocation: (shipmentId: string) => apiClient.get(`/tracking/shipments/${shipmentId}/location`),
};
