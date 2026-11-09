import apiClient from '../client';
import {
  AuthResponse,
  GoogleAuthURLResponse,
  LoginRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterRequest,
  UserResponse,
} from '../types';

export const authApi = {
  /** Ambil URL otorisasi Google OAuth2 (GET /api/v1/auth/google). */
  async getGoogleAuthUrl(): Promise<GoogleAuthURLResponse> {
    const res = await apiClient.get<GoogleAuthURLResponse>('/api/v1/auth/google');
    return res.data;
  },

  /** Tukar authorization code callback Google OAuth2 (GET /api/v1/auth/google/callback). */
  async handleGoogleCallback(code: string, state: string): Promise<AuthResponse> {
    const res = await apiClient.get<AuthResponse>('/api/v1/auth/google/callback', {
      params: { code, state },
    });
    return res.data;
  },

  /** Autentikasi user dengan email dan password (POST /api/v1/auth/login). */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    return res.data;
  },

  /** Cabut sesi dan batalkan refresh token aktif (POST /api/v1/auth/logout). */
  async logout(refreshToken: string): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>('/api/v1/auth/logout', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest);
    return res.data;
  },

  /** Ambil profil user yang sedang login (GET /api/v1/auth/me). */
  async getMe(): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>('/api/v1/auth/me');
    return res.data;
  },

  /** Perbarui access token kedaluwarsa memakai refresh token (POST /api/v1/auth/refresh). */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest);
    return res.data;
  },

  /** Daftarkan akun baru pelanggan atau merchant (POST /api/v1/auth/register). */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    return res.data;
  },
};

export default authApi;
