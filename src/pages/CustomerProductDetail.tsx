import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShoppingCart, Plus } from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerMysteryBox } from '../types';
import { getCartCount, addToCart, subscribeToCart } from '../services/cartService';

// Existing local assets as initial gallery examples (fallback slot used if missing)
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import cardTousLesJours from '../assets/customer/card-tous-les-jours.jpg';

export interface CustomerProductDetailProps {
  product?: CustomerMysteryBox | null;
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateCart?: () => void;
  onNavigateCheckout?: (product: CustomerMysteryBox, quantity: number) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string) => void;
}

interface FlyingCartItem {
  id: number;
  src: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  targetX: number;
  targetY: number;
  quantity: number;
}

/**
 * Format currency with dots thousands separator (e.g. 20000 -> "20.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function CustomerProductDetail({
  product,
  onNavigateBack,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateCart,
  onNavigateCheckout,
  onNavigateSeller,
  onShowToast,
}: CustomerProductDetailProps) {
  const shouldReduceMotion = useReducedMotion();

  // Use product prop or default to Figma mock data for TerasRasa Bakery
  const storeName = product?.storeName || 'TerasRasa Bakery';
  const title = product ? `${product.category.replace(/^[^\w\s]+/, '').trim()} Reguler` : 'Mystery Bakery Box Reguler';
  const description =
    product?.description ||
    'Nikmati kejutan aneka roti dan pastry berkualitas dengan harga spesial. Isi menyesuaikan stok harian toko, selalu fresh dan tetap lezat!';
  const rescuePrice = product?.rescuePrice ?? 20000;
  const originalPrice = product?.originalPrice ?? 40000;
  const discountPercent = product?.discountPercent ?? 50;
  const rating = product?.rating ?? 4.8;
  const reviewCount = product?.reviewCount ?? 320;
  const distanceText = product?.distanceText ?? '1.2 km';
  const remainingBoxes = 5;
  const pickupTime = product?.pickupTime ? product.pickupTime.replace(/WIB.*$/, 'WIB') : '15.00 – 18.00 WIB';

  // Gallery state
  const galleryImages = [
    product?.imageSrc || cardMonsieurSpoon,
    cardTousLesJours,
    cardMonsieurSpoon,
  ];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reservation quantity state (1 - 5)
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = 5;

  // Modals & Cart State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(getCartCount);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingCartItem[]>([]);

  // DOM Refs for animation positioning
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroImageContainerRef = useRef<HTMLDivElement>(null);
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const flyingIdRef = useRef<number>(1);

  // Synchronize cart count with centralized cartService
  useEffect(() => {
    const unsubscribe = subscribeToCart((count) => {
      setCartCount(count);
    });
    return unsubscribe;
  }, []);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    } else if (onShowToast) {
      onShowToast(`Maksimal pemesanan adalah ${maxQuantity} box per transaksi.`);
    }
  };

  const handleReservasi = () => {
    // Navigate directly to checkout page
    if (onNavigateCheckout) {
      onNavigateCheckout(activeBoxItem, quantity);
    } else {
      window.location.assign('#checkout');
    }
  };

  // Fly-to-Cart trigger when user clicks "+ Keranjang"
  const handleAddToCart = () => {
    const targetEl = cartButtonRef.current;
    const sourceEl = heroImageRef.current || heroImageContainerRef.current || addToCartBtnRef.current;

    if (!targetEl || !sourceEl || shouldReduceMotion) {
      // Direct add without animation if reduced motion or elements missing
      const newCount = addToCart(activeBoxItem, quantity);
      setCartCount(newCount);
      setIsCartBouncing(true);
      if (onShowToast) {
        onShowToast('Berhasil ditambahkan ke keranjang');
      }
      return;
    }

    // Determine initial and target coordinates with getBoundingClientRect()
    const startRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Center target on floating cart button
    const targetX = targetRect.left + targetRect.width / 2 - 24;
    const targetY = targetRect.top + targetRect.height / 2 - 24;

    const nextId = flyingIdRef.current;
    flyingIdRef.current += 1;

    const newItem: FlyingCartItem = {
      id: nextId,
      src: galleryImages[selectedImageIndex] || activeBoxItem.imageSrc,
      startX: startRect.left,
      startY: startRect.top,
      startWidth: startRect.width,
      startHeight: startRect.height,
      targetX,
      targetY,
      quantity,
    };

    setFlyingItems((prev) => [...prev, newItem]);
  };

  const handleFlyComplete = (id: number, qtyToAdd: number) => {
    // 1. Cleanup flying element
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));

    // 2. Persist in cartService
    const newCount = addToCart(activeBoxItem, qtyToAdd);
    setCartCount(newCount);

    // 3. Trigger bounce / scale animation on cart button
    setIsCartBouncing(true);

    // 4. Show success toast
    if (onShowToast) {
      onShowToast('Berhasil ditambahkan ke keranjang');
    }
  };

  const handleHeaderTab = (tab: 'beranda' | 'marketplace' | 'kontak') => {
    if (tab === 'beranda') {
      if (onNavigateHome) {
        onNavigateHome();
      } else {
        window.location.hash = '#beranda-customer';
      }
    } else if (tab === 'marketplace') {
      if (onNavigateMarketplace) {
        onNavigateMarketplace();
      } else {
        window.location.hash = '#marketplace';
      }
    } else if (tab === 'kontak') {
      const footerEl = document.getElementById('customer-footer');
      if (footerEl) {
        footerEl.scrollIntoView({ behavior: 'smooth' });
      } else if (onShowToast) {
        onShowToast('Hubungi kami di halo@rescuebyte.id');
      }
    }
  };

  // Active mystery box representation for modal
  const activeBoxItem: CustomerMysteryBox = product || {
    id: 'detail-teras-rasa',
    storeName,
    category: '🥐 Pastry & Bakery',
    distanceText,
    remainingBoxesText: `Tersisa ${remainingBoxes} box`,
    discountPercent,
    originalPrice,
    rescuePrice,
    pickupTime,
    description,
    tags: ['✓ Halal', 'Sisa Stok Harian'],
    rating,
    reviewCount,
    imageSrc: galleryImages[selectedImageIndex] || '',
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="product-detail-root">
      <div>
        {/* 1. Floating Pill Header (Active on Marketplace as shown in Figma) */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 2. Main Content Grid */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateMarketplace || onNavigateBack || (() => { window.location.hash = '#marketplace'; })}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#1b1c1c] transition-colors cursor-pointer group"
            >
              <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-100 transition-colors shadow-2xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
              <span>Kembali ke Marketplace</span>
            </button>

            <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
              Marketplace &gt; {storeName} &gt; {title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Gallery & Tentang Produk */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Gallery Section */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 items-stretch sm:items-start">
                {/* Vertical Thumbnails strip */}
                <div className="flex sm:flex-col items-center justify-center gap-2.5 shrink-0">
                  {/* Up button */}
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 flex items-center justify-center shadow-2xs transition-all cursor-pointer hidden sm:flex"
                    title="Foto sebelumnya"
                    aria-label="Foto sebelumnya"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>

                  {/* 3 Thumbnails */}
                  {galleryImages.map((img, idx) => (
                    <button
                      key={`thumb-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative bg-[#24201c] ${
                        selectedImageIndex === idx
                          ? 'border-[#3c6a00] ring-2 ring-[#3c6a00]/30 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300'
                      }`}
                      aria-label={`Pilih foto ${idx + 1}`}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`${title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2d251f] flex items-center justify-center text-amber-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Down button */}
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 flex items-center justify-center shadow-2xs transition-all cursor-pointer hidden sm:flex"
                    title="Foto selanjutnya"
                    aria-label="Foto selanjutnya"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Main Large Hero Image */}
                <div
                  ref={heroImageContainerRef}
                  className="flex-1 aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden relative shadow-sm border border-black/10 bg-[#231f1c]"
                >
                  {galleryImages[selectedImageIndex] ? (
                    <img
                      ref={heroImageRef}
                      src={galleryImages[selectedImageIndex]}
                      alt={`Foto utama ${title}`}
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2a241e] via-[#352c24] to-[#1c1815] flex flex-col items-center justify-center relative p-8">
                      <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-200 border border-white/10 mb-3 shadow-sm">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-white/80">Foto Produk Siap Dipasang</span>
                      <span className="text-xs text-white/40 mt-1">Gunakan asset lokal dari folder /assets</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Tentang Produk */}
              <article className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#1b1c1c]">
                  Tentang Produk
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5">
                  Mystery Bakery Box berisi aneka roti, pastry, dan kue pilihan dari stok harian {storeName}. Cocok untuk sarapan, camilan, atau dinikmati bersama keluarga. Semua produk masih layak konsumsi, tetap enak, dan membantu mengurangi food waste.
                </p>

                {/* 4 Feature Highlights */}
                <div className="bg-[#f2f8f2] border border-[#e2efe2] rounded-2xl p-4 mt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* 1. Masih Layak Konsumsi */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#1b1c1c] leading-tight">
                        Masih Layak Konsumsi
                      </span>
                    </div>

                    {/* 2. Harga Lebih Terjangkau */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <path d="M16 10H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H8" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#1b1c1c] leading-tight">
                        Harga Lebih Terjangkau
                      </span>
                    </div>

                    {/* 3. Bantu Kurangi Food Waste */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#1b1c1c] leading-tight">
                        Bantu Kurangi Food Waste
                      </span>
                    </div>

                    {/* 4. Rasa Tetap Lezat */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#1b1c1c] leading-tight">
                        Rasa Tetap Lezat
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* RIGHT COLUMN: Product Info & Order Action */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card 1: Main Product Info */}
              <article className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs flex flex-col gap-5">
                {/* Store Header */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1e3323] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    Teras
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                        {storeName}
                      </span>
                      <span className="bg-[#e7f7ea] text-[#1b6b2c] border border-[#c6edcb] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                        ✓ Terverifikasi
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                      <span className="flex items-center text-amber-500">
                        ★ <span className="text-gray-700 font-bold ml-1">{rating.toFixed(1)}</span>
                        <span className="text-gray-400 font-normal ml-0.5">({reviewCount} ulasan)</span>
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center text-gray-500">
                        📍 {distanceText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Title & Subtitle */}
                <div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-[26px] text-[#1b1c1c] leading-tight">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed mt-2">
                    {description}
                  </p>
                </div>

                {/* Tag Pill */}
                <div>
                  <span className="bg-[#eef8ee] text-[#2d6a2e] border border-[#d2edd2] text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                    ✓ Halal
                  </span>
                </div>

                {/* Pricing Box */}
                <div className="bg-[#fafaf8] border border-gray-150 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 block">
                      Harga RescueBite
                    </span>
                    <span className="text-2xl sm:text-[26px] font-black text-[#e11d48] font-display tracking-tight">
                      Rp {formatRupiah(rescuePrice)}
                    </span>
                  </div>

                  <div className="text-center px-3 border-x border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-400 block">
                      Harga Normal
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-400 line-through">
                      Rp {formatRupiah(originalPrice)}
                    </span>
                  </div>

                  <div className="bg-[#fef9c3] border border-[#fef08a] text-[#854d0e] rounded-xl px-3 py-1.5 text-center">
                    <span className="font-extrabold text-xs block leading-none">
                      {discountPercent}%
                    </span>
                    <span className="text-[10px] font-bold block mt-0.5 whitespace-nowrap">
                      Lebih Hemat
                    </span>
                  </div>
                </div>

                {/* Section: Estimasi Isi */}
                <div>
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2.5">
                    Estimasi Isi
                  </h3>
                  <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                    {/* Roti */}
                    <div className="bg-[#f8f8f6] border border-gray-150 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
                      <div className="text-gray-700">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10" />
                          <path d="M6 10h10" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-[#1b1c1c] mt-1.5 block">
                        Roti
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        (1–2 pcs)
                      </span>
                    </div>

                    {/* Pastry */}
                    <div className="bg-[#f8f8f6] border border-gray-150 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
                      <div className="text-gray-700">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m18 8 4 4-4 4" />
                          <path d="m6 16-4-4 4-4" />
                          <path d="M2 12h20" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-[#1b1c1c] mt-1.5 block">
                        Pastry
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        (1–2 pcs)
                      </span>
                    </div>

                    {/* Kue */}
                    <div className="bg-[#f8f8f6] border border-gray-150 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
                      <div className="text-gray-700">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                          <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
                          <path d="M2 21h20" />
                          <path d="M7 8v2" />
                          <path d="M12 8v2" />
                          <path d="M17 8v2" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-[#1b1c1c] mt-1.5 block">
                        Kue
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        (1–2 pcs)
                      </span>
                    </div>

                    {/* Kue Kering */}
                    <div className="bg-[#f8f8f6] border border-gray-150 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
                      <div className="text-gray-700">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="5" y="6" width="14" height="15" rx="3" />
                          <line x1="8" y1="2" x2="16" y2="2" />
                          <line x1="8" y1="6" x2="16" y2="6" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-[#1b1c1c] mt-1.5 block">
                        Kue Kering
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        (Opsional)
                      </span>
                    </div>
                  </div>

                  {/* Disclaimer banner */}
                  <div className="bg-[#f0f7f0] border border-[#d6ebd6] text-[#24521e] rounded-xl p-3 flex items-start gap-2.5 text-xs font-medium mt-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      Isi adalah kejutan dan menyesuaikan stok harian toko. Gambar hanya ilustrasi.
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 2: Stok & Waktu Pickup + Reservation Button */}
              <article className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs flex flex-col gap-4">
                <h3 className="font-display font-extrabold text-base text-[#1b1c1c]">
                  Stok &amp; Waktu Pickup
                </h3>

                {/* Two info boxes */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Stok */}
                  <div className="bg-[#fafaf8] border border-gray-150 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">
                        Stok Tersedia
                      </span>
                      <span className="text-xs sm:text-sm font-black text-gray-900 block">
                        Tersisa <span className="text-red-600 font-black">{remainingBoxes} box</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Pickup Time */}
                  <div className="bg-[#fafaf8] border border-gray-150 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">
                        Ambil hari ini
                      </span>
                      <span className="text-xs sm:text-sm font-black text-[#1b1c1c] block">
                        {pickupTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper Row */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="text-xs font-bold text-gray-700">
                    Jumlah Box
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Stepper buttons */}
                    <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-3 border border-gray-200">
                      <button
                        type="button"
                        onClick={handleDecreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Kurangi box"
                        aria-label="Kurangi box"
                      >
                        –
                      </button>
                      <span className="font-bold text-sm text-[#1b1c1c] min-w-[20px] text-center select-none">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncreaseQuantity}
                        disabled={quantity >= maxQuantity}
                        className="w-8 h-8 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Tambah box"
                        aria-label="Tambah box"
                      >
                        +
                      </button>
                    </div>

                    {/* Max note badge */}
                    <div className="bg-[#f8f8f6] border border-gray-200 text-gray-500 text-[11px] font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Maksimal {maxQuantity} box per transaksi</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Keranjang (left) & Reservasi Sekarang (right) */}
                <div className="flex items-center gap-2.5 sm:gap-3 w-full mt-2">
                  {/* Keranjang Button (Icon Only) */}
                  <button
                    ref={addToCartBtnRef}
                    type="button"
                    onClick={handleAddToCart}
                    className="w-14 sm:w-16 py-3.5 rounded-2xl border-2 border-[#1f2620] bg-white hover:bg-[#1f2620] text-[#1f2620] hover:text-white flex items-center justify-center shrink-0 shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer group select-none"
                    id="btn-tambah-keranjang"
                    title="Tambah ke Keranjang"
                    aria-label="Tambah ke Keranjang"
                  >
                    <div className="relative flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                      <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-300 stroke-[3] absolute -top-1 -right-1.5" />
                    </div>
                  </button>

                  {/* Reservasi Sekarang Button */}
                  <button
                    type="button"
                    onClick={handleReservasi}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#1f2620] hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer select-none"
                    id="btn-reservasi-sekarang"
                    title="Reservasi Sekarang"
                  >
                    <span>Reservasi Sekarang</span>
                  </button>
                </div>
              </article>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Cart Button (consistent with CustomerMarketplace) with Bounce Animation */}
      <motion.button
        ref={cartButtonRef}
        type="button"
        onClick={() => {
          if (onNavigateCart) {
            onNavigateCart();
          } else {
            window.location.hash = '#keranjang';
          }
        }}
        animate={
          isCartBouncing && !shouldReduceMotion
            ? {
                scale: [1, 1.28, 0.88, 1.15, 0.96, 1],
                rotate: [0, -10, 8, -5, 2, 0],
              }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onAnimationComplete={() => setIsCartBouncing(false)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white border-2 border-[#3c6a00] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
        title="Keranjang Pesanan"
        aria-label="Buka Keranjang Pesanan"
        id="floating-cart-button"
      >
        <ShoppingCart className="w-6 h-6 text-[#3c6a00]" strokeWidth={2.2} />
        <motion.span
          key={cartCount}
          initial={isCartBouncing && !shouldReduceMotion ? { scale: 1.8 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs"
          id="cart-badge-count"
        >
          {cartCount}
        </motion.span>
      </motion.button>

      {/* Fly-to-Cart Animation Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden" aria-hidden="true">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                position: 'fixed',
                left: item.startX,
                top: item.startY,
                width: item.startWidth,
                height: item.startHeight,
                opacity: 1,
                scale: 1,
                borderRadius: '24px',
                zIndex: 9999,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35)',
              }}
              animate={{
                left: item.targetX,
                top: item.targetY,
                width: 48,
                height: 48,
                opacity: [1, 1, 0.85, 0],
                scale: [1, 0.8, 0.4, 0.15],
                borderRadius: '50%',
                rotate: [0, -8, 12, -4],
              }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => handleFlyComplete(item.id, item.quantity)}
              className="overflow-hidden border-2 border-white shadow-2xl bg-[#1e2420]"
            >
              <img
                src={item.src}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. Customer Footer */}
      <CustomerFooter
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Membuka live chat Customer Service RescueBite...');
        }}
      />

      {/* 5. Quick Auth Modal */}
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

export default CustomerProductDetail;
