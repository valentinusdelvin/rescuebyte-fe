import apiClient from '../client';
import {
  AddToCartRequest,
  CartCountResponse,
  CartResponse,
  MessageResponse,
  UpdateCartItemRequest,
} from '../types';

export const cartApi = {
  /** Ambil data keranjang pelanggan dan kelompokkan berdasarkan toko (GET /api/v1/cart). */
  async getCart(params?: { latitude?: number; longitude?: number }): Promise<CartResponse> {
    const res = await apiClient.get<CartResponse>('/api/v1/cart', { params });
    return res.data;
  },

  /** Kosongkan seluruh item dari keranjang belanja (DELETE /api/v1/cart). */
  async clearCart(): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>('/api/v1/cart');
    return res.data;
  },

  /** Ambil total jumlah item di keranjang (GET /api/v1/cart/count). */
  async getCartCount(): Promise<CartCountResponse> {
    const res = await apiClient.get<CartCountResponse>('/api/v1/cart/count');
    return res.data;
  },

  /** Tambah varian produk ke dalam keranjang (POST /api/v1/cart/items). */
  async addItem(data: AddToCartRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>('/api/v1/cart/items', data);
    return res.data;
  },

  /** Hapus satu item spesifik dari keranjang (DELETE /api/v1/cart/items/{id}). */
  async removeItem(itemId: string): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>(`/api/v1/cart/items/${itemId}`);
    return res.data;
  },

  /** Update kuantitas item keranjang belanja (PATCH /api/v1/cart/items/{id}). */
  async updateItemQty(itemId: string, data: UpdateCartItemRequest): Promise<MessageResponse> {
    const res = await apiClient.patch<MessageResponse>(`/api/v1/cart/items/${itemId}`, data);
    return res.data;
  },

  /** Hapus semua item dari toko tertentu di keranjang (DELETE /api/v1/cart/stores/{store_id}). */
  async removeStoreItems(storeId: string): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>(`/api/v1/cart/stores/${storeId}`);
    return res.data;
  },
};

export default cartApi;
