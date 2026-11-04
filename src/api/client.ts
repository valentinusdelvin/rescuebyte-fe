import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiErrorResponse, AuthResponse } from './types';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'https://dolpin-fourthree.bccdev.id/';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_STORAGE_KEY = 'rescuebyte_auth';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

/**
 * Queue item for requests stalled while an access token refresh is in flight.
 */
interface FailedRequestQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Extracts a normalized, human-friendly error message from any backend API or network error.
 */
export function extractErrorMessage(err: unknown, fallbackMessage = 'Terjadi kesalahan pada sistem.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse | Record<string, unknown> | undefined;
    if (data && typeof data === 'object') {
      // Standard swagger format: payload.error.message / payload.error.error
      if ('payload' in data && data.payload && typeof data.payload === 'object') {
        const errorObj = (data.payload as { error?: { message?: string; error?: string } }).error;
        if (errorObj?.message) return errorObj.message;
        if (errorObj?.error) return errorObj.error;
      }
      if ('message' in data && typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }
    if (err.message) {
      if (err.message.includes('Network Error')) {
        return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      }
      if (err.message.includes('timeout')) {
        return 'Permintaan ke server memakan waktu terlalu lama. Silakan coba lagi.';
      }
      return err.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  }
  return fallbackMessage;
}

/* ==========================================================================
 * Request Interceptor: Injects Authorization Header from localStorage
 * ========================================================================== */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

/* ==========================================================================
 * Response Interceptor: Unwraps Payload + Transparent 401 Refresh Queue
 * ========================================================================== */
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwraps { request_id, payload } envelope while keeping backward-compatibility
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'payload' in resData) {
      const payload = resData.payload;
      if (typeof payload === 'object' && payload !== null) {
        // Expose self-referencing .payload and .request_id property non-enumerably
        // This satisfies callers doing `response.data.payload` AND callers doing `response.data`
        try {
          if (!('payload' in payload)) {
            Object.defineProperty(payload, 'payload', {
              value: payload,
              writable: true,
              enumerable: false,
              configurable: true,
            });
          }
          if (!('request_id' in payload)) {
            Object.defineProperty(payload, 'request_id', {
              value: resData.request_id,
              writable: true,
              enumerable: false,
              configurable: true,
            });
          }
        } catch {
          // If sealed/frozen, skip definition
        }
        response.data = payload;
      } else {
        response.data = payload;
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig | undefined;

    // Attach normalized message on error for easy UI consumption
    const normalizedMessage = extractErrorMessage(error);
    (error as AxiosError & { normalizedMessage?: string }).normalizedMessage = normalizedMessage;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/refresh') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/logout');

    // Handle 401 Unauthorized on protected routes with automatic token refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

      if (!refreshToken) {
        // No refresh token available, session is completely expired
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Perform direct token refresh using an isolated axios call to avoid interceptor recursion
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          `${API_BASE_URL.replace(/\/+$/, '')}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 10000,
          }
        );

        const newAuth = refreshResponse.data?.payload;
        const newAccessToken = newAuth?.access_token;
        const newRefreshToken = newAuth?.refresh_token || refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh token exchange did not return a valid access token');
        }

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

          try {
            const rawStoredAuth = localStorage.getItem(AUTH_STORAGE_KEY);
            if (rawStoredAuth) {
              const parsed = JSON.parse(rawStoredAuth);
              parsed.access_token = newAccessToken;
              parsed.refresh_token = newRefreshToken;
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
            }
          } catch {
            // Ignore parse errors on cached user
          }

          // Broadcast auth refreshed event
          window.dispatchEvent(
            new CustomEvent('rescuebyte_auth_refreshed', {
              detail: { access_token: newAccessToken },
            })
          );
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);

        // Wipe credentials on hard refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(AUTH_STORAGE_KEY);

          window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'));
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
