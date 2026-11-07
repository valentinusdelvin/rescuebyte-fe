import { useEffect, useMemo, useState } from 'react';
import { CartItem, StoreCartGroup, CustomerMysteryBox, CheckoutItem } from '../types';
import {
  getStoredCart, saveCart, removeCartItem, removeCartItemApi, removeCartStore, removeCartStoreApi,
  updateCartItemQtyApi, fetchBackendCart, subscribeToCart,
} from '../services/cartService';
import { getAllStores } from '../services/storeService';

interface UseCustomerCartOptions {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateCheckout?: (items?: CheckoutItem[]) => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onShowToast?: (message: string) => void;
}

interface DeleteTarget {
  type: 'store' | 'item';
  storeId: string;
  storeName: string;
  itemId?: string;
  itemName?: string;
}

function formatStorePickupTime(pickupTime?: string): string {
  if (!pickupTime) return '19:00 - 20:30 WIB';
  return pickupTime
    .replace(/^Waktu Pickup\s*/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/—/g, '-')
    .trim();
}


export function useCustomerCart({
  onNavigateHome, onNavigateMarketplace, onNavigateCheckout, onNavigateStore, onNavigateDetail, onShowToast,
}: UseCustomerCartOptions) {
  const [cartStores, setCartStores] = useState<StoreCartGroup[]>(getStoredCart);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const handleStoreClick = (storeName: string) => {
    if (onNavigateStore) {
      onNavigateStore(storeName);
    } else {
      window.location.hash = '#toko';
    }
  };

  const handleItemClick = (store: StoreCartGroup, item: CartItem) => {
    if (onNavigateDetail) {
      const mysteryBoxItem: CustomerMysteryBox = {
        id: item.id,
        storeName: store.storeName,
        category: item.name,
        categoryBadge: item.name,
        remainingBoxesText: 'Sisa Stok Terbatas',
        distanceText: store.distanceText,
        discountPercent: item.discountPercent,
        originalPrice: item.originalPrice,
        rescuePrice: item.rescuePrice,
        pickupTime: store.pickupTime,
        description: `Menu surplus segar dan berkualitas dari ${store.storeName}. Tetap lezat, higienis, dan layak dinikmati dengan harga hemat.`,
        tags: item.categoryTags && item.categoryTags.length > 0 ? item.categoryTags : ['Halal MUI', 'Surplus Fresh'],
        rating: store.rating,
        reviewCount: store.reviewCount,
        imageSrc: item.imageSrc || '',
      };
      onNavigateDetail(mysteryBoxItem);
    } else {
      window.location.hash = '#detail-produk';
    }
  };

  // Track checked/selected items in cart (default: all checked)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    const initial = getStoredCart();
    const set = new Set<string>();
    initial.forEach((store) => store.items.forEach((item) => set.add(item.id)));
    return set;
  });

  // Synchronize cart from backend database if user is authenticated
  useEffect(() => {
    let isCancelled = false;
    fetchBackendCart().then((remoteStores) => {
      if (!isCancelled && remoteStores && remoteStores.length > 0) {
        setCartStores(remoteStores);
        setSelectedItemIds((prev) => {
          if (prev.size === 0) {
            const allIds = new Set<string>();
            remoteStores.forEach((s) => s.items.forEach((it) => allIds.add(it.id)));
            return allIds;
          }
          return prev;
        });
      }
    }).catch(() => { });
    return () => {
      isCancelled = true;
    };
  }, []);

  // Synchronize cartStores with cartService updates
  useEffect(() => {
    const unsubscribe = subscribeToCart((_, stores) => {
      setCartStores(stores);
      setSelectedItemIds((prev) => {
        const next = new Set<string>();
        const allIds: string[] = [];
        stores.forEach((store) =>
          store.items.forEach((item) => {
            allIds.push(item.id);
            if (prev.has(item.id)) {
              next.add(item.id);
            }
          })
        );
        // Default select all if previously empty but new items arrived
        if (next.size === 0 && allIds.length > 0 && prev.size === 0) {
          allIds.forEach((id) => next.add(id));
        }
        return next;
      });
    });
    return unsubscribe;
  }, []);

  // Enrich cartStores with real backend store profile pictures and operational times
  useEffect(() => {
    let isCancelled = false;
    getAllStores()
      .then((backendStores) => {
        if (isCancelled || !backendStores || backendStores.length === 0) return;
        setCartStores((currentStores) => {
          let hasChanges = false;
          const updated = currentStores.map((cartStore) => {
            const matched = backendStores.find(
              (bs) =>
                (bs.id && cartStore.storeId && (bs.id === cartStore.storeId || cartStore.storeId.includes(bs.id))) ||
                (bs.name && cartStore.storeName && bs.name.toLowerCase() === cartStore.storeName.toLowerCase())
            );
            if (matched) {
              const newAvatar = matched.profile_picture_url || cartStore.storeAvatar;
              const newPickup =
                matched.operational_start && matched.operational_end
                  ? `${matched.operational_start.slice(0, 5)} - ${matched.operational_end.slice(0, 5)} WIB`
                  : cartStore.pickupTime;
              if (newAvatar !== cartStore.storeAvatar || newPickup !== cartStore.pickupTime) {
                hasChanges = true;
                return {
                  ...cartStore,
                  storeAvatar: newAvatar,
                  pickupTime: newPickup,
                };
              }
            }
            return cartStore;
          });
          if (hasChanges) {
            saveCart(updated);
            return updated;
          }
          return currentStores;
        });
      })
      .catch(() => { });
    return () => {
      isCancelled = true;
    };
  }, []);

  // Selection toggle handlers
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const isStoreAllSelected = (store: StoreCartGroup) =>
    store.items.length > 0 && store.items.every((it) => selectedItemIds.has(it.id));

  const toggleStoreSelection = (store: StoreCartGroup) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      const allSelected = store.items.every((it) => next.has(it.id));
      if (allSelected) {
        store.items.forEach((it) => next.delete(it.id));
      } else {
        store.items.forEach((it) => next.add(it.id));
      }
      return next;
    });
  };

  // Calculate totals matching the design based on SELECTED items
  const { totalBoxes, subtotal, discountTotal, serviceFee, grandTotal, selectedCount } = useMemo(() => {
    let boxes = 0;
    let sub = 0;
    let count = 0;
    cartStores.forEach((store) => {
      store.items.forEach((item) => {
        if (selectedItemIds.has(item.id)) {
          boxes += item.quantity;
          sub += item.originalPrice * item.quantity;
          count += 1;
        }
      });
    });

    // Discount matching 50%
    const disc = Math.round(sub * 0.5);
    const fee = boxes > 0 ? 4000 : 0;
    const finalTotal = sub - disc + fee;

    return {
      totalBoxes: boxes,
      subtotal: sub,
      discountTotal: disc,
      serviceFee: fee,
      grandTotal: finalTotal,
      selectedCount: count,
    };
  }, [cartStores, selectedItemIds]);

  // Stepper handlers
  const handleIncrease = (storeId: string, itemId: string) => {
    const updated = cartStores.map((store) => {
      if (store.storeId !== storeId) return store;
      return {
        ...store,
        items: store.items.map((item) => {
          if (item.id !== itemId) return item;
          if (item.quantity >= 5) {
            if (onShowToast) onShowToast('Maksimal 5 box per item.');
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }),
      };
    });
    setCartStores(updated);
    saveCart(updated);
    const targetItem = cartStores.find((s) => s.storeId === storeId)?.items.find((i) => i.id === itemId);
    if (targetItem && targetItem.quantity < 5) {
      updateCartItemQtyApi(itemId, targetItem.quantity + 1).catch(() => { });
    }
  };

  // Decreasing when quantity is 1 triggers confirmation popup
  const handleDecrease = (storeId: string, storeName: string, item: CartItem) => {
    if (item.quantity <= 1) {
      setDeleteTarget({
        type: 'item',
        storeId,
        storeName,
        itemId: item.id,
        itemName: item.name,
      });
      return;
    }

    const updated = cartStores
      .map((store) => {
        if (store.storeId !== storeId) return store;
        return {
          ...store,
          items: store.items.map((it) => {
            if (it.id !== item.id) return it;
            return { ...it, quantity: it.quantity - 1 };
          }),
        };
      });

    setCartStores(updated);
    saveCart(updated);
    updateCartItemQtyApi(item.id, Math.max(1, item.quantity - 1)).catch(() => { });
  };

  const handlePromptRemoveItem = (storeId: string, storeName: string, item: CartItem) => {
    setDeleteTarget({
      type: 'item',
      storeId,
      storeName,
      itemId: item.id,
      itemName: item.name,
    });
  };

  const handlePromptRemoveStore = (storeId: string, storeName: string) => {
    setDeleteTarget({
      type: 'store',
      storeId,
      storeName,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'store') {
      removeCartStoreApi(deleteTarget.storeId).catch(() => { });
      removeCartStore(deleteTarget.storeId);
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        const targetStore = cartStores.find((s) => s.storeId === deleteTarget.storeId);
        if (targetStore) {
          targetStore.items.forEach((it) => next.delete(it.id));
        }
        return next;
      });
      if (onShowToast) onShowToast(`Semua pesanan dari ${deleteTarget.storeName} dihapus.`);
    } else if (deleteTarget.type === 'item' && deleteTarget.itemId) {
      removeCartItemApi(deleteTarget.storeId, deleteTarget.itemId).catch(() => { });
      removeCartItem(deleteTarget.storeId, deleteTarget.itemId);
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        if (deleteTarget.itemId) next.delete(deleteTarget.itemId);
        return next;
      });
      if (onShowToast) onShowToast(`"${deleteTarget.itemName}" dihapus dari keranjang.`);
    }

    setDeleteTarget(null);
  };


  const handleCheckout = () => {
    if (selectedCount === 0 || totalBoxes === 0) {
      if (onShowToast) onShowToast('Pilih minimal 1 item untuk checkout.');
      return;
    }
    const flattenedItems = cartStores.flatMap((store) =>
      store.items
        .filter((item) => selectedItemIds.has(item.id))
        .map((item) => ({
          id: item.id,
          name: item.name?.replace(/\s+Reguler$/i, ''),
          productId: item.productId,
          variantId: item.variantId,
          storeId: store.storeId,
          storeName: store.storeName,
          storeAvatar: store.storeAvatar,
          storeAddress: undefined,
          rating: store.rating,
          reviewCount: store.reviewCount,
          distanceText: store.distanceText,
          categoryTags: item.categoryTags,
          originalPrice: item.originalPrice,
          rescuePrice: item.rescuePrice,
          discountPercent: item.discountPercent,
          quantity: item.quantity,
          imageSrc: item.imageSrc,
          pickupTime: store.pickupTime,
        }))
    );

    if (onNavigateCheckout) {
      onNavigateCheckout(flattenedItems);
    } else {
      window.location.assign('#checkout');
    }
  };

  const handleHeaderTab = (tab: 'beranda' | 'marketplace' | 'kontak') => {
    if (tab === 'beranda') {
      if (onNavigateHome) onNavigateHome();
      else window.location.hash = '#beranda-customer';
    } else if (tab === 'marketplace') {
      if (onNavigateMarketplace) onNavigateMarketplace();
      else window.location.hash = '#marketplace';
    } else if (tab === 'kontak') {
      window.location.hash = '#kontak';
    }
  };


  return {
    cartStores, setCartStores, isAuthModalOpen, setIsAuthModalOpen, deleteTarget, setDeleteTarget,
    handleStoreClick, handleItemClick, selectedItemIds, toggleItemSelection, isStoreAllSelected, toggleStoreSelection,
    totalBoxes, subtotal, discountTotal, serviceFee, grandTotal, selectedCount,
    handleIncrease, handleDecrease, handlePromptRemoveItem, handlePromptRemoveStore, handleConfirmDelete, handleCheckout, handleHeaderTab,
    formatStorePickupTime,
  };
}
