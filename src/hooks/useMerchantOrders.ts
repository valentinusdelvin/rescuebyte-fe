import { useState, useEffect, useCallback, useRef } from 'react';
import { OrderListItemResponse, PaginationMeta, UpdateOrderStatusRequest } from '../api/types';
import { orderApi, OrderQueryParams } from '../api/services/orderApi';
import { extractErrorMessage } from '../api/client';

export interface UseMerchantOrdersOptions {
  initialParams?: OrderQueryParams;
  autoFetch?: boolean;
}

export function useMerchantOrders(options: UseMerchantOrdersOptions = {}) {
  const { initialParams = {}, autoFetch = true } = options;

  const [params, setParamsState] = useState<OrderQueryParams>(initialParams);
  const [orders, setOrders] = useState<OrderListItemResponse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const fetchOrders = useCallback(async (paramsOverride?: OrderQueryParams) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const activeParams = paramsOverride || paramsRef.current;
      const res = await orderApi.getSellerOrders(activeParams);
      setOrders(res.orders || []);
      setMeta(res.meta);
    } catch (err) {
      setIsError(true);
      const msg = extractErrorMessage(err, 'Gagal memuat daftar pesanan toko.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setParams = useCallback(
    (newParams: Partial<OrderQueryParams> | ((prev: OrderQueryParams) => OrderQueryParams)) => {
      setParamsState((prev) => {
        const next = typeof newParams === 'function' ? newParams(prev) : { ...prev, ...newParams };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      void fetchOrders(params);
    }
  }, [autoFetch, fetchOrders, params]);

  const updateStatus = useCallback(
    async (
      orderId: string,
      status: UpdateOrderStatusRequest['status'],
      cancellationReason?: string
    ): Promise<boolean> => {
      try {
        await orderApi.updateOrderStatus(orderId, {
          status,
          cancellation_reason: cancellationReason,
        });
        await fetchOrders(paramsRef.current);
        return true;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal memperbarui status pesanan.');
        setError(msg);
        return false;
      }
    },
    [fetchOrders]
  );

  const refetch = useCallback(async () => {
    await fetchOrders(paramsRef.current);
  }, [fetchOrders]);

  return {
    orders,
    meta,
    isLoading,
    isError,
    error,
    params,
    setParams,
    updateStatus,
    refetch,
  };
}

export default useMerchantOrders;
