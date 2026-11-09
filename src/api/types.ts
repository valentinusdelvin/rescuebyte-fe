/**
 * Definisi TypeScript API Backend selaras kontrak Swagger 2.0.
 * Sumber Swagger: https://dolpin-fourthree.bccdev.id/swagger/doc.json
 * Base URL: https://dolpin-fourthree.bccdev.id/
 */

// Kontrak universal response & format error

export interface ApiResponse<T = unknown> {
  request_id: string;
  payload: T;
}

export interface PaginationMeta {
  limit?: number;
  page?: number;
  total_data?: number;
  total_page?: number;
}

export interface ApiErrorDetail {
  details?: unknown;
  error?: string;
  error_code?: string;
  location?: string;
  message?: string;
}

export interface ApiErrorPayload {
  error?: ApiErrorDetail;
}

export interface ApiErrorResponse {
  request_id?: string;
  payload?: ApiErrorPayload;
}

export interface MessageResponse {
  message: string;
}

export interface HealthResponse {
  message: string;
  status: 'healthy' | string;
}

// Enum sistem

export enum AuthProvider {
  ProviderLocal = 'LOCAL',
  ProviderGoogle = 'GOOGLE',
}

export type AuthProviderType = 'LOCAL' | 'GOOGLE';

export enum GenderIdx {
  GenderUnknownIdx = 0,
  GenderMaleIdx = 1,
  GenderFemaleIdx = 2,
}

export type GenderIdxType = 0 | 1 | 2;

export enum UserRoleIdx {
  RoleUnknownIdx = 0,
  RoleUserIdx = 1,
  RoleAdminIdx = 2,
  RoleSellerIdx = 3,
}

export type UserRoleIdxType = 0 | 1 | 2 | 3;

export type OrderStatusType =
  | 'MENUNGGU_PEMBAYARAN'
  | 'IN_PROCESS'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type StoreStatusType = 'ACTIVE' | 'INACTIVE';

export type PaymentMethodType = 'ONLINE' | 'CASH_ON_PICKUP';

export interface EnumsResponse {
  active_statuses?: Record<string, string>;
  genders?: Record<string, string>;
  user_roles?: Record<string, string>;
  [key: string]: unknown;
}

// DTO autentikasi

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role_id?: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface GoogleAuthURLResponse {
  auth_url?: string;
  state?: string;
}

export interface UserResponse {
  avatar_url?: string;
  created_at?: string;
  date_of_birth?: string;
  email?: string;
  gender?: number;
  gender_name?: string;
  id?: string;
  name?: string;
  phone_number?: string;
  provider?: AuthProvider | string;
  role?: string;
  role_id?: number;
  updated_at?: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: UserResponse;
}

// DTO profil user

export interface UpdateProfileRequest {
  avatar_url?: string;
  date_of_birth?: string;
  gender?: GenderIdx | number;
  name: string;
  phone_number?: string;
}

export interface UpdateUserRoleRequest {
  role_id: UserRoleIdx | number;
  user_id: string;
}

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

// DTO profil & jadwal toko

export interface CreateStoreRequest {
  address: string;
  city: string;
  description?: string;
  district: string;
  email: string;
  latitude: number;
  longitude: number;
  name: string;
  operational_days: number[];
  operational_end: string;
  operational_start: string;
  profile_picture_url?: string;
  whatsapp_number: string;
}

export interface UpdateStoreProfileRequest {
  address: string;
  city: string;
  description?: string;
  district: string;
  email: string;
  latitude: number;
  longitude: number;
  name: string;
  profile_picture_url?: string;
  whatsapp_number: string;
}

export interface UpdateStoreOperationalRequest {
  operational_days: number[];
  operational_end: string;
  operational_start: string;
  status: StoreStatusType;
}

export interface StoreResponse {
  address?: string;
  city?: string;
  created_at?: string;
  description?: string;
  district?: string;
  email?: string;
  id?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  operational_days?: number[];
  operational_end?: string;
  operational_start?: string;
  profile_picture_url?: string;
  status?: string;
  updated_at?: string;
  user_id?: string;
  whatsapp_number?: string;
}

export interface GetStoresResponse {
  meta?: PaginationMeta;
  stores?: StoreResponse[];
}

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
  payment_method?: string;
  pickup_date?: string;
  pickup_time?: string;
  service_fee?: number;
  status?: string;
  status_label?: string;
  steps?: OrderStepTrackingResponse[];
  store_address?: string;
  store_city?: string;
  store_district?: string;
  store_id?: string;
  store_name?: string;
  subtotal?: number;
  total_amount?: number;
  total_discount?: number;
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

// DTO cloud storage

export interface UploadResponse {
  content_type?: string;
  filename?: string;
  size?: number;
  url?: string;
}

// DTO ulasan & ringkasan toko

export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export interface UpdateReviewRequest {
  rating: number;
  content: string;
}

export interface ReviewAuthorResponse {
  id?: string;
  name?: string;
  role?: string;
  avatar_url?: string;
}

export interface ReviewResponse {
  id: string;
  user_id?: string;
  product_id?: string;
  store_id?: string;
  rating: number;
  content: string;
  author?: ReviewAuthorResponse;
  created_at: string;
  updated_at?: string;
}

export interface GetReviewsResponse {
  meta?: PaginationMeta;
  reviews?: ReviewResponse[];
}

export interface StoreSummaryResponse {
  average_rating: number;
  total_reviews: number;
}

// Alias kompatibilitas tipe Swagger lama

export type ErrorDetail = ApiErrorDetail;
export type ErrorPayload = ApiErrorPayload;
export type ErrorResponse = ApiErrorResponse;
