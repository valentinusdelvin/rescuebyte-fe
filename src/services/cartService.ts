import { CustomerMysteryBox, StoreCartGroup, CartItem } from '../types';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import { api } from './api';

const STORAGE_KEY = 'rescuebyte_customer_cart';
const CART_UPDATE_EVENT = 'rescuebyte-cart-update';

export const PLACEHOLDER_CART_STORE_IDS = new Set(['store-terasa', 'store-greenbowl', 'store-sayurkita']);
export const PLACEHOLDER_CART_STORE_NAMES = new Set(['TerasRasa Bakery', 'GreenBowl', 'SayurKita']);

export const INITIAL_CART_STORES: StoreCartGroup[] = [];


/**
 * Calculates total box count across all stores in the cart.
 */
export function countCartItems(stores: StoreCartGroup[]): number {
  return stores.reduce(
    (acc, store) => acc + store.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
}

/**
 * Retrieve cart stores from localStorage, filtering out legacy placeholder stores.
 */
export function getStoredCart(): StoreCartGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realStores = parsed
        .filter(
          (store) =>
            store &&
            !PLACEHOLDER_CART_STORE_IDS.has(store.storeId) &&
            !PLACEHOLDER_CART_STORE_NAMES.has(store.storeName)
        )
        .map((store) => ({
          ...store,
          items: Array.isArray(store.items)
            ? store.items
                .filter((item: CartItem) => item && !item.id?.startsWith('item-'))
                .map((item: CartItem) => ({
                  ...item,
                  name: item.name ? item.name.replace(/\s+Reguler$/i, '') : item.name,
                }))
            : [],
        }))
        .filter((store) => store.items.length > 0);

      if (realStores.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realStores));
      }
      return realStores;
    }
    return [];
  } catch (err) {
    console.warn('Failed to read cart from localStorage:', err);
    return [];
  }
}

/**
 * Save cart stores to localStorage and broadcast change event.
 */
export function saveCart(stores: StoreCartGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(CART_UPDATE_EVENT, {
          detail: { stores, count: countCartItems(stores) },
        })
      );
    }
  } catch (err) {
    console.warn('Failed to save cart to localStorage:', err);
  }
}

/**
 * Get current total count of items in the cart.
 */
export function getCartCount(): number {
  return countCartItems(getStoredCart());
}

/**
 * Helper to get 2-letter uppercase initials for a store name.
 */
