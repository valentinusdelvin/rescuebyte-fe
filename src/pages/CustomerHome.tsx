import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { MysteryBoxCard } from '../components/customer/MysteryBoxCard';
import { CustomerOrderModal } from '../components/customer/CustomerOrderModal';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerMysteryBox, TestimonialItem } from '../types';
import { getCurrentUser } from '../services/authService';
import { getPublicProducts, PublicProductItem } from '../services/productService';
import { formatDistanceKm } from '../services/locationService';

import heroFullBanner from '../assets/Kotak Misteri Hidangan Segar 1 (1).svg';
import aboutUsTopImg from '../assets/customer/about-us-top.svg';
import aboutUsBottomImg from '../assets/customer/about-us-bottom.svg';
import bgShapeTopRight from '../assets/customer/bg-shape-top-right.svg';
import bgShapeCircle from '../assets/customer/bg-shape-circle.svg';
import bgShapeBottomLeft from '../assets/customer/bg-shape-bottom-left.svg';
import bgShapeBottom from '../assets/customer/bg-shape-bottom.svg';
import bgShapeAccent from '../assets/customer/bg-shape-accent.svg';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import avatarReza from '../assets/customer/avatar-reza.jpg';
import avatarFahmi from '../assets/customer/avatar-fahmi.jpg';

export interface CustomerHomeProps {
  onNavigateSeller?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateAuth?: () => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onNavigateStore?: (storeName: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

function mapPublicProductToCustomerBox(p: PublicProductItem, isRadius = false): CustomerMysteryBox {
  const normalPrice = p.normal_price || 0;
  const rescuePrice = p.rescue_price || 0;
  const discount =
    typeof p.discount_percentage === 'number' && p.discount_percentage > 0
      ? p.discount_percentage
      : normalPrice > 0
        ? Math.round(((normalPrice - rescuePrice) / normalPrice) * 100)
        : 0;

  let pickup = p.pickup_time;
  if (!pickup && p.operational_start && p.operational_end) {
    pickup = `Ambil: ${p.operational_start} – ${p.operational_end} WIB`;
  } else if (!pickup) {
    pickup = 'Ambil: 19:00 – 21:00 WIB';
  }

  const dist = formatDistanceKm(p.distance_km);
  const realProductName = p.name || 'Surprise Box';
  let realStoreName = p.store_name || '';
  if (!realStoreName) {
    try {
      realStoreName = localStorage.getItem('rescuebyte_store_name') || 'Toko Mitra';
    } catch {
      realStoreName = 'Toko Mitra';
    }
  }

  let imageSrc = cardMonsieurSpoon;
  if (p.main_image_url && typeof p.main_image_url === 'string') {
    const url = p.main_image_url.trim();
    if (url.startsWith('http') && !url.includes('pinterest.com/search')) {
      imageSrc = url;
    }
  }

  return {
    id: p.id,
    storeId: p.store_id,
    storeName: realStoreName,
    category: realProductName,
    categoryBadge: realProductName,
    remainingBoxesText: `Sisa ${p.stock ?? 1} Box`,
    distanceText: dist,
    discountPercent: discount,
    originalPrice: normalPrice,
    rescuePrice: rescuePrice,
    pickupTime: pickup,
    description:
      p.description ||
      'Berisi 1 porsi makanan surplus berkualitas dan higienis yang disiapkan langsung oleh merchant mitra.',
    tags: [realStoreName, realProductName, 'Halal MUI', 'Surplus Harian'],
    imageSrc,
    rating: 4.9,
    reviewCount: '42',
    isRadiusItem: isRadius,
  };
}

function BoxCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e6df] overflow-hidden animate-pulse flex flex-col h-[400px]">
      <div className="w-full h-52 bg-[#ecefe9]" />
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 bg-[#ecefe9] rounded w-3/4" />
          <div className="h-3 bg-[#ecefe9] rounded w-1/2" />
        </div>
        <div className="h-10 bg-[#ecefe9] rounded-xl" />
        <div className="flex items-center justify-between pt-2 border-t border-[#f0f2ee]">
          <div className="h-6 bg-[#ecefe9] rounded w-24" />
          <div className="h-10 bg-[#ecefe9] rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

function BoxEmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-[#e2e6df] col-span-full">
      <p className="text-sm text-[#5a625d] font-medium">{message}</p>
    </div>
  );
}

function getCachedBoxes(): { nearby: CustomerMysteryBox[]; bestSeller: CustomerMysteryBox[] } {
  try {
    const raw = localStorage.getItem('rescuebyte_cached_marketplace_products');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mappedNearby = parsed.slice(0, 6).map((item) => ({
          ...item,
          isRadiusItem: false,
        }));
        const mappedBestSeller = [...parsed]
          .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
          .slice(0, 6)
          .map((item) => ({
            ...item,
            isRadiusItem: true,
          }));
        return { nearby: mappedNearby, bestSeller: mappedBestSeller };
      }
    }
  } catch {}
  return { nearby: [], bestSeller: [] };
}


