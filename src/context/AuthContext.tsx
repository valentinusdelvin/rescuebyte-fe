import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserRoleIdx,
} from '../api/types';
import { authApi } from '../api/services/authApi';
import { userApi } from '../api/services/userApi';
import { extractErrorMessage } from '../api/client';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_STORAGE_KEY = 'rescuebyte_auth';
export const ROLES_BY_EMAIL_KEY = 'rescuebyte_roles_by_email';
export const LOGIN_AT_KEY = 'rescuebyte_login_at';
export const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam

/** Parse timestamp kedaluwarsa JWT (claim exp dalam milidetik). */
export function parseJwtExp(token?: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Hitung batas kedaluwarsa sesi efektif berdasarkan exp JWT dan batas maksimal 24 jam. */
export function calculateSessionExpiresAt(): number | null {
  if (typeof window === 'undefined') return null;
  const loginAtStr = localStorage.getItem(LOGIN_AT_KEY);
  const loginAt = loginAtStr ? parseInt(loginAtStr, 10) : null;
  const maxExp = loginAt ? loginAt + MAX_SESSION_DURATION_MS : null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const tokenExp = parseJwtExp(token);

  if (tokenExp && maxExp) return Math.min(tokenExp, maxExp);
  return tokenExp || maxExp;
}

/** Bersihkan seluruh data autentikasi sensitif dan sesi toko dari storage. */
export function clearAllSensitiveSessionData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LOGIN_AT_KEY);
  localStorage.removeItem('rescuebyte_user_role');
  localStorage.removeItem('rescuebyte_customer_cart');
  localStorage.removeItem('rescuebyte_selected_store');
  localStorage.removeItem('rescuebyte_store_logo');
  localStorage.removeItem('rescuebyte_store_name');
  localStorage.removeItem('rescuebyte_store_email');
  localStorage.removeItem('rescuebyte_store_address');
  localStorage.removeItem('rescuebyte_store_coordinates');
}

let sessionTimerId: ReturnType<typeof setTimeout> | null = null;

function clearSessionTimer() {
  if (sessionTimerId) {
    clearTimeout(sessionTimerId);
    sessionTimerId = null;
  }
}

function scheduleSessionCheck(onExpire: () => void) {
  clearSessionTimer();
  const expiresAt = calculateSessionExpiresAt();
  if (!expiresAt) return;

  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    onExpire();
    return;
  }
  sessionTimerId = setTimeout(onExpire, remaining);
}

export interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchRole: (roleId: UserRoleIdx | number) => Promise<UserResponse>;
  refreshUser: () => Promise<UserResponse | null>;
  setUser: React.Dispatch<React.SetStateAction<UserResponse | null>>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.user || null;
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const clearAuthSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    clearSessionTimer();
    clearAllSensitiveSessionData();
    setUser(null);
    window.dispatchEvent(new CustomEvent('rescuebyte_auth_update', { detail: null }));
  }, []);

  const saveAuthSession = useCallback((authData: AuthResponse) => {
    if (typeof window === 'undefined') return;
    if (authData.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, authData.access_token);
    }
    if (authData.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refresh_token);
    }
    // Record login timestamp if not present
    if (!localStorage.getItem(LOGIN_AT_KEY)) {
      localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
    }
    if (authData.user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setUser(authData.user);

      // Track role for email heuristic
      if (authData.user.email && authData.user.role) {
        try {
          const raw = localStorage.getItem(ROLES_BY_EMAIL_KEY);
          const map = raw ? JSON.parse(raw) : {};
          map[authData.user.email.trim().toLowerCase()] =
            authData.user.role.toLowerCase() === 'seller' ? 'seller' : 'customer';
          localStorage.setItem(ROLES_BY_EMAIL_KEY, JSON.stringify(map));
        } catch {
          // Ignore storage error
        }
      }
    }

    scheduleSessionCheck(() => {
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'));
    });

    window.dispatchEvent(new CustomEvent('rescuebyte_auth_update', { detail: authData.user }));
  }, [clearAuthSession]);

  const refreshUser = useCallback(async (): Promise<UserResponse | null> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      let freshUser: UserResponse | null = null;
      try {
        freshUser = await userApi.getUserProfile();
      } catch {
        freshUser = await authApi.getMe();
      }

      if (freshUser) {
        setUser(freshUser);
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.user = freshUser;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          } catch {
            // Ignore parse error
          }
        }
      }
      return freshUser;
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inisialisasi sesi saat komponen mount
  useEffect(() => {
    const handleExpired = () => {
      clearAuthSession();
      setError('Sesi login telah berakhir. Silakan masuk kembali.');
    };

    // Pengecekan instan apakah sesi sudah kedaluwarsa saat aplikasi dibuka
    const expiresAt = calculateSessionExpiresAt();
    if (expiresAt && expiresAt - Date.now() <= 0) {
      handleExpired();
      setIsLoading(false);
      return;
    }

    void refreshUser();

    // Jadwalkan pengecekan sesi tunggal
    scheduleSessionCheck(handleExpired);

    // Listener visibility dan focus untuk pemulihan token saat tab browser aktif kembali
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const exp = calculateSessionExpiresAt();
        if (exp && exp - Date.now() <= 0) {
          handleExpired();
        } else {
          scheduleSessionCheck(handleExpired);
        }
      }
    };

    // Sinkronisasi lintas tab browser via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY && !e.newValue) {
        clearAuthSession();
      }
    };

    window.addEventListener('rescuebyte_auth_expired', handleExpired);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearSessionTimer();
      window.removeEventListener('rescuebyte_auth_expired', handleExpired);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshUser, clearAuthSession]);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.login(credentials);
        saveAuthSession(response);
        return response;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal masuk. Periksa email dan kata sandi Anda.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthSession]
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.register(data);
        saveAuthSession(response);
        return response;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal mendaftar akun baru.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthSession]
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch (err) {
          console.warn('Backend logout encountered error (clearing local session anyway):', err);
        }
      }
    } finally {
      clearAuthSession();
      setIsLoading(false);
    }
  }, [clearAuthSession]);

  const switchRole = useCallback(
    async (roleId: UserRoleIdx | number): Promise<UserResponse> => {
      if (!user?.id) {
        throw new Error('Pengguna belum login.');
      }
      setIsLoading(true);
      setError(null);
      try {
        const updatedUser = await userApi.updateUserRole({
          user_id: user.id,
          role_id: roleId,
        });

        setUser(updatedUser);

        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.user = updatedUser;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          } catch {
            // Ignore parse error
          }
        }

        if (updatedUser.email && updatedUser.role) {
          try {
            const raw = localStorage.getItem(ROLES_BY_EMAIL_KEY);
            const map = raw ? JSON.parse(raw) : {};
            map[updatedUser.email.trim().toLowerCase()] =
              updatedUser.role.toLowerCase() === 'seller' ? 'seller' : 'customer';
            localStorage.setItem(ROLES_BY_EMAIL_KEY, JSON.stringify(map));
          } catch {
            // Ignore parse error
          }
        }

        window.dispatchEvent(new CustomEvent('rescuebyte_auth_update', { detail: updatedUser }));
        return updatedUser;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal memperbarui peran akun.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const isAuthenticated = Boolean(user && (user.id || user.email));

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    switchRole,
    refreshUser,
    setUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
