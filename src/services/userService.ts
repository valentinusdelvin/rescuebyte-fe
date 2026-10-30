import { api } from './api';
import { UserPayload } from '../types';
import { getAuth, saveAuth, extractApiErrorMessage } from './authService';

export interface UpdateUserProfileRequest {
  name: string;
  avatar_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: number; // 0: Unknown, 1: Laki-laki, 2: Perempuan
}

export interface UpdateUserRoleRequest {
  user_id: string;
  role_id: number;
}

/**
 * Fetch current user profile from GET /api/v1/users/profile
 */
export async function getUserProfile(): Promise<UserPayload> {
  try {
    let user: UserPayload | null = null;
    try {
      const response = await api.get('/api/v1/users/profile');
      const payload = response.data?.payload;
      user = (payload?.user || (payload?.id || payload?.email ? payload : null)) as UserPayload | null;
    } catch {
      const response = await api.get('/api/v1/auth/me');
      const payload = response.data?.payload;
      user = (payload?.user || (payload?.id || payload?.email ? payload : null)) as UserPayload | null;
    }

    if (!user) {
      throw new Error('Data profil tidak ditemukan dalam respon server.');
    }

    // Sync with local auth storage
    const auth = getAuth();
    if (auth) {
      saveAuth({
        ...auth,
        user: {
          ...auth.user,
          ...user,
        },
      });
    }

    return user;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal mengambil data profil.');
    throw new Error(message);
  }
}

/**
 * Update authenticated user's profile via PUT /api/v1/users/profile
 * Accepts: name, avatar_url, phone_number, date_of_birth, gender
 */
export async function updateUserProfile(data: UpdateUserProfileRequest): Promise<UserPayload> {
  try {
    const payloadBody: Record<string, unknown> = {
      name: data.name.trim(),
    };
    if (data.avatar_url !== undefined) payloadBody.avatar_url = data.avatar_url;
    if (data.phone_number !== undefined) payloadBody.phone_number = data.phone_number.trim();
    if (data.date_of_birth !== undefined) payloadBody.date_of_birth = data.date_of_birth.trim();
    if (data.gender !== undefined) payloadBody.gender = data.gender;

    const response = await api.put('/api/v1/users/profile', payloadBody);

    const updatedUser = response.data?.payload as UserPayload;
    if (!updatedUser) {
      throw new Error('Gagal memperbarui profil pengguna.');
    }

    // Sync with local auth storage
    const auth = getAuth();
    if (auth) {
      saveAuth({
        ...auth,
        user: {
          ...auth.user,
          ...updatedUser,
        },
      });
    }

    return updatedUser;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal memperbarui profil.');
    throw new Error(message);
  }
}

/**
 * Update user role via PATCH /api/v1/users/role
 * Default role_id for customer is 1
 */
export async function updateUserRole(data: UpdateUserRoleRequest): Promise<UserPayload> {
  try {
    const response = await api.patch('/api/v1/users/role', {
      user_id: data.user_id,
      role_id: data.role_id ?? 1,
    });

    const updatedUser = response.data?.payload as UserPayload;
    if (!updatedUser) {
      throw new Error('Gagal memperbarui role pengguna.');
    }

    const auth = getAuth();
    if (auth && auth.user.id === data.user_id) {
      saveAuth({
        ...auth,
        user: {
          ...auth.user,
          ...updatedUser,
        },
      });
    }

    return updatedUser;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal memperbarui role pengguna.');
    throw new Error(message);
  }
}
