import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  LocateFixed,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Package,
  Clock,
  Flame,
  X,
  ShoppingCart,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerOrderModal } from '../components/customer/CustomerOrderModal';
import { CustomerMysteryBox } from '../types';
import { getCartCount, subscribeToCart } from '../services/cartService';
import {
  getPublicProducts,
  PublicProductItem,
} from '../services/productService';
import { formatDistanceKm } from '../services/locationService';

import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';

export interface CustomerMarketplaceProps {
  onNavigateHome?: () => void;
  onNavigateSeller?: () => void;
  onNavigateAuth?: () => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onNavigateStore?: (storeName: string, storeId?: string) => void;
  onNavigateCart?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onShowToast?: (message: string) => void;
}

export interface MarketplaceBoxItem extends CustomerMysteryBox {
  categoryBadge: string;
  city: string;
  categoryType: 'pastry' | 'heavy' | 'beverage' | 'snack';
  productName?: string;
  stock?: number;
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

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Malang': { lat: -7.9526, lng: 112.6146 },
  'Surabaya': { lat: -7.2575, lng: 112.7521 },
  'Jakarta Selatan': { lat: -6.2615, lng: 106.8106 },
  'Bandung': { lat: -6.9175, lng: 107.6191 },
  'Yogyakarta': { lat: -7.7956, lng: 110.3695 },
};

export const DEFAULT_COORDS = { lat: -7.9526, lng: 112.6146 };

function mapPublicProductToItem(p: PublicProductItem, fallbackCity = 'Malang'): MarketplaceBoxItem {
  const normalPrice = p.normal_price || 0;
  const rescuePrice = p.rescue_price || 0;
  const discount =
    typeof p.discount_percentage === 'number' && p.discount_percentage > 0
      ? p.discount_percentage
      : normalPrice > 0
        ? Math.round(((normalPrice - rescuePrice) / normalPrice) * 100)
        : 0;

  let pickup = '';
  if (p.pickup_time) {
    pickup = p.pickup_time.replace(/^Ambil:\s*/i, '').trim();
  } else if (p.operational_start && p.operational_end) {
    const start = p.operational_start.slice(0, 5).replace(':', '.');
    const end = p.operational_end.slice(0, 5).replace(':', '.');
    pickup = `${start} – ${end} WIB`;
  } else {
    pickup = '08.00 – 23.59 WIB';
  }

  const distanceText = formatDistanceKm(p.distance_km);

  const realProductName = p.name || 'Surprise Box';
  let realStoreName = p.store_name || '';
  if (!realStoreName) {
    try {
      realStoreName = localStorage.getItem('rescuebyte_store_name') || 'Toko Rejak';
    } catch {
      realStoreName = 'Toko Rejak';
    }
  }

  return {
    id: p.id,
    storeId: p.store_id,
    storeName: realStoreName,
    productName: realProductName,
    category: realProductName,
    categoryBadge: realProductName,
    categoryType: 'heavy',
    city: fallbackCity,
    stock: p.stock ?? 1,
    remainingBoxesText: `Sisa ${p.stock ?? 1} Box`,
    distanceText,
    discountPercent: discount,
    originalPrice: normalPrice,
    rescuePrice: rescuePrice,
    pickupTime: pickup,
    description:
      p.description ||
      'Berisi 1 porsi makanan berat surplus hari ini dengan rasa dan kualitas terjamin.',
    tags: [realStoreName, realProductName, 'Halal MUI', 'Surplus Harian'],
    imageSrc: p.main_image_url || cardMonsieurSpoon,
    rating: 4.9,
    reviewCount: 42,
  };
}

export const MARKETPLACE_CACHE_KEY = 'rescuebyte_cached_marketplace_products';

