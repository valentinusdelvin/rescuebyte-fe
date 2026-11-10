import type { AuthProvider, GenderIdx, UserRoleIdx } from './enums';

// DTO autentikasi

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role_id?: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface GoogleAuthURLResponse {
  auth_url?: string;
  state?: string;
}

export interface UserResponse {
  avatar_url?: string;
  created_at?: string;
  date_of_birth?: string;
  email?: string;
  gender?: number;
  gender_name?: string;
  id?: string;
  name?: string;
  phone_number?: string;
  provider?: AuthProvider | string;
  role?: string;
  role_id?: number;
  updated_at?: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: UserResponse;
}

// DTO profil user

export interface UpdateProfileRequest {
  avatar_url?: string;
  date_of_birth?: string;
  gender?: GenderIdx | number;
  name: string;
  phone_number?: string;
}

export interface UpdateUserRoleRequest {
  role_id: UserRoleIdx | number;
  user_id: string;
}
