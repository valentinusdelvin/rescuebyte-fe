import { PaymentOrderData, CustomerOrderStatus } from '../types';
import { api } from './api';
import { extractApiErrorMessage, getCurrentUser } from './authService';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import { clearCart } from './cartService';

export interface CustomerOrderItem {
  id: string;
  orderNumber: string;
  storeId?: string;
  createdAt?: string;
  status: CustomerOrderStatus;
  statusLabel: string;
  storeName: string;
  storeAddress?: string;
  storeRating?: number;
  storeReviewCount?: number;
  storeDistance?: string;
  storeTags?: string[];
  productName: string;
  productBoxCount: number;
  productDescription: string;
  pickupDate: string;
  pickupTime: string;
  originalPrice?: number;
  finalPrice: number;
  category?: 'bakery' | 'meal' | 'snack' | 'fresh' | 'deli';
  orderData?: PaymentOrderData;
  imageUrl?: string;
}

const CUSTOMER_ORDERS_STORAGE_KEY = 'rescuebyte_customer_orders';
const MERCHANT_ORDERS_STORAGE_KEY = 'rescuebyte_merchant_orders';
const ORDERS_UPDATE_EVENT = 'rescuebyte_orders_update';

export const PLACEHOLDER_ORDER_IDS = new Set([
  'ord-1',
  'ord-2',
  'ord-3',
  'ord-4',
  'ord-5',
  'RB261029-65056-1',
  'RB261029-65056-2',
  'RB261029-81118-2',
]);
export const PLACEHOLDER_STORE_NAMES = new Set([
  'TerasRasa Bakery',
  'GreenBowl',
  'SnackTime',
  'SayurKita',
  'DailyDeli',
]);

export const INITIAL_CUSTOMER_ORDERS: CustomerOrderItem[] = [];

function getCustomerOrdersStorageKey(): string | null {
  const user = getCurrentUser();
  const userKey = user?.id || user?.email?.trim().toLowerCase();
  return userKey ? `${CUSTOMER_ORDERS_STORAGE_KEY}:${encodeURIComponent(userKey)}` : null;
}


export function inferItemCategory(
  name: string,
  tags: string[] = []
): 'bakery' | 'meal' | 'snack' | 'fresh' | 'deli' {
  const text = (name + ' ' + tags.join(' ')).toLowerCase();
  if (
    text.includes('roti') ||
    text.includes('bakery') ||
    text.includes('croissant') ||
    text.includes('pastry') ||
    text.includes('donut') ||
    text.includes('cake') ||
    text.includes('tart')
  ) {
    return 'bakery';
  }
  if (
    text.includes('sayur') ||
    text.includes('buah') ||
    text.includes('salad') ||
    text.includes('fresh') ||
    text.includes('jus')
  ) {
    return 'fresh';
  }
  if (
    text.includes('snack') ||
    text.includes('kue') ||
    text.includes('camilan') ||
    text.includes('cookie') ||
    text.includes('keripik')
  ) {
    return 'snack';
  }
  if (
    text.includes('deli') ||
    text.includes('sandwich') ||
    text.includes('burger') ||
    text.includes('wrap')
  ) {
    return 'deli';
  }
  return 'meal';
}

export function getOrderStatusLabel(status: CustomerOrderStatus): string {
  switch (status) {
    case 'menunggu-pembayaran':
      return 'Menunggu Pembayaran';
    case 'menunggu-konfirmasi':
      return 'Menunggu Konfirmasi';
    case 'diproses':
      return 'Diproses';
    case 'siap-diambil':
      return 'Siap Diambil';
    case 'selesai':
      return 'Selesai';
    case 'dibatalkan':
      return 'Dibatalkan';
    default:
      return 'Diproses';
  }
}

/**
 * Retrieve all customer orders from localStorage, filtering out legacy placeholder dummy orders.
 */
export function getCustomerOrders(): CustomerOrderItem[] {
  try {
    const storageKey = getCustomerOrdersStorageKey();
    if (!storageKey) return [];

    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realOrders = parsed
        .filter(
          (o) =>
            o &&
            o.id &&
            !PLACEHOLDER_ORDER_IDS.has(o.id) &&
            !PLACEHOLDER_STORE_NAMES.has(o.storeName) &&
            !PLACEHOLDER_ORDER_IDS.has(o.orderNumber) &&
            !o.orderNumber?.startsWith('RB25102')
        )
        .map((o) => {
          const cleaned = { ...o };
          delete cleaned.storeRating;
          delete cleaned.storeReviewCount;
          delete cleaned.storeDistance;
          delete cleaned.storeTags;
          if (cleaned.originalPrice && cleaned.originalPrice === cleaned.finalPrice + 20000) {
            delete cleaned.originalPrice;
          }
          return cleaned;
        });
      localStorage.setItem(storageKey, JSON.stringify(realOrders));
      return realOrders;

    }
    return [];
  } catch (err) {
    console.warn('Failed to read customer orders from localStorage:', err);
    return [];
  }
}

