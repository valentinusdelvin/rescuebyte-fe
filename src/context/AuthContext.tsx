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

  const saveAuthSession = useCallback((authData: AuthResponse) => {
    if (typeof window === 'undefined') return;
    if (authData.access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, authData.access_token);
    }
    if (authData.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refresh_token);
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

    window.dispatchEvent(new CustomEvent('rescuebyte_auth_update', { detail: authData.user }));
  }, []);

  const clearAuthSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    window.dispatchEvent(new CustomEvent('rescuebyte_auth_update', { detail: null }));
  }, []);

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

  // Initialize session on mount
  useEffect(() => {
    void refreshUser();

    // Listen for auth-expiration event broadcast by client.ts
    const handleExpired = () => {
      clearAuthSession();
      setError('Sesi login telah berakhir. Silakan masuk kembali.');
    };

    window.addEventListener('rescuebyte_auth_expired', handleExpired);

    return () => {
      window.removeEventListener('rescuebyte_auth_expired', handleExpired);
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
