import { useState, useEffect, useCallback } from 'react';
import { ProductResponse } from '../api/types';
import { productApi } from '../api/services/productApi';
import { extractErrorMessage } from '../api/client';

export function useProductDetail(productId?: string) {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(productId));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id?: string) => {
    const targetId = id || productId;
    if (!targetId) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const data = await productApi.getProductDetail(targetId);
      setProduct(data);
    } catch (err) {
      setIsError(true);
      const msg = extractErrorMessage(err, 'Gagal memuat detail produk.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      void fetchDetail(productId);
    } else {
      setProduct(null);
      setIsLoading(false);
    }
  }, [productId, fetchDetail]);

  const refetch = useCallback(async () => {
    if (productId) {
      await fetchDetail(productId);
    }
  }, [productId, fetchDetail]);

  return {
    product,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export default useProductDetail;
