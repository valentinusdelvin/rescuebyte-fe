/**
 * Location Data & OpenStreetMap Geocoding Service for RescueBite
 * Provides Indonesian administrative data (Kota & Kecamatan) and
 * OpenStreetMap (Nominatim & Photon) search/reverse geocoding.
 * Complies with .agents/docs/api.md and .agents/docs/typescript.md.
 */

import { Coordinates } from '../types';
import { INDONESIA_CITIES, LOCAL_POPULAR_POIS } from './locationData';
import type { CityItem, KecamatanItem, OSMSearchResult, ReverseGeocodeResult } from './locationData';
export { INDONESIA_CITIES, LOCAL_POPULAR_POIS } from './locationData';
export type { CityItem, KecamatanItem, OSMSearchResult, ReverseGeocodeResult } from './locationData';

/**
 * Filter Cities by prefix / query
 */
export function searchCities(query: string): CityItem[] {
  if (!query) return INDONESIA_CITIES.slice(0, 8);
  const clean = query.trim().toLowerCase();

  // Prioritize startsWith, then includes
  const startsWith = INDONESIA_CITIES.filter(
    (c) =>
      c.name.toLowerCase().startsWith(clean) ||
      c.name.toLowerCase().replace(/^(kota|kabupaten)\s+/i, '').startsWith(clean),
  );

  const includes = INDONESIA_CITIES.filter(
    (c) =>
      !startsWith.includes(c) &&
      (c.name.toLowerCase().includes(clean) || c.province.toLowerCase().includes(clean)),
  );

  return [...startsWith, ...includes];
}

/**
 * Get districts (kecamatan) for a selected city
 */
export function getKecamatansForCity(cityName: string): KecamatanItem[] {
  if (!cityName) return [];
  const clean = cityName.trim().toLowerCase();
  const city = INDONESIA_CITIES.find(
    (c) =>
      c.name.toLowerCase() === clean ||
      c.name.toLowerCase().replace(/^(kota|kabupaten)\s+/i, '') ===
      clean.replace(/^(kota|kabupaten)\s+/i, ''),
  );

  return city ? city.kecamatans : [];
}

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    road?: string;
    suburb?: string;
    village?: string;
    district?: string;
    city?: string;
    town?: string;
    county?: string;
  };
}

/**
 * OpenStreetMap Nominatim Live Search (100% Free)
 */
export async function searchOpenStreetMap(
  query: string,
  nearCoords: Coordinates | null = null,
): Promise<OSMSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const results: OSMSearchResult[] = [];

  // 1. Check local POI matches first (instant response)
  const localMatches = LOCAL_POPULAR_POIS.filter(
    (poi) =>
      poi.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      poi.displayName.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      poi.street.toLowerCase().includes(cleanQuery.toLowerCase()),
  );

  localMatches.forEach((poi) => {
    results.push({
      title: poi.name,
      subtitle: poi.displayName,
      street: poi.street,
      suburb: poi.suburb,
      district: poi.district,
      city: poi.city,
      lat: poi.lat,
      lng: poi.lng,
      source: 'local',
    });
  });

  // 2. Fetch Photon by Komoot (Fast autocomplete OSM search)
  try {
    let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=5`;
    if (nearCoords && nearCoords.lat && nearCoords.lng) {
      photonUrl += `&lat=${nearCoords.lat}&lon=${nearCoords.lng}`;
    }

    const photonRes = await fetch(photonUrl, { signal: AbortSignal.timeout(4000) });
    if (photonRes.ok) {
      const data = (await photonRes.json()) as { features?: PhotonFeature[] };
      if (data && data.features) {
        data.features.forEach((f) => {
          const props = f.properties || {};
          const coords = f.geometry && f.geometry.coordinates;
          if (coords && coords.length >= 2) {
            const title = props.name || props.street || cleanQuery;
            const parts = [props.street, props.district, props.city, props.state, props.country].filter(
              Boolean,
            );

            const subtitle = parts.join(', ') || props.country || 'Indonesia';

            const alreadyExists = results.some(
              (r) =>
                Math.abs(r.lat - coords[1]) < 0.001 && Math.abs(r.lng - coords[0]) < 0.001,
            );

            if (!alreadyExists) {
              results.push({
                title: title,
                subtitle: subtitle,
                street: props.street || props.name || '',
                suburb: props.district || '',
                district: props.district || '',
                city: props.city || '',
                lat: coords[1],
                lng: coords[0],
                source: 'osm',
              });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Photon autocomplete query failed or timed out:', err);
  }

  // 3. Fetch Nominatim OpenStreetMap (Comprehensive Indonesian address search)
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery,
    )}&countrycodes=id&limit=5&addressdetails=1`;

    const nomRes = await fetch(nominatimUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RescueBite-App/1.0 (contact@rescuebite.app)',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (nomRes.ok) {
      const nomData = (await nomRes.json()) as NominatimItem[];
      if (Array.isArray(nomData)) {
        nomData.forEach((item) => {
          const addr = item.address || {};
          const title = item.name || addr.road || addr.suburb || cleanQuery;
          const subtitle = item.display_name;

          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          const alreadyExists = results.some(
            (r) => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001,
          );

          if (!alreadyExists) {
            results.push({
              title: title,
              subtitle: subtitle,
              street: addr.road || title,
              suburb: addr.suburb || addr.village || '',
              district: addr.district || addr.suburb || '',
              city: addr.city || addr.town || addr.county || '',
              lat: lat,
              lng: lng,
              source: 'osm',
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Nominatim search failed or timed out:', err);
  }

  return results;
}

interface NominatimReverseResponse {
  display_name: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    district?: string;
    city_district?: string;
    city?: string;
    town?: string;
    county?: string;
  };
}

/**
 * Reverse Geocode via Nominatim (Free)
 */
export async function reverseGeocodeOSM(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RescueBite-App/1.0 (contact@rescuebite.app)',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = (await res.json()) as NominatimReverseResponse;
      const addr = data.address || {};

      const street = addr.road || addr.neighbourhood || addr.suburb || '';
      const suburb = addr.suburb || addr.village || '';
      const district = addr.district || addr.city_district || suburb || '';
      const city = addr.city || addr.town || addr.county || 'Kota Malang';

      return {
        displayName: data.display_name,
        street: street,
        suburb: suburb,
        district: district,
        city: city,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }

  return null;
}

/**
 * Great-circle distance using Haversine formula (matches backend distance_km calculation).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Format distance in km cleanly matching backend style (e.g. '0.2 km', '2.1 km').
 */
export function formatDistanceKm(distanceKm?: number | null): string {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm) || distanceKm < 0) {
    return '0.0 km';
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Retrieve saved user coordinates from localStorage or fallback to default coordinates.
 */
export function getUserCoordinates(): { lat: number; lng: number } {
  try {
    const saved = localStorage.getItem('rescuebyte_user_coords');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
        return parsed;
      }
    }
  } catch {}
  return { lat: -7.9526, lng: 112.6146 };
}