/**
 * Save customer orders to localStorage and notify listeners.
 */
export function saveCustomerOrders(orders: CustomerOrderItem[]): void {
  try {
    const storageKey = getCustomerOrdersStorageKey();
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(orders));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(ORDERS_UPDATE_EVENT, { detail: orders })
      );
    }
  } catch (err) {
    console.warn('Failed to save customer orders to localStorage:', err);
  }
}

/**
 * Create a new customer order from checkout payment data.
 * - Saves order to customer order history
 * - Clears cart if order originated from cart
 * - Syncs to merchant order queue
 */
export function createCustomerOrder(
  paymentData: PaymentOrderData,
  initialStatus: CustomerOrderStatus = 'menunggu-konfirmasi'
): CustomerOrderItem {
  const primaryItem = paymentData.items[0];
  const itemCount = paymentData.items.length;
  const productTitle =
    itemCount > 1
      ? `${primaryItem?.name || 'Mystery Box'} + ${itemCount - 1} item lainnya`
      : primaryItem?.name || 'Mystery Box';

  const productDesc =
    paymentData.items && paymentData.items.length > 0
      ? paymentData.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')
      : 'Paket Mystery Box';

  const category = primaryItem
    ? inferItemCategory(primaryItem.name, primaryItem.categoryTags)
    : 'meal';

  const originalTotal = paymentData.items.reduce(
    (sum, it) => sum + (it.originalPrice || it.rescuePrice) * it.quantity,
    0
  );

  const newOrder: CustomerOrderItem = {
    id: `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    orderNumber: paymentData.orderId,
    storeId: paymentData.primaryStore.storeId,
    createdAt: paymentData.createdAt,
    status: initialStatus,
    statusLabel: getOrderStatusLabel(initialStatus),
    storeName: paymentData.primaryStore.storeName || primaryItem?.storeName || 'Toko Mitra',
    storeAddress: paymentData.primaryStore.storeAddress,
    imageUrl: primaryItem?.imageSrc,
    productName: productTitle,
    productBoxCount: paymentData.totalBoxes,
    productDescription: productDesc,
    pickupDate: paymentData.pickupDate || '',
    pickupTime: paymentData.pickupTimeSlot || '',
    originalPrice: originalTotal > paymentData.grandTotal ? originalTotal : undefined,
    finalPrice: paymentData.grandTotal,
    category,
    orderData: {
      ...paymentData,
      status: initialStatus,
    },
  };

  // 1. Prepend new order to customer list
  const existingOrders = getCustomerOrders();
  const updatedOrders = [newOrder, ...existingOrders.filter((o) => o.orderNumber !== paymentData.orderId)];
  saveCustomerOrders(updatedOrders);

  // 2. Also register in merchant order queue if already paid / waiting confirmation
  if (initialStatus !== 'menunggu-pembayaran') {
    try {
      const rawMerchant = localStorage.getItem(MERCHANT_ORDERS_STORAGE_KEY);
      const merchantOrders = rawMerchant ? JSON.parse(rawMerchant) : [];
      if (Array.isArray(merchantOrders)) {
        const primaryItem = paymentData.items[0];
        const origPrice = originalTotal > paymentData.grandTotal ? originalTotal : (primaryItem?.originalPrice || newOrder.finalPrice * 2);
        const rescPrice = primaryItem?.rescuePrice || newOrder.finalPrice;
        const disc = primaryItem?.discountPercent || Math.max(0, Math.round(((origPrice - rescPrice) / origPrice) * 100)) || 50;

        const merchantStatus: 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'batal' =
          initialStatus === 'diproses'
            ? 'diproses'
            : initialStatus === 'siap-diambil'
              ? 'siap-diambil'
              : initialStatus === 'selesai'
                ? 'selesai'
                : 'perlu-konfirmasi';

        merchantOrders.unshift({
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: merchantStatus,
          storeName: newOrder.storeName,
          customerName: paymentData.customerInfo.name,
          customerPhone: paymentData.customerInfo.phone,
          productName: newOrder.productName,
          productImage: primaryItem?.imageSrc || cardMonsieurSpoon,
          totalBoxes: newOrder.productBoxCount,
          rescuePrice: rescPrice,
          originalPrice: origPrice,
          discountPercent: disc,
          grandTotal: newOrder.finalPrice,
          pickupDate: newOrder.pickupDate,
          pickupTime: newOrder.pickupTime,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(MERCHANT_ORDERS_STORAGE_KEY, JSON.stringify(merchantOrders));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(ORDERS_UPDATE_EVENT, { detail: merchantOrders }));
        }
      }
    } catch (err) {
      console.warn('Failed to sync to merchant orders:', err);
    }
  }

  // 3. Clear cart if order originated from cart
  if (paymentData.source === 'cart') {
    try {
      clearCart();
    } catch (err) {
      console.warn('Failed to clear cart after checkout:', err);
    }
  }

  return newOrder;
}

/**
 * Subscribe to customer orders updates.
 */
export function subscribeToOrders(
  callback: (orders: CustomerOrderItem[]) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const storageKey = getCustomerOrdersStorageKey();

  const handleCustomEvent = () => {
    callback(getCustomerOrders());
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === storageKey) {
      callback(getCustomerOrders());
    }
  };

  window.addEventListener(ORDERS_UPDATE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(ORDERS_UPDATE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}


/**
 * Update the status of an existing customer order by orderNumber or id.
 */
export function updateCustomerOrderStatus(
  orderIdOrNumber: string,
  newStatus: CustomerOrderStatus
): boolean {
  try {
    const cleanId = orderIdOrNumber.replace(/^#/, '').trim();
    const orders = getCustomerOrders();
    const target = orders.find(
      (o) =>
        o.id === orderIdOrNumber ||
        o.orderNumber === orderIdOrNumber ||
        o.orderNumber === cleanId ||
        o.id === cleanId
    );
    if (!target) return false;

    target.status = newStatus;
    target.statusLabel = getOrderStatusLabel(newStatus);
    if (target.orderData) {
      target.orderData.status = newStatus;
    }
    saveCustomerOrders(orders);

    try {
      const rawMerchant = localStorage.getItem(MERCHANT_ORDERS_STORAGE_KEY);
      let merchantOrders = rawMerchant ? JSON.parse(rawMerchant) : [];
      if (!Array.isArray(merchantOrders)) merchantOrders = [];

      const mTarget = merchantOrders.find(
        (m: any) =>
          m.id === cleanId ||
          m.orderNumber === cleanId ||
          m.id === orderIdOrNumber ||
          m.orderNumber === orderIdOrNumber
      );

      if (mTarget) {
        if (newStatus === 'menunggu-konfirmasi') mTarget.status = 'perlu-konfirmasi';
        else if (newStatus === 'diproses') mTarget.status = 'diproses';
        else if (newStatus === 'siap-diambil') mTarget.status = 'siap-diambil';
        else if (newStatus === 'selesai') mTarget.status = 'selesai';
        else if (newStatus === 'dibatalkan') mTarget.status = 'batal';
        saveMerchantOrders(merchantOrders);
      } else {
        // Sync newly confirmed order directly into merchant orders
        getMerchantOrders();
      }
    } catch (err) {
      console.warn('Failed to sync updated customer status to merchant orders:', err);
    }

    return true;
  } catch (err) {
    console.warn('Failed to update customer order status:', err);
    return false;
  }
}

export interface CheckoutApiPayload {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: 'ONLINE' | 'CASH_ON_PICKUP';
  pickup_date: string;
  pickup_time_start: string;
  pickup_time_end: string;
  items: Array<{
    product_variant_id: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface CheckoutApiResponse {
  order: {
    id: string;
    order_number: string;
    store_id: string;
    store_name: string;
    store_address: string;
    store_city: string;
    store_district: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    pickup_date: string;
    pickup_time: string;
    total_original_price: number;
    total_discount: number;
    subtotal: number;
    service_fee: number;
    packaging_fee: number;
    total_amount: number;
    status: string;
    status_label: string;
    payment_method: string;
    notes?: string;
    created_at: string;
    items: Array<{
      id: string;
      product_id: string;
      product_variant_id: string;
      product_name: string;
      variant_name: string;
      product_image_url: string;
      normal_price: number;
      rescue_price: number;
      quantity: number;
      subtotal: number;
    }>;
  };
  snap_token?: string;
  snap_redirect_url?: string;
}

export function mapBackendStatusToCustomerStatus(backendStatus: string): CustomerOrderStatus {
  const s = (backendStatus || '').toUpperCase();
  if (s === 'PAID' || s === 'SETTLEMENT' || s === 'CAPTURE' || s === 'PAYMENT_SUCCESS' || s === 'SUCCESS') return 'menunggu-konfirmasi';
  if (s === 'WAITING_PAYMENT' || s === 'PENDING' || s === 'UNPAID' || s === 'NEW' || s === 'PENDING_PAYMENT') return 'menunggu-pembayaran';
  if (s.includes('PAYMENT')) return 'menunggu-pembayaran';
  if (s.includes('CONFIRM') || s === 'WAITING_CONFIRMATION') return 'menunggu-konfirmasi';
  if (s.includes('PROCESS') || s === 'PREPARING' || s === 'CONFIRMED') return 'diproses';
  if (s.includes('READY') || s === 'READY_FOR_PICKUP') return 'siap-diambil';
  if (s.includes('COMPLETE') || s === 'COMPLETED' || s === 'FINISHED') return 'selesai';
  if (s.includes('CANCEL') || s === 'CANCELLED') return 'dibatalkan';
  // Unknown backend states must never be presented as payment-confirmed.
  return 'menunggu-pembayaran';
}

export type BackendPaymentState = 'paid' | 'pending' | 'failed' | 'unknown';

export interface BackendPaymentDetails {
  status?: string;
  transaction_status?: string;
  payment_status?: string;
  snap_token?: string;
  snap_redirect_url?: string;
}

/** Fetch the current payment record, including the reusable Snap token when available. */
export async function fetchPaymentDetailsApi(orderId: string): Promise<BackendPaymentDetails | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token || !orderId) return null;

  try {
    const response = await api.get(`/api/v1/payments/order/${encodeURIComponent(orderId)}`);
    const payload = response.data?.payload;
    const payment = payload?.payment || payload?.order?.payment || payload?.order || payload;
    if (!payment || typeof payment !== 'object') return null;

    return {
      status: payment.status,
      transaction_status: payment.transaction_status,
      payment_status: payment.payment_status,
      snap_token: payment.snap_token,
      snap_redirect_url: payment.snap_redirect_url,
    };
  } catch (err) {
    console.warn('fetchPaymentDetailsApi failed:', err);
    return null;
  }
}

/** Read the authoritative payment state for a backend order UUID. */
export async function fetchPaymentStatusApi(orderId: string): Promise<BackendPaymentState> {
  const payment = await fetchPaymentDetailsApi(orderId);
  const rawStatus = String(
    payment?.transaction_status || payment?.payment_status || payment?.status || ''
  ).toUpperCase();

  if (['PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS'].includes(rawStatus)) return 'paid';
  if (['PENDING', 'WAITING_PAYMENT', 'UNPAID', 'NEW', 'PENDING_PAYMENT'].includes(rawStatus)) return 'pending';
  if (['DENY', 'FAILED', 'CANCEL', 'CANCELLED', 'EXPIRE', 'EXPIRED'].includes(rawStatus)) return 'failed';
  return 'unknown';
}

function isBackendOrderId(id: string): boolean {
  return !id.startsWith('m-ord-') && !id.startsWith('ord-');
}

async function updateMerchantOrderStatus(
  orderId: string,
  merchantStatus: MerchantOrderItem['status'],
  backendStatus: 'IN_PROCESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED',
  cancellationReason?: string
): Promise<boolean> {
  const orders = getMerchantOrders();
  const target = orders.find((order) => order.id === orderId || order.orderNumber === orderId);
  if (!target) throw new Error('Pesanan tidak ditemukan. Muat ulang halaman lalu coba lagi.');
  if (!isBackendOrderId(target.id)) {
    throw new Error('Pesanan ini belum terhubung ke backend, jadi statusnya belum dapat diubah.');
  }

  try {
    await api.patch(`/api/v1/orders/${encodeURIComponent(target.id)}/status`, {
      status: backendStatus,
      ...(backendStatus === 'CANCELLED'
        ? { cancellation_reason: cancellationReason || 'Dibatalkan oleh pihak toko mitra' }
        : {}),
    });
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, 'Backend gagal memperbarui status pesanan.'));
  }

  // Update browser caches only after the backend confirms the transition.
  const savedMerchantOrders: MerchantOrderItem[] = (() => {
    try {
      const raw = localStorage.getItem(MERCHANT_ORDERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();
  const merchantTarget = savedMerchantOrders.find(
    (order) => order.id === target.id || order.orderNumber === target.orderNumber
  );
  if (merchantTarget) merchantTarget.status = merchantStatus;
  saveMerchantOrders(savedMerchantOrders);

  const customerOrders = getCustomerOrders();
  const customerTarget = customerOrders.find(
    (order) => order.id === target.id || order.orderNumber === target.orderNumber
  );
  if (customerTarget) {
    const customerStatus: CustomerOrderStatus =
      merchantStatus === 'batal'
        ? 'dibatalkan'
        : merchantStatus === 'perlu-konfirmasi'
          ? 'menunggu-konfirmasi'
          : merchantStatus;
    customerTarget.status = customerStatus;
    customerTarget.statusLabel = getOrderStatusLabel(customerStatus);
    if (customerTarget.orderData) customerTarget.orderData.status = customerStatus;
    saveCustomerOrders(customerOrders);
  }

  return true;
}

/**
 * Call backend checkout endpoint POST /api/v1/orders/checkout
 */
export async function checkoutOrderApi(data: CheckoutApiPayload): Promise<CheckoutApiResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) {
    throw new Error('Silakan masuk terlebih dahulu sebelum membuat pesanan.');
  }

  try {
    const response = await api.post('/api/v1/orders/checkout', data);
    const payload = response.data?.payload;
    if (payload && payload.order) {
      return payload as CheckoutApiResponse;
    }
    throw new Error('Server tidak mengembalikan data pesanan.');
  } catch (err: any) {
    const msg = extractApiErrorMessage(err, 'Gagal membuat pesanan di server.');
    console.warn('checkoutOrderApi error:', msg);
    throw new Error(msg);
  }
}

/**
 * Fetch customer orders from GET /api/v1/orders
 */
/**
 * Fetch single order detail from GET /api/v1/orders/{id}
 */
export async function fetchOrderDetailApi(orderId: string): Promise<any | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token || !orderId) return null;

  try {
    const response = await api.get('/api/v1/orders/' + orderId);
    const payload = response.data?.payload;
    return payload?.order || payload || null;
  } catch (err) {
    console.warn('fetchOrderDetailApi failed:', err);
    return null;
  }
}

export async function fetchCustomerOrdersApi(params?: {
  page?: number;
  limit?: number;
  tab?: string;
  search?: string;
}): Promise<CustomerOrderItem[] | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return null;

  try {
    const response = await api.get('/api/v1/orders', { params });
    const payload = response.data?.payload;
    if (payload && Array.isArray(payload.orders)) {
      const mappedOrders: CustomerOrderItem[] = payload.orders
        .filter((bo: any) => !PLACEHOLDER_ORDER_IDS.has(bo.id) && !PLACEHOLDER_ORDER_IDS.has(bo.order_number))
        .map((bo: any) => {
        const status = mapBackendStatusToCustomerStatus(bo.status);
        const pickupScheduleParts = String(bo.pickup_schedule || '').split('|').map((part: string) => part.trim());
        const pickupDate = bo.pickup_date || (pickupScheduleParts.length > 1 ? pickupScheduleParts[0] : bo.pickup_schedule) || '';
        const pickupTime = bo.pickup_time || (pickupScheduleParts.length > 1 ? pickupScheduleParts[1] : '') || '';
        return {
          id: bo.id,
          orderNumber: bo.order_number,
          storeId: bo.store_id,
          createdAt: bo.created_at,
          status,
          statusLabel: bo.status_label || getOrderStatusLabel(status),
          storeName: bo.store_name,
          storeAddress: bo.store_address,
          productName: bo.summary_item_name || 'Mystery Box',
          productBoxCount: bo.total_items || 1,
          productDescription: bo.summary_item_name || 'Paket Mystery Box',
          imageUrl: bo.summary_image_url,
          pickupDate,
          pickupTime,
          finalPrice: bo.total_amount,
          category: 'meal',
          orderData: {
            orderId: bo.order_number,
            backendOrderId: bo.id,
            items: [
              {
                id: bo.id,
                name: bo.summary_item_name || 'Mystery Box',
                storeName: bo.store_name,
                storeAddress: bo.store_address,
                rescuePrice: bo.total_amount,
                quantity: bo.total_items || 1,
                categoryTags: ['Penyelamatan Pangan'],
                imageSrc: bo.summary_image_url || cardMonsieurSpoon,
              },
            ],
            primaryStore: {
              storeId: bo.store_id,
              storeName: bo.store_name,
              storeAddress: bo.store_address,
            },
            pickupDate,
            pickupTimeSlot: pickupTime,
            customerInfo: {
              name: 'Tester',
              phone: '081234567890',
              email: 'customer@rescuebite.com',
            },
            totalBoxes: bo.total_items || 1,
            subtotal: bo.total_amount,
            grandTotal: bo.total_amount,
            status,
            snapRedirectUrl: bo.payment?.snap_redirect_url || (bo as any).snap_redirect_url,
            snapToken: bo.payment?.snap_token || (bo as any).snap_token,
            createdAt: bo.created_at,
          },
        };
      });

      // Merge backend orders with active customer orders
      const existing = getCustomerOrders();
      const existingMap = new Map(existing.map((o) => [o.orderNumber, o]));
      mappedOrders.forEach((bo) => {
        const local = existingMap.get(bo.orderNumber);
        if (local && local.status === 'menunggu-konfirmasi' && bo.status === 'menunggu-pembayaran') {
          bo.status = 'menunggu-konfirmasi';
          bo.statusLabel = getOrderStatusLabel('menunggu-konfirmasi');
          if (bo.orderData) {
            bo.orderData.status = 'menunggu-konfirmasi';
          }
        }
      });
      const merged = [...mappedOrders];
      existing.forEach((localOrder) => {
        if (
          !PLACEHOLDER_ORDER_IDS.has(localOrder.id) &&
          !PLACEHOLDER_ORDER_IDS.has(localOrder.orderNumber) &&
          !PLACEHOLDER_STORE_NAMES.has(localOrder.storeName) &&
          !localOrder.orderNumber?.startsWith('RB25102') &&
          !merged.some((m) => m.orderNumber === localOrder.orderNumber || m.id === localOrder.id)
        ) {
          merged.push(localOrder);
        }
      });
      saveCustomerOrders(merged);
      return merged;
    }
    return null;
  } catch (err) {
    console.warn('fetchCustomerOrdersApi failed:', err);
    return null;
  }
}


export interface MerchantOrderItem {
  id: string;
  orderNumber: string;
  status: 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'batal';
  storeId?: string;
  storeName: string;
  storeAddress?: string;
  storeCity?: string;
  storeDistrict?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  productName: string;
  productImage?: string;
  totalBoxes: number;
  rescuePrice: number;
  originalPrice: number;
  discountPercent: number;
  grandTotal: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  items?: Array<{
    id?: string;
    productName: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    variantName?: string;
  }>;
  createdAt: string;
}
export const INITIAL_MERCHANT_ORDERS: MerchantOrderItem[] = [];

export async function fetchMerchantOrdersApi(
  _storeName?: string,
  tab: 'all' | 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' = 'all'
): Promise<MerchantOrderItem[] | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return null;

  try {
    const backendTabBySellerTab = {
      all: 'all',
      'perlu-konfirmasi': 'WAITING_CONFIRMATION',
      diproses: 'IN_PROCESS',
      'siap-diambil': 'READY_FOR_PICKUP',
      selesai: 'COMPLETED',
    } as const;
    const response = await api.get('/api/v1/orders/seller', {
      params: {
        page: 1,
        limit: 100,
        tab: backendTabBySellerTab[tab],
      },
    });
    const payload = response.data?.payload;
    if (payload && Array.isArray(payload.orders)) {
            const backendOrders: MerchantOrderItem[] = [];

      payload.orders.forEach((bo: any) => {
        if (PLACEHOLDER_ORDER_IDS.has(bo.id) || PLACEHOLDER_ORDER_IDS.has(bo.order_number)) return;

        const customerStatus = mapBackendStatusToCustomerStatus(bo.status);
        if (customerStatus === 'menunggu-pembayaran') return;

        let merchantStatus: 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'batal' = 'perlu-konfirmasi';
        if (customerStatus === 'menunggu-konfirmasi') merchantStatus = 'perlu-konfirmasi';
        else if (customerStatus === 'diproses') merchantStatus = 'diproses';
        else if (customerStatus === 'siap-diambil') merchantStatus = 'siap-diambil';
        else if (customerStatus === 'selesai') merchantStatus = 'selesai';
        else if (customerStatus === 'dibatalkan') merchantStatus = 'batal';

        const pickupScheduleParts = String(bo.pickup_schedule || '').split('|').map((part) => part.trim());
        const pickupDate = bo.pickup_date || (pickupScheduleParts.length > 1 ? pickupScheduleParts[0] : bo.pickup_schedule) || bo.created_at || '';
        const pickupTime = bo.pickup_time || (pickupScheduleParts.length > 1 ? pickupScheduleParts[1] : '') || '15.00 - 18.00 WIB';

        const rawCustomerName = bo.customer_name || bo.customer?.name || bo.user?.name;
        const customerName = typeof rawCustomerName === 'string' && rawCustomerName.trim()
          ? rawCustomerName.trim()
          : 'Pelanggan RescueByte';

        const customerPhone = bo.customer_phone || bo.customer?.phone || bo.customer?.phone_number || bo.user?.phone_number || undefined;
        const customerAvatar = bo.customer_avatar_url || bo.customer_avatar || bo.customer?.avatar_url || bo.customer?.profile_picture_url || bo.user?.avatar_url || undefined;
        const customerEmail = bo.customer_email || bo.customer?.email || bo.user?.email || undefined;
        const customerId = bo.customer_id || bo.user_id || bo.customer?.id || undefined;

        const storeId = bo.store_id || bo.store?.id || undefined;
        const storeName = bo.store_name || bo.store?.name || 'Toko Mitra';
        const storeAddress = bo.store_address || bo.store?.address || undefined;
        const storeCity = bo.store_city || bo.store?.city || undefined;
        const storeDistrict = bo.store_district || bo.store?.district || undefined;

        const itemsList = Array.isArray(bo.items) && bo.items.length > 0
          ? bo.items.map((it: any) => ({
              id: it.id || it.product_id,
              productName: it.product_name || it.name || 'Mystery Box',
              quantity: it.quantity || 1,
              price: it.rescue_price || it.price || 0,
              originalPrice: it.normal_price || it.original_price,
              imageUrl: it.product_image_url || it.image_url,
              variantName: it.variant_name,
            }))
          : undefined;

        backendOrders.push({
          id: bo.id,
          orderNumber: bo.order_number,
          status: merchantStatus,
          storeId,
          storeName,
          storeAddress,
          storeCity,
          storeDistrict,
          customerId,
          customerName,
          customerPhone,
          customerEmail,
          customerAvatar,
          productName: bo.summary_item_name || 'Mystery Box',
          productImage: bo.summary_image_url || cardMonsieurSpoon,
          totalBoxes: bo.total_items || 1,
          rescuePrice: bo.total_amount,
          originalPrice: bo.total_original_price || bo.total_amount * 2,
          discountPercent: bo.total_original_price
            ? Math.max(0, Math.round(((bo.total_original_price - bo.total_amount) / bo.total_original_price) * 100))
            : 50,
          grandTotal: bo.total_amount,
          pickupDate,
          pickupTime,
          paymentMethod: bo.payment_method || bo.payment?.method,
          paymentStatus: bo.payment_status || bo.payment?.status,
          notes: bo.notes,
          items: itemsList,
          createdAt: bo.created_at,
        });
      });

      // Use the server response as the seller history source, including an empty list.
      // This replaces stale browser-cached orders instead of silently retaining them.
      // The seller endpoint is already scoped to the authenticated seller's store.
      localStorage.setItem(MERCHANT_ORDERS_STORAGE_KEY, JSON.stringify(backendOrders));
      return backendOrders;
    }
    return null;
  } catch (err) {
    console.warn('fetchMerchantOrdersApi failed:', err);
    return null;
  }
}

export function getMerchantOrders(currentStoreName?: string): MerchantOrderItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(MERCHANT_ORDERS_STORAGE_KEY);
    let orders: MerchantOrderItem[] = raw ? JSON.parse(raw) : [];

    // Filter out dummy/placeholder orders completely
    orders = orders.filter(
      (o) =>
        o &&
        !PLACEHOLDER_ORDER_IDS.has(o.id) &&
        !PLACEHOLDER_ORDER_IDS.has(o.orderNumber) &&
        !PLACEHOLDER_STORE_NAMES.has(o.storeName) &&
        !o.id?.startsWith('m-ord-')
    );

    // Auto-sync real customer orders into merchant queue
    const customerOrders = getCustomerOrders();

    customerOrders.forEach((co) => {
      // Exclude placeholder mock customer orders
      if (
        PLACEHOLDER_ORDER_IDS.has(co.id) ||
        PLACEHOLDER_STORE_NAMES.has(co.storeName) ||
        PLACEHOLDER_ORDER_IDS.has(co.orderNumber)
      ) {
        return;
      }

      if (co.status === 'menunggu-pembayaran') {
        return;
      }

      let status: 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'batal' = 'perlu-konfirmasi';
      if (co.status === 'menunggu-konfirmasi') {
        status = 'perlu-konfirmasi';
      } else if (co.status === 'diproses') {
        status = 'diproses';
      } else if (co.status === 'siap-diambil') {
        status = 'siap-diambil';
      } else if (co.status === 'selesai') {
        status = 'selesai';
      } else if (co.status === 'dibatalkan') {
        status = 'batal';
      }

      const existingIndex = orders.findIndex((m) => m.orderNumber === co.orderNumber || m.id === co.id);
      if (existingIndex >= 0) {
        orders[existingIndex].status = status;
      } else {
        const primaryItem = co.orderData?.items?.[0];
        const origPrice = primaryItem?.originalPrice || co.originalPrice || co.finalPrice * 2;
        const rescPrice = primaryItem?.rescuePrice || co.finalPrice;
        const disc = primaryItem?.discountPercent || Math.max(0, Math.round(((origPrice - rescPrice) / origPrice) * 100)) || 50;

        orders.unshift({
          id: co.id,
          orderNumber: co.orderNumber,
          status,
          storeName: co.storeName || co.orderData?.primaryStore?.storeName || 'Toko Mitra',
          customerName: co.orderData?.customerInfo?.name || 'Pelanggan RescueByte',
          customerPhone: co.orderData?.customerInfo?.phone,
          productName: co.productName,
          productImage: primaryItem?.imageSrc || cardMonsieurSpoon,
          totalBoxes: co.productBoxCount,
          rescuePrice: rescPrice,
          originalPrice: origPrice,
          discountPercent: disc,
          grandTotal: co.finalPrice,
          pickupDate: co.pickupDate,
          pickupTime: co.pickupTime,
          createdAt: co.orderData?.createdAt || new Date().toISOString(),
        });
      }
    });

    localStorage.setItem(MERCHANT_ORDERS_STORAGE_KEY, JSON.stringify(orders));

    const activeStore = (currentStoreName || localStorage.getItem('rescuebyte_store_name') || '').toLowerCase().trim();
    if (activeStore) {
      return orders.filter((o) => {
        const sName = (o.storeName || '').toLowerCase().trim();
        return sName === activeStore || sName.includes(activeStore) || activeStore.includes(sName);
      });
    }

    return orders;
  } catch (err) {
    console.warn('Failed to get merchant orders:', err);
    return [];
  }
}

export function saveMerchantOrders(orders: MerchantOrderItem[]): void {
  try {
    localStorage.setItem(MERCHANT_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ORDERS_UPDATE_EVENT, { detail: orders }));
    }
  } catch (err) {
    console.warn('Failed to save merchant orders:', err);
  }
}

export async function confirmMerchantOrder(orderId: string): Promise<boolean> {
  return updateMerchantOrderStatus(orderId, 'diproses', 'IN_PROCESS');
}

export async function processMerchantOrder(orderId: string): Promise<boolean> {
  return updateMerchantOrderStatus(orderId, 'siap-diambil', 'READY_FOR_PICKUP');
}

export async function completeMerchantOrder(orderId: string): Promise<boolean> {
  return updateMerchantOrderStatus(orderId, 'selesai', 'COMPLETED');
}

export function subscribeToCustomerOrders(callback: (orders: CustomerOrderItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => {
    callback(getCustomerOrders());
  };

  window.addEventListener(ORDERS_UPDATE_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(ORDERS_UPDATE_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

export function subscribeToMerchantOrders(
  callback: (orders: MerchantOrderItem[]) => void,
  storeName?: string
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => {
    callback(getMerchantOrders(storeName));
  };

  window.addEventListener(ORDERS_UPDATE_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(ORDERS_UPDATE_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

export async function cancelMerchantOrder(orderId: string, reason?: string): Promise<boolean> {
  return updateMerchantOrderStatus(orderId, 'batal', 'CANCELLED', reason);
}
