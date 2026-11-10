import type { PaginationMeta } from './common';
import type { PaymentMethodType } from './enums';

// DTO pesanan & transaksi

export interface CheckoutItemRequest {
  product_variant_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  items: CheckoutItemRequest[];
  notes?: string;
  payment_method: PaymentMethodType;
  pickup_date: string;
  pickup_time_end: string;
  pickup_time_start: string;
  store_id: string;
}

export interface PaymentResponse {
  amount?: number;
  id?: string;
  order_id?: string;
  paid_at?: string;
  payment_channel?: string;
  payment_type?: string;
  snap_redirect_url?: string;
  snap_token?: string;
  status?: string;
}

export interface OrderItemResponse {
  id?: string;
  normal_price?: number;
  product_id?: string;
  product_image_url?: string;
  product_name?: string;
  product_variant_id?: string;
  quantity?: number;
  rescue_price?: number;
  subtotal?: number;
  variant_name?: string;
}

export interface OrderStepTrackingResponse {
  completed_at?: string;
  is_completed?: boolean;
  step_description?: string;
  step_name?: string;
  step_number?: number;
}

export interface OrderDetailResponse {
  customer?: {
    avatar_url?: string;
    name?: string;
    phone?: string;
    phone_number?: string;
  };
  customer_avatar_url?: string;
  customer_id?: string;
  created_at?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  id?: string;
  items?: OrderItemResponse[];
  notes?: string;
  order_number?: string;
  packaging_fee?: number;
  payment?: PaymentResponse;
  pickup_window?: string;
  payment_method?: string;
  pickup_date?: string;
  pickup_time?: string;
  service_fee?: number;
  snap_token?: string;
  status?: string;
  status_label?: string;
  steps?: OrderStepTrackingResponse[];
  store?: {
    address?: string;
    name?: string;
  };
  store_address?: string;
  store_city?: string;
  store_district?: string;
  store_id?: string;
  store_name?: string;
  subtotal?: number;
  total_amount?: number;
  total_discount?: number;
  total_items?: number;
  total_original_price?: number;
}

export interface CheckoutResponse {
  order?: OrderDetailResponse;
  snap_redirect_url?: string;
  snap_token?: string;
}

export interface OrderListItemResponse {
  created_at?: string;
  id?: string;
  order_number?: string;
  payment_method?: string;
  pickup_schedule?: string;
  status?: string;
  status_label?: string;
  store_address?: string;
  store_id?: string;
  store_name?: string;
  summary_image_url?: string;
  summary_item_name?: string;
  total_amount?: number;
  total_items?: number;
}

export interface GetOrdersResponse {
  meta?: PaginationMeta;
  orders?: OrderListItemResponse[];
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface UpdateOrderStatusRequest {
  cancellation_reason?: string;
  status: 'IN_PROCESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
}

export interface MidtransNotificationPayload {
  fraud_status?: string;
  gross_amount?: string;
  order_id?: string;
  payment_type?: string;
  signature_key?: string;
  status_code?: string;
  transaction_id?: string;
  transaction_status?: string;
  transaction_time?: string;
}