export function getStoreInitials(name: string): string {
  if (!name) return 'TR';
  const clean = name.trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Fetch a product's first variant ID from the backend.
 */
export async function getProductVariantId(productId: string): Promise<string | null> {
  if (!productId || productId.startsWith('prod-') || productId.startsWith('item-')) {
    return null;
  }
  try {
    const res = await api.get(`/api/v1/products/${productId}`);
    const variants = res.data?.payload?.variants;
    if (Array.isArray(variants) && variants.length > 0) {
      return variants[0]?.id || null;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to resolve variant for product ${productId}:`, err);
    return null;
  }
}

/**
 * Fetch cart from backend API (/api/v1/cart) when authenticated.
 * Seamlessly maps backend StoreCartGroup and CartItemResponse to frontend models.
 */
export async function fetchBackendCart(): Promise<StoreCartGroup[] | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) {
    return null;
  }

  try {
    const response = await api.get('/api/v1/cart');
    const payload = response.data?.payload;
    if (!payload || !Array.isArray(payload.stores)) {
      return null;
    }

    const mappedStores: StoreCartGroup[] = payload.stores.map((store: any) => {
      const parts = [store.store_address, store.store_district, store.store_city].filter(Boolean);
      const fullAddress = parts.join(', ');

      const opStart = store.operational_start ? store.operational_start.slice(0, 5).replace(':', '.') : '';
      const opEnd = store.operational_end ? store.operational_end.slice(0, 5).replace(':', '.') : '';
      const formattedPickup =
        opStart && opEnd
          ? `${opStart} - ${opEnd} WIB`
          : store.pickup_time
          ? store.pickup_time.replace(/^Waktu Pickup\s*/i, '').replace(/—/g, '-').trim()
          : '15.00 - 18.00 WIB';

      return {
        storeId: store.store_id,
        storeName: store.store_name,
        storeAvatar: getStoreInitials(store.store_name),
        storeAddress: fullAddress,
        rating: 4.9,
        reviewCount: 42,
        distanceText: store.distance_km ? `${store.distance_km} km` : '1.0 km',
        pickupTime: formattedPickup,
        availablePickupTimes: [formattedPickup],
        items: (store.items || []).map((it: any) => ({
          id: it.id, // backend Cart Item UUID
          productId: it.product_id,
          variantId: it.product_variant_id,
          name: it.product_name ? it.product_name.replace(/\s+Reguler$/i, '') : 'Mystery Box',
          categoryTags: ['Penyelamatan Pangan', '✓ Halal'],
          originalPrice: it.normal_price || 40000,
          rescuePrice: it.rescue_price || 20000,
          discountPercent: it.discount_percentage || 50,
          quantity: it.quantity,
          imageSrc: it.product_image_url || cardMonsieurSpoon,
          currentStock: it.current_stock,
          isAvailable: it.is_available,
        })),
      };
    });

    saveCart(mappedStores);
    return mappedStores;
  } catch (err: any) {
    console.warn('fetchBackendCart failed:', err?.message || err);
    return null;
  }
}

/**
 * Add a mystery box product to the cart with specified quantity.
 * If the item already exists in the store group, its quantity is increased (max 5).
 * Returns the updated total cart item count.
 */
export function addToCart(box: CustomerMysteryBox, quantityToAdd: number = 1): number {
  const stores = getStoredCart();
  const targetStoreId = box.id.startsWith('store-')
    ? box.id
    : `store-${box.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  let storeFound = false;

  const updatedStores = stores.map((store) => {
    // Match by storeId or storeName
    if (
      store.storeId === targetStoreId ||
      store.storeName.toLowerCase() === box.storeName.toLowerCase()
    ) {
      storeFound = true;
      const existingItemIndex = store.items.findIndex(
        (it) => it.id === box.id || it.name.toLowerCase() === box.category.toLowerCase()
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...store.items];
        const currentQty = updatedItems[existingItemIndex].quantity;
        const newQty = Math.min(5, currentQty + quantityToAdd);
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQty,
        };
        return {
          ...store,
          storeAvatar: box.storeAvatar || store.storeAvatar,
          items: updatedItems,
        };
      }

      // Add new item to existing store
      return {
        ...store,
        storeAvatar: box.storeAvatar || store.storeAvatar,
        items: [
          ...store.items,
          {
            id: box.id,
            productId: box.id,
            variantId: box.variantId,
            name: box.category ? box.category.replace(/^[^\w\s]+/, '').trim() : 'Mystery Bakery Box',
            categoryTags: box.tags && box.tags.length > 0 ? box.tags : ['✓ Halal', 'Sisa Stok Harian'],
            originalPrice: box.originalPrice,
            rescuePrice: box.rescuePrice,
            discountPercent: box.discountPercent,
            quantity: Math.min(5, quantityToAdd),
            imageSrc: box.imageSrc,
          },
        ],
      };
    }
    return store;
  });

  // If store doesn't exist yet, create a new StoreCartGroup
  if (!storeFound) {
    const avatar = box.storeAvatar || getStoreInitials(box.storeName);
    const newStoreGroup: StoreCartGroup = {
      storeId: targetStoreId,
      storeName: box.storeName,
      storeAvatar: avatar,
      rating: box.rating ?? 4.8,
      reviewCount: typeof box.reviewCount === 'number' ? box.reviewCount : Number(box.reviewCount) || 100,
      distanceText: box.distanceText || '1.0 km',
      pickupTime: box.pickupTime || '15.00 - 18.00 WIB',
      availablePickupTimes: [box.pickupTime || '15.00 - 18.00 WIB', '18.00 - 20.00 WIB'],
      items: [
        {
          id: box.id,
          productId: box.id,
          variantId: box.variantId,
          name: box.category ? box.category.replace(/^[^\w\s]+/, '').trim() : 'Mystery Bakery Box',
          categoryTags: box.tags && box.tags.length > 0 ? box.tags : ['✓ Halal', 'Sisa Stok Harian'],
          originalPrice: box.originalPrice,
          rescuePrice: box.rescuePrice,
          discountPercent: box.discountPercent,
          quantity: Math.min(5, quantityToAdd),
          imageSrc: box.imageSrc,
        },
      ],
    };
    updatedStores.unshift(newStoreGroup);
  }

  saveCart(updatedStores);
  return countCartItems(updatedStores);
}

/**
 * Add item to cart with backend API synchronization if authenticated.
 */
export async function addToCartApi(
  box: CustomerMysteryBox,
  quantityToAdd: number = 1
): Promise<{ count: number; serverSynced: boolean }> {
  const localCount = addToCart(box, quantityToAdd);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) {
    return { count: localCount, serverSynced: false };
  }

  try {
    let variantId = box.variantId;
    if (!variantId && box.id) {
      variantId = (await getProductVariantId(box.id)) || undefined;
    }

    if (variantId) {
      await api.post('/api/v1/cart/items', {
        product_variant_id: variantId,
        quantity: quantityToAdd,
      });
      const backendCart = await fetchBackendCart();
      if (backendCart) {
        return { count: countCartItems(backendCart), serverSynced: true };
      }
    }
  } catch (err: any) {
    console.warn('Backend addToCartApi failed, fallback to local cart:', err?.message || err);
  }

  return { count: localCount, serverSynced: false };
}

/**
 * Update cart item quantity with backend API synchronization.
 */
export async function updateCartItemQtyApi(
  itemId: string,
  newQuantity: number
): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token && itemId && itemId.length === 36 && itemId.includes('-')) {
    try {
      await api.patch(`/api/v1/cart/items/${itemId}`, {
        quantity: newQuantity,
      });
    } catch (err) {
      console.warn(`Failed to update backend cart item ${itemId}:`, err);
    }
  }
}

