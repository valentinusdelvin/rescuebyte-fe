import { useState, useMemo, useEffect, useCallback } from 'react';
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
  onNavigateAuth?: () => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateCart?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
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
 * Format input string into thousands dot separated string (e.g. "10000" -> "10.000")
 */
function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

/**
 * Parse thousands dot separated string back to number
 */
function parsePriceInput(val: string): number | null {
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : null;
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
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '0.8 km',
    discountPercent: 68,
    originalPrice: 55000,
    rescuePrice: 18000,
    pickupTime: '19:45 - 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3-4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-2',
    storeName: 'Holland Bakery Ijen',
    category: '🍞 Roti & Pastry Harian',
    categoryBadge: '🍞 ROTI SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 3 Box',
    distanceText: '1.2 km',
    discountPercent: 65,
    originalPrice: 25000,
    rescuePrice: 8500,
    pickupTime: '19:30 - 20:30 WIB',
    description: 'Roti manis, lemper ayam, dan aneka jajanan pasar lembut dan fresh hari ini.',
    tags: ['✓ Halal MUI', 'Tradisional'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-3',
    storeName: 'Gourmet Delicatessen Malang',
    category: '🥪 European Cold Cuts & Bread',
    categoryBadge: '🥪 DELI SURPRISE',
    categoryType: 'heavy',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '3.5 km',
    discountPercent: 60,
    originalPrice: 65000,
    rescuePrice: 25000,
    pickupTime: '20:00 - 21:30 WIB',
    description: 'Aneka artisan sourdough, cheese sandwich, dan ham roll impor kualitas premium.',
    tags: ['Non Halal', 'European Deli'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-4',
    storeName: 'Monsieur Spoon Senopati',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 1 Box',
    distanceText: '7.8 km',
    discountPercent: 68,
    originalPrice: 110000,
    rescuePrice: 35000,
    pickupTime: '19:45 - 21:00 WIB (45 mnt lagi)',
    description: 'Artisan French Viennoiserie Surprise Box berisi 3-4 macam butter croissant, pain au chocolat, atau fruit danish segar hari ini.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-5',
    storeName: 'Artisan Viennoiserie Cafe',
    category: '☕ Pastry & Specialty Coffee',
    categoryBadge: '☕ CAFE SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '12.0 km',
    discountPercent: 55,
    originalPrice: 95000,
    rescuePrice: 45000,
    pickupTime: '20:30 - 22:00 WIB',
    description: 'Paket brunch mystery: 2 pastry premium dan 1 kopi susu literan botolan segar.',
    tags: ['✓ Halal MUI', 'Kopi & Roti'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-6',
    storeName: 'Donat Kampung Sutami',
    category: '🍩 Donat & Sweet Treats',
    categoryBadge: '🍩 DONAT SURPRISE',
    categoryType: 'snack',
    city: 'Malang',
    remainingBoxesText: 'Sisa 4 Box',
    distanceText: '2.1 km',
    discountPercent: 60,
    originalPrice: 22000,
    rescuePrice: 9000,
    pickupTime: '18:30 - 20:00 WIB',
    description: 'Kotak donat kentang tabur gula halus dan meises klasik 6 pcs masih empuk.',
    tags: ['✓ Halal MUI', 'Snack Manis'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-7',
    storeName: 'Bacon & Brew Bistro',
    category: '🥓 Western Diner & Pastry',
    categoryBadge: '🥓 DINER SURPRISE',
    categoryType: 'heavy',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '18.5 km',
    discountPercent: 62,
    originalPrice: 40000,
    rescuePrice: 15000,
    pickupTime: '21:00 - 22:30 WIB',
    description: 'Savory puff pastry dengan bacon bits dan creamy cheese melt hangat.',
    tags: ['Non Halal', 'Western Food'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-8',
    storeName: 'Dapur Croissant Sawojajar',
    category: '🥐 Pastry & Danish',
    categoryBadge: '🥐 CROISSANT SURPRISE',
    categoryType: 'pastry',
    city: 'Malang',
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '4.2 km',
    discountPercent: 65,
    originalPrice: 80000,
    rescuePrice: 28000,
    pickupTime: '19:00 - 20:30 WIB',
    description: 'Surprise box berisi 3 almond croissant dan chocolate roll gurih.',
    tags: ['✓ Halal MUI', 'Fresh Baked'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-9',
    storeName: 'Cake & Tart Dinoyo',
    category: '🍰 Cake Slice & Tart',
    categoryBadge: '🍰 CAKE SURPRISE',
    categoryType: 'snack',
    city: 'Malang',
    remainingBoxesText: 'Sisa 1 Box',
    distanceText: '25.0 km',
    discountPercent: 65,
    originalPrice: 135000,
    rescuePrice: 48000,
    pickupTime: '20:00 - 21:00 WIB',
    description: 'Aneka 2-3 slice whole cake signature seperti red velvet dan tiramisu segar.',
    tags: ['✓ Halal MUI', 'Dessert Box'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-10',
    storeName: 'Monsieur Spoon Jakarta',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Jakarta Selatan',
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '0.8 km',
    discountPercent: 65,
    originalPrice: 65000,
    rescuePrice: 22000,
    pickupTime: '19:45 - 21:00 WIB',
    description: 'Artisan French Viennoiserie Surprise Box butter croissant & pain au chocolat.',
    tags: ['✓ Halal MUI', 'Gluten & Dairy'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-11',
    storeName: 'Roti Surabaya Gubeng',
    category: '🍞 Roti & Pastry Harian',
    categoryBadge: '🍞 ROTI SURPRISE',
    categoryType: 'pastry',
    city: 'Surabaya',
    remainingBoxesText: 'Sisa 2 Box',
    distanceText: '2.0 km',
    discountPercent: 60,
    originalPrice: 40000,
    rescuePrice: 16000,
    pickupTime: '19:00 - 20:30 WIB',
    description: 'Paket aneka roti kasur dan roti sobek mentega manis lembut hari ini.',
    tags: ['✓ Halal MUI', 'Keluarga'],
    imageSrc: cardMonsieurSpoon,
  },
  {
    id: 'mp-12',
    storeName: 'Bandung Pastry Express',
    category: '🥐 Pastry & Bakery Premium',
    categoryBadge: '🥐 PASTRY SURPRISE',
    categoryType: 'pastry',
    city: 'Bandung',
    remainingBoxesText: 'Sisa 3 Box',
    distanceText: '4.5 km',
    discountPercent: 58,
    originalPrice: 70000,
    rescuePrice: 29000,
    pickupTime: '19:30 - 21:00 WIB',
    description: 'Aneka bolen pisang keju coklat dan pastry lapis legit mini khas Bandung.',
    tags: ['✓ Halal MUI', 'Oleh-Oleh'],
    imageSrc: cardMonsieurSpoon,
  },
];

const CITIES = ['Malang', 'Jakarta Selatan', 'Surabaya', 'Bandung', 'Yogyakarta', 'Semua Kota'];

const DISTANCE_OPTIONS = [
  { value: 'semua', label: 'Semua Jarak' },
  { value: '<1km', label: 'Kurang dari 1km' },
  { value: '<5km', label: 'Kurang dari 5km' },
  { value: '<10km', label: 'Kurang dari 10km' },
];

export type SortField = 'jam_ambil' | 'lokasi' | 'ulasan';
export type SortOrder = 'asc' | 'desc';

interface SortConfig {
  id: SortField;
  label: string;
  defaultOrder: SortOrder;
  ascLabel: string;
  descLabel: string;
}

const SORT_OPTIONS: SortConfig[] = [
  {
    id: 'jam_ambil',
    label: 'Jam Ambil',
    defaultOrder: 'asc',
    ascLabel: 'Paling Awal Pagi / Sore',
    descLabel: 'Paling Akhir Malam',
  },
  {
    id: 'lokasi',
    label: 'Lokasi',
    defaultOrder: 'asc',
    ascLabel: 'Jarak Terdekat mulai 0 km',
    descLabel: 'Jarak Terjauh',
  },
  {
    id: 'ulasan',
    label: 'Ulasan',
    defaultOrder: 'desc',
    ascLabel: 'Rating Terendah',
    descLabel: 'Rating Tertinggi 5.0',
  },
];

/**
 * Parse start minutes from pickup schedule string (e.g. "19:45 - 21:00" -> 1185)
 */
function parsePickupMinutes(pickupTimeStr?: string): number {
  if (!pickupTimeStr) return 9999;
  const match = pickupTimeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/**
 * Strip emoji and icon characters from product name, returning clean text
 */
function cleanProductName(raw?: string): string {
  if (!raw) return 'SURPRISE BOX';
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/^[^\w\s]+/, '')
    .trim()
    .toUpperCase();
}

export function CustomerMarketplace({
  onNavigateHome,
  onNavigateSeller,
  onNavigateAuth,
  onNavigateDetail,
  onNavigateStore,
  onNavigateCart,
  onNavigateProfile,
  onNavigateOrders,
  onShowToast,
}: CustomerMarketplaceProps) {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Lokasi Saat Ini');
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('semua');
  const [sortField, setSortField] = useState<SortField>('jam_ambil');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [openDropdown, setOpenDropdown] = useState<'harga' | 'jarak' | 'urutkan' | 'kota' | null>(null);

  // Request browser live location
  const handleRequestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (onShowToast) onShowToast('Browser tidak mendukung geolokasi');
      setSelectedCity('Malang');
      return;
    }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (_pos) => {
        setIsLoadingLoc(false);
        setSelectedCity('Lokasi Saat Ini');
        setOpenDropdown(null);
        if (onShowToast) onShowToast('📍 Menggunakan lokasi live Anda');
      },
      (err) => {
        setIsLoadingLoc(false);
        console.warn('Geolocation permission:', err.message);
        if (onShowToast) onShowToast('Izin lokasi belum diberikan, default: Malang');
        setSelectedCity('Malang');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onShowToast]);

  // Trigger live location request on mount asynchronously
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (_pos) => {
        setSelectedCity('Lokasi Saat Ini');
      },
      (err) => {
        console.warn('Geolocation permission:', err.message);
        setSelectedCity('Malang');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

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

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchCat && !matchTags) return false;
      }

      // City filter (based on live loc or selected city)
      if (selectedCity && selectedCity !== 'Semua Kota' && selectedCity !== 'Lokasi Saat Ini') {
        if (item.city !== selectedCity) return false;
      }

      // Price filter (Min - Max Range)
      if (appliedMinPrice !== null && item.rescuePrice < appliedMinPrice) return false;
      if (appliedMaxPrice !== null && item.rescuePrice > appliedMaxPrice) return false;

      // Distance filter
      if (distanceFilter !== 'semua') {
        const dist = parseFloat(item.distanceText) || 0;
        if (distanceFilter === '<1km' && dist >= 1.0) return false;
        if (distanceFilter === '<5km' && dist >= 5.0) return false;
        if (distanceFilter === '<10km' && dist >= 10.0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'jam_ambil') {
        const timeA = parsePickupMinutes(a.pickupTime);
        const timeB = parsePickupMinutes(b.pickupTime);
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'lokasi') {
        const distA = parseFloat(a.distanceText) || 0;
        const distB = parseFloat(b.distanceText) || 0;
        return sortOrder === 'asc' ? distA - distB : distB - distA;
      }
      if (sortField === 'ulasan') {
        const ratingA = a.rating || 4.8;
        const ratingB = b.rating || 4.8;
        return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
      }
      return 0;
    });
  }, [searchQuery, selectedCity, appliedMinPrice, appliedMaxPrice, distanceFilter, sortField, sortOrder]);

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
        />

        {/* 2. Main Marketplace Content Area */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Header Bar: Title + Search & City Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5">
            {/* Left Title & Subtitle */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#1b1c1c] tracking-tight flex items-center">
                  <span>Jelajahi </span>
                  <span className="text-brand-green ml-1.5">Mystery Box</span>
                </h1>
                {/* 4 Diagonal Footprints (Jejak Kaki Hitam 100% Persis Gambar Referensi) */}
                <svg
                  viewBox="0 0 49 89"
                  width="26"
                  height="46"
                  fill="#1b1c1c"
                  className="shrink-0 select-none ml-2 inline-block align-middle"
                  aria-label="Jejak kaki"
                  role="img"
                >
                  <path d="M 3,1 L 5,1 L 7,1 L 8,2 L 10,3 L 11,4 L 12,5 L 13,6 L 14,7 L 15,8 L 16,10 L 15,11 L 14,12 L 13,13 L 12,14 L 11,13 L 10,12 L 8,11 L 6,11 L 5,10 L 4,9 L 3,8 L 2,7 L 1,5 L 1,3 L 2,2 L 3,1 Z" />
                  <path d="M 18,13 L 19,14 L 20,15 L 21,17 L 20,19 L 19,20 L 17,20 L 16,19 L 15,18 L 14,17 L 15,15 L 17,14 L 18,13 Z" />
                  <path d="M 5,30 L 7,31 L 9,32 L 10,33 L 11,35 L 12,36 L 12,38 L 13,40 L 14,42 L 13,43 L 12,44 L 11,45 L 10,46 L 9,45 L 8,44 L 6,43 L 5,41 L 4,40 L 3,38 L 2,36 L 2,34 L 2,32 L 3,31 L 5,30 Z" />
                  <path d="M 33,35 L 35,35 L 37,35 L 38,36 L 39,37 L 40,38 L 41,39 L 42,40 L 43,42 L 43,44 L 44,45 L 44,47 L 42,48 L 40,49 L 39,48 L 38,47 L 37,46 L 35,45 L 34,44 L 33,43 L 32,41 L 32,39 L 32,37 L 33,35 Z" />
                  <path d="M 16,45 L 17,46 L 18,47 L 19,48 L 19,50 L 18,51 L 17,52 L 15,51 L 13,50 L 13,48 L 14,47 L 15,46 L 16,45 Z" />
                  <path d="M 45,50 L 46,51 L 47,52 L 47,54 L 46,56 L 45,57 L 44,56 L 42,55 L 41,54 L 41,52 L 43,51 L 45,50 Z" />
                  <path d="M 33,66 L 35,66 L 37,67 L 38,68 L 39,69 L 40,71 L 41,73 L 41,75 L 42,77 L 42,79 L 40,80 L 39,81 L 37,80 L 36,79 L 35,78 L 34,77 L 33,76 L 32,74 L 31,72 L 31,70 L 31,68 L 32,67 L 33,66 Z" />
                  <path d="M 44,81 L 46,81 L 47,82 L 48,84 L 47,86 L 46,87 L 44,87 L 43,86 L 42,85 L 41,84 L 42,83 L 43,82 L 44,81 Z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Temukan makanan murah berkualitas disekitarmu
              </p>
            </div>

            {/* Right: Search Bar & City Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-72 lg:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari makanan, toko atau kategori..."
                  className="w-full bg-white border border-black/25 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-[#1b1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black shadow-2xs transition-all"
                  aria-label="Cari makanan, toko atau kategori"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
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

              {/* City Dropdown Selector with Live Location */}
              <div className="relative filter-dropdown-container min-w-38.75 sm:min-w-43.75">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'kota' ? null : 'kota')}
                  className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-[#1b1c1c] flex items-center justify-between gap-2 shadow-2xs cursor-pointer transition-all ${openDropdown === 'kota'
                    ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]'
                    : 'border-black/25 hover:border-black/45'
                    }`}
                  aria-expanded={openDropdown === 'kota'}
                  aria-haspopup="listbox"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-black"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{isLoadingLoc ? 'Mendeteksi...' : selectedCity}</span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`shrink-0 text-black transition-transform duration-200 ${openDropdown === 'kota' ? 'rotate-180' : ''
                      }`}
                  >
                    <path d="M12 15l-5-5h10z" />
                  </svg>
                </button>

                {openDropdown === 'kota' && (
                  <div className="absolute top-full right-0 mt-1.5 w-full min-w-50 bg-white border border-black/15 rounded-xl shadow-lg z-40 py-1.5 overflow-hidden">
                    {/* Live Location option */}
                    <button
                      type="button"
                      onClick={handleRequestLiveLocation}
                      className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold text-[#1b1c1c] hover:bg-gray-100 flex items-center justify-between border-b border-gray-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-black shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="22" y1="12" x2="18" y2="12" />
                          <line x1="6" y1="12" x2="2" y2="12" />
                          <line x1="12" y1="6" x2="12" y2="2" />
                          <line x1="12" y1="22" x2="12" y2="18" />
                        </svg>
                        <span>{isLoadingLoc ? 'Mendeteksi...' : 'Gunakan Live Loc'}</span>
                      </div>
                      {selectedCity === 'Lokasi Saat Ini' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">Aktif</span>
                      )}
                    </button>

                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${selectedCity === city
                          ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                          : 'text-[#1b1c1c] hover:bg-gray-50'
                          }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Dropdowns Row (Harga, Jarak, Urutkan) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-8">
            {/* 1. Filter Harga */}
            <div className="relative filter-dropdown-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'harga' ? null : 'harga')}
                className={`w-full bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all ${
                  openDropdown === 'harga'
                    ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#1b1c1c]'
                    : appliedMinPrice !== null || appliedMaxPrice !== null
                    ? 'border-brand-green bg-[#f4f8f4] text-[#1b1c1c]'
                    : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
                }`}
                aria-expanded={openDropdown === 'harga'}
              >
                <span className="truncate">
                  {appliedMinPrice !== null && appliedMaxPrice !== null
                    ? `Rp ${formatRupiah(appliedMinPrice)} - ${formatRupiah(appliedMaxPrice)}`
                    : appliedMinPrice !== null
                    ? `≥ Rp ${formatRupiah(appliedMinPrice)}`
                    : appliedMaxPrice !== null
                    ? `≤ Rp ${formatRupiah(appliedMaxPrice)}`
                    : 'Harga'}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 transition-transform duration-200 ${openDropdown === 'harga' ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'harga' && (
                <div className="absolute top-full left-0 right-0 w-full mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-150 min-w-[280px] sm:min-w-full">
                  {/* 1. Semua Harga */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedMinPrice(null);
                      setAppliedMaxPrice(null);
                      setMinPriceInput('');
                      setMaxPriceInput('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-between cursor-pointer mb-1 ${
                      appliedMinPrice === null && appliedMaxPrice === null
                        ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                        : 'text-[#1b1c1c] hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <span>Semua Harga</span>
                    {appliedMinPrice === null && appliedMaxPrice === null && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  <div className="border-t border-gray-100 my-2" />

                  {/* 2. Rentang min x - max y */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Rentang Harga (Rp)
                    </span>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Min</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={minPriceInput}
                            onChange={(e) => setMinPriceInput(formatPriceInput(e.target.value))}
                            className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-[#1b1c1c] focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Max</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="50.000"
                            value={maxPriceInput}
                            onChange={(e) => setMaxPriceInput(formatPriceInput(e.target.value))}
                            className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-[#1b1c1c] focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Box Terapkan */}
                    <button
                      type="button"
                      onClick={() => {
                        const min = parsePriceInput(minPriceInput);
                        const max = parsePriceInput(maxPriceInput);
                        setAppliedMinPrice(min);
                        setAppliedMaxPrice(max);
                        setOpenDropdown(null);
                        if (onShowToast) {
                          onShowToast('Rentang harga diterapkan');
                        }
                      }}
                      className="w-full mt-3 py-2.5 bg-[#1e2420] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Filter Jarak */}
            <div className="relative filter-dropdown-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'jarak' ? null : 'jarak')}
                className={`w-full bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all ${
                  openDropdown === 'jarak'
                    ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#1b1c1c]'
                    : distanceFilter !== 'semua'
                    ? 'border-brand-green bg-[#f4f8f4] text-[#1b1c1c]'
                    : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
                }`}
                aria-expanded={openDropdown === 'jarak'}
              >
                <span className="truncate">
                  {distanceFilter === 'semua' ? 'Jarak' : DISTANCE_OPTIONS.find((o) => o.value === distanceFilter)?.label}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 transition-transform duration-200 ${openDropdown === 'jarak' ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'jarak' && (
                <div className="absolute top-full left-0 right-0 w-full mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden min-w-[200px] sm:min-w-full animate-in fade-in zoom-in-95 duration-150">
                  {DISTANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDistanceFilter(opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-colors flex items-center justify-between cursor-pointer ${
                        distanceFilter === opt.value
                          ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                          : 'text-[#1b1c1c] hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {distanceFilter === opt.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Filter Urutkan (dengan fitur panah Asc / Desc) */}
            <div className="relative filter-dropdown-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'urutkan' ? null : 'urutkan')}
                className={`w-full bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all ${
                  openDropdown === 'urutkan'
                    ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#1b1c1c]'
                    : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
                }`}
                aria-expanded={openDropdown === 'urutkan'}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate">
                    {sortField === 'jam_ambil'
                      ? 'Jam Ambil'
                      : sortField === 'lokasi'
                      ? 'Lokasi'
                      : 'Ulasan'}
                  </span>
                  <span className="text-xs font-black text-brand-green">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 transition-transform duration-200 ${openDropdown === 'urutkan' ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDropdown === 'urutkan' && (
                <div className="absolute top-full right-0 sm:left-0 sm:right-0 w-full mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 py-2 overflow-hidden min-w-[280px] sm:min-w-full animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Pilih Urutan &amp; Arah
                  </div>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortField === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (isSelected) {
                            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setSortField(opt.id);
                            setSortOrder(opt.defaultOrder);
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 transition-colors flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? 'bg-[#f0f7f0] text-[#1b1c1c]'
                            : 'text-[#1b1c1c] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className={`text-xs sm:text-sm ${isSelected ? 'font-bold text-[#1b1c1c]' : 'font-medium'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-gray-500 font-normal mt-0.5">
                            {isSelected
                              ? sortOrder === 'asc'
                                ? opt.ascLabel
                                : opt.descLabel
                              : 'Klik untuk memilih'}
                          </span>
                        </div>

                        {/* Interactive Asc/Desc toggle button (Arrow Only) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                            } else {
                              setSortField(opt.id);
                              setSortOrder(opt.defaultOrder);
                            }
                          }}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isSelected
                              ? 'bg-brand-green text-white border-brand-green shadow-xs hover:bg-[#165022]'
                              : 'bg-white text-gray-400 border-gray-200 group-hover:border-gray-300 group-hover:text-gray-600'
                          }`}
                          title={isSelected ? (sortOrder === 'asc' ? 'Urutkan Menurun' : 'Urutkan Menaik') : 'Pilih pengurutan'}
                          aria-label={isSelected ? (sortOrder === 'asc' ? 'Arah naik' : 'Arah turun') : 'Pilih arah'}
                        >
                          {isSelected ? (
                            sortOrder === 'asc' ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                              </svg>
                            )
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m7 15 5 5 5-5" />
                              <path d="m7 9 5-5 5 5" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
                      <div className="w-full h-full bg-linear-to-br from-[#2a241e] via-[#352c24] to-[#1c1815] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
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
                          const cleanStockText = item.remainingBoxesText.replace(/^[!\s]+/, '').replace(/[!\s]+$/, '');

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
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="shrink-0"
                                  aria-hidden="true"
                                >
                                  <line x1="12" y1="4.5" x2="12" y2="13.5" />
                                  <line x1="12" y1="19" x2="12.01" y2="19" />
                                </svg>
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
                        <span className="px-2.5 py-1 rounded-full bg-brand-green text-white text-[11px] font-black shadow-xs">
                          -{item.discountPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Dark Gradient with Store Name Overlay */}
                    <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-4 bg-linear-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end pointer-events-none z-10">
                      <span className="text-xs sm:text-[13px] font-bold text-[#b7e472] uppercase tracking-wide drop-shadow-sm truncate mb-0.5">
                        {cleanProductName(item.categoryBadge || item.category)}
                      </span>
                      <h2
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateStore) onNavigateStore(item.storeName);
                        }}
                        className="text-base sm:text-lg font-bold text-white font-display leading-tight drop-shadow-sm truncate pointer-events-auto cursor-pointer hover:text-[#bbf381] hover:underline transition-colors"
                        title={`Lihat halaman toko ${item.storeName}`}
                      >
                        {item.storeName}
                      </h2>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-[#434844] line-clamp-2 leading-relaxed mb-3.5">
                      {item.description}
                    </p>

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
                        className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#1f2a24] hover:bg-[#2c3b33] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                        id={`btn-ambil-${item.id}`}
                      >
                        <span>Pesan Sekarang</span>
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
                Coba sesuaikan kata kunci pencarian atau ubah filter harga dan jarak di atas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAppliedMinPrice(null);
                  setAppliedMaxPrice(null);
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  setDistanceFilter('semua');
                  setSortField('jam_ambil');
                  setSortOrder('asc');
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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white border-2 border-brand-green shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
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
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
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
