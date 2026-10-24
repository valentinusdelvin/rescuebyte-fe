import { useState } from 'react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { MysteryBoxCard } from '../components/customer/MysteryBoxCard';
import { CustomerOrderModal } from '../components/customer/CustomerOrderModal';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerMysteryBox, TestimonialItem } from '../types';

import heroFullBanner from '../assets/customer/hero-official-banner.png';
import glowingBoxImg from '../assets/customer/glowing-box.jpg';
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
  onNavigateMarketplace?: () => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onShowToast?: (message: string) => void;
}

/**
 * Mystery Box Mock Data (Popular Section)
 */
const POPULAR_BOXES: CustomerMysteryBox[] = [
  {
    id: 'pop-1',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    remainingBoxesText: 'Hanya Sisa 2 Box',
    distanceText: '0.8 km',
    discountPercent: 65,
    originalPrice: 100000,
    rescuePrice: 35000,
    pickupTime: 'Ambil: 19:40 - 21:00 WIB (Sisa 45 mnt lagi)',
    description: 'Artisan Croissant French Butter, Pain au Chocolat, dan savory quiche fresh dari baking oven terakhir.',
    tags: ['✓ Halal MUI', 'Sisa Hanya 2 Box'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'pop-2',
    storeName: 'Sate Khas Senayan - GI',
    category: '🍢 Indonesian Heritage Cuisine',
    remainingBoxesText: 'Sisa 3 Box',
    distanceText: '1.2 km',
    discountPercent: 60,
    originalPrice: 95000,
    rescuePrice: 38000,
    pickupTime: 'Ambil: 20:30 - 21:30 WIB',
    description: 'Paket Nasi Kuning / Nasi Uduk komplit dengan Sate Ayam, Tahu Tempe Bacem, & Sambal khas Senayan.',
    tags: ['✓ Halal MUI', 'Porsi Mengenyangkan (1-2 Orang)'],
    imageSrc: cardSateSenayan,
  },
  {
    id: 'pop-3',
    storeName: 'SaladStop! Kemang Village',
    category: '🥗 Healthy Salad & Fresh Bowl',
    remainingBoxesText: 'Tinggal 1 Box Terakhir',
    distanceText: '1.5 km',
    discountPercent: 70,
    originalPrice: 140000,
    rescuePrice: 42000,
    pickupTime: 'Ambil: 20:15 - 21:15 WIB',
    description: 'Mystery Salad Bag: Gourmet Signature Salad/Bowl with warm grains, fresh organic greens, dan dressing sehat spesial signature.',
    tags: ['✓ 100% Organik Bersertifikat', 'Rendah Kalori'],
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
    remainingBoxesText: 'Sisa 4 Jam',
    distanceText: 'Menteng • 1.1 km',
    discountPercent: 60,
    originalPrice: 62000,
    rescuePrice: 25000,
    pickupTime: 'Jadwal Ambil: 21:00 - 22:00 WIB',
    description: 'Kombinasi croissant gurih, quiche jamur, atau cake hari ini dari produsen produk bahan lokal terbaik Indonesia.',
    tags: ['✓ Halal MUI', 'Sisa 4 Jam'],
    rating: 4.9,
    reviewCount: 120,
    imageSrc: cardAnomaliCoffee,
    isRadiusItem: true,
  },
  {
    id: 'rad-2',
    storeName: 'Dapur Solo Matraman',
    category: '🍛 Lauk Fresh & Nasi Tradisional',
    remainingBoxesText: 'Hanya 2 Box',
    distanceText: 'Matraman • 2.3 km',
    discountPercent: 60,
    originalPrice: 70000,
    rescuePrice: 28000,
    pickupTime: 'Jadwal Ambil: 20:45 - 21:45 WIB',
    description: 'Surprise box lauk lezat: ayam goreng lengkuas/empal daging, sayur urap segar, tempe mendoan & sambal terasi khas.',
    tags: ['✓ Halal MUI', 'Sisa 2 Box'],
    rating: 4.9,
    reviewCount: 95,
    imageSrc: cardDapurSolo,
    isRadiusItem: true,
  },
  {
    id: 'rad-3',
    storeName: 'Tous Les Jours Pacific Place',
    category: '🍞 Pastry & Roti Manis Fresh Harian',
    remainingBoxesText: 'Sisa Akhir',
    distanceText: 'SCBD Sudirman • 3.2 km',
    discountPercent: 55,
    originalPrice: 72000,
    rescuePrice: 32000,
    pickupTime: 'Jadwal Ambil: 21:15 - 22:00 WIB',
    description: 'Koleksi roti premium manis dan savory: croissant, red bean pastry, choco twist, dan roti bun fresh yang dipanggang pagi tadi.',
    tags: ['✓ Halal MUI', 'Sisa Akhir'],
    rating: 4.8,
    reviewCount: 210,
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
    name: 'Reza Akbar',
    role: 'Pelanggan',
    rating: 5,
    avatarSrc: avatarReza,
    quote:
      'Konsepnya keren banget! Sensasi nungguin mystery box itu nagih, dan makanannya 100% higienis dan enak. Berasa makan makanan resto bintang lima tapi bayarnya seharga warung. Rekomen parah!',
  },
];

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
  onNavigateMarketplace,
  onNavigateDetail,
  onShowToast,
}: CustomerHomeProps) {
  // Modal states
  const [selectedBox, setSelectedBox] = useState<CustomerMysteryBox | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Filters for radius section
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedDistance, setSelectedDistance] = useState<string>('Jarak Terdekat');

  const handleOpenOrder = (box: CustomerMysteryBox) => {
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

  // Filtered radius boxes
  const filteredRadiusBoxes = RADIUS_BOXES.filter((box) => {
    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Makanan Berat') return box.category.includes('Tradisional') || box.category.includes('Nasi');
    if (selectedCategory === 'Pastry & Bakery') return box.category.includes('Pastry') || box.category.includes('Roti') || box.category.includes('Snack');
    return true;
  });

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased" id="customer-page-root">
      {/* 1. Floating Pill Header */}
      <CustomerHeader
        activeTab="beranda"
        onNavigateSeller={onNavigateSeller}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectTab={(tab) => {
          if (tab === 'marketplace') {
            if (onNavigateMarketplace) {
              onNavigateMarketplace();
            } else {
              window.location.hash = '#marketplace';
            }
          }
        }}
      />

      {/* 2. Hero Section - Desain Awal (Crisp Unblurred Panoramic Cafe Background with 3D Glowing Box on Right) */}
      <section className="relative min-h-[460px] md:min-h-[520px] lg:min-h-[540px] pt-32 md:pt-36 pb-16 px-6 sm:px-12 flex items-center overflow-hidden border-b border-black/5" id="hero-section">
        {/* Full-width crisp unblurred panoramic banner */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroFullBanner}
            alt="Suasana Cafe & Glowing Mystery Box RescueBite"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Headline & Description matching Desain Awal verbatim */}
            <div className="max-w-xl">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold leading-[1.2] text-[#1b1c1c] tracking-tight mb-3.5">
                Selamatkan Makanan Lezat, <br />
                Hemat Hingga 70% Setiap Malam
              </h1>

              <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#1b1c1c] font-medium max-w-lg">
                Beli Mystery Box berisi makanan berlebih berkualitas prima dari kafe, bakery, dan restoran favoritmu sebelum jam tutup. Tetap higienis, halal, lezat, dan berdampak nyata bagi bumi.
              </p>
            </div>

            {/* Right half is intentionally open to showcase the integrated 3D Glowing Mystery Box in the banner photo */}
            <div className="hidden lg:block min-h-[300px]" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* 3. Section: Mystery Box Populer */}
      <section className="px-6 py-10 lg:py-12" id="marketplace-section">
        <div className="w-full max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">
                Mystery Box Populer
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Jakarta Selatan • Menampilkan pilihan terbaik di sekitarmu</span>
            </div>
          </div>

          {/* Popular Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_BOXES.map((box) => (
              <MysteryBoxCard
                key={box.id}
                item={box}
                variant="popular"
                onOrderClick={handleOpenOrder}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section: Mystery Box Populer di Sekitarmu (Radius 5 km) */}
      <section className="px-6 pt-4 pb-12">
        <div className="w-full max-w-7xl mx-auto">
          {/* Section Header with Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">
              Mystery Box Populer di Sekitarmu (Radius 5 km)
            </h2>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Distance Filter */}
              <div className="relative">
                <label htmlFor="filter-distance" className="sr-only">Filter Jarak</label>
                <select
                  id="filter-distance"
                  className="appearance-none bg-white border border-black/15 rounded-full py-1.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-[#1b1c1c] cursor-pointer hover:border-[#3c6a00] focus:outline-none focus:ring-1 focus:ring-[#3c6a00] transition-colors"
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                >
                  <option value="Jarak Terdekat">📍 Jarak: Jarak Terdekat</option>
                  <option value="< 2 km">📍 Jarak: &lt; 2 km</option>
                  <option value="< 5 km">📍 Jarak: &lt; 5 km</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <label htmlFor="filter-category" className="sr-only">Filter Kategori</label>
                <select
                  id="filter-category"
                  className="appearance-none bg-white border border-black/15 rounded-full py-1.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-[#1b1c1c] cursor-pointer hover:border-[#3c6a00] focus:outline-none focus:ring-1 focus:ring-[#3c6a00] transition-colors"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Semua">🍱 Kategori: Semua Menu</option>
                  <option value="Makanan Berat">🍱 Kategori: Makanan Berat</option>
                  <option value="Pastry & Bakery">🥐 Kategori: Pastry & Bakery</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Grid Layout Toggle Icon */}
              <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-black/15 bg-white text-[#1b1c1c] shadow-xs" title="Tampilan Grid Aktif">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Radius Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRadiusBoxes.map((box) => (
              <MysteryBoxCard
                key={box.id}
                item={box}
                variant="radius"
                onOrderClick={handleOpenOrder}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section: About Us (Dual Organic Bento Cards with Lime Backdrop) */}
      <section className="bg-[#f1fbe8] px-6 py-16 sm:py-20 relative overflow-hidden" id="about-us-section">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-12 sm:gap-14">
          {/* Bento Card 1: Top */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-center gap-8 sm:gap-12">
            <div>
              <span className="inline-block text-xs sm:text-sm font-bold text-[#3c6a00] uppercase tracking-wider mb-2.5">
                About Us
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold leading-tight text-[#0b1510] mb-4">
                Lebih dari Sekadar <br />
                <span className="text-[#3c6a00]">Makanan Murah</span>
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#434844]">
                RescueBite bukan sekadar platform belanja diskon makanan. Kami hadir sebagai jembatan ekologis antara toko dan kafe berkualitas dengan kamu yang peduli. Setiap harinya, tonan makanan lezat dan higienis berisiko terbuang hanya karena pergantian display harian.
              </p>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#434844] mt-3">
                Bersama RescueBite, kamu menyelamatkan hidangan berharga, memangkas jejak emisi karbon pangan, sekaligus menikmati kelezatan premium resto bintang lima dengan harga sangat terjangkau.
              </p>
            </div>

            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-[340px] aspect-square bg-white rounded-[38%_62%_63%_37%/41%_44%_56%_59%] flex items-center justify-center shadow-lg p-5 overflow-hidden transition-all duration-500 hover:rotate-1 hover:scale-105">
                <img
                  src={glowingBoxImg}
                  alt="RescueBite Mystery Box Organic Artwork"
                  className="w-full h-full object-cover rounded-2xl drop-shadow-md"
                />
                <div className="absolute top-[12%] right-[14%] text-xl pointer-events-none">✨</div>
                <div className="absolute bottom-[12%] left-[16%] text-xl pointer-events-none">🌿</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Inverted Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] items-center gap-8 sm:gap-12">
            <div className="flex justify-center items-center order-2 lg:order-1">
              <div className="relative w-full max-w-[340px] aspect-square bg-white rounded-[63%_37%_38%_62%/56%_59%_41%_44%] flex items-center justify-center shadow-lg p-5 overflow-hidden transition-all duration-500 hover:rotate-1 hover:scale-105">
                <img
                  src={glowingBoxImg}
                  alt="Second Chance Food Rescue"
                  className="w-full h-full object-cover rounded-2xl drop-shadow-md"
                />
                <div className="absolute top-[16%] left-[14%] text-xl pointer-events-none">🌟</div>
                <div className="absolute bottom-[14%] right-[18%] text-xl pointer-events-none">🌱</div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold leading-tight text-[#0b1510] mb-4">
                Good Food Deserve A <br />
                <span className="text-[#3c6a00]">Second Chance</span>
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#434844]">
                Di balik setiap Mystery Box terdapat komitmen nyata menjaga bumi kita. Makanan berkualitas tinggi layak dinikmati seutuhnya, bukan menjadi sampah emisi karbon di tempat pembuangan.
              </p>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#434844] mt-3">
                Mari jadi bagian dari gerakan penyelamatan pangan cerdas Indonesia. Rasakan sensasi kejutan lezat setiap malam, hemat pengeluaran bulanan, dan rawat lingkungan hidup bersama-sama untuk hari esok yang lebih hijau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Apa Kata Mereka (Testimonials) */}
      <section className="px-6 py-16" id="testimoni-section">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-left mb-10">
            <span className="inline-block text-xs sm:text-sm font-bold text-[#3c6a00] uppercase tracking-wider mb-2">
              Apa Kata Mereka
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1b1c1c] mt-1">
              Cerita Nyata dari <span className="text-[#3c6a00]">Pengguna</span>
            </h2>
          </div>

          {/* 3 Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testi) => (
              <div
                key={testi.id}
                className="bg-white border border-black/8 rounded-2xl p-6 shadow-xs flex flex-col transition-all hover:-translate-y-1 hover:border-[#3c6a00]/30 hover:shadow-md"
                id={`testi-${testi.id}`}
              >
                {/* Header User Profile */}
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={testi.avatarSrc}
                    alt={testi.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#3c6a00]/20 shadow-xs"
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
                  "{testi.quote}"
                </p>
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
            <div className="w-12 h-12 mx-auto rounded-full bg-[#3c6a00]/10 flex items-center justify-center text-[#3c6a00]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
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
