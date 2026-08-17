import { apiClient } from './apiClient';

export interface CreateShipmentPayload {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  weight: number;
}

export interface CreateShipmentResponse {
  id: string;
  message: string;
  trackingNumber: string;
  status: string;
}

export interface CustomerShipmentItem {
  id: string;
  trackingNumber: string;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  weight: number;
  createdAt: string;
  updatedAt?: string;
  packageDescription?: string;
  senderPhone?: string;
  receiverPhone?: string;
  timeline?: TrackingTimelineEvent[];
}

export interface TrackingTimelineEvent {
  status: string;
  description: string;
  createdAt: string;
  location?: string;
}

export interface PodResponse {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  receiverName: string;
  photoUrl: string;
  deliveryTime: string;
}

export const shipmentService = {
  async createShipment(data: CreateShipmentPayload): Promise<CreateShipmentResponse> {
    return apiClient.post<CreateShipmentResponse>('/api/customer/shipments', data);
  },

  async getMyShipments(): Promise<CustomerShipmentItem[]> {
    return apiClient.get<CustomerShipmentItem[]>('/api/customer/shipments');
  },

  async getShipmentById(id: string): Promise<CustomerShipmentItem> {
    return apiClient.get<CustomerShipmentItem>(`/api/customer/shipments/${id}`);
  },

  async getShipmentPod(id: string): Promise<PodResponse> {
    return apiClient.get<PodResponse>(`/api/customer/shipments/${id}/pod`);
  }
};
