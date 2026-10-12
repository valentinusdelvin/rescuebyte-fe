import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocodeOSM } from '../../services/locationService';
import { Coordinates, StoreLocation } from '../../types';

// Default Store Location Coordinates (Jl. Veteran No. 10, Merjosari, Lowokwaru, Malang)
const DEFAULT_LOCATION: StoreLocation = {
  lat: -7.9526,
  lng: 112.6146,
  address: 'Jl. Veteran No. 10, Merjosari',
  city: 'Kota Malang',
  district: 'Lowokwaru',
};

export interface StoreLocationMapProps {
  storeName?: string;
  coordinates?: Coordinates | StoreLocation;
  displayAddress?: string;
  onLocationChange?: (locationData: Partial<StoreLocation> & Coordinates) => void;
  onShowToast?: (message: string, duration?: number) => void;
}

/**
 * StoreLocationMap Component
 * Interactive store location map powered by Leaflet, CartoCDN raster tiles,
 * draggable custom marker, GPS geolocation, and OSM reverse geocoding.
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/styling.md.
 */
export function StoreLocationMap({
  storeName = 'Toko Reza',
  coordinates = DEFAULT_LOCATION,
  displayAddress,
  onLocationChange,
  onShowToast,
}: StoreLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  const [isTilesLoaded, setIsTilesLoaded] = useState<boolean>(false);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);

  // Keep latest references inside useEffect to avoid updating refs during render
  const onLocationChangeRef = useRef(onLocationChange);
  const onShowToastRef = useRef(onShowToast);
  const displayAddressRef = useRef(displayAddress);
  const storeNameRef = useRef(storeName);
  const initialCenterRef = useRef({
    lat: coordinates.lat,
    lng: coordinates.lng,
    storeName,
  });

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
    onShowToastRef.current = onShowToast;
    displayAddressRef.current = displayAddress;
    storeNameRef.current = storeName;
  }, [onLocationChange, onShowToast, displayAddress, storeName]);

  const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY as string | undefined;
  const hasValidKey =
    Boolean(CARTO_KEY) &&
    !CARTO_KEY?.includes('your_carto') &&
    !CARTO_KEY?.includes('placeholder');
  const tileUrl = hasValidKey
    ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const initialLat = initialCenterRef.current.lat;
      const initialLng = initialCenterRef.current.lng;
      const initialStore = initialCenterRef.current.storeName;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      const cartoVoyager = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      cartoVoyager.on('tileloadstart', () => {
        setIsTilesLoaded(true);
      });

      // Custom High-DPI Marker Pin
      const customPinIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-pin-wrapper">
            <div class="marker-pin-pulse"></div>
            <div class="marker-pin">
              <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16C0 26 16 40 16 40C16 40 32 26 32 16C32 7.16 24.84 0 16 0Z" fill="#dc2626"/>
                <circle cx="16" cy="15" r="5.5" fill="#ffffff"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customPinIcon,
        draggable: true,
        title: `${initialStore} - Geser pin untuk atur lokasi`,
      }).addTo(map);

      markerInstanceRef.current = marker;

      marker.bindPopup(`
        <strong>${storeNameRef.current}</strong><br>
        <span style="color: #4b5563;">${displayAddressRef.current || DEFAULT_LOCATION.address}</span>
      `);

      // Handle marker drag end
      marker.on('dragend', async (e: L.LeafletEvent) => {
        const targetMarker = e.target as L.Marker;
        const newPos = targetMarker.getLatLng();
        if (onShowToastRef.current) onShowToastRef.current('Mencari alamat titik pin...', 1500);

        const geoInfo = await reverseGeocodeOSM(newPos.lat, newPos.lng);
        if (geoInfo) {
          const streetAddr = geoInfo.street
            ? `${geoInfo.street}${geoInfo.suburb ? ', ' + geoInfo.suburb : ''}`
            : geoInfo.displayName.split(',')[0];

          if (onLocationChangeRef.current) {
            onLocationChangeRef.current({
              lat: newPos.lat,
              lng: newPos.lng,
              address: streetAddr,
              city: geoInfo.city,
              district: geoInfo.district,
            });
          }
          if (onShowToastRef.current) onShowToastRef.current(`Alamat disesuaikan: ${streetAddr}`);
        } else {
          if (onLocationChangeRef.current) {
            onLocationChangeRef.current({
              lat: newPos.lat,
              lng: newPos.lng,
            });
          }
          if (onShowToastRef.current)
            onShowToastRef.current(`Pin dipindahkan: ${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`);
        }
      });

      // Handle map click
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const clickPos = e.latlng;
        marker.setLatLng(clickPos);

        const geoInfo = await reverseGeocodeOSM(clickPos.lat, clickPos.lng);
        if (geoInfo) {
          const streetAddr = geoInfo.street
            ? `${geoInfo.street}${geoInfo.suburb ? ', ' + geoInfo.suburb : ''}`
            : geoInfo.displayName.split(',')[0];

          if (onLocationChangeRef.current) {
            onLocationChangeRef.current({
              lat: clickPos.lat,
              lng: clickPos.lng,
              address: streetAddr,
              city: geoInfo.city,
              district: geoInfo.district,
            });
          }
          if (onShowToastRef.current) onShowToastRef.current(`Alamat disesuaikan: ${streetAddr}`);
        } else {
          if (onLocationChangeRef.current) {
            onLocationChangeRef.current({
              lat: clickPos.lat,
              lng: clickPos.lng,
            });
          }
          if (onShowToastRef.current) onShowToastRef.current('Pin dipindahkan ke koordinat baru');
        }
      });

      // Force recalculate map size once loaded
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } catch (err) {
      console.warn('Leaflet Carto map initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tileUrl]);

  // Synchronize map & marker when external coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerInstanceRef.current) return;

    const currentMarkerPos = markerInstanceRef.current.getLatLng();
    if (
      Math.abs(currentMarkerPos.lat - coordinates.lat) > 0.0001 ||
      Math.abs(currentMarkerPos.lng - coordinates.lng) > 0.0001
    ) {
      markerInstanceRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      mapInstanceRef.current.flyTo([coordinates.lat, coordinates.lng], 16, { duration: 1.2 });
    }

    markerInstanceRef.current.setPopupContent(`
      <strong>${storeName}</strong><br>
      <span style="color: #4b5563;">${displayAddress || DEFAULT_LOCATION.address}</span>
    `);
  }, [coordinates.lat, coordinates.lng, displayAddress, storeName]);

  // Handle GPS Location Button
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      if (onShowToast) onShowToast('Fitur GPS tidak didukung di peramban ini.');
      return;
    }

    if (onShowToast) onShowToast('Mencari posisi perangkat Anda...');
    setIsLocatingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocatingGps(false);
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const geoInfo = await reverseGeocodeOSM(userLat, userLng);
        if (geoInfo) {
          const streetAddr = geoInfo.street
            ? `${geoInfo.street}${geoInfo.suburb ? ', ' + geoInfo.suburb : ''}`
            : geoInfo.displayName.split(',')[0];

          if (onLocationChange) {
            onLocationChange({
              lat: userLat,
              lng: userLng,
              address: streetAddr,
              city: geoInfo.city,
              district: geoInfo.district,
            });
          }
        } else {
          if (onLocationChange) {
            onLocationChange({
              lat: userLat,
              lng: userLng,
            });
          }
        }

        if (onShowToast) onShowToast('Posisi GPS berhasil diperbarui ke lokasi Anda!');
      },
      (error) => {
        setIsLocatingGps(false);
        console.warn('Geolocation error:', error);
        if (onShowToast) onShowToast('Tidak dapat mengakses lokasi perangkat. Periksa izin peramban.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // Handle Reset to Default Location
  const handleResetMap = () => {
    if (onLocationChange) {
      onLocationChange({
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng,
        address: DEFAULT_LOCATION.address,
        city: DEFAULT_LOCATION.city,
        district: DEFAULT_LOCATION.district,
      });
    }
    if (onShowToast) onShowToast('Lokasi peta diatur ulang ke alamat toko awal.');
  };

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;

  return (
    <div className="profile-outline-card" id="card-lokasi-toko">
      <div className="card-header-with-actions">
        <h2 className="card-outline-title">Lokasi Toko</h2>
        <div className="location-header-tools">
          <button
            type="button"
            className="btn-location-tool"
            id="btn-locate-me"
            title="Gunakan Lokasi Perangkat (GPS)"
            aria-label="Gunakan Lokasi Perangkat"
            disabled={isLocatingGps}
            onClick={handleLocateMe}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span>{isLocatingGps ? 'Mencari...' : 'GPS'}</span>
          </button>
          <button
            type="button"
            className="btn-location-tool"
            id="btn-reset-map"
            title="Atur Ulang ke Alamat Toko"
            aria-label="Atur Ulang ke Alamat Toko"
            onClick={handleResetMap}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="store-location-content">
        {/* Interactive Map Wrapper */}
        <div className="store-map-wrapper" id="store-map-wrapper">
          {/* Leaflet Map Mount Container */}
          <div
            ref={mapContainerRef}
            id="store-map"
            className="store-map-element"
            role="region"
            aria-label="Peta Interaktif Lokasi Toko"
          />

          {/* Visual Fallback Map (Visible before tiles load / offline) */}
          {!isTilesLoaded && (
            <div className="map-fallback-preview" id="map-fallback-preview" aria-hidden="true">
              <svg className="map-vector-bg" viewBox="0 0 400 220" preserveAspectRatio="none">
                <rect width="400" height="220" fill="#e9edf2" />
                <path d="M-10 60 Q120 40 220 70 T410 50" stroke="#ffffff" strokeWidth="20" fill="none" />
                <path d="M120 -10 L160 230" stroke="#fcd34d" strokeWidth="12" fill="none" />
                <path d="M-10 130 L410 110" stroke="#fde047" strokeWidth="14" fill="none" />
                <path d="M-10 170 Q140 180 280 150 T410 190" stroke="#ffffff" strokeWidth="10" fill="none" />
                <path d="M290 -10 Q270 100 320 230" stroke="#cbd5e1" strokeWidth="10" fill="none" />
                <path d="M20 15 C50 10 100 20 90 70 C70 90 20 80 15 50 Z" fill="#bbf7d0" opacity="0.9" />
                <path d="M230 130 C270 120 340 135 330 180 C300 200 240 190 225 160 Z" fill="#bbf7d0" opacity="0.9" />
              </svg>
              <div className="fallback-pin-center">
                <div className="fallback-pin-badge">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                  </svg>
                </div>
                <span className="fallback-pin-label">{storeName}</span>
              </div>
            </div>
          )}

          {/* Floating Map Tip */}
          <div className="map-floating-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Geser pin atau klik peta untuk atur lokasi</span>
          </div>
        </div>

        {/* Address Bar Info */}
        <div className="location-address-bar" id="location-address-bar" tabIndex={0} role="region" aria-label="Informasi Alamat Toko">
          <div className="location-pin-badge" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" fill="#ffffff" />
            </svg>
          </div>
          <div className="location-address-details">
            <span className="location-address-title">Alamat Toko</span>
            <span className="location-address-text" id="map-address-display">
              {displayAddress || DEFAULT_LOCATION.address}
            </span>
          </div>
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="location-open-link"
            id="link-open-gmaps"
            title="Buka di Google Maps"
            aria-label="Buka di Google Maps"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
