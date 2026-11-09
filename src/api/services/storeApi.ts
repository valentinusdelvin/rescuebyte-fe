import apiClient from '../client';
import {
  CreateStoreRequest,
  GetStoresResponse,
  StoreResponse,
  UpdateStoreOperationalRequest,
  UpdateStoreProfileRequest,
} from '../types';

export interface GetStoresParams {
  page?: number;
  limit?: number;
  name?: string;
  nama?: string;
}

export const storeApi = {
  /** Ambil daftar toko merchant publik (GET /api/v1/stores). */
  async getStores(params?: GetStoresParams): Promise<GetStoresResponse> {
    const res = await apiClient.get<GetStoresResponse>('/api/v1/stores', { params });
    return res.data;
  },

  /** Daftarkan profil toko baru merchant (POST /api/v1/stores). */
  async createStore(data: CreateStoreRequest): Promise<StoreResponse> {
    const res = await apiClient.post<StoreResponse>('/api/v1/stores', data);
    return res.data;
  },

  /** Perbarui jam buka dan jadwal operasional toko (PUT /api/v1/stores/me/operational). */
  async updateStoreOperational(data: UpdateStoreOperationalRequest): Promise<StoreResponse> {
    const res = await apiClient.put<StoreResponse>('/api/v1/stores/me/operational', data);
    return res.data;
  },

  /** Ambil profil toko merchant yang sedang login (GET /api/v1/stores/me/profile). */
  async getMyStoreProfile(): Promise<StoreResponse> {
    const res = await apiClient.get<StoreResponse>('/api/v1/stores/me/profile');
    return res.data;
  },

  /** Perbarui informasi detail profil toko (PUT /api/v1/stores/me/profile). */
  async updateMyStoreProfile(data: UpdateStoreProfileRequest): Promise<StoreResponse> {
    const res = await apiClient.put<StoreResponse>('/api/v1/stores/me/profile', data);
    return res.data;
  },

  /** Ubah status operasional toko (ACTIVE / INACTIVE) (PATCH /api/v1/stores/me/status). */
  async toggleStoreStatus(): Promise<StoreResponse> {
    const res = await apiClient.patch<StoreResponse>('/api/v1/stores/me/status');
    return res.data;
  },

  /** Ambil detail toko publik berdasarkan ID (GET /api/v1/stores/{id}). */
  async getStoreDetail(storeId: string): Promise<StoreResponse> {
    const res = await apiClient.get<StoreResponse>(`/api/v1/stores/${storeId}`);
    return res.data;
  },
};

export default storeApi;
