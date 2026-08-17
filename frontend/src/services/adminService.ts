import { apiClient } from './apiClient';
import { CustomerShipmentItem } from './shipmentService';

export interface DashboardStats {
  totalShipments: number;
  pendingDispatch: number;
  inTransit: number;
  delivered: number;
  openComplaints: number;
  activeDrivers: number;
}

export interface AdminReport {
  totalShipments: number;
  statusBreakdown: Record<string, number>;
  ticketBreakdown: Record<string, number>;
  totalCustomers: number;
  totalDrivers: number;
}

export interface DriverUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  status: string;
  roles?: string[];
  createdAt?: string;
}

export interface SystemUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  status: string;
  roles?: string[];
  role?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/admin/dashboard/stats');
  },

  async getReports(): Promise<AdminReport> {
    return apiClient.get<AdminReport>('/api/admin/reports');
  },

  async getPendingShipments(): Promise<CustomerShipmentItem[]> {
    return apiClient.get<CustomerShipmentItem[]>('/api/admin/shipments/pending');
  },

  async getDrivers(): Promise<DriverUser[]> {
    return apiClient.get<DriverUser[]>('/api/admin/drivers');
  },

  async assignDriver(shipmentId: string, driverId: string): Promise<any> {
    return apiClient.post('/api/admin/assignments', { shipmentId, driverId });
  },

  async getUsers(page: number = 0, size: number = 50, role?: string): Promise<PageResponse<SystemUser> | SystemUser[]> {
    let url = `/api/admin/users?page=${page}&size=${size}`;
    if (role && role !== 'ALL') {
      url += `&role=${role}`;
    }
    return apiClient.get<PageResponse<SystemUser> | SystemUser[]>(url);
  }
};
