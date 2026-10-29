import { PaymentOrderData, CustomerOrderStatus } from '../types';
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

export const INITIAL_CUSTOMER_ORDERS: CustomerOrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'RB251026-00123',
    status: 'menunggu-konfirmasi',
    statusLabel: 'Menunggu Konfirmasi',
    storeName: 'TerasRasa Bakery',
    storeRating: 4.8,
    storeReviewCount: 320,
    storeDistance: '1.2 km',
    storeTags: ['Roti & Pastry', 'Halal'],
    productName: 'Mystery Bakery Box Reguler',
    productBoxCount: 1,
    productDescription: 'Roti, pastry, dan kue pilihan',
    pickupDate: '26 Oktober 2026',
    pickupTime: '16.00 - 18.00 WIB',
    finalPrice: 22000,
    category: 'bakery',
  },
  {
    id: 'ord-2',
    orderNumber: 'RB251025-00891',
    status: 'diproses',
    statusLabel: 'Diproses',
    storeName: 'GreenBowl',
    storeRating: 4.7,
    storeReviewCount: 210,
    storeDistance: '2.5 km',
    storeTags: ['Makanan Sehat', 'Halal'],
    productName: 'Mystery Meal Box',
    productBoxCount: 2,
    productDescription: 'Nasi, lauk, dan sayur pilihan',
    pickupDate: '25 Oktober 2026',
    pickupTime: '12.00 - 13.00 WIB',
    finalPrice: 52000,
    category: 'meal',
  },
  {
    id: 'ord-3',
    orderNumber: 'RB251024-00567',
    status: 'siap-diambil',
    statusLabel: 'Siap Diambil',
    storeName: 'SnackTime',
    storeRating: 4.5,
    storeReviewCount: 95,
    storeDistance: '3.1 km',
    storeTags: ['Camilan & Snack', 'Halal'],
    productName: 'Mystery Snack Box',
    productBoxCount: 1,
    productDescription: 'Snack dan camilan pilihan',
    pickupDate: '24 Oktober 2026',
    pickupTime: '17.00 - 18.00 WIB',
    originalPrice: 45000,
    finalPrice: 20000,
    category: 'snack',
  },
  {
    id: 'ord-4',
    orderNumber: 'RB251023-00455',
    status: 'selesai',
    statusLabel: 'Selesai',
    storeName: 'SayurKita',
    storeRating: 4.6,
    storeReviewCount: 180,
    storeDistance: '2.8 km',
    storeTags: ['Sayur & Buah', 'Halal'],
    productName: 'Mystery Fresh Box',
    productBoxCount: 1,
    productDescription: 'Sayur dan buah segar pilihan',
    pickupDate: '23 Oktober 2026',
    pickupTime: '15.00 - 16.00 WIB',
    finalPrice: 22000,
    category: 'fresh',
  },
  {
    id: 'ord-5',
    orderNumber: 'RB251022-00312',
    status: 'dibatalkan',
    statusLabel: 'Dibatalkan',
    storeName: 'DailyDeli',
    storeRating: 4.4,
    storeReviewCount: 120,
    storeDistance: '4.2 km',
    storeTags: ['Makanan Siap Saji', 'Halal'],
    productName: 'Mystery Deli Box',
    productBoxCount: 1,
    productDescription: 'Makanan siap saji pilihan',
    pickupDate: '22 Oktober 2026',
    pickupTime: '14.00 - 15.00 WIB',
    finalPrice: 20000,
    category: 'deli',
  },
];

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
 * Retrieve all customer orders from localStorage with fallback to initial mock data.
 */
export function getCustomerOrders(): CustomerOrderItem[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMER_ORDERS));
      return INITIAL_CUSTOMER_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CUSTOMER_ORDERS;
  } catch (err) {
    console.warn('Failed to read customer orders from localStorage:', err);
    return INITIAL_CUSTOMER_ORDERS;
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