/**
 * Testimonials Mock Data
 */
const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testi-1',
    name: 'Reza Akbar',
    role: 'Pelanggan',
    rating: 5,
    avatarSrc: avatarReza,
    quote:
      'Awalnya iseng nyoba beli Mystery Box Monsieur Spoon, pas dibuka isinya ada croissant butter & quiche masih anget renyah! Hematnya gila-gilaan, dari 100rb jadi cuma 35rb. Sekarang jadi langganan tiap malam!',
  },
  {
    id: 'testi-2',
    name: 'Fahmi Fayyidl',
    role: 'Seller',
    rating: 5,
    avatarSrc: avatarFahmi,
    quote:
      'Sebagai pengelola cafe & bakery, fitur RescueBite ngebantu banget ngurangin sisa stok harian tanpa ngerusak branding toko. Revenue nambah, sisa terbuang jadi 0, dan pelanggan baru malah berdatangan ke toko.',
  },
  {
    id: 'testi-3',
    name: 'Nadia Putri',
    role: 'Pelanggan',
    rating: 5,
    avatarSrc: avatarReza,
    quote:
      'Konsepnya keren banget! Sensasi nungguin mystery box itu nagih, dan makanannya 100% higienis dan enak. Berasa makan makanan resto bintang lima tapi bayarnya seharga warung. Rekomen parah!',
  },
  {
    id: 'testi-4',
    name: 'Dimas Pratama',
    role: 'Pelanggan',
    rating: 5,
    avatarSrc: avatarFahmi,
    quote:
      'Dapet pastry box isi 4 macam roti dan sandwich sourdough yang masih fresh banget. Rasanya premium dan packagingnya rapi. Gerakan penyelamatan makanan ini patut didukung penuh!',
  },
  {
    id: 'testi-5',
    name: 'Maya Lestari',
    role: 'Seller',
    rating: 5,
    avatarSrc: avatarReza,
    quote:
      'Sistem notifikasi dan pickup QR code-nya super simpel. Konsumen datang tepat waktu sebelum resto tutup. Ngebantu operasional dapur jadi jauh lebih efisien.',
  },
  {
    id: 'testi-6',
    name: 'Budi Santoso',
    role: 'Pelanggan',
    rating: 5,
    avatarSrc: avatarFahmi,
    quote:
      'Menu lauk nusantaranya mantap, porsi kenyang dan higienis. Senang bisa makan enak sekaligus berkontribusi mengurangi sampah makanan berlebih di kota ini.',
  },
];

/**
 * Continuous infinite marquee track data:
 * Two identical 12-card halves (4848px each, total 9696px).
 * Translating -50% guarantees the screen is ALWAYS 100% filled with zero gaps on any screen size.
 */
const HALF_TRACK = [...TESTIMONIALS, ...TESTIMONIALS];
const MARQUEE_CARDS = [...HALF_TRACK, ...HALF_TRACK];

