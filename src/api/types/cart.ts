// DTO keranjang belanja

export interface AddToCartRequest {
  product_variant_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartCountResponse {
  count?: number;
}

export interface CartItemResponse {
  current_stock?: number;
  discount_percentage?: number;
  id?: string;
  is_available?: boolean;
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

export interface BackendStoreCartGroup {
  distance_km?: number;
  items?: CartItemResponse[];
  operational_end?: string;
  operational_start?: string;
  pickup_time?: string;
  store_address?: string;
  store_city?: string;
  store_district?: string;
  store_id?: string;
  store_name?: string;
  store_subtotal?: number;
}

export type StoreCartGroup = BackendStoreCartGroup;

export interface CartResponse {
  service_fee?: number;
  stores?: BackendStoreCartGroup[];
  subtotal?: number;
  total_boxes?: number;
  total_discount?: number;
  total_items?: number;
  total_original_price?: number;
  total_payment?: number;
}
