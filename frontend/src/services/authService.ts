import { Role, User } from '@/types/domain';
import { apiClient } from './apiClient';

const ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: 'Administrator',
  BUSINESS_CLIENT: 'BusinessClient',
  DRIVER: 'Driver',
  CUSTOMER: 'Customer',
};

export const authService = {
  async login(email: string, password: string): Promise<{user: User, accessToken: string}> {
    try {
      const data: any = await apiClient.post('/auth/login', { email, password });
      
      const backendRoles: string[] = data.user.roles || [];
      const primaryRole = backendRoles.length > 0 ? ROLE_MAP[backendRoles[0]] || 'Customer' : 'Customer';

      const user: User = {
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: primaryRole,
      };

      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return { user, accessToken: data.accessToken };
    } catch (e: any) {
      throw new Error(e.message || 'Invalid email or password');
    }
  },

  async register(data: any): Promise<{user: User, accessToken: string}> {
    try {
      const responseData: any = await apiClient.post('/auth/register', data);
      
      const backendRoles: string[] = responseData.user.roles || [];
      const primaryRole = backendRoles.length > 0 ? ROLE_MAP[backendRoles[0]] || 'Customer' : 'Customer';

      const user: User = {
        id: responseData.user.id,
        name: `${responseData.user.firstName} ${responseData.user.lastName}`,
        email: responseData.user.email,
        role: primaryRole,
      };

      localStorage.setItem('accessToken', responseData.accessToken);
      if (responseData.refreshToken) {
          localStorage.setItem('refreshToken', responseData.refreshToken);
      }
      
      return { user, accessToken: responseData.accessToken };
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
    try {
      const data: any = await apiClient.get('/auth/me');
      
      const backendRoles: string[] = data.roles || [];
      const primaryRole = backendRoles.length > 0 ? ROLE_MAP[backendRoles[0]] || 'Customer' : 'Customer';

      return {
          id: data.id,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: primaryRole,
      };
    } catch (e) {
      console.error('Error fetching current user', e);
      return null;
    }
  }
};
