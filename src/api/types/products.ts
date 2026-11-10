import type { PaginationMeta } from './common';

// DTO produk & varian

export interface CreateProductVariantRequest {
  current_stock: number;
  initial_stock: number;
  name: string;
  normal_price: number;
  rescue_price: number;
  sequence: number;
}

export interface CreateProductRequest {
  description?: string;
  image_urls?: string[];
  main_image_url?: string;
  name: string;
  variants: CreateProductVariantRequest[];
}

export interface UpdateProductRequest {
  description?: string;
  is_active?: boolean;
  main_image_url?: string;
  name: string;
  stock?: number;
}

export interface ToggleProductStatusRequest {
  is_active?: boolean;
}

export interface ProductImageResponse {
  display_order?: number;
  id?: string;
  image_url?: string;
}

export interface ProductVariantResponse {
  created_at?: string;
  current_stock?: number;
  id?: string;
  initial_stock?: number;
  is_active?: boolean;
  name?: string;
  normal_price?: number;
  product_id?: string;
  rescue_price?: number;
  sequence?: number;
  updated_at?: string;
}

export interface ProductResponse {
  created_at?: string;
  description?: string;
  id?: string;
  images?: ProductImageResponse[];
  is_active?: boolean;
  main_image_url?: string;
  min_normal_price?: number;
  min_rescue_price?: number;
  name?: string;
  store_id?: string;
  total_current_stock?: number;
  total_initial_stock?: number;
  updated_at?: string;
  variants?: ProductVariantResponse[];
}

export interface ProductCardResponse {
  description?: string;
  discount_percentage?: number;
  distance_km?: number;
  id?: string;
  main_image_url?: string;
  name?: string;
  normal_price?: number;
  operational_end?: string;
  operational_start?: string;
  pickup_time?: string;
  rescue_price?: number;
  stock?: number;
  store_id?: string;
  store_name?: string;
}

export interface GetProductsResponse {
  meta?: PaginationMeta;
  products?: ProductCardResponse[];
}
