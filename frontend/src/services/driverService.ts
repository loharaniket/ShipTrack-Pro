import { apiClient } from './apiClient';
import { CustomerShipmentItem, PodResponse } from './shipmentService';

export interface UpdateStatusPayload {
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | string;
  description: string;
}

export const driverService = {
  async getAssignedDeliveries(): Promise<CustomerShipmentItem[]> {
    return apiClient.get<CustomerShipmentItem[]>('/api/operator/deliveries');
  },

  async updateShipmentStatus(id: string, status: string, description: string): Promise<CustomerShipmentItem> {
    return apiClient.put<CustomerShipmentItem>(`/api/operator/shipments/${id}/status`, {
      status,
      description
    });
  },

  async uploadPod(shipmentId: string, receiverName: string, photo: File): Promise<PodResponse> {
    const formData = new FormData();
    formData.append('shipmentId', shipmentId);
    formData.append('receiverName', receiverName);
    formData.append('photo', photo);

    return apiClient.postForm<PodResponse>('/api/operator/pod', formData);
  }
};
