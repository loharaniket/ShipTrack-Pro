import { apiClient } from './apiClient';
import { AddressDto } from './addressService';

export interface TrackingTimelineEvent {
  status: string;
  description: string;
  createdAt: string;
  location?: string;
}

export interface PublicTrackingResponse {
  trackingNumber: string;
  currentStatus: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  originAddress?: AddressDto;
  destinationAddress?: AddressDto;
  originLatitude?: number;
  originLongitude?: number;
  destLatitude?: number;
  destLongitude?: number;
  timeline: TrackingTimelineEvent[];
}

export const trackingService = {
  async getPublicTracking(trackingNumber: string): Promise<PublicTrackingResponse> {
    return apiClient.get<PublicTrackingResponse>(`/api/tracking/${encodeURIComponent(trackingNumber)}`);
  }
};
