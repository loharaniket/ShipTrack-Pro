import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shiptrack_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('shiptrack_refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:8080/api/v1/auth/refresh', { refreshToken });
          const newToken = res.data.data.token;
          const newRefreshToken = res.data.data.refreshToken;
          
          localStorage.setItem('shiptrack_token', newToken);
          localStorage.setItem('shiptrack_refresh_token', newRefreshToken);
          
          // Update the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log them out
          localStorage.removeItem('shiptrack_token');
          localStorage.removeItem('shiptrack_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
