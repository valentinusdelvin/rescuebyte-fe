import apiClient from '../client';
import { EnumsResponse, HealthResponse } from '../types';

export const enumApi = {
  /** Ambil enum sistem backend (jenis kelamin, role, status aktif) (GET /api/v1/enums). */
  async getEnums(types?: string): Promise<EnumsResponse> {
    const res = await apiClient.get<EnumsResponse>('/api/v1/enums', {
      params: types ? { types } : undefined,
    });
    return res.data;
  },

  /** Cek status kesehatan server backend (GET /health). */
  async checkHealth(): Promise<HealthResponse> {
    const res = await apiClient.get<HealthResponse>('/health');
    return res.data;
  },
};

export default enumApi;
