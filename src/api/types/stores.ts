import type { PaginationMeta } from './common';
import type { StoreStatusType } from './enums';

// DTO profil & jadwal toko

export interface CreateStoreRequest {
  address: string;
  city: string;
  description?: string;
  district: string;
  email: string;
  latitude: number;
  longitude: number;
  name: string;
  operational_days: number[];
  operational_end: string;
  operational_start: string;
  profile_picture_url?: string;
  whatsapp_number: string;
}

export interface UpdateStoreProfileRequest {
  address: string;
  city: string;
  description?: string;
  district: string;
  email: string;
  latitude: number;
  longitude: number;
  name: string;
  profile_picture_url?: string;
  whatsapp_number: string;
}

export interface UpdateStoreOperationalRequest {
  operational_days: number[];
  operational_end: string;
  operational_start: string;
  status: StoreStatusType;
}

export interface StoreResponse {
  address?: string;
  city?: string;
  created_at?: string;
  description?: string;
  district?: string;
  email?: string;
  id?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  operational_days?: number[];
  operational_end?: string;
  operational_start?: string;
  profile_picture_url?: string;
  status?: string;
  updated_at?: string;
  user_id?: string;
  whatsapp_number?: string;
}

export interface GetStoresResponse {
  meta?: PaginationMeta;
  stores?: StoreResponse[];
}
