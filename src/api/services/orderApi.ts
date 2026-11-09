import apiClient from '../client';
import {
  CancelOrderRequest,
  CheckoutRequest,
  CheckoutResponse,
  GetOrdersResponse,
  MessageResponse,
  OrderDetailResponse,
  PaymentResponse,
  UpdateOrderStatusRequest,
} from '../types';

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  tab?: string;
  search?: string;
}

export const orderApi = {
  /** Ambil riwayat pesanan pelanggan (GET /api/v1/orders). */
  async getCustomerOrders(params?: OrderQueryParams): Promise<GetOrdersResponse> {
    const res = await apiClient.get<GetOrdersResponse>('/api/v1/orders', { params });
    return res.data;
  },

  /** Buat pesanan baru dan peroleh Snap token Midtrans (POST /api/v1/orders/checkout). */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const res = await apiClient.post<CheckoutResponse>('/api/v1/orders/checkout', data);
    return res.data;
  },

  /** Ambil daftar pesanan masuk dan riwayat pesanan merchant (GET /api/v1/orders/seller). */
  async getSellerOrders(params?: OrderQueryParams): Promise<GetOrdersResponse> {
    const res = await apiClient.get<GetOrdersResponse>('/api/v1/orders/seller', { params });
    return res.data;
  },

  /** Ambil detail lengkap pesanan berdasarkan ID (GET /api/v1/orders/{id}). */
  async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    const res = await apiClient.get<OrderDetailResponse>(`/api/v1/orders/${orderId}`);
    return res.data;
  },

  /** Pembatalan pesanan oleh pelanggan (POST /api/v1/orders/{id}/cancel). */
  async cancelOrder(orderId: string, data?: CancelOrderRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>(
      `/api/v1/orders/${orderId}/cancel`,
      data || {}
    );
    return res.data;
  },

  /** Update status progres pesanan oleh merchant (PATCH /api/v1/orders/{id}/status). */
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<OrderDetailResponse> {
    const res = await apiClient.patch<OrderDetailResponse>(
      `/api/v1/orders/${orderId}/status`,
      data
    );
    return res.data;
  },

  /** Cek status transaksi pembayaran pesanan (GET /api/v1/payments/order/{order_id}). */
  async getPaymentStatus(orderId: string): Promise<PaymentResponse> {
    const res = await apiClient.get<PaymentResponse>(`/api/v1/payments/order/${orderId}`);
    return res.data;
  },
};

export default orderApi;