/**
 * Customer Home Page Component ("Beranda Customer")
 * Pixel-accurate reproduction of the user Figma design.
 * Features:
 *  - Floating pill top header
 *  - High-impact hero with ambient food rescue lighting and mystery box
 *  - Section: Mystery Box Populer
 *  - Section: Mystery Box Populer di Sekitarmu (Radius 5 km) with filters
 *  - Section: About Us (Dual Organic Bento Cards)
 *  - Section: Apa Kata Mereka (Testimonials)
 *  - Customer Footer
 *  - Interactive checkout modal
 */
export function CustomerHome({
  onNavigateSeller,
  onNavigateProfile,
  onNavigateOrders,
  onNavigateMarketplace,
  onNavigateAuth,
  onNavigateDetail,
  onNavigateStore,
  onShowToast,
}: CustomerHomeProps) {
  // Modal states
  const [selectedBox, setSelectedBox] = useState<CustomerMysteryBox | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Dynamic products from backend API
  const cached = getCachedBoxes();
  const [nearbyBoxes, setNearbyBoxes] = useState<CustomerMysteryBox[]>(cached.nearby);
  const [bestSellerBoxes, setBestSellerBoxes] = useState<CustomerMysteryBox[]>(cached.bestSeller);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState<boolean>(cached.nearby.length === 0);

  useEffect(() => {
    let isMounted = true;

    async function loadBoxes() {
      try {
        const coords = (() => {
          try {
            const saved = localStorage.getItem('rescuebyte_user_coords');
            if (saved) return JSON.parse(saved);
          } catch {}
          return { lat: -7.9526, lng: 112.6146 };
        })();

        const products = await getPublicProducts({
          latitude: coords.lat,
          longitude: coords.lng,
        });

        if (!isMounted) return;

        if (products && products.length > 0) {
          const sortedByDistance = [...products]
            .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
            .map((p) => mapPublicProductToCustomerBox(p, false));

          const sortedByDiscount = [...products]
            .sort((a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))
            .map((p) => mapPublicProductToCustomerBox(p, true));

          setNearbyBoxes(sortedByDistance);
          setBestSellerBoxes(sortedByDiscount);
        }
      } catch (err) {
        console.warn('Failed to load boxes for CustomerHome:', err);
      } finally {
        if (isMounted) {
          setIsLoadingBoxes(false);
        }
      }
    }

    loadBoxes();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenOrder = (box: CustomerMysteryBox) => {
    const user = getCurrentUser();
    if (!user) {
      if (onShowToast) {
        onShowToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
      }
      if (onNavigateAuth) {
        onNavigateAuth();
      } else {
        window.location.hash = '#masuk';
      }
      return;
    }

    if (onNavigateDetail) {
      onNavigateDetail(box);
    } else {
      setSelectedBox(box);
      setIsOrderModalOpen(true);
    }
  };

  const handleConfirmOrder = (box: CustomerMysteryBox, quantity: number) => {
    if (onShowToast) {
      onShowToast(`🎉 Berhasil memesan ${quantity}x ${box.storeName}! Kode pickup telah disiapkan.`);
    }
  };

  const handleContactSupport = () => {
    if (onShowToast) {
      onShowToast('Membuka live chat Customer Service RescueBite...');
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased" id="customer-page-root">
      {/* 1. Floating Pill Header */}
      <CustomerHeader
        activeTab="beranda"
        onNavigateSeller={onNavigateSeller}
        onNavigateProfile={onNavigateProfile}
        onNavigateOrders={onNavigateOrders}
        onNavigateAuth={onNavigateAuth}
        onShowToast={onShowToast}
        onOpenAuthModal={() => {
          if (onNavigateAuth) {
            onNavigateAuth();
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onSelectTab={(tab) => {
          if (tab === 'marketplace') {
            if (!getCurrentUser()) {
              if (onShowToast) {
                onShowToast('Silakan masuk terlebih dahulu untuk mengakses Marketplace.', 'warning');
              }
              if (onNavigateAuth) {
                onNavigateAuth();
              } else {
                window.location.hash = '#masuk';
              }
              return;
            }
            if (onNavigateMarketplace) {
              onNavigateMarketplace();
            } else {
              window.location.hash = '#marketplace';
            }
          }
        }}
      />

      {/* 2. Hero Section */}
      {/* 2A. Desktop Version: Full Panoramic Cafe Banner with 3D Glowing Mystery Box on right (matches Figma verbatim) */}
      <section className="relative min-h-110 lg:min-h-120 xl:min-h-130 pt-32 md:pt-36 pb-12 sm:pb-16 px-6 sm:px-12 hidden lg:flex items-center overflow-hidden border-b border-black/5" id="hero-section">
        {/* Full-width panoramic banner background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroFullBanner}
            alt="Suasana Cafe & Glowing Mystery Box RescueBite"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-2 items-center">
            {/* Left Headline & Description matching Figma typography, shifted slightly right away from corner leaves */}
            <div className="max-w-110 ml-10 lg:ml-14">
              <h1 className="font-display text-[28px] lg:text-[32px] font-extrabold leading-[1.2] text-[#1b1c1c] tracking-tight mb-3">
                Selamatkan Makanan Lezat, <br />
                Hemat Hingga 70% Setiap Malam
              </h1>

              <p className="text-[13px] md:text-sm leading-relaxed text-[#1b1c1c] font-medium max-w-100">
                Beli Mystery Box berisi makanan berlebih berkualitas prima dari kafe, bakery, dan restoran favoritmu sebelum jam tutup. Tetap higienis, halal, lezat, dan berdampak nyata bagi bumi.
              </p>
            </div>

            {/* Right half is intentionally open to showcase the integrated 3D Glowing Mystery Box in the banner photo */}
            <div className="min-h-75" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* 2B. Mobile Version: Stacked Layout with Text on top and Glowing Kardus at the bottom (Fore Coffee style) */}
      <section className="lg:hidden relative pt-28 sm:pt-32 pb-0 flex flex-col justify-between overflow-hidden border-b border-black/5 bg-[#fcf9f8]" id="hero-section-mobile">
        {/* Top: Centered Headline & Description */}
        <div className="px-6 text-center z-10">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-[1.2] text-[#1b1c1c] tracking-tight mb-3 max-w-sm mx-auto">
            Selamatkan Makanan Lezat, <br />
            Hemat Hingga 70% Setiap Malam
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed text-[#434844] font-medium max-w-sm mx-auto">
            Beli Mystery Box berisi makanan berlebih berkualitas prima dari kafe, bakery, dan restoran favoritmu sebelum jam tutup. Tetap higienis, halal, lezat, dan berdampak nyata bagi bumi.
          </p>
        </div>

        {/* Bottom: The Cardboard Mystery Box sitting at the bottom without overlapping text */}
        <div className="w-full mt-4 -mb-1 relative overflow-hidden flex justify-center items-end">
          <div className="w-full h-55 sm:h-65 relative">
            <img
              src={heroFullBanner}
              alt="RescueBite Mystery Box"
              className="w-full h-full object-cover object-[78%_center]"
            />
            {/* Subtle top gradient fade into clean page background */}
            <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-[#fcf9f8] to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 3. Section: Mystery Box di Sekitar */}
      <section className="px-6 py-10 lg:py-12" id="marketplace-section">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">
              Mystery Box di Sekitar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingBoxes && nearbyBoxes.length === 0 ? (
              <>
                <BoxCardSkeleton />
                <BoxCardSkeleton />
                <BoxCardSkeleton />
              </>
            ) : nearbyBoxes.length === 0 ? (
              <BoxEmptyState message="Belum ada Mystery Box di sekitarmu saat ini." />
            ) : (
              nearbyBoxes.map((box) => (
                <MysteryBoxCard
                  key={box.id}
                  item={box}
                  variant="popular"
                  onOrderClick={handleOpenOrder}
                  onStoreClick={onNavigateStore}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Section: Mystery Box Terlaris */}
      <section className="px-6 pt-4 pb-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">
              Mystery Box Terlaris
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingBoxes && bestSellerBoxes.length === 0 ? (
              <>
                <BoxCardSkeleton />
                <BoxCardSkeleton />
                <BoxCardSkeleton />
              </>
            ) : bestSellerBoxes.length === 0 ? (
              <BoxEmptyState message="Belum ada Mystery Box terlaris saat ini." />
            ) : (
              bestSellerBoxes.map((box) => (
                <MysteryBoxCard
                  key={box.id}
                  item={box}
                  variant="radius"
                  onOrderClick={handleOpenOrder}
                  onStoreClick={onNavigateStore}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Section: About Us (Matching Figma verbatim with organic backdrop & new SVG artwork) */}
      <section className="relative px-6 py-16 sm:py-24 bg-white overflow-hidden" id="about-us-section">
        {/* Organic Lime Fluid Backdrop Blobs matching Figma visual */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {/* Top-Right Organic Shape (Rectangle 16 (1).svg) behind Row 1 photo */}
          <img
            src={bgShapeTopRight}
            alt=""
            className="absolute -right-20 lg:-right-8 -top-8 w-140 sm:w-160 lg:w-175 h-auto select-none pointer-events-none -z-10"
          />

          {/* Left-Side Accent Organic Shape (Rectangle 18.svg) */}
          <img
            src={bgShapeAccent}
            alt=""
            className="absolute -left-16 sm:-left-8 top-16 w-50 sm:w-65 lg:w-70 h-auto select-none pointer-events-none -z-10"
          />

          {/* Center Floating Organic Pebble (Ellipse 1116.svg) */}
          <img
            src={bgShapeCircle}
            alt=""
            className="absolute left-[44%] lg:left-[48%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-32 sm:w-44 lg:w-52 h-auto select-none pointer-events-none -z-10"
          />

          {/* Bottom-Left Organic Shape (Rectangle 19.svg) behind Row 2 photo */}
          <img
            src={bgShapeBottomLeft}
            alt=""
            className="absolute -left-20 sm:-left-10 bottom-6 sm:bottom-12 w-120 sm:w-140 lg:w-152.5 h-auto select-none pointer-events-none -z-10"
          />

          {/* Bottom Organic Wave / Hill (Rectangle 20.svg) */}
          <img
            src={bgShapeBottom}
            alt=""
            className="absolute right-0 bottom-0 w-150 sm:w-195 lg:w-232.5 h-auto select-none pointer-events-none -z-10"
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-16 sm:gap-24">
          {/* Row 1: Lebih dari Sekadar Makanan Murah */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-14">
            {/* Left Column: Text */}
            <div className="max-w-xl">
              <span className="text-brand-green font-bold text-sm sm:text-base tracking-wide block mb-2.5">
                About Us
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.15] text-[#1b1c1c] tracking-tight mb-4">
                Lebih dari Sekadar <br />
                <span className="text-brand-green">Makanan Murah</span>
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#434844] font-normal text-justify sm:text-left">
                RescueBite menghubungkan bisnis kuliner dan masyarakat untuk menyelamatkan surplus pangan berkualitas sebelum jam tutup toko. Kami percaya setiap porsi makanan bernilai tinggi dan layak dinikmati dengan harga hemat sekaligus mengurangi limbah makanan.
              </p>
            </div>

            {/* Right Column: Organic SVG Photo 1 */}
            <div className="flex justify-center lg:justify-end items-center">
              <div className="relative w-full max-w-115 sm:max-w-125 lg:max-w-132.5">
                <img
                  src={aboutUsTopImg}
                  alt="Lebih dari Sekadar Makanan Murah - RescueBite"
                  className="w-full h-auto object-contain select-none transition-transform duration-500 hover:scale-[1.01] drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Good Food Deserve A Second Chance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-14">
            {/* Left Column: Organic SVG Photo 2 (Mobile Order 2, Desktop Order 1) */}
            <div className="flex justify-center lg:justify-start items-center order-2 lg:order-1">
              <div className="relative w-full max-w-105 sm:max-w-112.5 lg:max-w-120">
                <img
                  src={aboutUsBottomImg}
                  alt="Good Food Deserve A Second Chance - RescueBite"
                  className="w-full h-auto object-contain select-none transition-transform duration-500 hover:scale-[1.01] drop-shadow-sm"
                />
              </div>
            </div>

            {/* Right Column: Text (Mobile Order 1, Desktop Order 2) */}
            <div className="order-1 lg:order-2 flex flex-col lg:items-end">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.15] text-[#1b1c1c] tracking-tight mb-4 lg:text-right">
                  Good Food Deserve A <br />
                  <span className="text-brand-green">Second Chance</span>
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-[#434844] font-normal text-justify sm:text-left">
                  Setiap harinya, beragam sajian lezat dan bergizi berisiko terbuang hanya karena pergantian hari operasional. Melalui RescueBite, kami memberi kesempatan kedua bagi hidangan terbaik untuk dinikmati serta berkontribusi nyata menjaga kelestarian lingkungan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Apa Kata Mereka (Continuous Infinite Marquee using Tailwind CSS) */}
      <section className="py-16 sm:py-20 overflow-hidden" id="testimoni-section">
        <div className="w-full max-w-7xl mx-auto px-6 mb-8 text-left">
          <span className="inline-block text-xs sm:text-sm font-bold text-brand-green uppercase tracking-wider mb-2">
            APA KATA MEREKA
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#1b1c1c] tracking-tight">
            Cerita Nyata dari <span className="text-brand-green">Pengguna</span>
          </h2>
        </div>

        <div className="relative w-full overflow-hidden group">
          {/* Left subtle fade */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-linear-to-r from-[#fcf9f8] to-transparent z-10 pointer-events-none" />

          {/* Right subtle fade */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-linear-to-l from-[#fcf9f8] to-transparent z-10 pointer-events-none" />

          {/* Infinite Marquee Track: Seamless 50% continuous loop with 100% screen coverage */}
          <div className="flex gap-6 w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:[animation-play-state:paused] will-change-transform transform-[translate3d(0,0,0)] backface-hidden">
            {MARQUEE_CARDS.map((testi, idx) => (
              <div
                key={`${testi.id}-${idx}`}
                className="w-75 sm:w-87.5 md:w-95 shrink-0 bg-white border border-black/8 rounded-2xl sm:rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-md select-none"
              >
                <div>
                  {/* Header User Profile */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={testi.avatarSrc}
                      alt={testi.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-green/20 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-[#1b1c1c] text-sm">
                        {testi.name}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium">
                        {testi.role}
                      </span>
                      <div className="flex text-amber-500 text-xs mt-0.5">
                        {'★'.repeat(testi.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Quote Content */}
                  <p className="text-sm leading-relaxed text-gray-600 italic">
                    &ldquo;{testi.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Customer Footer */}
      <CustomerFooter
        variant="full"
        onNavigateSeller={onNavigateSeller}
        onNavigateMarketplace={onNavigateMarketplace}
        onContactSupport={handleContactSupport}
      />

      {/* Interactive Order Checkout Modal */}
      <CustomerOrderModal
        item={selectedBox}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Auth / Login Quick Modal */}
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
              Masuk untuk menyimpan riwayat mystery box favorit dan nikmati diskon khusus pelanggan.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#0b1510] text-white rounded-xl font-semibold text-sm hover:bg-[#202a24] transition-colors"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  if (onShowToast) onShowToast('Selamat datang kembali, Reza Akbar!');
                }}
              >
                Masuk sebagai Reza Akbar
              </button>
              <button
                type="button"
                className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
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
