import { useState, useEffect, useCallback } from 'react';
import {
  StoreResponse,
  UpdateStoreOperationalRequest,
  UpdateStoreProfileRequest,
} from '../api/types';
import { storeApi } from '../api/services/storeApi';
import { extractErrorMessage } from '../api/client';

export interface UseStoreProfileOptions {
  storeId?: string;
  autoFetch?: boolean;
}

export function useStoreProfile(options: UseStoreProfileOptions = {}) {
  const { storeId, autoFetch = true } = options;

  const [store, setStore] = useState<StoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const data = storeId ? await storeApi.getStoreDetail(storeId) : await storeApi.getMyStoreProfile();
      setStore(data);
    } catch (err) {
      setIsError(true);
      const msg = extractErrorMessage(err, 'Gagal memuat profil toko.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (autoFetch) {
      void fetchProfile();
    }
  }, [autoFetch, fetchProfile]);

  const updateProfile = useCallback(
    async (data: UpdateStoreProfileRequest): Promise<StoreResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await storeApi.updateMyStoreProfile(data);
        setStore(updated);
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal memperbarui profil toko.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateOperational = useCallback(
    async (data: UpdateStoreOperationalRequest): Promise<StoreResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await storeApi.updateStoreOperational(data);
        setStore(updated);
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal memperbarui jam operasional toko.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const toggleStatus = useCallback(async (): Promise<StoreResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await storeApi.toggleStoreStatus();
      setStore(updated);
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Gagal mengubah status toko.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    store,
    isLoading,
    isError,
    error,
    updateProfile,
    updateOperational,
    toggleStatus,
    refetch,
  };
}

export default useStoreProfile;
