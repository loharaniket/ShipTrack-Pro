import { apiClient } from './apiClient';

export interface AddressDto {
  id?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface GeocodeResultDto {
  displayName: string;
  latitude: number;
  longitude: number;
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export const addressService = {
  async searchAddresses(query: string): Promise<GeocodeResultDto[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const results = await apiClient.get<GeocodeResultDto[]>(
        `/api/v1/addresses/search?query=${encodeURIComponent(query.trim())}`
      );
      return results || [];
    } catch (e) {
      console.warn('Address search failed:', e);
      return [];
    }
  },

  async geocodeAddress(rawAddress: string): Promise<GeocodeResultDto | null> {
    if (!rawAddress || !rawAddress.trim()) return null;
    try {
      return await apiClient.post<GeocodeResultDto>('/api/v1/addresses/geocode', {
        rawAddress: rawAddress.trim()
      });
    } catch (e) {
      console.warn('Geocoding failed:', e);
      return null;
    }
  }
};
