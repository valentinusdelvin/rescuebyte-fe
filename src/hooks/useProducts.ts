import { useState, useEffect, useCallback, useRef } from 'react';
import { ProductCardResponse, PaginationMeta } from '../api/types';
import { productApi, GetProductsParams } from '../api/services/productApi';
import { extractErrorMessage } from '../api/client';

export interface UseProductsOptions {
  initialFilters?: GetProductsParams;
  autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options;

  const [filters, setFiltersState] = useState<GetProductsParams>(initialFilters);
  const [products, setProducts] = useState<ProductCardResponse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchProducts = useCallback(async (paramsOverride?: GetProductsParams) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const activeParams = paramsOverride || filtersRef.current;
      const res = await productApi.getProducts(activeParams);
      setProducts(res.products || []);
      setMeta(res.meta);
    } catch (err) {
      setIsError(true);
      const msg = extractErrorMessage(err, 'Gagal memuat produk.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilters = useCallback(
    (newFilters: Partial<GetProductsParams> | ((prev: GetProductsParams) => GetProductsParams)) => {
      setFiltersState((prev) => {
        const next = typeof newFilters === 'function' ? newFilters(prev) : { ...prev, ...newFilters };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      void fetchProducts(filters);
    }
  }, [autoFetch, fetchProducts, filters]);

  const refetch = useCallback(async () => {
    await fetchProducts(filters);
  }, [fetchProducts, filters]);

  return {
    products,
    meta,
    isLoading,
    isError,
    error,
    filters,
    setFilters,
    refetch,
  };
}

export default useProducts;
