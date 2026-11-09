import { useLocationContext } from '../context/LocationContext';

export interface UseGeolocationReturn {
  coordinates: { lat: number; lng: number };
  permissionStatus: 'unknown' | 'prompt' | 'granted' | 'denied' | 'unavailable';
  selectedCity: string;
  isLoading: boolean;
  error: string | null;
  requestLocation: (force?: boolean) => Promise<{ lat: number; lng: number } | null>;
  setManualLocation: (coords: { lat: number; lng: number }, cityName?: string) => void;
}

/**
 * Custom hook untuk kontrol dan pemantauan geolokasi terpusat (koordinat live, status izin, dan fallback otomatis).
 */
export function useGeolocation(): UseGeolocationReturn {
  return useLocationContext();
}

export default useGeolocation;
