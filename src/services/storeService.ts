import { api } from './api';
import { extractApiErrorMessage } from './authService';

export interface StoreProfileData {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  profile_picture_url?: string;
  whatsapp_number: string;
  email: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  status?: 'ACTIVE' | 'INACTIVE';
  operational_start?: string;
  operational_end?: string;
  operational_days?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface UpdateStoreProfilePayload {
  name: string;
  description?: string;
  profile_picture_url?: string;
  whatsapp_number: string;
  email: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface UpdateStoreOperationalPayload {
  status: 'ACTIVE' | 'INACTIVE';
  operational_start: string;
  operational_end: string;
  operational_days: number[];
}

export interface CreateStorePayload extends UpdateStoreProfilePayload {
  operational_start: string;
  operational_end: string;
  operational_days: number[];
}

/**
 * Fetch current seller's store profile via GET /api/v1/stores/me/profile
 */
export async function getStoreProfile(): Promise<StoreProfileData> {
  try {
    const response = await api.get('/api/v1/stores/me/profile');
    const payload = response.data?.payload;
    if (!payload) {
      throw new Error('Data profil toko tidak ditemukan dalam respon server.');
    }
    return payload as StoreProfileData;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal mengambil data profil toko.');
    throw new Error(message);
  }
}

/**
 * Update basic store profile details via PUT /api/v1/stores/me/profile
 */
export async function updateStoreProfile(data: UpdateStoreProfilePayload): Promise<StoreProfileData> {
  try {
    const response = await api.put('/api/v1/stores/me/profile', {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      profile_picture_url: data.profile_picture_url || '',
      whatsapp_number: data.whatsapp_number.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      district: data.district.trim(),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    });

    const payload = response.data?.payload;
    if (!payload) {
      throw new Error('Gagal memperbarui profil toko.');
    }
    return payload as StoreProfileData;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal menyimpan profil toko.');
    throw new Error(message);
  }
}

/**
 * Update store operational schedule & active status via PUT /api/v1/stores/me/operational
 */
export async function updateStoreOperational(
  data: UpdateStoreOperationalPayload
): Promise<StoreProfileData> {
  try {
    const response = await api.put('/api/v1/stores/me/operational', {
      status: data.status,
      operational_start: data.operational_start,
      operational_end: data.operational_end,
      operational_days: data.operational_days,
    });

    const payload = response.data?.payload;
    if (!payload) {
      throw new Error('Gagal memperbarui informasi operasional toko.');
    }
    return payload as StoreProfileData;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal menyimpan informasi operasional toko.');
    throw new Error(message);
  }
}

/**
 * Toggle store status between ACTIVE and INACTIVE via PATCH /api/v1/stores/me/status
 */
export async function toggleStoreStatus(): Promise<StoreProfileData> {
  try {
    const response = await api.patch('/api/v1/stores/me/status');
    const payload = response.data?.payload;
    if (!payload) {
      throw new Error('Gagal mengubah status aktif toko.');
    }
    return payload as StoreProfileData;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal mengubah status toko.');
    throw new Error(message);
  }
}

/**
 * Create a new store if none exists yet via POST /api/v1/stores
 */
export async function createStore(data: CreateStorePayload): Promise<StoreProfileData> {
  try {
    const response = await api.post('/api/v1/stores', {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      profile_picture_url: data.profile_picture_url || '',
      whatsapp_number: data.whatsapp_number.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      district: data.district.trim(),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      operational_start: data.operational_start,
      operational_end: data.operational_end,
      operational_days: data.operational_days,
    });

    const payload = response.data?.payload;
    if (!payload) {
      throw new Error('Gagal mendaftarkan profil toko baru.');
    }
    return payload as StoreProfileData;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal membuat toko baru.');
    throw new Error(message);
  }
}

