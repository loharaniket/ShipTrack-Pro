import { apiClient } from './apiClient';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    return apiClient.get<AppNotification[]>('/api/notifications');
  },

  async getUnreadCount(): Promise<number> {
    try {
      const count = await apiClient.get<number>('/api/notifications/unread-count');
      return typeof count === 'number' ? count : 0;
    } catch (e) {
      return 0;
    }
  },

  async markAsRead(id: string): Promise<AppNotification> {
    return apiClient.put<AppNotification>(`/api/notifications/${id}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.put<void>('/api/notifications/read-all', {});
  }
};
