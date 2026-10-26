import { useState, useMemo, useEffect } from 'react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerOrderModal } from '../components/customer/CustomerOrderModal';
import { CustomerMysteryBox } from '../types';
import { getCartCount, subscribeToCart } from '../services/cartService';

// Optional existing assets (can be replaced/augmented anytime from assets)
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';

export interface CustomerMarketplaceProps {
  onNavigateHome?: () => void;
  onNavigateSeller?: () => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onNavigateCart?: () => void;
  onShowToast?: (message: string) => void;
}

export interface MarketplaceBoxItem extends CustomerMysteryBox {
  categoryBadge: string;
  city: string;
  categoryType: 'pastry' | 'heavy' | 'beverage' | 'snack';
}

/**
 * Format currency with dots thousands separator (e.g. 35000 -> "35.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * 12 Marketplace Mock Products matching the Figma design verbatim.
 * Designed with a clean placeholder slot when imageSrc is not present.
 */
const MARKETPLACE_PRODUCTS: MarketplaceBoxItem[] = [
  {
    id: 'mp-1',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 - 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3-4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-2',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-3',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-4',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 1 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-5',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-6',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-7',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-8',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-9',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-10',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-11',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-12',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box!',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 – 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3–4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
];

const CITIES = ['Malang', 'Jakarta Selatan', 'Surabaya', 'Bandung', 'Yogyakarta'];

export function CustomerMarketplace({
  onNavigateHome,
  onNavigateSeller,
  onNavigateDetail,
  onNavigateCart,
  onShowToast,
}: CustomerMarketplaceProps) {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Malang');
  const [priceFilter, setPriceFilter] = useState('semua');
  const [categoryFilter, setCategoryFilter] = useState('semua');
  const [distanceFilter, setDistanceFilter] = useState('semua');
  const [sortFilter, setSortFilter] = useState('relevan');

  // Modal & Cart States
  const [selectedBox, setSelectedBox] = useState<CustomerMysteryBox | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState<number>(getCartCount);

  // Synchronize cart count across views
  useEffect(() => {
    const unsubscribe = subscribeToCart((count) => {
      setCartCount(count);
    });
    return unsubscribe;
  }, []);

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return MARKETPLACE_PRODUCTS.filter((item) => {
      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.storeName.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      // City filter
      if (selectedCity && selectedCity !== 'Semua Kota') {
        if (item.city !== selectedCity) return false;
      }

      // Price filter
      if (priceFilter === '<30k' && item.rescuePrice >= 30000) return false;
      if (priceFilter === '30k-50k' && (item.rescuePrice < 30000 || item.rescuePrice > 50000)) return false;
      if (priceFilter === '>50k' && item.rescuePrice <= 50000) return false;

      // Category filter
      if (categoryFilter !== 'semua') {
        if (categoryFilter === 'pastry' && item.categoryType !== 'pastry') return false;
        if (categoryFilter === 'heavy' && item.categoryType !== 'heavy') return false;
        if (categoryFilter === 'beverage' && item.categoryType !== 'beverage') return false;
        if (categoryFilter === 'snack' && item.categoryType !== 'snack') return false;
      }

      // Distance filter
      if (distanceFilter === '<1km') {
        const dist = parseFloat(item.distanceText);
        if (dist >= 1.0) return false;
      } else if (distanceFilter === '<3km') {
        const dist = parseFloat(item.distanceText);
        if (dist >= 3.0) return false;
      } else if (distanceFilter === '<5km') {
        const dist = parseFloat(item.distanceText);
        if (dist >= 5.0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortFilter === 'diskon') {
        return b.discountPercent - a.discountPercent;
      }
      if (sortFilter === 'harga-terendah') {
        return a.rescuePrice - b.rescuePrice;
      }
      if (sortFilter === 'jarak') {
        return parseFloat(a.distanceText) - parseFloat(b.distanceText);
      }
      return 0; // relevan
    });
  }, [searchQuery, selectedCity, priceFilter, categoryFilter, distanceFilter, sortFilter]);

  const handleOpenOrder = (box: CustomerMysteryBox) => {
    if (onNavigateDetail) {
      onNavigateDetail(box);
    } else {
      setSelectedBox(box);
      setIsOrderModalOpen(true);
    }
  };

  const handleConfirmOrder = (_box: CustomerMysteryBox, _quantity: number) => {
    if (onShowToast) {
      onShowToast('Pesanan berhasil dibuat!');
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'kontak') {
      const footerEl = document.getElementById('customer-footer');
      if (footerEl) {
        footerEl.scrollIntoView({ behavior: 'smooth' });
      } else if (onShowToast) {
        onShowToast('Hubungi kami di halo@rescuebyte.id');
      }
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="marketplace-page-root">
      <div>
        {/* 1. Floating Pill Header (Active on Marketplace) */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 2. Main Marketplace Content Area */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Header Bar: Title + Search & City Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5">
            {/* Left Title & Subtitle */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#1b1c1c] tracking-tight">
                  Jelajahi <span className="text-[#3c6a00]">Mystery Box</span>
                </h1>
                {/* Decorative motif dots / paw from Figma */}
                <div className="flex flex-col gap-1 -rotate-12 translate-y-0.5 select-none" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3c6a00] self-end"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3c6a00] self-center"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3c6a00] self-start"></span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Temukan makanan murah berkualitas di sekitarmu
              </p>
            </div>

            {/* Right: Search Bar & City Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-72 lg:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari makanan, toko atau kategori..."
                  className="w-full bg-white border border-black/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-[#1b1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3c6a00] focus:border-[#3c6a00] shadow-2xs transition-all"
                  aria-label="Cari makanan, toko atau kategori"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs cursor-pointer p-1"
                    title="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* City Dropdown Selector */}
              <div className="relative min-w-[130px] sm:min-w-[145px]">
                <label htmlFor="select-city" className="sr-only">Pilih Kota</label>
                <select
                  id="select-city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full appearance-none bg-white border border-black/20 rounded-2xl pl-4 pr-9 py-2.5 text-xs sm:text-sm font-bold text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-[#3c6a00] focus:border-[#3c6a00] shadow-2xs cursor-pointer transition-all"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills Row (Harga, Kategori, Jarak, Urutkan) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
            {/* 1. Filter Harga */}
            <div className="relative">
              <label htmlFor="filter-price" className="sr-only">Filter Harga</label>
              <select
                id="filter-price"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-black/15 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#1b1c1c] focus:outline-none focus:border-[#3c6a00] focus:ring-1 focus:ring-[#3c6a00] shadow-2xs cursor-pointer transition-all truncate pr-8"
              >
                <option value="semua">Harga: Semua</option>
                <option value="<30k">&lt; Rp 30.000</option>
                <option value="30k-50k">Rp 30.000 – Rp 50.000</option>
                <option value=">50k">&gt; Rp 50.000</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* 2. Filter Kategori */}
            <div className="relative">
              <label htmlFor="filter-category" className="sr-only">Filter Kategori</label>
              <select
                id="filter-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-black/15 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#1b1c1c] focus:outline-none focus:border-[#3c6a00] focus:ring-1 focus:ring-[#3c6a00] shadow-2xs cursor-pointer transition-all truncate pr-8"
              >
                <option value="semua">Kategori: Semua</option>
                <option value="pastry">🥐 Pastry & Bakery</option>
                <option value="heavy">🍛 Makanan Berat</option>
                <option value="beverage">☕ Minuman & Kopi</option>
                <option value="snack">🍪 Camilan & Dessert</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* 3. Filter Jarak */}
            <div className="relative">
              <label htmlFor="filter-distance" className="sr-only">Filter Jarak</label>
              <select
                id="filter-distance"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-black/15 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#1b1c1c] focus:outline-none focus:border-[#3c6a00] focus:ring-1 focus:ring-[#3c6a00] shadow-2xs cursor-pointer transition-all truncate pr-8"
              >
                <option value="semua">Jarak: Semua</option>
                <option value="<1km">&lt; 1 km</option>
                <option value="<3km">&lt; 3 km</option>
                <option value="<5km">&lt; 5 km</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* 4. Filter Urutkan */}
            <div className="relative">
              <label htmlFor="filter-sort" className="sr-only">Urutkan</label>
              <select
                id="filter-sort"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-black/15 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#1b1c1c] focus:outline-none focus:border-[#3c6a00] focus:ring-1 focus:ring-[#3c6a00] shadow-2xs cursor-pointer transition-all truncate pr-8"
              >
                <option value="relevan">Urutkan: Paling Relevan</option>
                <option value="diskon">Diskon Tertinggi</option>
                <option value="harga-terendah">Harga Terendah</option>
                <option value="jarak">Jarak Terdekat</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. Product Cards Grid (3 Columns) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="marketplace-grid">
              {filteredProducts.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl border border-black/10 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  id={`marketplace-card-${item.id}`}
                >
                  {/* Card Visual Header (Photo or Clean Structured Placeholder) */}
                  <div className="relative w-full h-52 overflow-hidden bg-[#24201c]">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={`Mystery Box ${item.storeName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      /* Clean visual placeholder slot when image is not yet in assets */
                      <div className="w-full h-full bg-gradient-to-br from-[#2a241e] via-[#352c24] to-[#1c1815] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-200/90 mb-1 border border-white/10 shadow-xs">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">Mystery Box</span>
                      </div>
                    )}

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                      <div className="flex items-center gap-1.5">
                        {/* Stock Badge: Merah Muda jika > 2, Merah Tebal jika <= 2 */}
                        {(() => {
                          const stockMatch = item.remainingBoxesText.match(/\d+/);
                          const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
                          const isAboveTwo = stockCount > 2;
                          const isSingleLast = stockCount === 1 || item.remainingBoxesText.toLowerCase().includes('1 box') || item.remainingBoxesText.toLowerCase().includes('terakhir');
                          const cleanStockText = item.remainingBoxesText.replace(/^[!\s]+/, '');

                          return isAboveTwo ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#FDECEB] text-[#D94A38] text-[11px] font-bold flex items-center gap-1 shadow-xs border border-[#FCA5A5]/30">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="shrink-0"
                                aria-hidden="true"
                              >
                                <circle cx="12" cy="12" r="9" />
                                <polyline points="12 6 12 12 15 14" />
                              </svg>
                              <span>{cleanStockText}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#b91c1c] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                              {isSingleLast ? (
                                <span className="font-black text-[12px] leading-none" aria-hidden="true">!</span>
                              ) : (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="shrink-0"
                                  aria-hidden="true"
                                >
                                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                                </svg>
                              )}
                              <span>{cleanStockText}</span>
                            </span>
                          );
                        })()}
                        <span className="px-2.5 py-1 rounded-full bg-white text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs">
                          {item.distanceText}
                        </span>
                      </div>

                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-[#3c6a00] text-white text-[11px] font-black shadow-xs">
                          -{item.discountPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Dark Gradient with Category & Store Name Overlay */}
                    <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end pointer-events-none z-10">
                      <span className="text-[11px] sm:text-xs font-black text-[#a3e635] tracking-wider uppercase drop-shadow-xs">
                        {item.categoryBadge}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white font-display leading-tight drop-shadow-sm mt-0.5 truncate">
                        {item.storeName}
                      </h2>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-[#434844] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex items-center gap-2 flex-wrap my-3.5">
                      {item.tags.map((tag, idx) => {
                        const lowerTag = tag.toLowerCase();
                        const isHalal = lowerTag.includes('halal') || idx === 0 && !lowerTag.includes('porsi');
                        const isPlantBased = lowerTag.includes('plant') || lowerTag.includes('organik');

                        if (isHalal) {
                          return (
                            <span
                              key={`${tag}-${idx}`}
                              className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs bg-[#9AE630] text-[#143805] font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="shrink-0"
                                aria-hidden="true"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                              <span>{tag.replace(/^[✓\s]+/, '')}</span>
                            </span>
                          );
                        }

                        if (isPlantBased) {
                          return (
                            <span
                              key={`${tag}-${idx}`}
                              className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs bg-[#9AE630] text-[#143805] font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="shrink-0"
                                aria-hidden="true"
                              >
                                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                              </svg>
                              <span>{tag}</span>
                            </span>
                          );
                        }

                        return (
                          <span
                            key={`${tag}-${idx}`}
                            className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs bg-[#F1F3F5] text-[#434844] font-medium"
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>

                    {/* Pickup Time Bar */}
                    <div className="w-full bg-[#F4F3F0] rounded-xl py-2.5 px-3.5 flex items-center gap-2 mt-auto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d94a38] shrink-0" aria-hidden="true">
                        <circle cx="12" cy="13" r="8" />
                        <path d="M12 9v4l2.5 2.5" />
                        <path d="M5 3 2 6" />
                        <path d="m22 6-3-3" />
                        <path d="M10 2h4" />
                      </svg>
                      <div className="text-xs text-[#434844] truncate">
                        <span className="font-normal text-[#5a625d]">Ambil: </span>
                        <span className="font-bold text-[#1b1c1c]">{item.pickupTime}</span>
                      </div>
                    </div>

                    {/* Card Footer: Price & Ambil Sekarang Button */}
                    <div className="pt-3.5 mt-3.5 border-t border-[#f0eded] flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#737874] line-through font-medium">
                          Rp {formatRupiah(item.originalPrice)}
                        </span>
                        <span className="text-xl sm:text-[22px] font-black text-[#1b1c1c] font-display tracking-tight leading-none mt-0.5">
                          Rp {formatRupiah(item.rescuePrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenOrder(item)}
                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#1f2a24] hover:bg-[#2c3b33] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                        id={`btn-ambil-${item.id}`}
                      >
                        <span>Ambil Sekarang</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State when filters yield no results */
            <div className="w-full py-16 px-4 bg-white rounded-3xl border border-black/10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl mb-3">
                🔍
              </div>
              <h3 className="font-bold text-lg text-[#1b1c1c]">Tidak ada Mystery Box yang cocok</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-1 mb-4">
                Coba sesuaikan kata kunci pencarian atau ubah filter harga, kategori, dan jarak di atas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPriceFilter('semua');
                  setCategoryFilter('semua');
                  setDistanceFilter('semua');
                  setSortFilter('relevan');
                }}
                className="px-5 py-2 bg-[#1e2420] text-white text-xs font-bold rounded-full hover:bg-black transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 4. Floating Cart / Orders Quick Badge (Matching Figma design) */}
      <button
        type="button"
        onClick={() => {
          if (onNavigateCart) {
            onNavigateCart();
          } else {
            window.location.hash = '#keranjang';
          }
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white border-2 border-[#3c6a00] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="Keranjang Pesanan"
        aria-label="Buka Keranjang Pesanan"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3c6a00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {/* Badge Count */}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
          {cartCount}
        </span>
      </button>

      {/* 5. Customer Footer */}
      <CustomerFooter
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Membuka live chat Customer Service RescueBite...');
        }}
      />

      {/* 6. Checkout Order Modal */}
      <CustomerOrderModal
        item={selectedBox}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* 7. Quick Auth Modal */}
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
