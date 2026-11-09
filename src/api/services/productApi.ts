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
  /** Query produk marketplace dengan filter dan kalkulasi jarak geospasial (GET /api/v1/products). */
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    const res = await apiClient.get<GetProductsResponse>('/api/v1/products', { params });
    return res.data;
  },

  /** Merchant membuat produk baru beserta variannya (POST /api/v1/products). */
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    const res = await apiClient.post<ProductResponse>('/api/v1/products', data);
    return res.data;
  },

  /** Merchant mengambil katalog produk miliknya sendiri (GET /api/v1/products/me/list). */
  async getSellerProducts(params?: GetSellerProductsParams): Promise<ProductResponse[]> {
    const res = await apiClient.get<ProductResponse[]>('/api/v1/products/me/list', { params });
    return res.data;
  },

  /** Ambil detail produk publik, galeri foto, dan variannya (GET /api/v1/products/{id}). */
  async getProductDetail(id: string): Promise<ProductResponse> {
    const res = await apiClient.get<ProductResponse>(`/api/v1/products/${id}`);
    return res.data;
  },

  /** Merchant memperbarui informasi dan stok produk (PUT /api/v1/products/{id}). */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
    const res = await apiClient.put<ProductResponse>(`/api/v1/products/${id}`, data);
    return res.data;
  },

  /** Merchant menghapus produk dari katalog (DELETE /api/v1/products/{id}). */
  async deleteProduct(id: string): Promise<MessageResponse> {
    const res = await apiClient.delete<MessageResponse>(`/api/v1/products/${id}`);
    return res.data;
  },

  /** Merchant mengubah status aktif/nonaktif produk (PATCH /api/v1/products/{id}/status). */
  async toggleProductStatus(
    id: string,
    data: ToggleProductStatusRequest
  ): Promise<ProductResponse> {
    const res = await apiClient.patch<ProductResponse>(`/api/v1/products/${id}/status`, data);
    return res.data;
  },
};

export default productApi;
