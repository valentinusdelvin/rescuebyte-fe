import apiClient from '../client';
import {
  CreateProductRequest,
  GetProductsResponse,
  MessageResponse,
  ProductResponse,
  ToggleProductStatusRequest,
  UpdateProductRequest,
} from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  store_id?: string;
  nama?: string;
  name?: string;
  search?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface GetSellerProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  tab?: string;
  sort?: string;
}

export const productApi = {
  /**
   * Query marketplace products with spatial distance and filters
   * GET /api/v1/products
   */
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    const res = await apiClient.get<GetProductsResponse>('/api/v1/products', { params });
    return res.data;
  },

  /**
   * Merchant creates a new product and initial variants
   * POST /api/v1/products
   */
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    const res = await apiClient.post<ProductResponse>('/api/v1/products', data);
    return res.data;
  },

  /**
   * Merchant retrieves their own product catalog
   * GET /api/v1/products/me/list
   */
  async getSellerProducts(params?: GetSellerProductsParams): Promise<ProductResponse[]> {
    const res = await apiClient.get<ProductResponse[]>('/api/v1/products/me/list', { params });
    return res.data;
  },

  /**
   * Get public product detail with variants and image gallery
   * GET /api/v1/products/{id}
   */
  async getProductDetail(id: string): Promise<ProductResponse> {
    const res = await apiClient.get<ProductResponse>(`/api/v1/products/${id}`);
    return res.data;
  },

  /**
   * Merchant updates product info and stock
   * PUT /api/v1/products/{id}
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
    const res = await apiClient.put<ProductResponse>(`/api/v1/products/${id}`, data);
    return res.data;
  },

  /**
   * Merchant deletes a product
   * DELETE /api/v1/products/{id}
   */
  async deleteProduct(id: string): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>(`/api/v1/products/${id}`);
    return res.data;
  },

  /**
   * Merchant toggles product active status
   * PATCH /api/v1/products/{id}/status
   */
  async toggleProductStatus(
    id: string,
    data: ToggleProductStatusRequest
  ): Promise<ProductResponse> {
    const res = await apiClient.patch<ProductResponse>(`/api/v1/products/${id}/status`, data);
    return res.data;
  },
};

export default productApi;
