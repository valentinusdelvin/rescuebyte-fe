import { useState, useMemo } from 'react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';

// Existing local assets as sample images (optional, fallback used if missing)
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import cardTousLesJours from '../assets/customer/card-tous-les-jours.jpg';
import cardSateSenayan from '../assets/customer/card-sate-senayan.jpg';
import cardSaladstop from '../assets/customer/card-saladstop.jpg';

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
  reviewCount: number;
  distanceText: string;
  pickupTime: string;
  availablePickupTimes: string[];
  items: CartItem[];
}

export interface CustomerCartProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string) => void;
}

/**
 * Format currency with dots thousands separator (e.g. 20000 -> "20.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Initial Mock Cart Data matching Figma screenshot verbatim
 */
const INITIAL_CART_STORES: StoreCartGroup[] = [
  {
    storeId: 'store-terasa',
    storeName: 'TerasRasa Bakery',
    storeAvatar: 'erasRas',
    rating: 4.8,
    reviewCount: 320,
    distanceText: '1.2 km',
    pickupTime: '15.00 – 18.00 WIB',
    availablePickupTimes: ['15.00 – 18.00 WIB', '18.00 – 20.00 WIB'],
    items: [
      {
        id: 'item-bakery-box',
        name: 'Mystery Bakery Box',
        categoryTags: ['Roti & Pastry', '✓ Halal', 'Tanpa Babi'],
        originalPrice: 40000,
        rescuePrice: 20000,
        discountPercent: 50,
        quantity: 2,
        imageSrc: cardMonsieurSpoon,
      },
      {
        id: 'item-pastry-box',
        name: 'Mystery Pastry Box',
        categoryTags: ['Pastry', 'Kue', '✓ Halal'],
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
    storeAvatar: 'reenBo',
    rating: 4.7,
    reviewCount: 210,
    distanceText: '3.5 km',
    pickupTime: '12.00 – 15.00 WIB',
    availablePickupTimes: ['12.00 – 15.00 WIB', '15.00 – 18.00 WIB'],
    items: [
      {
        id: 'item-meal-box',
        name: 'Mystery Meal Box',
        categoryTags: ['Makanan Berat', 'Lauk', '✓ Halal'],
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
    storeAvatar: 'ayurKit',
    rating: 4.6,
    reviewCount: 180,
    distanceText: '4.1 km',
    pickupTime: '17.00 – 20.00 WIB',
    availablePickupTimes: ['17.00 – 20.00 WIB', '20.00 – 22.00 WIB'],
    items: [
      {
        id: 'item-fresh-box',
        name: 'Mystery Fresh Box',
        categoryTags: ['Sayur & Buah', 'Organik', '✓ Halal'],
        originalPrice: 30000,
        rescuePrice: 15000,
        discountPercent: 50,
        quantity: 1,
        imageSrc: cardSaladstop,
      },
    ],
  },
];

export function CustomerCart({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onShowToast,
}: CustomerCartProps) {
  const [cartStores, setCartStores] = useState<StoreCartGroup[]>(INITIAL_CART_STORES);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculate totals matching the design
  const { totalBoxes, subtotal, discountTotal, serviceFee, grandTotal } = useMemo(() => {
    let boxes = 0;
    let sub = 0;
    cartStores.forEach((store) => {
      store.items.forEach((item) => {
        boxes += item.quantity;
        // Subtotal calculated from original price or item base
        sub += item.originalPrice * item.quantity;
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
    };
  }, [cartStores]);

  // Stepper handlers
  const handleIncrease = (storeId: string, itemId: string) => {
    setCartStores((prev) =>
      prev.map((store) => {
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
      })
    );
  };

  const handleDecrease = (storeId: string, itemId: string) => {
    setCartStores((prev) =>
      prev.map((store) => {
        if (store.storeId !== storeId) return store;
        return {
          ...store,
          items: store.items
            .map((item) => {
              if (item.id !== itemId) return item;
              return { ...item, quantity: item.quantity - 1 };
            })
            .filter((item) => item.quantity > 0),
        };
      }).filter((store) => store.items.length > 0)
    );
  };

  const handleRemoveItem = (storeId: string, itemId: string) => {
    setCartStores((prev) =>
      prev
        .map((store) => {
          if (store.storeId !== storeId) return store;
          return {
            ...store,
            items: store.items.filter((item) => item.id !== itemId),
          };
        })
        .filter((store) => store.items.length > 0)
    );
    if (onShowToast) onShowToast('Item dihapus dari keranjang.');
  };

  const handleRemoveStore = (storeId: string, storeName: string) => {
    setCartStores((prev) => prev.filter((store) => store.storeId !== storeId));
    if (onShowToast) onShowToast(`Semua pesanan dari ${storeName} dihapus.`);
  };

  const handlePickupTimeChange = (storeId: string, newTime: string) => {
    setCartStores((prev) =>
      prev.map((store) => (store.storeId === storeId ? { ...store, pickupTime: newTime } : store))
    );
  };

  const handleCheckout = () => {
    if (totalBoxes === 0) {
      if (onShowToast) onShowToast('Keranjangmu masih kosong.');
      return;
    }
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      if (onShowToast) {
        onShowToast(`🎉 Pesanan ${totalBoxes} box berhasil dibuat! Siapkan kode pengambilan saat tiba di toko.`);
      }
      setCartStores([]);
    }, 1200);
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
                      {/* Left: Avatar, Name, Rating, Distance */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1e2a22] text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                          {store.storeAvatar}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                              {store.storeName}
                            </h2>
                            <span className="bg-[#e7f7ea] text-[#1b6b2c] border border-[#c6edcb] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              ✓ Terverifikasi
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <span className="text-amber-500 font-bold">★ {store.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({store.reviewCount} ulasan)</span>
                            <span className="text-gray-300">•</span>
                            <span>{store.distanceText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Pickup Time Pill & Hapus Semua */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        {/* Pickup Time Dropdown */}
                        <div className="relative">
                          <label htmlFor={`pickup-${store.storeId}`} className="sr-only">Waktu Pickup</label>
                          <div className="flex items-center gap-1.5 bg-[#f8f8f6] border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <select
                              id={`pickup-${store.storeId}`}
                              value={store.pickupTime}
                              onChange={(e) => handlePickupTimeChange(store.storeId, e.target.value)}
                              className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1"
                            >
                              {store.availablePickupTimes.map((time) => (
                                <option key={time} value={time}>
                                  Waktu Pickup {time}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Hapus Semua Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveStore(store.storeId, store.storeName)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                          title="Hapus semua pesanan toko ini"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
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
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-3.5 min-w-0">
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
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a241e] to-[#1c1815] text-amber-200">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-0">
                              <h3 className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                                {item.name}
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

                          {/* Right: Quantity Stepper, Subtotal, Trash Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:self-center">
                            {/* Stepper */}
                            <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-2.5 border border-gray-200">
                              <button
                                type="button"
                                onClick={() => handleDecrease(store.storeId, item.id)}
                                className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                                title="Kurangi box"
                                aria-label="Kurangi box"
                              >
                                –
                              </button>
                              <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] min-w-[16px] text-center select-none">
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
                            <div className="min-w-[90px] text-right">
                              <span className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                                Rp {formatRupiah(item.rescuePrice * item.quantity)}
                              </span>
                            </div>

                            {/* Trash Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(store.storeId, item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                              title="Hapus produk ini"
                              aria-label="Hapus produk ini"
                            >
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                      Penting untuk Diketahui
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 mt-1">
                    {/* Item 1: Pesanan dikelompokkan per toko */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e7f7ea] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        </svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span className="leading-relaxed">
                      Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung bisnis lokal.
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || totalBoxes === 0}
                    className="w-full mt-1 py-3.5 px-4 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed"
                    id="btn-lanjut-checkout"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{isCheckingOut ? 'Memproses Pesanan...' : 'Lanjut ke Checkout →'}</span>
                  </button>
                </article>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="w-full py-16 px-4 bg-white rounded-3xl border border-black/10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#3c6a00] flex items-center justify-center text-3xl mb-3">
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
            <div className="w-12 h-12 mx-auto rounded-full bg-[#3c6a00]/10 flex items-center justify-center text-[#3c6a00]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
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
    </div>
  );
}

export default CustomerCart;
