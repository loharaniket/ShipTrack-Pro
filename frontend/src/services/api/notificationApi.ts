import { apiClient } from '../apiClient';

export const notificationApi = {
  getMyAlerts: () => apiClient.get('/notifications/my-alerts'),
  markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`, {}),
  getLogs: () => apiClient.get('/notifications/logs'),
};
