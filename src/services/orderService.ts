import { PaymentOrderData, CustomerOrderStatus } from '../types';
import { api } from './api';
import { extractApiErrorMessage } from './authService';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import { clearCart } from './cartService';
import {
  MERCHANT_ORDERS_STORAGE_KEY,
  ORDERS_UPDATE_EVENT,
  PLACEHOLDER_ORDER_IDS,
  PLACEHOLDER_STORE_NAMES,
  getCustomerOrders,
  getCustomerOrdersStorageKey,
  saveCustomerOrders,
} from './orders/orderStorage';
import { CustomerOrderItem, MerchantOrderItem } from './orders/orderTypes';
export { fetchMerchantOrdersApi } from './orders/sellerOrders';
export { fetchOrderDetailApi, fetchCustomerOrdersApi } from './orders/customerOrders';
export { checkoutOrderApi } from './orders/checkoutService';
export type { CheckoutApiPayload, CheckoutApiResponse } from './orders/checkoutService';
import { getOrderStatusLabel } from './orders/orderStatus';
export { getOrderStatusLabel } from './orders/orderStatus';
export { mapBackendStatusToCustomerStatus } from './orders/orderStatus';
export { fetchPaymentDetailsApi, fetchPaymentStatusApi } from './orders/paymentService';
export type { BackendPaymentState, BackendPaymentDetails } from './orders/paymentService';
export type { CustomerOrderItem, MerchantOrderItem } from './orders/orderTypes';
export {
  INITIAL_CUSTOMER_ORDERS,
  MERCHANT_ORDERS_STORAGE_KEY,
  PLACEHOLDER_ORDER_IDS,
  PLACEHOLDER_STORE_NAMES,
  getCustomerOrders,
  saveCustomerOrders,
} from './orders/orderStorage';


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

/**
 * Buat pesanan baru dari data pembayaran checkout, bersihkan keranjang, dan masukkan ke antrean merchant.
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

  // Sisipkan pesanan baru di posisi terdepan riwayat pesanan pelanggan
  const existingOrders = getCustomerOrders();
  const updatedOrders = [newOrder, ...existingOrders.filter((o) => o.orderNumber !== paymentData.orderId)];
  saveCustomerOrders(updatedOrders);

  // Daftarkan ke antrean pesanan masuk merchant jika sudah terbayar atau menunggu konfirmasi
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

  // Bersihkan keranjang jika pesanan berasal dari keranjang belanja
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

export const INITIAL_MERCHANT_ORDERS: MerchantOrderItem[] = [];

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

export async function cancelCustomerOrderApi(orderId: string, reason?: string): Promise<boolean> {
  try {
    await api.post(`/api/v1/orders/${orderId}/cancel`, { reason: reason || 'Dibatalkan oleh pelanggan' });
    return true;
  } catch (err) {
    console.warn(`Failed to cancel order ${orderId} on backend:`, err);
    return false;
  }
}

