import { api } from '../api';

export type BackendPaymentState = 'paid' | 'pending' | 'failed' | 'unknown';

export interface BackendPaymentDetails {
  status?: string;
  transaction_status?: string;
  payment_status?: string;
  snap_token?: string;
  snap_redirect_url?: string;
}

/** Fetch the current payment record, including the reusable Snap token when available. */
export async function fetchPaymentDetailsApi(orderId: string): Promise<BackendPaymentDetails | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token || !orderId) return null;

  try {
    const response = await api.get(`/api/v1/payments/order/${encodeURIComponent(orderId)}`);
    const payload = response.data?.payload;
    const payment = payload?.payment || payload?.order?.payment || payload?.order || payload;
    if (!payment || typeof payment !== 'object') return null;

    return {
      status: payment.status,
      transaction_status: payment.transaction_status,
      payment_status: payment.payment_status,
      snap_token: payment.snap_token,
      snap_redirect_url: payment.snap_redirect_url,
    };
  } catch (err) {
    console.warn('fetchPaymentDetailsApi failed:', err);
    return null;
  }
}

/** Read the authoritative payment state for a backend order UUID. */
export async function fetchPaymentStatusApi(orderId: string): Promise<BackendPaymentState> {
  const payment = await fetchPaymentDetailsApi(orderId);
  const rawStatus = String(
    payment?.transaction_status || payment?.payment_status || payment?.status || ''
  ).toUpperCase();

  if (['PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS'].includes(rawStatus)) return 'paid';
  if (['PENDING', 'WAITING_PAYMENT', 'UNPAID', 'NEW', 'PENDING_PAYMENT'].includes(rawStatus)) return 'pending';
  if (['DENY', 'FAILED', 'CANCEL', 'CANCELLED', 'EXPIRE', 'EXPIRED'].includes(rawStatus)) return 'failed';
  return 'unknown';
}
