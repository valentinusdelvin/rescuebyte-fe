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
  /**
   * List customer order history
   * GET /api/v1/orders
   */
  async getCustomerOrders(params?: OrderQueryParams): Promise<GetOrdersResponse> {
    const res = await apiClient.get<GetOrdersResponse>('/api/v1/orders', { params });
    return res.data;
  },

  /**
   * Create a new checkout order with Midtrans snap token
   * POST /api/v1/orders/checkout
   */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const res = await apiClient.post<CheckoutResponse>('/api/v1/orders/checkout', data);
    return res.data;
  },

  /**
   * List merchant incoming and fulfilled orders
   * GET /api/v1/orders/seller
   */
  async getSellerOrders(params?: OrderQueryParams): Promise<GetOrdersResponse> {
    const res = await apiClient.get<GetOrdersResponse>('/api/v1/orders/seller', { params });
    return res.data;
  },

  /**
   * Get full order detail by ID
   * GET /api/v1/orders/{id}
   */
  async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    const res = await apiClient.get<OrderDetailResponse>(`/api/v1/orders/${orderId}`);
    return res.data;
  },

  /**
   * Customer-initiated order cancellation
   * POST /api/v1/orders/{id}/cancel
   */
  async cancelOrder(orderId: string, data?: CancelOrderRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>(
      `/api/v1/orders/${orderId}/cancel`,
      data || {}
    );
    return res.data;
  },

  /**
   * Merchant updates order fulfillment status
   * PATCH /api/v1/orders/{id}/status
   */
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

  /**
   * Query payment transaction status for an order
   * GET /api/v1/payments/order/{order_id}
   */
  async getPaymentStatus(orderId: string): Promise<PaymentResponse> {
    const res = await apiClient.get<PaymentResponse>(`/api/v1/payments/order/${orderId}`);
    return res.data;
  },
};

export default orderApi;
