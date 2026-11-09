import apiClient from '../client';
import {
  UpdateProfileRequest,
  UpdateUserRoleRequest,
  UserResponse,
} from '../types';

export const userApi = {
  /** Ambil profil user yang sedang login (GET /api/v1/users/profile). */
  async getUserProfile(): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>('/api/v1/users/profile');
    return res.data;
  },

  /** Perbarui informasi profil user terautentikasi (PUT /api/v1/users/profile). */
  async updateUserProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const res = await apiClient.put<UserResponse>('/api/v1/users/profile', data);
    return res.data;
  },

  /** Ganti role user (berpindah antara customer dan merchant) (PATCH /api/v1/users/role). */
  async updateUserRole(data: UpdateUserRoleRequest): Promise<UserResponse> {
    const res = await apiClient.patch<UserResponse>('/api/v1/users/role', data);
    return res.data;
  },
};

export default userApi;
