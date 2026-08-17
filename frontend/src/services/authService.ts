import { Role, User } from '@/types/domain';
import { apiClient } from './apiClient';

const ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: 'Administrator',
  DRIVER: 'Driver',
  CUSTOMER: 'Customer',
  SUPPORT_AGENT: 'SupportAgent',
  BUSINESS_CLIENT: 'BusinessClient',
};

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
    try {
      const data: any = await apiClient.post('/auth/login', { email, password });
      
      const roleStr = data.user?.role || (data.user?.roles && data.user.roles[0]) || 'CUSTOMER';
      const primaryRole = ROLE_MAP[roleStr.toUpperCase()] || 'Customer';

      const user: User = {
        id: data.user.id,
        name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
        email: data.user.email,
        role: primaryRole,
      };

      const token = data.accessToken || data.token;
      localStorage.setItem('accessToken', token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return { user, accessToken: token };
    } catch (e: any) {
      throw new Error(e.message || 'Invalid email or password');
    }
  },

  async register(data: { firstName: string; lastName: string; email: string; password: string; phone?: string }): Promise<any> {
    try {
      const responseData: any = await apiClient.post('/auth/register', data);
      return responseData;
    } catch (e: any) {
      throw new Error(e.message || 'Registration failed');
    }
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (e) {
        console.error('Error during logout API call', e);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const data: any = await apiClient.get('/auth/me');
      if (!data) return null;

      const roleStr = data.role || (data.roles && data.roles[0]) || 'CUSTOMER';
      const primaryRole = ROLE_MAP[roleStr.toUpperCase()] || 'Customer';

      return {
        id: data.id,
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        email: data.email,
        role: primaryRole,
      };
    } catch (e) {
      console.error('Error fetching current user', e);
      return null;
    }
  }
};

