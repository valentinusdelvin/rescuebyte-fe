import { CustomerMysteryBox } from '../../../types';
import { PublicProductItem } from '../../../services/productService';
import { formatDistanceKm } from '../../../services/locationService';
import cardMonsieurSpoon from '../../../assets/customer/card-monsieur-spoon.jpg';

export interface MarketplaceBoxItem extends CustomerMysteryBox {
  categoryBadge: string;
  city: string;
  categoryType: 'pastry' | 'heavy' | 'beverage' | 'snack';
  productName?: string;
  stock?: number;
  distanceKm?: number;
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Malang': { lat: -7.9526, lng: 112.6146 },
  'Surabaya': { lat: -7.2575, lng: 112.7521 },
  'Jakarta Selatan': { lat: -6.2615, lng: 106.8106 },
  'Bandung': { lat: -6.9175, lng: 107.6191 },
  'Yogyakarta': { lat: -7.7956, lng: 110.3695 },
};

export const DEFAULT_COORDS = { lat: -7.9526, lng: 112.6146 };

export function mapPublicProductToItem(p: PublicProductItem, fallbackCity = 'Malang'): MarketplaceBoxItem {
  const normalPrice = p.normal_price || 0;
  const rescuePrice = p.rescue_price || 0;
  const discount =
    typeof p.discount_percentage === 'number' && p.discount_percentage > 0
      ? p.discount_percentage
      : normalPrice > 0
        ? Math.round(((normalPrice - rescuePrice) / normalPrice) * 100)
        : 0;

  let pickup = '';
  if (p.pickup_time) {
    pickup = p.pickup_time.replace(/^Ambil:\s*/i, '').trim();
  } else if (p.operational_start && p.operational_end) {
    const start = p.operational_start.slice(0, 5).replace(':', '.');
    const end = p.operational_end.slice(0, 5).replace(':', '.');
    pickup = `${start} – ${end} WIB`;
  } else {
    pickup = '08.00 – 23.59 WIB';
  }

  const distanceText = formatDistanceKm(p.distance_km);

  const realProductName = p.name || 'Surprise Box';
  let realStoreName = p.store_name || '';
  if (!realStoreName) {
    try {
      realStoreName = localStorage.getItem('rescuebyte_store_name') || 'Toko Rejak';
    } catch {
      realStoreName = 'Toko Rejak';
    }
  }

  return {
    id: p.id,
    storeId: p.store_id,
    storeName: realStoreName,
    productName: realProductName,
    category: realProductName,
    categoryBadge: realProductName,
    categoryType: 'heavy',
    city: fallbackCity,
    stock: p.stock ?? 1,
    remainingBoxesText: `Sisa ${p.stock ?? 1} Box`,
    distanceText,
    distanceKm: typeof p.distance_km === 'number' ? p.distance_km : 9999,
    discountPercent: discount,
    originalPrice: normalPrice,
    rescuePrice: rescuePrice,
    pickupTime: pickup,
    description:
      p.description ||
      'Berisi 1 porsi makanan berat surplus hari ini dengan rasa dan kualitas terjamin.',
    tags: [realStoreName, realProductName, 'Halal MUI', 'Surplus Harian'],
    imageSrc: p.main_image_url || cardMonsieurSpoon,
    rating: (p as any).rating ?? 0,
    reviewCount: (p as any).review_count ?? (p as any).reviewCount ?? 0,
  };
}

export const MARKETPLACE_CACHE_KEY = 'rescuebyte_cached_marketplace_products';

export function getInitialMarketplaceProducts(): MarketplaceBoxItem[] {
  // Use the last successful public API response for an instant first render.
  try {
    const cached = localStorage.getItem(MARKETPLACE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export const CITIES = ['Malang', 'Jakarta Selatan', 'Surabaya', 'Bandung', 'Yogyakarta', 'Semua Kota'];

export const DISTANCE_OPTIONS = [
  { value: 'semua', label: 'Semua Jarak' },
  { value: '<1km', label: 'Kurang dari 1km' },
  { value: '<5km', label: 'Kurang dari 5km' },
  { value: '<10km', label: 'Kurang dari 10km' },
];

export type SortField = 'jam_ambil' | 'lokasi' | 'ulasan';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  id: SortField;
  label: string;
  defaultOrder: SortOrder;
  ascLabel: string;
  descLabel: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  {
    id: 'lokasi',
    label: 'Lokasi',
    defaultOrder: 'asc',
    ascLabel: 'Jarak Terdekat mulai 0 km',
    descLabel: 'Jarak Terjauh',
  },
  {
    id: 'jam_ambil',
    label: 'Jam Ambil',
    defaultOrder: 'asc',
    ascLabel: 'Paling Awal Pagi / Sore',
    descLabel: 'Paling Akhir Malam',
  },
  {
    id: 'ulasan',
    label: 'Ulasan',
    defaultOrder: 'desc',
    ascLabel: 'Rating Terendah',
    descLabel: 'Rating Tertinggi 5.0',
  },
];

/**
 * Parse start minutes from pickup schedule string (e.g. "19:45 - 21:00" -> 1185)
 */
export function parsePickupMinutes(pickupTimeStr?: string): number {
  if (!pickupTimeStr) return 9999;
  const match = pickupTimeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

