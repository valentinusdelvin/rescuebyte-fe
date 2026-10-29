import { PaymentOrderData, CustomerOrderStatus } from '../types';
import { api } from './api';
import { extractApiErrorMessage } from './authService';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import { clearCart } from './cartService';
import { getStoredProducts, saveAllProducts } from './productService';

export interface CustomerOrderItem {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  statusLabel: string;
  storeName: string;
  storeRating: number;
  storeReviewCount: number;
  storeDistance: string;
  storeTags: string[];
  productName: string;
  productBoxCount: number;
  productDescription: string;
  pickupDate: string;
  pickupTime: string;
  originalPrice?: number;
  finalPrice: number;
  category: 'bakery' | 'meal' | 'snack' | 'fresh' | 'deli';
  orderData?: PaymentOrderData;
}

const CUSTOMER_ORDERS_STORAGE_KEY = 'rescuebyte_customer_orders';
const MERCHANT_ORDERS_STORAGE_KEY = 'rescuebyte_merchant_orders';
const ORDERS_UPDATE_EVENT = 'rescuebyte_orders_update';

export const PLACEHOLDER_ORDER_IDS = new Set(['ord-1', 'ord-2', 'ord-3', 'ord-4', 'ord-5']);
export const PLACEHOLDER_STORE_NAMES = new Set([
  'TerasRasa Bakery',
  'GreenBowl',
  'SnackTime',
  'SayurKita',
  'DailyDeli',
]);

