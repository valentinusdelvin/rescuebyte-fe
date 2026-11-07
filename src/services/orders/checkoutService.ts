import { api } from '../api';
import { extractApiErrorMessage } from '../authService';

export interface CheckoutApiPayload {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: 'ONLINE' | 'CASH_ON_PICKUP';
  pickup_date: string;
  pickup_time_start: string;
  pickup_time_end: string;
  items: Array<{
    product_variant_id: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface CheckoutApiResponse {
  order: {
    id: string;
    order_number: string;
    store_id: string;
    store_name: string;
    store_address: string;
    store_city: string;
    store_district: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    pickup_date: string;
    pickup_time: string;
    total_original_price: number;
    total_discount: number;
    subtotal: number;
    service_fee: number;
    packaging_fee: number;
    total_amount: number;
    status: string;
    status_label: string;
    payment_method: string;
    notes?: string;
    created_at: string;
    items: Array<{
      id: string;
      product_id: string;
      product_variant_id: string;
      product_name: string;
      variant_name: string;
      product_image_url: string;
      normal_price: number;
      rescue_price: number;
      quantity: number;
      subtotal: number;
    }>;
  };
  snap_token?: string;
  snap_redirect_url?: string;
}

export async function checkoutOrderApi(data: CheckoutApiPayload): Promise<CheckoutApiResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) {
    throw new Error('Silakan masuk terlebih dahulu sebelum membuat pesanan.');
  }

  try {
    const response = await api.post('/api/v1/orders/checkout', data);
    const payload = response.data?.payload;
    if (payload && payload.order) {
      return payload as CheckoutApiResponse;
    }
    throw new Error('Server tidak mengembalikan data pesanan.');
  } catch (err: any) {
    const msg = extractApiErrorMessage(err, 'Gagal membuat pesanan di server.');
    console.warn('checkoutOrderApi error:', msg);
    throw new Error(msg);
  }
}

/**
 * Fetch customer orders from GET /api/v1/orders
 */
/**
 * Fetch single order detail from GET /api/v1/orders/{id}
 */
