import { apiClient } from '../apiClient';

export const searchApi = {
  globalSearch: (query: string, type?: string) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return apiClient.get(`/search?${params.toString()}`);
  },
};