export const INITIAL_CUSTOMER_ORDERS: CustomerOrderItem[] = [];

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
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realOrders = parsed.filter(
        (o: CustomerOrderItem) =>
          o &&
          o.id &&
          !PLACEHOLDER_ORDER_IDS.has(o.id) &&
          !PLACEHOLDER_STORE_NAMES.has(o.storeName) &&
          !o.orderNumber?.startsWith('RB25102') // filter old mock numbers like RB251026-00123
      );
      if (realOrders.length !== parsed.length) {
        localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(realOrders));
      }
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
    localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(orders));
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
 * - Deducts item quantity from merchant stock
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
    status: initialStatus,
    statusLabel: getOrderStatusLabel(initialStatus),
    storeName: paymentData.primaryStore.storeName || primaryItem?.storeName || 'Toko Mitra',
    storeRating: paymentData.primaryStore.rating || 4.8,
    storeReviewCount:
      typeof paymentData.primaryStore.reviewCount === 'number'
        ? paymentData.primaryStore.reviewCount
        : 100,
    storeDistance: primaryItem?.distanceText || '1.0 km',
    storeTags: primaryItem?.categoryTags || ['✓ Halal', 'Sisa Stok Harian'],
    productName: productTitle,
    productBoxCount: paymentData.totalBoxes,
    productDescription: productDesc,
    pickupDate: paymentData.pickupDate || 'Hari ini',
    pickupTime: paymentData.pickupTimeSlot || '15.00 - 18.00 WIB',
    originalPrice: originalTotal > paymentData.grandTotal ? originalTotal : undefined,
    finalPrice: paymentData.grandTotal,
    category,
    orderData: {
      ...paymentData,
      status: initialStatus,
      createdAt: paymentData.createdAt || new Date().toISOString(),
    },
  };

  // 1. Prepend new order to customer list
  const existingOrders = getCustomerOrders();
  const updatedOrders = [newOrder, ...existingOrders.filter((o) => o.orderNumber !== paymentData.orderId)];
  saveCustomerOrders(updatedOrders);

  // 2. Also register in merchant order queue
  try {
    const rawMerchant = localStorage.getItem(MERCHANT_ORDERS_STORAGE_KEY);
    const merchantOrders = rawMerchant ? JSON.parse(rawMerchant) : [];
    if (Array.isArray(merchantOrders)) {
      merchantOrders.unshift({
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: initialStatus === 'menunggu-konfirmasi' ? 'konfirmasi' : 'diproses',
        storeName: newOrder.storeName,
        customerName: paymentData.customerInfo.name,
        customerPhone: paymentData.customerInfo.phone,
        totalBoxes: newOrder.productBoxCount,
        grandTotal: newOrder.finalPrice,
        pickupDate: newOrder.pickupDate,
        pickupTime: newOrder.pickupTime,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(MERCHANT_ORDERS_STORAGE_KEY, JSON.stringify(merchantOrders));
    }
  } catch (err) {
    console.warn('Failed to sync to merchant orders:', err);
  }

  // 3. Deduct stock from local store inventory
  try {
    const storedProducts = getStoredProducts();
    let stockChanged = false;
    paymentData.items.forEach((item) => {
      const prodIndex = storedProducts.findIndex(
        (p) =>
          p.id === item.id ||
          p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (prodIndex >= 0) {
        const prod = storedProducts[prodIndex];
        const updatedStock = Math.max(0, prod.stock - item.quantity);
        storedProducts[prodIndex] = {
          ...prod,
          stock: updatedStock,
          status: updatedStock === 0 ? 'habis' : updatedStock <= 2 ? 'segera_habis' : prod.status,
        };
        stockChanged = true;
      }
    });
    if (stockChanged) {
      saveAllProducts(storedProducts);
    }
  } catch (err) {
    console.warn('Failed to deduct product stock:', err);
  }

  // 4. Clear cart if order originated from cart
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

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<CustomerOrderItem[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getCustomerOrders());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === CUSTOMER_ORDERS_STORAGE_KEY) {
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
  if (s.includes('PAYMENT') || s === 'WAITING_PAYMENT') return 'menunggu-pembayaran';
  if (s.includes('CONFIRM') || s === 'WAITING_CONFIRMATION') return 'menunggu-konfirmasi';
  if (s.includes('PROCESS') || s === 'PREPARING' || s === 'CONFIRMED') return 'diproses';
  if (s.includes('READY') || s === 'READY_FOR_PICKUP') return 'siap-diambil';
  if (s.includes('COMPLETE') || s === 'COMPLETED' || s === 'FINISHED') return 'selesai';
  if (s.includes('CANCEL') || s === 'CANCELLED') return 'dibatalkan';
  return 'menunggu-konfirmasi';
}

/**
 * Call backend checkout endpoint POST /api/v1/orders/checkout
 */
export async function checkoutOrderApi(data: CheckoutApiPayload): Promise<CheckoutApiResponse | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return null;

  try {
    const response = await api.post('/api/v1/orders/checkout', data);
    const payload = response.data?.payload;
    if (payload && payload.order) {
      return payload as CheckoutApiResponse;
    }
    return null;
  } catch (err: any) {
    const msg = extractApiErrorMessage(err, 'Gagal membuat pesanan di server.');
    console.warn('checkoutOrderApi error:', msg);
    throw new Error(msg);
  }
}

/**
 * Fetch customer orders from GET /api/v1/orders
 */
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
      const mappedOrders: CustomerOrderItem[] = payload.orders.map((bo: any) => {
        const status = mapBackendStatusToCustomerStatus(bo.status);
        return {
          id: bo.id,
          orderNumber: bo.order_number,
          status,
          statusLabel: bo.status_label || getOrderStatusLabel(status),
          storeName: bo.store_name,
          storeRating: 4.9,
          storeReviewCount: 42,
          storeDistance: '1.0 km',
          storeTags: ['Penyelamatan Pangan', '✓ Halal'],
          productName: bo.summary_item_name || 'Mystery Box',
          productBoxCount: bo.total_items || 1,
          productDescription: bo.summary_item_name || 'Paket Mystery Box',
          pickupDate: bo.pickup_schedule || bo.created_at,
          pickupTime: bo.pickup_schedule && bo.pickup_schedule.includes('|') ? bo.pickup_schedule.split('|')[1]?.trim() : '15.00 - 18.00 WIB',
          finalPrice: bo.total_amount,
          category: 'meal',
          orderData: {
            orderId: bo.order_number,
            items: [
              {
                id: bo.id,
                name: bo.summary_item_name || 'Mystery Box',
                storeName: bo.store_name,
                storeAddress: bo.store_address,
                originalPrice: bo.total_amount + 20000,
                rescuePrice: bo.total_amount,
                discountPercent: 50,
                quantity: bo.total_items || 1,
                categoryTags: ['Penyelamatan Pangan'],
                imageSrc: bo.summary_image_url || cardMonsieurSpoon,
              },
            ],
            primaryStore: {
              storeName: bo.store_name,
              storeAddress: bo.store_address,
              rating: 4.9,
              reviewCount: 42,
            },
            pickupDate: bo.pickup_schedule || 'Hari ini',
            pickupTimeSlot: bo.pickup_schedule || '15.00 - 18.00 WIB',
            customerInfo: {
              name: 'Tester',
              phone: '081234567890',
              email: 'customer@rescuebite.com',
            },
            totalBoxes: bo.total_items || 1,
            subtotal: Math.max(0, bo.total_amount - 2000),
            discountTotal: 20000,
            serviceFee: 2000,
            grandTotal: bo.total_amount,
            status,
            createdAt: bo.created_at,
          },
        };
      });

      // Merge with local orders, excluding mock placeholders
      const existing = getCustomerOrders();
      const merged = [...mappedOrders];
      existing.forEach((localOrder) => {
        if (
          !PLACEHOLDER_ORDER_IDS.has(localOrder.id) &&
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
