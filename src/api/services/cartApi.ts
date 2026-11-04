import apiClient from '../client';
import {
  AddToCartRequest,
  CartCountResponse,
  CartResponse,
  MessageResponse,
  UpdateCartItemRequest,
} from '../types';

export const cartApi = {
  /**
   * Fetch customer cart details and calculate store groups
   * GET /api/v1/cart
   */
  async getCart(params?: { latitude?: number; longitude?: number }): Promise<CartResponse> {
    const res = await apiClient.get<CartResponse>('/api/v1/cart', { params });
    return res.data;
  },

  /**
   * Clear all items across all stores from the cart
   * DELETE /api/v1/cart
   */
  async clearCart(): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>('/api/v1/cart');
    return res.data;
  },

  /**
   * Get total cart item count
   * GET /api/v1/cart/count
   */
  async getCartCount(): Promise<CartCountResponse> {
    const res = await apiClient.get<CartCountResponse>('/api/v1/cart/count');
    return res.data;
  },

  /**
   * Add a product variant to the cart
   * POST /api/v1/cart/items
   */
  async addItem(data: AddToCartRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>('/api/v1/cart/items', data);
    return res.data;
  },

  /**
   * Remove a single item from the cart
   * DELETE /api/v1/cart/items/{id}
   */
  async removeItem(itemId: string): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>(`/api/v1/cart/items/${itemId}`);
    return res.data;
  },

  /**
   * Update the quantity of a specific cart item
   * PATCH /api/v1/cart/items/{id}
   */
  async updateItemQty(itemId: string, data: UpdateCartItemRequest): Promise<MessageResponse> {
    const res = await apiClient.patch<MessageResponse>(`/api/v1/cart/items/${itemId}`, data);
    return res.data;
  },

  /**
   * Remove all items belonging to a particular store
   * DELETE /api/v1/cart/stores/{store_id}
   */
  async removeStoreItems(storeId: string): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>(`/api/v1/cart/stores/${storeId}`);
    return res.data;
  },
};

export default cartApi;
