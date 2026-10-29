import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShoppingCart, Plus, ChevronLeft, ChevronUp, ChevronDown, Package, Clock, User } from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { FormattedDescription } from '../components/common/FormattedDescription';
import { CustomerMysteryBox } from '../types';
import { getCartCount, addToCart, subscribeToCart } from '../services/cartService';

export interface CustomerProductDetailProps {
  product?: CustomerMysteryBox | null;
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateCart?: () => void;
  onNavigateCheckout?: (product: CustomerMysteryBox, quantity: number) => void;
  onNavigateSeller?: () => void;
  onNavigateAuth?: () => void;
  onNavigateStore?: (storeName: string, storeId?: string) => void;
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
  onNavigateAuth,
  onNavigateStore,
  onShowToast,
}: CustomerProductDetailProps) {
  const shouldReduceMotion = useReducedMotion();

  // Use product prop or default to Figma mock data for TerasRasa Bakery
  const storeName = product?.storeName || 'TerasRasa Bakery';
  const title = product?.category ? product.category.replace(/^[^\w\s]+/, '').trim() : 'Mystery Bakery Box';
  const description =
    product?.description ||
    'Nikmati kejutan aneka roti dan pastry berkualitas dengan harga spesial. Isi menyesuaikan stok harian toko, selalu fresh dan tetap lezat!';
  const rescuePrice = product?.rescuePrice ?? 20000;
  const originalPrice = product?.originalPrice ?? 40000;
  const discountPercent = product?.discountPercent ?? 50;
  const rating = product?.rating ?? 4.8;
  const reviewCount = product?.reviewCount ?? 320;
  const distanceText = product?.distanceText ?? '1.2 km';
  const remainingBoxes = product?.remainingBoxesText?.match(/\d+/)?.[0]
    ? parseInt(product.remainingBoxesText.match(/\d+/)![0], 10)
    : 5;
  const pickupTime = product?.pickupTime
    ? product.pickupTime.replace(/^Ambil:\s*/i, '').replace(/WIB.*$/, 'WIB')
    : '15.00 – 18.00 WIB';

  // Photos Gallery: Only use actual uploaded product images (no fake placeholder fallback photos)
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (product?.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      product.imageUrls.forEach((img: string) => {
        if (img && typeof img === 'string' && img.trim()) {
          list.push(img.trim());
        }
      });
    } else if (product?.imageSrc && typeof product.imageSrc === 'string' && product.imageSrc.trim()) {
      list.push(product.imageSrc.trim());
    }
    return list;
  }, [product]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0] || '';

  // Reservation quantity state (1 - 5)
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = 5;

  // Modals & Cart State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(getCartCount);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingCartItem[]>([]);
  const [localToast, setLocalToast] = useState<string | null>(null);

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

  const handleStoreClick = () => {
    if (onNavigateStore) {
      onNavigateStore(storeName, product?.storeId);
    } else {
      const msg = `Halaman toko "${storeName}" sedang dalam tahap perancangan desain.`;
      if (onShowToast) {
        onShowToast(msg);
      } else {
        setLocalToast(msg);
        setTimeout(() => setLocalToast(null), 3500);
      }
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
    tags: ['Sisa Stok Harian'],
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
          onNavigateAuth={onNavigateAuth}
          onOpenAuthModal={() => {
            if (onNavigateAuth) {
              onNavigateAuth();
            } else {
              setIsAuthModalOpen(true);
            }
          }}
        />

        {/* 2. Main Content Grid */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onNavigateMarketplace || onNavigateBack || (() => { window.location.hash = '#marketplace'; })}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#1b1c1c] transition-colors cursor-pointer group shrink-0"
            >
              <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-100 transition-colors shadow-2xs">
                <ChevronLeft className="w-3.5 h-3.5" />
              </span>
              <span>Kembali ke Marketplace</span>
            </button>

            <nav aria-label="Breadcrumb" className="text-xs font-medium hidden sm:flex items-center gap-1.5 text-gray-400 min-w-0">
              <button
                type="button"
                onClick={onNavigateMarketplace || onNavigateBack || (() => { window.location.hash = '#marketplace'; })}
                className="hover:text-brand-green hover:underline transition-colors cursor-pointer text-gray-500 font-medium"
                title="Kembali ke Marketplace"
              >
                Marketplace
              </button>
              <span className="text-gray-300 select-none">&gt;</span>
              <button
                type="button"
                onClick={handleStoreClick}
                className="hover:text-brand-green hover:underline transition-colors cursor-pointer text-gray-500 font-medium truncate max-w-[150px] lg:max-w-[220px]"
                title={`Kunjungi toko ${storeName}`}
              >
                {storeName}
              </button>
              <span className="text-gray-300 select-none">&gt;</span>
              <span className="text-gray-700 font-semibold truncate max-w-[180px] lg:max-w-[280px]" aria-current="page" title={title}>
                {title}
              </span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Gallery & Tentang Produk */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Gallery Section */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 items-stretch sm:items-start">
                {/* Vertical Thumbnails strip (only show when multiple uploaded photos exist) */}
                {galleryImages.length > 1 && (
                  <div className="flex sm:flex-col items-center justify-center gap-2.5 shrink-0">
                    {/* Up button */}
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 max-sm:hidden flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                      title="Foto sebelumnya"
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    {/* Thumbnails */}
                    {galleryImages.map((img, idx) => (
                      <button
                        key={`thumb-${idx}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative bg-[#24201c] ${
                          selectedImageIndex === idx
                            ? 'border-brand-green ring-2 ring-brand-green/30 scale-102'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300'
                        }`}
                        aria-label={`Pilih foto ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}

                    {/* Down button */}
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 max-sm:hidden flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                      title="Foto selanjutnya"
                      aria-label="Foto selanjutnya"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Main Large Hero Image */}
                <div
                  ref={heroImageContainerRef}
                  className="flex-1 aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden relative shadow-sm border border-black/10 bg-[#231f1c]"
                >
                  {currentImage ? (
                    <img
                      ref={heroImageRef}
                      src={currentImage}
                      alt={`Foto utama ${title}`}
                      className="w-full h-full object-cover transition-all duration-300 hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#2a241e] via-[#352c24] to-[#1c1815] flex flex-col items-center justify-center relative p-8">
                      <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-200 border border-white/10 mb-3 shadow-sm">
                        <Package className="w-10 h-10" />
                      </div>
                      <span className="text-sm font-bold text-white/80">Foto Produk Siap Dipasang</span>
                      <span className="text-xs text-white/40 mt-1">Gunakan asset lokal dari folder /assets</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Info & Order Action */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card 1: Main Product Info */}
              <article className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs flex flex-col gap-5">
                {/* Store Header */}
                <div
                  onClick={handleStoreClick}
                  className="flex items-center gap-3 cursor-pointer group w-fit"
                  title={`Lihat toko ${storeName}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStoreClick();
                    }
                  }}
                >
                  <div className="w-11 h-11 rounded-full bg-[#1e3323] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    {storeName.slice(0, 4)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate group-hover:text-brand-green group-hover:underline transition-colors">
                        {storeName}
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
                  <div className="mt-2 text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
                    <FormattedDescription content={description} />
                  </div>
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
                      <Package className="w-5 h-5" />
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
                      <Clock className="w-5 h-5" />
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
                    <span className="font-bold text-sm text-[#1b1c1c] min-w-5 text-center select-none">
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
                      <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-300 stroke-3 absolute -top-1 -right-1.5" />
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

          {/* Full-Width Card: Tentang Produk */}
          <article className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs mt-6 sm:mt-8">
            <h2 className="font-display font-extrabold text-base sm:text-lg text-[#1b1c1c]">
              Tentang Produk
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5">
              Mystery Bakery Box berisi aneka roti, pastry, dan kue pilihan dari stok harian {storeName}. Cocok untuk sarapan, camilan, atau dinikmati bersama keluarga. Semua produk masih layak konsumsi, tetap enak, dan membantu mengurangi food waste.
            </p>
          </article>
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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white border-2 border-brand-green shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
        title="Keranjang Pesanan"
        aria-label="Buka Keranjang Pesanan"
        id="floating-cart-button"
      >
        <ShoppingCart className="w-6 h-6 text-brand-green" strokeWidth={2.2} />
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
      <div className="fixed inset-0 pointer-events-none z-9998 overflow-hidden" aria-hidden="true">
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

      {/* Fallback Local Toast */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1b1c1c] text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2"
          >
            <span>ℹ️</span>
            <span>{localToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomerProductDetail;
