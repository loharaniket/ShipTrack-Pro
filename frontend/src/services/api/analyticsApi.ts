import { apiClient } from '../apiClient';

export const analyticsApi = {
  getExecutiveKpis: () => apiClient.get('/analytics/executive-kpis'),
  getVolumeTrend: (days: number = 30) => apiClient.get(`/analytics/charts/volume-trend?days=${days}`),
  getDelayDistribution: () => apiClient.get('/analytics/charts/delay-distribution'),
  generateReport: (data: any) => apiClient.post('/analytics/reports/generate', data),
  getSystemHealth: () => apiClient.get('/analytics/system-health'),
};
