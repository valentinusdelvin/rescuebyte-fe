import { useState, useCallback } from 'react';
import { CheckoutRequest, CheckoutResponse, PaymentResponse } from '../api/types';
import { orderApi } from '../api/services/orderApi';
import { extractErrorMessage } from '../api/client';

export function useCheckout() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setIsError(false);
    setError(null);
  }, []);

  const checkout = useCallback(
    async (data: CheckoutRequest): Promise<CheckoutResponse> => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      try {
        const response = await orderApi.checkout(data);
        return response;
      } catch (err) {
        setIsError(true);
        const msg = extractErrorMessage(err, 'Gagal memproses checkout pesanan.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkPaymentStatus = useCallback(
    async (orderId: string): Promise<PaymentResponse> => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      try {
        const response = await orderApi.getPaymentStatus(orderId);
        return response;
      } catch (err) {
        setIsError(true);
        const msg = extractErrorMessage(err, 'Gagal memeriksa status pembayaran.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    checkout,
    checkPaymentStatus,
    isLoading,
    isError,
    error,
    clearError,
  };
}

export default useCheckout;
