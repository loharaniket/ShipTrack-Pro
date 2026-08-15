import { apiClient } from '../apiClient';

export interface OrganizationResponse {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateOrganizationRequest {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrganizationMemberResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: string;
  joinedAt: string;
}

export interface OrganizationMemberListResponse {
  content: OrganizationMemberResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const organizationApi = {
  getAll: async (page: number = 0, size: number = 20): Promise<OrganizationListResponse> => {
    return apiClient.get(`/organizations?page=${page}&size=${size}`);
  },

  getCurrent: async (): Promise<OrganizationResponse> => {
    return apiClient.get('/organizations/current');
  },

  getById: async (id: string): Promise<OrganizationResponse> => {
    return apiClient.get(`/organizations/${id}`);
  },

  create: async (data: CreateOrganizationRequest): Promise<OrganizationResponse> => {
    return apiClient.post('/organizations', data);
  },

  update: async (id: string, data: UpdateOrganizationRequest): Promise<OrganizationResponse> => {
    return apiClient.patch(`/organizations/${id}`, data);
  },

  getMembers: async (id: string, page: number = 0, size: number = 20): Promise<OrganizationMemberListResponse> => {
    return apiClient.get(`/organizations/${id}/members?page=${page}&size=${size}`);
  },

  addMember: async (id: string, userId: string): Promise<OrganizationMemberResponse> => {
    return apiClient.post(`/organizations/${id}/members`, { userId });
  },

  removeMember: async (id: string, userId: string): Promise<void> => {
    return apiClient.delete(`/organizations/${id}/members/${userId}`);
  }
};