/**
 * Remove an item from a store group with backend API synchronization.
 */
export function removeCartItem(storeId: string, itemId: string): number {
  const stores = getStoredCart();
  const updatedStores = stores
    .map((store) => {
      if (store.storeId !== storeId) return store;
      return {
        ...store,
        items: store.items.filter((it) => it.id !== itemId),
      };
    })
    .filter((store) => store.items.length > 0);

  saveCart(updatedStores);
  return countCartItems(updatedStores);
}

export async function removeCartItemApi(
  storeId: string,
  itemId: string
): Promise<number> {
  const count = removeCartItem(storeId, itemId);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token && itemId && itemId.length === 36 && itemId.includes('-')) {
    try {
      await api.delete(`/api/v1/cart/items/${itemId}`);
    } catch (err) {
      console.warn(`Failed to delete backend cart item ${itemId}:`, err);
    }
  }

  return count;
}

/**
 * Remove an entire store group.
 */
export function removeCartStore(storeId: string): number {
  const stores = getStoredCart();
  const updatedStores = stores.filter((store) => store.storeId !== storeId);
  saveCart(updatedStores);
  return countCartItems(updatedStores);
}

export async function removeCartStoreApi(storeId: string): Promise<number> {
  const count = removeCartStore(storeId);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token && storeId && storeId.length === 36 && storeId.includes('-')) {
    try {
      await api.delete(`/api/v1/cart/stores/${storeId}`);
    } catch (err) {
      console.warn(`Failed to delete backend cart store ${storeId}:`, err);
    }
  }

  return count;
}

/**
 * Clear all items from the cart.
 */
export function clearCart(): void {
  saveCart([]);
}

export async function clearCartApi(): Promise<void> {
  clearCart();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    try {
      await api.delete('/api/v1/cart');
    } catch (err) {
      console.warn('Failed to clear backend cart:', err);
    }
  }
}

/**
 * Subscribe to cart updates across components and window storage events.
 */
export function subscribeToCart(
  callback: (count: number, stores: StoreCartGroup[]) => void
): () => void {
  if (typeof window === 'undefined') return () => { };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<{ stores: StoreCartGroup[]; count: number }>;
    if (custom.detail) {
      callback(custom.detail.count, custom.detail.stores);
    } else {
      const stores = getStoredCart();
      callback(countCartItems(stores), stores);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const stores = getStoredCart();
      callback(countCartItems(stores), stores);
    }
  };

  window.addEventListener(CART_UPDATE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(CART_UPDATE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