function getInitialMarketplaceProducts(): MarketplaceBoxItem[] {
  // Use the last successful public API response for an instant first render.
  try {
    const cached = localStorage.getItem(MARKETPLACE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

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
  // Cart Badge Synchronization
  const [cartCount, setCartCount] = useState<number>(getCartCount);
  useEffect(() => {
    const unsubscribe = subscribeToCart((count) => {
      setCartCount(count);
    });
    return unsubscribe;
  }, []);

  // Coordinates State (reads cached coordinates if present)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(() => {
    try {
      const saved = localStorage.getItem('rescuebyte_user_coords');
      if (saved) return JSON.parse(saved);
    } catch { }
    return DEFAULT_COORDS;
  });

  // Dynamic Marketplace Products with Stale-While-Revalidate (instant 0ms render from cache)
  const [apiProducts, setApiProducts] = useState<MarketplaceBoxItem[]>(getInitialMarketplaceProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(() => {
    const initial = getInitialMarketplaceProducts();
    return initial.length === 0;
  });

  const hasProductsRef = useRef(apiProducts.length > 0);
  useEffect(() => {
    hasProductsRef.current = apiProducts.length > 0;
  }, [apiProducts.length]);

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

  // Fetch products from backend GET /api/v1/products with coordinates
  const fetchMarketplaceProducts = useCallback(
    async (coords: { lat: number; lng: number }, query?: string) => {
      if (!hasProductsRef.current) {
        setIsLoadingProducts(true);
      }
      try {
        const publicItems = await getPublicProducts({
          latitude: coords.lat,
          longitude: coords.lng,
          search: query?.trim() ? query.trim() : undefined,
        });

        const mappedApi = publicItems.map((p) => mapPublicProductToItem(p, 'Malang'));

        setApiProducts(mappedApi);
        try {
          localStorage.setItem(MARKETPLACE_CACHE_KEY, JSON.stringify(mappedApi));
        } catch {}
      } catch (err) {
        console.warn('Gagal mengambil produk marketplace:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    },
    []
  );

  // Initial instant products fetch on mount
  useEffect(() => {
    fetchMarketplaceProducts(userCoords);
  }, [fetchMarketplaceProducts, userCoords]);

  // Synchronize immediately whenever product stock or status updates
  useEffect(() => {
    const handleProductUpdated = () => {
      fetchMarketplaceProducts(userCoords);
    };
    window.addEventListener('rescuebyte_product_updated', handleProductUpdated);
    return () => {
      window.removeEventListener('rescuebyte_product_updated', handleProductUpdated);
    };
  }, [fetchMarketplaceProducts, userCoords]);

  // Request browser live location (quick non-blocking 3s timeout)
  const handleRequestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (onShowToast) onShowToast('Browser tidak mendukung geolokasi');
      setSelectedCity('Malang');
      return;
    }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoadingLoc(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        try {
          localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords));
        } catch { }
        setSelectedCity('Lokasi Saat Ini');
        setOpenDropdown(null);
        if (onShowToast) onShowToast('📍 Lokasi terdeteksi, menampilkan Mystery Box terdekat');
      },
      (err) => {
        setIsLoadingLoc(false);
        console.warn('Geolocation permission:', err.message);
        if (onShowToast) onShowToast('Izin lokasi belum diberikan, default: Malang');
        setSelectedCity('Malang');
        const fallback = CITY_COORDINATES['Malang'];
        setUserCoords(fallback);
      },
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, [onShowToast]);

  // Modal State
  const [selectedBox, setSelectedBox] = useState<CustomerMysteryBox | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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

  // Marketplace products (sourced from backend API & merchant store)
  const allProducts = useMemo(() => {
    return apiProducts;
  }, [apiProducts]);

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((item) => {
        // Search Query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName =
            item.storeName.toLowerCase().includes(query) ||
            (item.productName && item.productName.toLowerCase().includes(query));
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
      })
      .sort((a, b) => {
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
  }, [
    allProducts,
    searchQuery,
    selectedCity,
    appliedMinPrice,
    appliedMaxPrice,
    distanceFilter,
    sortField,
    sortOrder,
  ]);

  const handleOpenOrder = (box: CustomerMysteryBox) => {
    if (onNavigateDetail) {
      onNavigateDetail(box);
    } else {
      setSelectedBox(box);
      setIsOrderModalOpen(true);
    }
  };

  const handleConfirmOrder = (_box: CustomerMysteryBox, _quantity: number, _notes?: string) => {
    setIsOrderModalOpen(false);
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
    <div
      className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between"
      id="marketplace-page-root"
    >
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
                {/* 4 Diagonal Footprints (Jejak Kaki Hitam Sesuai Desain Referensi) */}
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
                  className="w-full bg-white border border-black/25 rounded-2xl pl-10 pr-9 py-3 text-xs sm:text-sm font-medium text-[#1b1c1c] focus:outline-none focus:ring-1 focus:ring-black focus:border-black shadow-2xs transition-all"
                  aria-label="Cari makanan, toko atau kategori"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <Search className="w-4 h-4" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs cursor-pointer p-1"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* City Dropdown Selector with Live Location */}
              <div className="relative filter-dropdown-container min-w-38.75 sm:min-w-43.75">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'kota' ? null : 'kota')}
                  className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-[#1b1c1c] flex items-center justify-between gap-2 shadow-2xs cursor-pointer transition-all ${
                    openDropdown === 'kota'
                      ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]'
                      : 'border-black/25 hover:border-black/45'
                  }`}
                  aria-expanded={openDropdown === 'kota'}
                  aria-haspopup="listbox"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span className="truncate">
                      {isLoadingLoc ? 'Mendeteksi...' : selectedCity}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 text-black transition-transform duration-200 ${
                      openDropdown === 'kota' ? 'rotate-180' : ''
                    }`}
                  />
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
                        <LocateFixed className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{isLoadingLoc ? 'Mendeteksi...' : 'Gunakan Live Loc'}</span>
                      </div>
                      {selectedCity === 'Lokasi Saat Ini' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
                          Aktif
                        </span>
                      )}
                    </button>

                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setOpenDropdown(null);
                          const coords = CITY_COORDINATES[city] || DEFAULT_COORDS;
                          setUserCoords(coords);
                          try {
                            localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords));
                          } catch {}
                          fetchMarketplaceProducts(coords);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          selectedCity === city
                            ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                            : 'text-[#1b1c1c] hover:bg-gray-50'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <Check className="w-3.5 h-3.5 text-emerald-700" />}
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
                className={`w-full bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all ${openDropdown === 'harga'
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
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-black transition-transform duration-200 ${
                    openDropdown === 'harga' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'harga' && (
                <div className="absolute top-full left-0 w-72 sm:w-80 mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-[#1b1c1c]">Rentang Harga (Rp)</span>
                    {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedMinPrice(null);
                          setAppliedMaxPrice(null);
                          setMinPriceInput('');
                          setMaxPriceInput('');
                          setOpenDropdown(null);
                        }}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">MINIMUM</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(formatPriceInput(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">MAKSIMUM</label>
                      <input
                        type="text"
                        placeholder="100.000"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(formatPriceInput(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {[
                      { label: '< Rp 25rb', min: null, max: 25000 },
                      { label: 'Rp 25rb - 50rb', min: 25000, max: 50000 },
                      { label: '> Rp 50rb', min: 50000, max: null },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setAppliedMinPrice(preset.min);
                          setAppliedMaxPrice(preset.max);
                          setMinPriceInput(preset.min ? formatRupiah(preset.min) : '');
                          setMaxPriceInput(preset.max ? formatRupiah(preset.max) : '');
                          setOpenDropdown(null);
                        }}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1b1c1c] transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAppliedMinPrice(parsePriceInput(minPriceInput));
                      setAppliedMaxPrice(parsePriceInput(maxPriceInput));
                      setOpenDropdown(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0b1510] text-[#bbf381] text-xs font-bold transition hover:bg-[#1a2c22] cursor-pointer"
                  >
                    Terapkan Filter
                  </button>
                </div>
              )}
            </div>

            {/* 2. Filter Jarak */}
            <div className="relative filter-dropdown-container">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'jarak' ? null : 'jarak')}
                className={`w-full bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all ${openDropdown === 'jarak'
                    ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#1b1c1c]'
                    : distanceFilter !== 'semua'
                      ? 'border-brand-green bg-[#f4f8f4] text-[#1b1c1c]'
                      : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
                  }`}
                aria-expanded={openDropdown === 'jarak'}
              >
                <span className="truncate">
                  {distanceFilter === 'semua'
                    ? 'Jarak'
                    : DISTANCE_OPTIONS.find((o) => o.value === distanceFilter)?.label}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-black transition-transform duration-200 ${
                    openDropdown === 'jarak' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'jarak' && (
                <div className="absolute top-full left-0 right-0 w-full mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden min-w-50 sm:min-w-full animate-in fade-in zoom-in-95 duration-150">
                  {DISTANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDistanceFilter(opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-colors flex items-center justify-between cursor-pointer ${distanceFilter === opt.value
                          ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                          : 'text-[#1b1c1c] hover:bg-gray-50 font-medium'
                        }`}
                    >
                      <span>{opt.label}</span>
                      {distanceFilter === opt.value && <Check className="w-3.5 h-3.5 text-emerald-700" />}
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
                className={`w-full bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all ${openDropdown === 'urutkan'
                    ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#1b1c1c]'
                    : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
                  }`}
                aria-expanded={openDropdown === 'urutkan'}
              >
                <div className="flex items-center gap-1 truncate">
                  <span className="truncate">
                    {SORT_OPTIONS.find((s) => s.id === sortField)?.label || 'Urutkan'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-black transition-transform duration-200 ${
                    openDropdown === 'urutkan' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'urutkan' && (
                <div className="absolute top-full right-0 w-64 sm:w-72 mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wide border-b border-gray-100">
                    Urutkan Berdasarkan
                  </div>
                  <div className="py-1">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortField === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`rounded-xl px-3 py-2 flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-[#f4f8f4]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortField(opt.id);
                                setSortOrder(opt.defaultOrder);
                              }
                              setOpenDropdown(null);
                            }}
                            className="flex-1 text-left cursor-pointer"
                          >
                            <p
                              className={`text-xs sm:text-sm font-semibold ${
                                isSelected ? 'text-[#1b1c1c] font-bold' : 'text-[#1b1c1c]'
                              }`}
                            >
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {isSelected
                                ? sortOrder === 'asc'
                                  ? opt.ascLabel
                                  : opt.descLabel
                                : opt.defaultOrder === 'asc'
                                ? opt.ascLabel
                                : opt.descLabel}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSortField(opt.id);
                              setSortOrder(
                                isSelected ? (sortOrder === 'asc' ? 'desc' : 'asc') : opt.defaultOrder
                              );
                              setOpenDropdown(null);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition cursor-pointer text-[#1b1c1c]"
                            title="Balik urutan (Naik / Turun)"
                          >
                            {isSelected ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Product Cards Grid (3 Columns) */}
          {isLoadingProducts ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
              <Package className="w-10 h-10 text-emerald-700 animate-pulse mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Memuat Mystery Box...</p>
              <p className="text-xs text-slate-400 mt-1">Mengambil paket surplus segar dari database</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="marketplace-grid">
              {filteredProducts.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl border border-black/10 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  id={`marketplace-card-${item.id}`}
                >
                  {/* Card Visual Header (Photo or Clean Structured Placeholder) */}
                  <div
                    onClick={() => handleOpenOrder(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenOrder(item);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Lihat detail produk ${item.productName || item.storeName}`}
                    title={`Lihat detail ${item.productName || item.categoryBadge || item.storeName}`}
                    className="relative w-full h-52 overflow-hidden bg-[#24201c] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2a24] focus-visible:ring-offset-2"
                  >
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={`Mystery Box ${item.productName || item.storeName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = cardMonsieurSpoon;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#2a241e] via-[#352c24] to-[#1c1815] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-200/90 mb-1 border border-white/10 shadow-xs">
                          <Package className="w-7 h-7 text-amber-200/90" />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">
                          Mystery Box
                        </span>
                      </div>
                    )}

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const stockMatch = item.remainingBoxesText.match(/\d+/);
                          const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
                          const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
                          const isAboveTwo = stockCount > 2;
                          const cleanStockText = item.remainingBoxesText
                            .replace(/^[!\s]+/, '')
                            .replace(/[!\s]+$/, '');

                          if (isOutOfStock) {
                            return (
                              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center gap-1 shadow-xs border border-gray-200">
                                <Clock className="w-3 h-3 shrink-0 text-gray-500" aria-hidden="true" />
                                <span>Sisa 0 Box</span>
                              </span>
                            );
                          }

                          return isAboveTwo ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#FDECEB] text-[#D94A38] text-[11px] font-bold flex items-center gap-1 shadow-xs border border-[#FCA5A5]/30">
                              <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span>{cleanStockText}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#b91c1c] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                              <Flame className="w-3 h-3 shrink-0" aria-hidden="true" />
                              <span>{cleanStockText}</span>
                            </span>
                          );
                        })()}

                        {/* Distance Badge */}
                        <span className="px-2.5 py-1 rounded-full bg-white text-[#1b1c1c] text-[11px] font-bold shadow-xs">
                          {item.distanceText}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      <span className="px-2.5 py-1 rounded-full bg-[#3c6a00] text-white text-[11px] font-extrabold shadow-xs">
                        -{item.discountPercent}%
                      </span>
                    </div>

                    {/* Gradient Overlay for bottom text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/90 via-black/55 to-transparent pointer-events-none" />

                    {/* Title overlay at the bottom */}
                    <div className="absolute bottom-3 inset-x-3.5 z-10 pointer-events-none">
                      <span className="text-[11px] font-bold text-[#bbf381] tracking-wide block uppercase drop-shadow-sm truncate">
                        {cleanProductName(item.productName || item.categoryBadge || item.category)}
                      </span>
                      <h2
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateStore) onNavigateStore(item.storeName, item.storeId);
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
                    <p className="text-xs text-gray-600 line-clamp-2 min-h-8 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Pickup Time Container */}
                    <div className="w-full bg-[#f4f2ee] rounded-xl px-3.5 py-2.5 flex items-center gap-2 mb-5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="text-xs font-medium text-gray-700 truncate">
                        Ambil: <strong className="font-bold text-[#1b1c1c]">{item.pickupTime}</strong>
                      </span>
                    </div>

                    {/* Price and CTA Button */}
                    <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-400 line-through block leading-none">
                          Rp {formatRupiah(item.originalPrice)}
                        </span>
                        <div className="text-lg sm:text-xl font-black text-[#1b1c1c] font-display mt-0.5">
                          Rp {formatRupiah(item.rescuePrice)}
                        </div>
                      </div>

                      {(() => {
                        const stockMatch = item.remainingBoxesText.match(/\d+/);
                        const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
                        const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');

                        if (isOutOfStock) {
                          return (
                            <button
                              type="button"
                              disabled
                              className="bg-gray-200 text-gray-400 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight cursor-not-allowed shrink-0 select-none"
                              title="Stok habis atau produk sedang dinonaktifkan"
                            >
                              Habis
                            </button>
                          );
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => handleOpenOrder(item)}
                            className="bg-[#1b1c1c] hover:bg-[#2e2f2f] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer shrink-0"
                          >
                            Pesan Sekarang
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-3xl border border-black/10 shadow-xs px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#1b1c1c] mb-1">
                Tidak ada Mystery Box yang cocok
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
                Coba sesuaikan kata kunci pencarian, ubah filter jarak, atau pilih kota lain.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('Lokasi Saat Ini');
                  setAppliedMinPrice(null);
                  setAppliedMaxPrice(null);
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  setDistanceFilter('semua');
                  fetchMarketplaceProducts(userCoords);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-green text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#325800] transition cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Cart Button (matching CustomerProductDetail design) */}
      <button
        type="button"
        onClick={() => {
          if (onNavigateCart) {
            onNavigateCart();
          } else {
            window.location.hash = '#keranjang';
          }
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white border-2 border-brand-green shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
        title="Keranjang Pesanan"
        aria-label="Buka Keranjang Pesanan"
        id="floating-cart-button"
      >
        <ShoppingCart className="w-6 h-6 text-brand-green" strokeWidth={2.2} />
        <span
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs"
          id="cart-badge-count"
        >
          {cartCount}
        </span>
      </button>

      {/* 4. Customer Footer */}
      <CustomerFooter variant="full" onNavigateSeller={onNavigateSeller} />

      {/* Order Modal Component */}
      {selectedBox && (
        <CustomerOrderModal
          isOpen={isOrderModalOpen}
          item={selectedBox}
          onClose={() => setIsOrderModalOpen(false)}
          onConfirmOrder={(item, qty, notes) => handleConfirmOrder(item, qty, notes)}
        />
      )}
    </div>
  );
}

export default CustomerMarketplace;
