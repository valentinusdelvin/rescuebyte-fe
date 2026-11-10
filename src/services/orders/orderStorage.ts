import { getCurrentUser } from '../authService';
import { CustomerOrderItem } from './orderTypes';

const CUSTOMER_ORDERS_STORAGE_KEY = 'rescuebyte_customer_orders';
export const MERCHANT_ORDERS_STORAGE_KEY = 'rescuebyte_merchant_orders';
export const ORDERS_UPDATE_EVENT = 'rescuebyte_orders_update';

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

export function getCustomerOrdersStorageKey(): string | null {
  const user = getCurrentUser();
  const userKey = user?.id || user?.email?.trim().toLowerCase();
  return userKey ? `${CUSTOMER_ORDERS_STORAGE_KEY}:${encodeURIComponent(userKey)}` : null;
}

function isCustomerOrderItem(value: unknown): value is CustomerOrderItem {
  if (!value || typeof value !== 'object') return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.id === 'string' &&
    typeof order.orderNumber === 'string' &&
    typeof order.storeName === 'string' &&
    typeof order.status === 'string' &&
    typeof order.statusLabel === 'string' &&
    typeof order.productName === 'string' &&
    typeof order.productBoxCount === 'number' &&
    typeof order.productDescription === 'string' &&
    typeof order.pickupDate === 'string' &&
    typeof order.pickupTime === 'string' &&
    typeof order.finalPrice === 'number'
  );
}

export function getCustomerOrders(): CustomerOrderItem[] {
  try {
    const storageKey = getCustomerOrdersStorageKey();
    if (!storageKey) return [];

    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const realOrders = parsed
      .filter(isCustomerOrderItem)
      .filter(
        (order) =>
          order &&
          order.id &&
          !PLACEHOLDER_ORDER_IDS.has(order.id) &&
          !PLACEHOLDER_STORE_NAMES.has(order.storeName) &&
          !PLACEHOLDER_ORDER_IDS.has(order.orderNumber) &&
          !order.orderNumber?.startsWith('RB25102')
      )
      .map((order) => {
        const cleaned = { ...order };
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
  } catch (err) {
    console.warn('Failed to read customer orders from localStorage:', err);
    return [];
  }
}

export function saveCustomerOrders(orders: CustomerOrderItem[]): void {
  try {
    const storageKey = getCustomerOrdersStorageKey();
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(orders));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ORDERS_UPDATE_EVENT, { detail: orders }));
    }
  } catch (err) {
    console.warn('Failed to save customer orders to localStorage:', err);
  }
}
