const API_BASE_URL = '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Ignore JSON parse error if response is not JSON
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

function getHeaders(contentType: string = 'application/json'): HeadersInit {
  const headers: HeadersInit = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function fetchWithAuth(url: string, options: RequestInit): Promise<Response> {
  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    // If no refresh token or the original request WAS the refresh call, don't loop
    if (!refreshToken || url.includes('/auth/refresh')) {
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshResponse.ok) {
          const result = await refreshResponse.json();
          // Assuming backend wraps response in ApiResponse<T>
          const newAccessToken = result.data?.accessToken || result.accessToken;
          const newRefreshToken = result.data?.refreshToken || result.refreshToken;
          
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            onRefreshed(newAccessToken);
          } else {
            throw new Error("No access token in refresh response");
          }
        } else {
          // Refresh failed (expired or invalid), log user out
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          onRefreshed('');
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onRefreshed('');
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for the refresh to complete
    const newToken = await new Promise<string>(resolve => {
      subscribeTokenRefresh(token => resolve(token));
    });

    if (newToken) {
      // Retry the original request with the new token
      const newHeaders = new Headers(options.headers);
      newHeaders.set('Authorization', `Bearer ${newToken}`);
      options.headers = newHeaders;
      response = await fetch(url, options);
    } else {
      // Force redirect to login if refresh token died
      window.location.href = '/auth/login';
    }
  }

  return response;
}

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
  
  postForm: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const headers = getHeaders('');
    delete (headers as any)['Content-Type'];
    
    const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<T>(response);
  }
};
