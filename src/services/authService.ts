import axios from 'axios';
import { AuthPayload, UserPayload } from '../types';
import { api } from './api';

const AUTH_STORAGE_KEY = 'rescuebyte_auth';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

type AuthListener = (user: UserPayload | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function subscribeToAuth(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function notifyAuthListeners(user: UserPayload | null) {
  authListeners.forEach((fn) => {
    try {
      fn(user);
    } catch (err) {
      console.error('Error notifying auth listener:', err);
    }
  });
}

/**
 * Extracts descriptive user-friendly message from backend error response
 */
export function extractApiErrorMessage(err: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as {
      payload?: {
        error?: {
          message?: string;
          error?: string;
          error_code?: string;
        };
      };
      message?: string;
    };

    if (data.payload?.error?.message) {
      return data.payload.error.message;
    }
    if (data.payload?.error?.error) {
      return data.payload.error.error;
    }
    if (data.message) {
      return data.message;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return defaultMessage;
}

/**
 * Save auth payload into localStorage and notify listeners
 */
export function saveAuth(payload: AuthPayload): void {
  try {
    // Provide default avatar fallback if backend returns null
    const normalizedPayload: AuthPayload = {
      ...payload,
      user: {
        ...payload.user,
        avatar_url:
          payload.user.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.user.name)}`,
      },
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedPayload));
    localStorage.setItem(ACCESS_TOKEN_KEY, normalizedPayload.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, normalizedPayload.refresh_token);
    notifyAuthListeners(normalizedPayload.user);
  } catch (err) {
    console.error('Failed to save auth to localStorage:', err);
  }
}

/**
 * Retrieve saved auth payload from localStorage
 */
export function getAuth(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieve currently logged in user
 */
export function getCurrentUser(): UserPayload | null {
  const auth = getAuth();
  return auth ? auth.user : null;
}

/**
 * Retrieve active access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Retrieve active refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear authentication session and notify listeners
 */
export function clearAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    notifyAuthListeners(null);
  } catch (err) {
    console.error('Failed to clear auth from localStorage:', err);
  }
}

/**
 * Register user using Axios client with real endpoint /api/v1/auth/register
 */
export async function registerUser(data: {
  name: string;
  email: string;
  password?: string;
}): Promise<AuthPayload> {
  try {
    const response = await api.post('/api/v1/auth/register', {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (response.data?.payload) {
      saveAuth(response.data.payload);
      return response.data.payload;
    }
    throw new Error('Format respon pendaftaran tidak valid dari server.');
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal mendaftar akun. Silakan coba lagi.');
    throw new Error(msg);
  }
}

/**
 * Login user using Axios client with real endpoint /api/v1/auth/login
 */
export async function loginUser(data: {
  email: string;
  password?: string;
}): Promise<AuthPayload> {
  try {
    const response = await api.post('/api/v1/auth/login', {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (response.data?.payload) {
      saveAuth(response.data.payload);
      return response.data.payload;
    }
    throw new Error('Format respon masuk tidak valid dari server.');
  } catch (err) {
    const msg = extractApiErrorMessage(
      err,
      'Gagal masuk. Periksa kembali email dan kata sandi kamu.'
    );
    throw new Error(msg);
  }
}

/**
 * Logout user calling /api/v1/auth/logout with refresh_token
 */
export async function logoutUser(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
    }
  } catch (err) {
    console.warn('Logout endpoint error (clearing local session anyway):', err);
  } finally {
    clearAuth();
  }
}

/**
 * Fetch current authenticated user via /api/v1/auth/me
 */
export async function fetchCurrentUser(): Promise<UserPayload | null> {
  try {
    const response = await api.get('/api/v1/auth/me');
    if (response.data?.payload?.user) {
      const user = response.data.payload.user;
      const currentAuth = getAuth();
      if (currentAuth) {
        saveAuth({
          ...currentAuth,
          user,
        });
      }
      return user;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch /api/v1/auth/me:', err);
    return null;
  }
}

/**
 * Refresh access token calling /api/v1/auth/refresh
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    if (response.data?.payload?.access_token) {
      const newAccessToken = response.data.payload.access_token;
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      const currentAuth = getAuth();
      if (currentAuth) {
        saveAuth({
          ...currentAuth,
          access_token: newAccessToken,
          refresh_token: response.data.payload.refresh_token || refreshToken,
        });
      }
      return newAccessToken;
    }
    return null;
  } catch (err) {
    console.warn('Failed to refresh token:', err);
    clearAuth();
    return null;
  }
}

/**
 * Fetch Google OAuth2 URL from /api/v1/auth/google
 */
export async function getGoogleAuthUrl(): Promise<{ auth_url: string; state: string }> {
  try {
    const response = await api.get('/api/v1/auth/google');
    if (response.data?.payload?.auth_url) {
      return response.data.payload;
    }
    throw new Error('Format respon Google OAuth tidak valid dari server.');
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal mengambil URL otentikasi Google.');
    throw new Error(msg);
  }
}

/**
 * Handle Google OAuth2 callback code & state exchange via /api/v1/auth/google/callback
 */
export async function handleGoogleCallback(code: string, state: string): Promise<AuthPayload> {
  try {
    const response = await api.get('/api/v1/auth/google/callback', {
      params: { code, state },
    });
    if (response.data?.payload) {
      saveAuth(response.data.payload);
      return response.data.payload;
    }
    throw new Error('Respon pertukaran token Google tidak valid.');
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal menyelesaikan otentikasi Google.');
    throw new Error(msg);
  }
}

/**
 * Google OAuth handler fallback (for offline or local simulated login)
 */
export async function googleAuthUser(): Promise<AuthPayload> {
  const now = new Date().toISOString();
  const payload: AuthPayload = {
    access_token: `rb_google_at_${Math.random().toString(36).substring(2)}${Date.now()}`,
    refresh_token: `rb_google_rt_${Math.random().toString(36).substring(2)}${Date.now()}`,
    user: {
      avatar_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      created_at: now,
      email: 'user.google@rescuebyte.id',
      id: `usr_google_${Date.now()}`,
      name: 'Google User',
      provider: 'GOOGLE',
      role: 'User',
      role_id: 1,
      updated_at: now,
    },
  };

  saveAuth(payload);
  return payload;
}
