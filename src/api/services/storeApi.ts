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
  /**
   * List public merchant stores
   * GET /api/v1/stores
   */
  async getStores(params?: GetStoresParams): Promise<GetStoresResponse> {
    const res = await apiClient.get<GetStoresResponse>('/api/v1/stores', { params });
    return res.data;
  },

  /**
   * Create seller store profile
   * POST /api/v1/stores
   */
  async createStore(data: CreateStoreRequest): Promise<StoreResponse> {
    const res = await apiClient.post<StoreResponse>('/api/v1/stores', data);
    return res.data;
  },

  /**
   * Update store operational hours and open days
   * PUT /api/v1/stores/me/operational
   */
  async updateStoreOperational(data: UpdateStoreOperationalRequest): Promise<StoreResponse> {
    const res = await apiClient.put<StoreResponse>('/api/v1/stores/me/operational', data);
    return res.data;
  },

  /**
   * Get authenticated merchant store profile
   * GET /api/v1/stores/me/profile
   */
  async getMyStoreProfile(): Promise<StoreResponse> {
    const res = await apiClient.get<StoreResponse>('/api/v1/stores/me/profile');
    return res.data;
  },

  /**
   * Update seller store profile details
   * PUT /api/v1/stores/me/profile
   */
  async updateMyStoreProfile(data: UpdateStoreProfileRequest): Promise<StoreResponse> {
    const res = await apiClient.put<StoreResponse>('/api/v1/stores/me/profile', data);
    return res.data;
  },

  /**
   * Toggle store operational status (ACTIVE / INACTIVE)
   * PATCH /api/v1/stores/me/status
   */
  async toggleStoreStatus(): Promise<StoreResponse> {
    const res = await apiClient.patch<StoreResponse>('/api/v1/stores/me/status');
    return res.data;
  },

  /**
   * Get single store detail by ID
   * GET /api/v1/stores/{id}
   */
  async getStoreDetail(storeId: string): Promise<StoreResponse> {
    const res = await apiClient.get<StoreResponse>(`/api/v1/stores/${storeId}`);
    return res.data;
  },
};

export default storeApi;
