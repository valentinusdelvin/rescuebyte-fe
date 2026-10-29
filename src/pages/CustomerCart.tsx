import { useState, useMemo, useEffect } from 'react';
import {
  Check,
  Clock,
  ChevronDown,
  Trash2,
  Package,
  Info,
  Store,
  RefreshCw,
  Receipt,
  Lock,
  User,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { CartItem, StoreCartGroup } from '../types';
import {
  getStoredCart,
  saveCart,
  removeCartItem,
  removeCartStore,
  subscribeToCart,
  getStoreInitials,
} from '../services/cartService';

export type { CartItem, StoreCartGroup };

export interface CustomerCartProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateCheckout?: (items?: import('../types').CheckoutItem[]) => void;
  onShowToast?: (message: string) => void;
}

interface DeleteTarget {
  type: 'store' | 'item';
  storeId: string;
  storeName: string;
  itemId?: string;
  itemName?: string;
}

/**
 * Format currency with dots thousands separator (e.g. 20000 -> "20.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function CustomerCart({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onNavigateCheckout,
  onShowToast,
}: CustomerCartProps) {
  const [cartStores, setCartStores] = useState<StoreCartGroup[]>(getStoredCart);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Track checked/selected items in cart (default: all checked)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    const initial = getStoredCart();
    const set = new Set<string>();
    initial.forEach((store) => store.items.forEach((item) => set.add(item.id)));
    return set;
  });

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

  const handlePickupTimeChange = (storeId: string, newTime: string) => {
    const updated = cartStores.map((store) =>
      store.storeId === storeId ? { ...store, pickupTime: newTime } : store
    );
    setCartStores(updated);
    saveCart(updated);
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
      const footerEl = document.getElementById('customer-footer');
      if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
      else if (onShowToast) onShowToast('Hubungi kami di halo@rescuebyte.id');
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="cart-page-root">
      <div>
        {/* 1. Floating Pill Header (Active on Marketplace as per Figma) */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 2. Main Content Grid */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Keranjang Saya
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Periksa kembali pesananmu sebelum melanjutkan ke checkout.
            </p>
          </div>

          {cartStores.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Stores & Items */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {cartStores.map((store) => (
                  <section
                    key={store.storeId}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-5"
                    id={`cart-store-${store.storeId}`}
                  >
                    {/* Store Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                      {/* Left: Store Checkbox, Avatar, Name, Rating, Distance */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Store Selection Checkbox */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isStoreAllSelected(store)}
                          onClick={() => toggleStoreSelection(store)}
                          className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                            isStoreAllSelected(store)
                              ? 'bg-[#16a34a] border-[#16a34a] text-white shadow-2xs'
                              : store.items.some((it) => selectedItemIds.has(it.id))
                                ? 'bg-[#16a34a]/15 border-[#16a34a] text-[#16a34a]'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                          aria-label={`Pilih semua produk dari ${store.storeName}`}
                        >
                          {isStoreAllSelected(store) ? (
                            <Check className="w-3 h-3 stroke-[3.2]" />
                          ) : store.items.some((it) => selectedItemIds.has(it.id)) ? (
                            <span className="w-2.5 h-0.5 bg-[#16a34a] rounded-full" />
                          ) : null}
                        </button>

                        <div className="w-10 h-10 rounded-full bg-[#1b261e] text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs">
                          {store.storeAvatar && store.storeAvatar.length <= 2
                            ? store.storeAvatar
                            : getStoreInitials(store.storeName)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c] whitespace-nowrap">
                              {store.storeName}
                            </h2>
                            <span className="bg-[#e7f7ea] text-[#1b6b2c] border border-[#c6edcb] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 whitespace-nowrap select-none">
                              ✓ Terverifikasi
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                            <span className="text-amber-500 font-bold">★ {store.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({store.reviewCount} ulasan)</span>
                            <span className="text-gray-300">•</span>
                            <span>{store.distanceText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Pickup Time Pill & Hapus Semua */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-center">
                        {/* Pickup Time Dropdown */}
                        <div className="relative inline-flex items-center bg-[#f8f8f6] hover:bg-[#f0f0ee] border border-gray-200/90 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 transition-colors">
                          <label htmlFor={`pickup-${store.storeId}`} className="sr-only">Waktu Pickup</label>
                          <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0 mr-1.5" />
                          <span className="text-gray-500 whitespace-nowrap mr-1 text-[11px] sm:text-xs">Waktu Pickup</span>
                          <select
                            id={`pickup-${store.storeId}`}
                            value={store.pickupTime}
                            onChange={(e) => handlePickupTimeChange(store.storeId, e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-gray-900 focus:outline-none cursor-pointer pr-1 appearance-none"
                          >
                            {store.availablePickupTimes.map((time) => {
                              const cleanTime = time.replace(/^Waktu Pickup\s*/i, '').replace(/\s*\([^)]*\)/, '').trim();
                              return (
                                <option key={time} value={time}>
                                  {cleanTime}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="w-3 h-3 text-gray-400 pointer-events-none ml-0.5" />
                        </div>

                        {/* Hapus Semua Button */}
                        <button
                          type="button"
                          onClick={() => handlePromptRemoveStore(store.storeId, store.storeName)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
                          title="Hapus semua pesanan toko ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Semua</span>
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col divide-y divide-gray-100">
                      {store.items.map((item) => (
                        <div
                          key={item.id}
                          className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Left: Checkbox, Thumbnail & Details */}
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            {/* Item Checkbox */}
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={selectedItemIds.has(item.id)}
                              onClick={() => toggleItemSelection(item.id)}
                              className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                                selectedItemIds.has(item.id)
                                  ? 'bg-[#16a34a] border-[#16a34a] text-white shadow-2xs'
                                  : 'bg-white border-gray-300 hover:border-gray-400'
                              }`}
                              aria-label={`Pilih ${item.name}`}
                            >
                              {selectedItemIds.has(item.id) && (
                                <Check className="w-3 h-3 stroke-[3.2]" />
                              )}
                            </button>

                            {/* Product Thumbnail */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#24201c] shrink-0 border border-black/10 relative">
                              {item.imageSrc ? (
                                <img
                                  src={item.imageSrc}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#2a241e] to-[#1c1815] text-amber-200">
                                  <Package className="w-5.5 h-5.5" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-0">
                              <h3 className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                                {item.name?.replace(/\s+Reguler$/i, '')}
                              </h3>

                              {/* Tags */}
                              <div className="flex items-center gap-1.5 flex-wrap my-1.5">
                                {item.categoryTags.map((tag, idx) => (
                                  <span
                                    key={`${tag}-${idx}`}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      tag.includes('Halal')
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Prices */}
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-[#e11d48]">
                                  Rp {formatRupiah(item.rescuePrice)}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  Rp {formatRupiah(item.originalPrice)}
                                </span>
                                <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  {item.discountPercent}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Quantity Stepper, Subtotal, Red Trash Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 sm:self-center">
                            {/* Stepper */}
                            <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-2.5 border border-gray-200/80">
                              <button
                                type="button"
                                onClick={() => handleDecrease(store.storeId, store.storeName, item)}
                                className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                                title={item.quantity === 1 ? 'Hapus box' : 'Kurangi box'}
                                aria-label={item.quantity === 1 ? 'Hapus box' : 'Kurangi box'}
                              >
                                –
                              </button>
                              <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] min-w-4 text-center select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncrease(store.storeId, item.id)}
                                className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                                title="Tambah box"
                                aria-label="Tambah box"
                              >
                                +
                              </button>
                            </div>

                            {/* Subtotal Item Price */}
                            <div className="min-w-21.25 sm:min-w-23.75 text-right">
                              <span className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                                Rp {formatRupiah(item.rescuePrice * item.quantity)}
                              </span>
                            </div>

                            {/* Trash Button */}
                            <button
                              type="button"
                              onClick={() => handlePromptRemoveItem(store.storeId, store.storeName, item)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer p-1.5 rounded-lg"
                              title="Hapus produk ini"
                              aria-label="Hapus produk ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* RIGHT COLUMN: Info Cards & Order Summary */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* 1. Card: Penting untuk Diketahui */}
                <article className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-gray-700" />
                    <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                      Penting untuk Diketahui
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 mt-1">
                    {/* Item 1: Pesanan dikelompokkan per toko */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e7f7ea] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#1b1c1c]">
                          Pesanan dikelompokkan per toko
                        </span>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          Setiap toko memiliki lokasi dan waktu pickup yang berbeda.
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Stok tidak dijamin */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e7f7ea] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#1b1c1c]">
                          Stok tidak dijamin
                        </span>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          Stok akan divalidasi ulang saat checkout.
                        </p>
                      </div>
                    </div>

                    {/* Item 3: Mystery Box */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e7f7ea] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#1b1c1c]">
                          Mystery Box
                        </span>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          Isi menyesuaikan stok harian toko. Tidak dapat memilih menu tertentu.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                {/* 2. Card: Ringkasan Pesanan */}
                <article className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4.5 h-4.5 text-gray-700" />
                    <h2 className="font-bold text-base text-[#1b1c1c]">
                      Ringkasan Pesanan
                    </h2>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-gray-600 pt-1">
                    <div className="flex items-center justify-between">
                      <span>Total Item</span>
                      <span className="font-semibold text-gray-900">{totalBoxes} box</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">Rp {formatRupiah(subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        Diskon <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.5 rounded-md">50%</span>
                      </span>
                      <span className="font-semibold text-[#e11d48]">
                        - Rp {formatRupiah(discountTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        Biaya Layanan
                        <Info className="w-3 h-3 text-gray-400" />
                      </span>
                      <span className="font-semibold text-gray-900">Rp {formatRupiah(serviceFee)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1b1c1c]">Total Pembayaran</span>
                    <span className="font-black text-xl text-[#e11d48] font-display">
                      Rp {formatRupiah(grandTotal)}
                    </span>
                  </div>

                  {/* Impact Note Banner */}
                  <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#24521e]">
                    <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung bisnis lokal.
                    </span>
                  </div>

                  {/* Checkout Button matching Image 3 */}
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={totalBoxes === 0}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                      id="btn-lanjut-checkout"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Lanjut ke Checkout →</span>
                    </button>
                  </div>
                </article>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="w-full py-16 px-4 bg-white rounded-3xl border border-black/10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center text-3xl mb-3">
                🛒
              </div>
              <h3 className="font-bold text-lg text-[#1b1c1c]">Keranjangmu Kosong</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-1 mb-5">
                Belum ada Mystery Box di keranjangmu. Jelajahi aneka paket makanan lezat dan hemat di sekitarmu!
              </p>
              <button
                type="button"
                onClick={onNavigateMarketplace || (() => { window.location.hash = '#marketplace'; })}
                className="px-6 py-2.5 bg-[#1e2420] text-white text-xs font-bold rounded-full hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                Jelajahi Marketplace
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 3. Customer Footer */}
      <CustomerFooter
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Membuka live chat Customer Service RescueBite...');
        }}
      />

      {/* 4. Quick Auth Modal */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#1b1c1c]">Masuk ke RescueBite</h3>
            <p className="text-xs text-gray-500">
              Masuk untuk memesan mystery box dan menyimpan pesanan favoritmu.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#0b1510] text-white rounded-xl font-semibold text-sm hover:bg-[#202a24] transition-colors cursor-pointer"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  if (onShowToast) onShowToast('Selamat datang kembali, Reza Akbar!');
                }}
              >
                Masuk sebagai Reza Akbar
              </button>
              <button
                type="button"
                className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setIsAuthModalOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'store' ? 'Hapus Semua Pesanan?' : 'Hapus Item dari Keranjang?'}
        itemName={deleteTarget?.type === 'store' ? deleteTarget.storeName : (deleteTarget?.itemName || '')}
        message={
          deleteTarget?.type === 'store'
            ? `Apakah kamu yakin ingin menghapus semua pesanan dari "${deleteTarget.storeName}" dari keranjang?`
            : `Apakah kamu yakin ingin menghapus "${deleteTarget?.itemName}" dari keranjang?`
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CustomerCart;
