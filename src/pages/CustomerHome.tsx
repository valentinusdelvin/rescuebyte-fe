import { useState } from 'react';
import { User } from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { MysteryBoxCard } from '../components/customer/MysteryBoxCard';
import { CustomerOrderModal } from '../components/customer/CustomerOrderModal';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerMysteryBox, TestimonialItem } from '../types';
import { getCurrentUser } from '../services/authService';

import heroFullBanner from '../assets/Kotak Misteri Hidangan Segar 1 (1).svg';
import aboutUsTopImg from '../assets/customer/about-us-top.svg';
import aboutUsBottomImg from '../assets/customer/about-us-bottom.svg';
import bgShapeTopRight from '../assets/customer/bg-shape-top-right.svg';
import bgShapeCircle from '../assets/customer/bg-shape-circle.svg';
import bgShapeBottomLeft from '../assets/customer/bg-shape-bottom-left.svg';
import bgShapeBottom from '../assets/customer/bg-shape-bottom.svg';
import bgShapeAccent from '../assets/customer/bg-shape-accent.svg';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import cardSateSenayan from '../assets/customer/card-sate-senayan.jpg';
import cardSaladStop from '../assets/customer/card-saladstop.jpg';
import cardAnomaliCoffee from '../assets/customer/card-anomali-coffee.jpg';
import cardDapurSolo from '../assets/customer/card-dapur-solo.jpg';
import cardTousLesJours from '../assets/customer/card-tous-les-jours.jpg';
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

/**
 * Mystery Box Mock Data (Popular Section)
 * Matched verbatim with reference design image and Design.md specifications.
 */
const POPULAR_BOXES: CustomerMysteryBox[] = [
  {
    id: 'pop-1',
    storeName: 'Monsieur Spoon Senopati',
    category: 'PASTRY SURPRISE',
    categoryBadge: '🥐 PASTRY SURPRISE',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: 'Ambil: 19:45 - 21:00 WIB',
    description: 'Artisan French Viennoiserie Surprise Box... isi 3-4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'pop-2',
    storeName: 'Sate Khas Senayan – GI',
    category: 'NUSANTARA SURPRISE',
    categoryBadge: '🍱 NUSANTARA SURPRISE',
    remainingBoxesText: 'Sisa 4 Box',
    distanceText: '2.1 km',
    discountPercent: 60,
    originalPrice: 95000,
    rescuePrice: 38000,
    pickupTime: 'Ambil: 20:30 - 21:30 WIB',
    description: 'Paket Makan Malam Kenyang: Aneka sate ayam legendaris / tahu telur / nasi uduk lauk lengkap terkemas higienis standar resto.',
    tags: ['Halal MUI', 'Porsi Kenyang (1-2 Orang)'],
    imageSrc: cardSateSenayan,
  },
  {
    id: 'pop-3',
    storeName: 'SaladStop! Kemang Village',
    category: 'FRESH SALAD & WARM BOWL',
    categoryBadge: '🥗 FRESH SALAD & WARM BOWL',
    remainingBoxesText: '! Hanya 1 Box Tersisa!',
    distanceText: '3.4 km',
    discountPercent: 65,
    originalPrice: 120000,
    rescuePrice: 42000,
    pickupTime: 'Ambil: 20:15 - 21:15 WIB',
    description: 'Mystery Salad Bag: Gourmet signature salad bowl atau warm grain bowl kaya serat dan protein nabati, dipersiapkan segar sore ini.',
    tags: ['Plant-Based Option', 'Kacang & Wijen'],
    imageSrc: cardSaladStop,
  },
];

/**
 * Mystery Box Mock Data (Radius 5 km Section)
 */
const RADIUS_BOXES: CustomerMysteryBox[] = [
  {
    id: 'rad-1',
    storeName: 'Anomali Coffee Teuku Cik Ditiro',
    category: '☕ Pastry & Savory Snack Box',
    categoryBadge: '☕ Pastry & Savory Snack Box',
    portionText: 'Porsi Sedang 450g',
    remainingBoxesText: 'Sisa 5 box',
    distanceText: '1.2 km • Cikini',
    discountPercent: 67,
    originalPrice: 75000,
    rescuePrice: 25000,
    pickupTime: '21:00 - 22:00 WIB',
    description: 'Kombinasi croissant gurih, quiche jamur, atau cinnamon roll premium produksi harian kafe spesialis kopi Indonesia.',
    tags: ['Halal MUI', 'Gluten & Dairy'],
    rating: 4.9,
    reviewCount: '1.2k',
    imageSrc: cardAnomaliCoffee,
    isRadiusItem: true,
  },
  {
    id: 'rad-2',
    storeName: 'Dapur Solo Matraman',
    category: '🍱 Lauk Pauk & Nasi Kotak Tradisional',
    categoryBadge: '🍱 Lauk Pauk & Nasi Kotak Tradisional',
    portionText: 'Porsi Lengkap 500g',
    remainingBoxesText: 'Sisa 3 box',
    distanceText: '2.4 km • Matraman',
    discountPercent: 60,
    originalPrice: 70000,
    rescuePrice: 28000,
    pickupTime: '20:45 - 21:45 WIB',
    description: 'Surplus sajian khas Jawa: ayam goreng rempah / empal / serundeng, sayuran segar, telur balado & sambal terasi lezat.',
    tags: ['Halal MUI', 'Kacang & Rempah'],
    rating: 4.8,
    reviewCount: '890',
    imageSrc: cardDapurSolo,
    isRadiusItem: true,
  },
  {
    id: 'rad-3',
    storeName: 'Tous Les Jours Pacific Place',
    category: '🥐 Morning Bake Surplus Package',
    categoryBadge: '🥐 Morning Bake Surplus Package',
    portionText: '4-5 Pcs Roti Manis & Gurih',
    remainingBoxesText: 'Sisa 6 box',
    distanceText: '2.8 km • SCBD',
    discountPercent: 64,
    originalPrice: 90000,
    rescuePrice: 32000,
    pickupTime: '21:15 - 22:00 WIB',
    description: 'Koleksi aneka roti artisan Korea, red bean bread, sosis bun panggang, dan sponge cake harum yang dipanggang pagi tadi.',
    tags: ['Halal MUI', 'Gluten & Telur'],
    rating: 4.9,
    reviewCount: '2.4k',
    imageSrc: cardTousLesJours,
    isRadiusItem: true,
  },
];

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

      {/* 3. Section: Mystery Box Populer */}
      <section className="px-6 py-10 lg:py-12" id="marketplace-section">
        <div className="w-full max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] shrink-0" aria-hidden="true" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">
              Mystery Box Populer
            </h2>
          </div>

          {/* Popular Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_BOXES.map((box) => (
              <MysteryBoxCard
                key={box.id}
                item={box}
                variant="popular"
                onOrderClick={handleOpenOrder}
                onStoreClick={onNavigateStore}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section: Mystery Box Populer di Sekitarmu (Radius 5 km) */}
      <section className="px-6 pt-4 pb-12">
        <div className="w-full max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">
              Mystery Box Populer di Sekitarmu (Radius 5 km)
            </h2>
          </div>

          {/* Radius Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RADIUS_BOXES.map((box) => (
              <MysteryBoxCard
                key={box.id}
                item={box}
                variant="radius"
                onOrderClick={handleOpenOrder}
                onStoreClick={onNavigateStore}
              />
            ))}
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
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset&apos;s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.
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
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset&apos;s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.
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
        onNavigateSeller={onNavigateSeller}
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
