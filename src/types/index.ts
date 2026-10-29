/**
 * Shared TypeScript types and interfaces for RescueBite frontend.
 * Follows guidelines defined in .agents/docs/architecture.md and .agents/docs/typescript.md.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StoreLocation extends Coordinates {
  address: string;
  city: string;
  district: string;
}

export interface POIItem extends Coordinates {
  name: string;
  displayName: string;
  street: string;
  suburb: string;
  district: string;
  city: string;
  state: string;
}

export interface OSMSuggestion extends Coordinates {
  id: string | number;
  displayName: string;
  street: string;
  suburb: string;
  district: string;
  city: string;
  state: string;
}

export type ActiveViewId =
  | 'view-customer-home'
  | 'view-customer-marketplace'
  | 'view-customer-product-detail'
  | 'view-customer-cart'
  | 'view-customer-checkout'

  | 'view-customer-store'
  | 'view-customer-orders'
  | 'view-customer-order-detail'
  | 'view-customer-profile'
  | 'view-auth-role-selection'
  | 'view-customer-auth'
  | 'view-seller-auth'
  | 'view-beranda'
  | 'view-profil'
  | 'view-riwayat'
  | 'view-buat-dagangan'
  | 'view-daganganku'
  | 'view-ulasan'
  | string;

export interface CheckoutItem {
  id: string;
  name: string;
  storeId?: string;
  storeName: string;
  storeAvatar?: string;
  storeAddress?: string;
  rating?: number;
  reviewCount?: number | string;
  distanceText?: string;
  categoryTags: string[];
  originalPrice: number;
  rescuePrice: number;
  discountPercent: number;
  quantity: number;
  imageSrc?: string;
  pickupTime?: string;
}

export interface CheckoutPayload {
  source: 'direct' | 'cart';
  items: CheckoutItem[];
}

export type CustomerOrderStatus =
  | 'menunggu-pembayaran'
  | 'menunggu-konfirmasi'
  | 'diproses'
  | 'siap-diambil'
  | 'selesai'
  | 'dibatalkan';

export interface PaymentOrderData {
  orderId: string;
  items: CheckoutItem[];
  primaryStore: {
    storeName: string;
    storeAvatar?: string;
    storeAddress?: string;
    rating?: number;
    reviewCount?: number | string;
  };
  pickupDate: string;
  pickupTimeSlot: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  totalBoxes: number;
  subtotal: number;
  discountTotal: number;
  serviceFee: number;
  grandTotal: number;
  source?: 'direct' | 'cart';
  status?: CustomerOrderStatus;
  createdAt?: string;
}

export interface CustomerMysteryBox {
  id: string;
  storeId?: string;
  storeName: string;
  category: string;
  categoryBadge?: string;
  portionText?: string;
  distanceText: string;
  remainingBoxesText: string;
  discountPercent: number;
  originalPrice: number;
  rescuePrice: number;
  pickupTime: string;
  description: string;
  tags: string[];
  rating?: number;
  reviewCount?: number | string;
  imageSrc: string;
  imageUrls?: string[];
  isRadiusItem?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  categoryTags: string[];
  originalPrice: number;
  rescuePrice: number;
  discountPercent: number;
  quantity: number;
  imageSrc?: string;
}

export interface StoreCartGroup {
  storeId: string;
  storeName: string;
  storeAvatar: string;
  rating: number;
  reviewCount: number | string;
  distanceText: string;
  pickupTime: string;
  availablePickupTimes: string[];
  items: CartItem[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: 'Pelanggan' | 'Seller';
  rating: number;
  avatarSrc: string;
  quote: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  normalPrice: number;
  rescuePrice: number;
  stock: number;
  maxStock: number;
  status: 'aktif' | 'segera_habis' | 'habis' | 'nonaktif';
  isActive?: boolean;
  imageUrl?: string;
  createdAt: string;
}

export type ProductStatusTab = 'semua' | 'aktif' | 'segera_habis' | 'habis' | 'nonaktif';

export type OrderStatusTab =
  | 'diproses'
  | 'konfirmasi'
  | 'selesai'
  | 'habis'
  | 'kendala'
  | 'batal';

export interface OrderTabItem {
  id: OrderStatusTab;
  label: string;
}

export type DayKey = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export type DaysSchedule = Record<DayKey, boolean>;

export interface DayItem {
  key: DayKey;
  label: string;
}

export interface FilterSummaryItem {
  total: string;
  orders: string;
  toastMsg: string;
}

export type PerformanceFilterKey = 'bulan-ini' | 'minggu-ini' | 'tahun-ini';

export interface UserPayload {
  avatar_url: string;
  created_at: string;
  date_of_birth?: string;
  email: string;
  gender?: number;
  gender_name?: string;
  id: string;
  name: string;
  phone_number?: string;
  provider: 'LOCAL' | 'GOOGLE' | string;
  role: string;
  role_id: number;
  updated_at: string;
}

export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  user: UserPayload;
}

export interface AuthApiResponse {
  payload: AuthPayload;
}
