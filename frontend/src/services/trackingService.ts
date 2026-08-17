import { apiClient } from './apiClient';

export interface TrackingTimelineEvent {
  status: string;
  description: string;
  createdAt: string;
  location?: string;
}

export interface PublicTrackingResponse {
  trackingNumber: string;
  currentStatus: string;
  timeline: TrackingTimelineEvent[];
}

export const trackingService = {
  async getPublicTracking(trackingNumber: string): Promise<PublicTrackingResponse> {
    return apiClient.get<PublicTrackingResponse>(`/api/tracking/${encodeURIComponent(trackingNumber)}`);
  }
};
