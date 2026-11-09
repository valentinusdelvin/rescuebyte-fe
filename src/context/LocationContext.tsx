import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type GeolocationPermissionStatus =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable';

export interface LocationContextValue {
  coordinates: Coordinates;
  permissionStatus: GeolocationPermissionStatus;
  selectedCity: string;
  isLoading: boolean;
  error: string | null;
  requestLocation: (force?: boolean) => Promise<Coordinates | null>;
  setManualLocation: (coords: Coordinates, cityName?: string) => void;
}

export const DEFAULT_COORDINATES: Coordinates = {
  lat: -7.9526,
  lng: 112.6146,
}; // Malang center

export const STORAGE_COORDS_KEY = 'rescuebyte_user_coords';
export const STORAGE_CITY_KEY = 'rescuebyte_user_city';

// Guard level modul agar dialog prompt lokasi hanya muncul sekali saat inisialisasi
let hasInitializedStartupGeo = false;

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<Coordinates>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_COORDS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
            return parsed;
          }
        }
      } catch {
        // ignore parse error
      }
    }
    return DEFAULT_COORDINATES;
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCity = localStorage.getItem(STORAGE_CITY_KEY);
        if (savedCity) return savedCity;
      } catch {
        // ignore
      }
    }
    return 'Lokasi Saat Ini';
  });

  const [permissionStatus, setPermissionStatus] =
    useState<GeolocationPermissionStatus>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isRequestingRef = useRef<boolean>(false);

  const applyCoordinates = useCallback((coords: Coordinates, cityName?: string) => {
    setCoordinates(coords);
    if (cityName) {
      setSelectedCity(cityName);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_COORDS_KEY, JSON.stringify(coords));
        if (cityName) {
          localStorage.setItem(STORAGE_CITY_KEY, cityName);
        }
        window.dispatchEvent(
          new CustomEvent('rescuebyte_location_updated', {
            detail: { coordinates: coords, city: cityName },
          })
        );
      } catch {
        // ignore storage error
      }
    }
  }, []);

  const requestLocation = useCallback(
    async (force: boolean = false): Promise<Coordinates | null> => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        setPermissionStatus('unavailable');
        return null;
      }

      if (isRequestingRef.current && !force) {
        return coordinates;
      }

      isRequestingRef.current = true;
      setIsLoading(true);
      setError(null);

      return new Promise<Coordinates | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            isRequestingRef.current = false;
            setIsLoading(false);
            const liveCoords: Coordinates = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setPermissionStatus('granted');
            applyCoordinates(liveCoords, 'Lokasi Saat Ini');
            resolve(liveCoords);
          },
          (err) => {
            isRequestingRef.current = false;
            setIsLoading(false);
            setPermissionStatus('denied');
            setError(err.message || 'Izin lokasi tidak diberikan.');
            // Fallback mulus ke koordinat Malang tanpa memunculkan error atau toast mengganggu
            resolve(DEFAULT_COORDINATES);
          },
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 1000 * 60 * 5, // 5 minutes cache
          }
        );
      });
    },
    [applyCoordinates, coordinates]
  );

  const setManualLocation = useCallback(
    (coords: Coordinates, cityName?: string) => {
      applyCoordinates(coords, cityName || 'Lokasi Khusus');
      setError(null);
    },
    [applyCoordinates]
  );

  // Permintaan geolokasi otomatis saat aplikasi pertama kali dimuat
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (hasInitializedStartupGeo) return;
    hasInitializedStartupGeo = true;

    if (!navigator.geolocation) {
      setPermissionStatus('unavailable');
      return;
    }

    const checkAndPrompt = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setPermissionStatus(status.state as GeolocationPermissionStatus);

          if (status.state === 'granted') {
            await requestLocation(true);
            return;
          }

          if (status.state === 'denied') {
            // Izin lokasi sebelumnya ditolak; jangan paksa prompt ulang untuk mencegah peringatan browser
            setPermissionStatus('denied');
            return;
          }

          // Status 'prompt': lakukan permintaan izin lokasi non-blocking
          await requestLocation(false);
          return;
        }
      } catch {
        // Permissions query unsupported or failed, attempt direct prompt
      }

      await requestLocation(false);
    };

    void checkAndPrompt();
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        permissionStatus,
        selectedCity,
        isLoading,
        error,
        requestLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}

export default LocationContext;
