import { apiClient } from './apiClient';
import { AddressDto } from './addressService';

export interface CreateShipmentPayload {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  originAddress?: AddressDto;
  destinationAddress?: AddressDto;
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
  originAddress?: AddressDto;
  destinationAddress?: AddressDto;
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

  async getAllShipments(page: number = 0, size: number = 50): Promise<CustomerShipmentItem[]> {
    const data: any = await apiClient.get<any>(`/api/shipments?page=${page}&size=${size}`);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  },

  async getShipmentById(id: string): Promise<CustomerShipmentItem> {
    return apiClient.get<CustomerShipmentItem>(`/api/customer/shipments/${id}`);
  },

  async getShipmentPod(id: string): Promise<PodResponse> {
    return apiClient.get<PodResponse>(`/api/customer/shipments/${id}/pod`);
  }
};
