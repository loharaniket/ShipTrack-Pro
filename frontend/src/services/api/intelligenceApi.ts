import { apiClient } from '../apiClient';

export const intelligenceApi = {
  calculateEta: (shipmentId: string) => apiClient.get(`/intelligence/eta/calculate/${shipmentId}`),
  getAtRiskShipments: () => apiClient.get('/intelligence/eta/at-risk'),
  getEtaKpis: () => apiClient.get('/intelligence/eta/kpis'),
};
