import { CustomerMysteryBox, StoreCartGroup, CartItem } from '../types';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import cardTousLesJours from '../assets/customer/card-tous-les-jours.jpg';
import cardSateSenayan from '../assets/customer/card-sate-senayan.jpg';
import cardSaladstop from '../assets/customer/card-saladstop.jpg';

const STORAGE_KEY = 'rescuebyte_customer_cart';
const CART_UPDATE_EVENT = 'rescuebyte-cart-update';

export const INITIAL_CART_STORES: StoreCartGroup[] = [
  {
    storeId: 'store-terasa',
    storeName: 'Toko Rejak',
    storeAvatar: 'TR',
    rating: 4.8,
    reviewCount: 320,
    distanceText: '1.2 km',
    pickupTime: '15.00 – 18.00 WIB',
    availablePickupTimes: ['15.00 – 18.00 WIB', '18.00 – 20.00 WIB'],
    items: [
      {
        id: 'item-bakery-box',
        name: 'Mystery Bakery Box',
        categoryTags: ['Roti & Pastry', 'Halal', 'Tanpa Babi'],
        originalPrice: 40000,
        rescuePrice: 20000,
        discountPercent: 50,
        quantity: 2,
        imageSrc: cardMonsieurSpoon,
      },
      {
        id: 'item-pastry-box',
        name: 'Mystery Pastry Box',
        categoryTags: ['Pastry', 'Kue', 'Halal'],
        originalPrice: 36000,
        rescuePrice: 18000,
        discountPercent: 50,
        quantity: 1,
        imageSrc: cardTousLesJours,
      },
    ],
  },
  {
    storeId: 'store-greenbowl',
    storeName: 'GreenBowl',
    storeAvatar: 'GB',
    rating: 4.7,
    reviewCount: 210,
    distanceText: '3.5 km',
    pickupTime: '12.00 – 15.00 WIB',
    availablePickupTimes: ['12.00 – 15.00 WIB', '15.00 – 18.00 WIB'],
    items: [
      {
        id: 'item-meal-box',
        name: 'Mystery Meal Box',
        categoryTags: ['Makanan Berat', 'Lauk', 'Halal'],
        originalPrice: 50000,
        rescuePrice: 25000,
        discountPercent: 50,
        quantity: 1,
        imageSrc: cardSateSenayan,
      },
    ],
  },
  {
    storeId: 'store-sayurkita',
    storeName: 'SayurKita',
    storeAvatar: 'SK',
    rating: 4.6,
    reviewCount: 180,
    distanceText: '4.1 km',
    pickupTime: '17.00 – 20.00 WIB',
    availablePickupTimes: ['17.00 – 20.00 WIB', '20.00 – 22.00 WIB'],
    items: [
      {
        id: 'item-fresh-box',
        name: 'Mystery Fresh Box',
        categoryTags: ['Sayur & Buah', 'Organik', 'Halal'],
        originalPrice: 30000,
        rescuePrice: 15000,
        discountPercent: 50,
        quantity: 1,
        imageSrc: cardSaladstop,
      },
    ],
  },
];

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
 * Retrieve cart stores from localStorage with fallback to initial mock data.
 */
export function getStoredCart(): StoreCartGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CART_STORES));
      return INITIAL_CART_STORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((store) => ({
        ...store,
        items: Array.isArray(store.items)
          ? store.items.map((item: CartItem) => ({
              ...item,
              name: item.name ? item.name.replace(/\s+Reguler$/i, '') : item.name,
            }))
          : [],
      }));
    }
    return INITIAL_CART_STORES;
  } catch (err) {
    console.warn('Failed to read cart from localStorage:', err);
    return INITIAL_CART_STORES;
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
        return { ...store, items: updatedItems };
      }

      // Add new item to existing store
      return {
        ...store,
        items: [
          ...store.items,
          {
            id: box.id,
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
    const avatar = getStoreInitials(box.storeName);
    const newStoreGroup: StoreCartGroup = {
      storeId: targetStoreId,
      storeName: box.storeName,
      storeAvatar: avatar,
      rating: box.rating ?? 4.8,
      reviewCount: typeof box.reviewCount === 'number' ? box.reviewCount : Number(box.reviewCount) || 100,
      distanceText: box.distanceText || '1.0 km',
      pickupTime: box.pickupTime || '15.00 – 18.00 WIB',
      availablePickupTimes: [box.pickupTime || '15.00 – 18.00 WIB', '18.00 – 20.00 WIB'],
      items: [
        {
          id: box.id,
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
 * Remove an item from a store group.
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

/**
 * Remove an entire store group.
 */
export function removeCartStore(storeId: string): number {
  const stores = getStoredCart();
  const updatedStores = stores.filter((store) => store.storeId !== storeId);
  saveCart(updatedStores);
  return countCartItems(updatedStores);
}

/**
 * Clear all items from the cart.
 */
export function clearCart(): void {
  saveCart([]);
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
