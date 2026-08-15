import { apiClient } from '../apiClient';

export const supportApi = {
  createEscalation: (data: any) => apiClient.post('/support/escalate', data),
  getEscalations: () => apiClient.get('/support/escalations'),
};
