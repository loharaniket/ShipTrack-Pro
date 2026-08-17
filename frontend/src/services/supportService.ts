import { apiClient } from './apiClient';

export interface CreateTicketPayload {
  shipmentId?: string;
  subject: string;
  description: string;
}

export interface SupportTicket {
  id: string;
  shipmentId?: string;
  trackingNumber?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  createdAt: string;
  updatedAt?: string;
}

export const supportService = {
  async createTicket(data: CreateTicketPayload): Promise<SupportTicket> {
    return apiClient.post<SupportTicket>('/api/customer/tickets', data);
  },

  async getMyTickets(): Promise<SupportTicket[]> {
    return apiClient.get<SupportTicket[]>('/api/customer/tickets');
  },

  async getTicketDetails(id: string): Promise<SupportTicket> {
    return apiClient.get<SupportTicket>(`/api/customer/tickets/${id}`);
  },

  async getAllTickets(status?: string): Promise<SupportTicket[]> {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return apiClient.get<SupportTicket[]>(`/api/support/tickets${query}`);
  },

  async updateTicketStatus(id: string, status: string): Promise<SupportTicket> {
    return apiClient.put<SupportTicket>(`/api/support/tickets/${id}`, { status });
  }
};
