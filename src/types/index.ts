/**
 * Shared TypeScript types and interfaces for RescueBite frontend.
 * Follows guidelines defined in .agents/docs/architecture.md and .agents/docs/typescript.md.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StoreLocation extends Coordinates {
  address: string;
  city: string;
  district: string;
}

export interface POIItem extends Coordinates {
  name: string;
  displayName: string;
  street: string;
  suburb: string;
  district: string;
  city: string;
  state: string;
}

export interface OSMSuggestion extends Coordinates {
  id: string | number;
  displayName: string;
  street: string;
  suburb: string;
  district: string;
  city: string;
  state: string;
}

export type ActiveViewId = 'view-beranda' | 'view-profil' | string;

export type DayKey = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export type DaysSchedule = Record<DayKey, boolean>;

export interface DayItem {
  key: DayKey;
  label: string;
}

export interface FilterSummaryItem {
  total: string;
  orders: string;
  toastMsg: string;
}

export type PerformanceFilterKey = 'bulan-ini' | 'minggu-ini' | 'tahun-ini';
