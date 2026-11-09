import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiErrorResponse, AuthResponse } from './types';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'https://dolpin-fourthree.bccdev.id/';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_STORAGE_KEY = 'rescuebyte_auth';

export function clearAllSensitiveSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('rescuebyte_login_at');
  localStorage.removeItem('rescuebyte_user_role');
  localStorage.removeItem('rescuebyte_customer_cart');
  localStorage.removeItem('rescuebyte_selected_store');
  localStorage.removeItem('rescuebyte_store_logo');
  localStorage.removeItem('rescuebyte_store_name');
  localStorage.removeItem('rescuebyte_store_email');
  localStorage.removeItem('rescuebyte_store_address');
  localStorage.removeItem('rescuebyte_store_coordinates');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

/** Antrean request yang ditahan saat proses refresh token sedang berjalan. */
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
 * Ekstrak pesan error yang user-friendly dan ternormalisasi dari error API maupun network.
 */
export function extractErrorMessage(err: unknown, fallbackMessage = 'Terjadi kesalahan pada sistem.'): string {
  const defaultFallback = 'Terjadi kesalahan pada sistem.';
  const isTechnicalMessage = (message: string) =>
    /request failed with status code \d{3}|status code\s*[:=]?\s*\d{3}|\bhttp\s*\d{3}\b|\baxioserror\b|\berr_[a-z0-9_]+\b|\bnetwork error\b|\bfailed to fetch\b|\bfetch failed\b|\bload failed\b|\btimeout\b|internal server error|sqlstate|stack trace/i.test(message);
  const statusFallback = (status?: number) => {
    switch (status) {
      case 401: return 'Sesi kamu berakhir atau data masuk tidak cocok. Silakan masuk kembali.';
      case 403: return 'Kamu tidak memiliki izin untuk melakukan tindakan ini.';
      case 404: return 'Data yang diminta tidak ditemukan. Muat ulang halaman lalu coba lagi.';
      case 409: return 'Data berubah atau bertentangan dengan permintaan. Muat ulang halaman lalu coba lagi.';
      case 422: return 'Data belum dapat diproses. Periksa kembali isian lalu coba lagi.';
      case 429: return 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.';
      case 408: return 'Permintaan terlalu lama. Silakan coba lagi.';
      default:
        if (status && status >= 500) return 'Layanan sedang bermasalah. Coba lagi beberapa saat.';
        return undefined;
    }
  };
  const usableMessage = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const message = value.trim();
    if (!message || isTechnicalMessage(message)) return undefined;
    return message;
  };

  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse | Record<string, unknown> | undefined;
    if (data && typeof data === 'object') {
      const responseData = data as Record<string, unknown>;
      // Pertahankan pesan bisnis dari API, jangan tampilkan internal server/transport ke user.
      if (responseData.payload && typeof responseData.payload === 'object') {
        const errorObj = (responseData.payload as { error?: { message?: unknown; error?: unknown; details?: unknown } }).error;
        const details = usableMessage(errorObj?.details);
        if (details) return details;
        const message = usableMessage(errorObj?.message);
        if (message) return message;
        const errorMessage = usableMessage(errorObj?.error);
        if (errorMessage) return errorMessage;
      }
      const message = usableMessage(responseData.message);
      if (message) return message;
      const nestedError = responseData.error;
      if (nestedError && typeof nestedError === 'object') {
        const nestedMessage = usableMessage((nestedError as { message?: unknown; details?: unknown }).details)
          || usableMessage((nestedError as { message?: unknown }).message);
        if (nestedMessage) return nestedMessage;
      }
    }
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message)) {
      return 'Permintaan ke server memakan waktu terlalu lama. Silakan coba lagi.';
    }
    if (!err.response) {
      return 'Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi.';
    }
    const fallback = statusFallback(err.response.status);
    if (fallback) return fallbackMessage === defaultFallback ? fallback : fallbackMessage;
    const errorMessage = usableMessage(err.message);
    if (errorMessage) return errorMessage;
  } else if (err instanceof Error) {
    const message = usableMessage(err.message);
    if (message) return message;
  }
  if (fallbackMessage !== defaultFallback) return fallbackMessage;
  if (axios.isAxiosError(err)) return statusFallback(err.response?.status) || fallbackMessage;
  return fallbackMessage;
}

// Request Interceptor: Sisipkan Bearer token autentikasi dari localStorage
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

// Response Interceptor: Unwrap payload dan tangani antrean refresh token 401 otomatis
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap envelope { request_id, payload } dengan tetap menjaga backward compatibility
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'payload' in resData) {
      const payload = resData.payload;
      if (typeof payload === 'object' && payload !== null) {
        // Pasang properti .payload dan .request_id secara non-enumerable agar kompatibel untuk pemanggil data maupun data.payload
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
          // Lewati jika objek frozen
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

    // Lampirkan pesan error yang sudah dinormalisasi agar mudah dipakai di UI
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

    // Tangani 401 Unauthorized pada route terproteksi lewat refresh token otomatis
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

      if (!refreshToken) {
        // Tidak ada refresh token, sesi user sudah kedaluwarsa penuh
        if (typeof window !== 'undefined') {
          clearAllSensitiveSession();
          window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'));
        }
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
        // Jalankan refresh token memakai instance axios terisolasi agar tidak loop rekursif di interceptor
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
            // Abaikan jika cache user gagal diparse
          }

          // Broadcast event pembaruan token autentikasi
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

        // Bersihkan seluruh kredensial sesi jika refresh token gagal total
        if (typeof window !== 'undefined') {
          clearAllSensitiveSession();
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
