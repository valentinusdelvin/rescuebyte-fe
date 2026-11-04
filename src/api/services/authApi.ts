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
  /**
   * Get Google OAuth2 authorization URL
   * GET /api/v1/auth/google
   */
  async getGoogleAuthUrl(): Promise<GoogleAuthURLResponse> {
    const res = await apiClient.get<GoogleAuthURLResponse>('/api/v1/auth/google');
    return res.data;
  },

  /**
   * Exchange Google OAuth2 callback authorization code
   * GET /api/v1/auth/google/callback
   */
  async handleGoogleCallback(code: string, state: string): Promise<AuthResponse> {
    const res = await apiClient.get<AuthResponse>('/api/v1/auth/google/callback', {
      params: { code, state },
    });
    return res.data;
  },

  /**
   * Authenticate user with email and password
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    return res.data;
  },

  /**
   * Revoke session and invalidate refresh token
   * POST /api/v1/auth/logout
   */
  async logout(refreshToken: string): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>('/api/v1/auth/logout', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest);
    return res.data;
  },

  /**
   * Fetch current authenticated user profile
   * GET /api/v1/auth/me
   */
  async getMe(): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>('/api/v1/auth/me');
    return res.data;
  },

  /**
   * Renew expired access token using refresh token
   * POST /api/v1/auth/refresh
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    } as RefreshTokenRequest);
    return res.data;
  },

  /**
   * Register a new customer or merchant user account
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    return res.data;
  },
};

export default authApi;
