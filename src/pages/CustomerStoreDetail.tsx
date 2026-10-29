import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Clock,
  ShoppingBag,
  Star,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Check,
  Tag,
  AtSign,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerMysteryBox } from '../types';
import { getCurrentUser } from '../services/authService';
import { getAllStores } from '../services/storeService';
import { getPublicProducts, getStoredProducts } from '../services/productService';

import heroBannerImg from '../assets/customer/hero-full-banner.jpg';
import avatarReza from '../assets/customer/avatar-reza.jpg';
import avatarFahmi from '../assets/customer/avatar-fahmi.jpg';
import cardPastry from '../assets/customer/card-monsieur-spoon.jpg';

export interface CustomerStoreDetailProps {
  storeName?: string;
  storeId?: string;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onNavigateProductDetail?: (product: CustomerMysteryBox) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface StoreProductItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  rescuePrice: number;
  discountPercent: number;
  imageSrc: string;
  pickupTime: string;
  stock?: number;
  remainingBoxes?: number;
  description?: string;
}

interface StoreReviewItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  comment: string;
  date: string;
}

interface StoreDetailInfo {
  id?: string;
  name: string;
  category: string;
  status: string;
  rating: number;
  reviewCount: number;
  distance: string;
  area: string;
  address: string;
  operationalHours: string;
  pickupHours: string;
  email: string;
  phone: string;
  socialMedia: string;
  description: string;
  avatarUrl?: string;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getInitials(name: string): string {
  if (!name) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getShortName(name: string): string {
  if (!name) return '';
  const firstWord = name.trim().split(/\s+/)[0];
  return firstWord.length > 9 ? firstWord.slice(0, 8) + '…' : firstWord;
}

// Toko Rejak is the primary real store connected to backend & Supabase
const TOKO_REJAK_INFO: StoreDetailInfo = {
  id: '01a187c3-82a3-7f06-afe1-e276c3c4a142',
  name: 'Toko Rejak',
  category: 'Aneka Makanan Berat & Kuliner',
  status: 'Buka',
  rating: 4.9,
  reviewCount: 48,
  distance: '1.2 km',
  area: 'Lowokwaru, Kota Malang',
  address: 'Jalan Selorejo, Lowokwaru, Kota Malang, Jawa Timur',
  operationalHours: 'Senin - Minggu\n08:00 - 23:59 WIB',
  pickupHours: '08:00 - 23:59 WIB',
  email: 'animeadventrue@gmail.com',
  phone: '0812345678',
  socialMedia: '@tokorejak',
  description: 'Toko rejagone bapak beni',
  avatarUrl:
    'https://abiaxlkxogtnlemxeaev.supabase.co/storage/v1/object/public/rescuebyte-bucket/stores/01a187eb-f43d-764d-ac5b-a363a4ddf871.png',
};

const TOKO_REJAK_PRODUCTS: StoreProductItem[] = [
  {
    id: '01a18829-c1da-71b4-afb9-2bac249a29c0',
    name: 'Makanan rejak',
    category: 'Makanan Berat',
    originalPrice: 45000,
    rescuePrice: 20000,
    discountPercent: 56,
    imageSrc:
      'https://abiaxlkxogtnlemxeaev.supabase.co/storage/v1/object/public/rescuebyte-bucket/products/01a18829-ba1b-766b-8ac3-fe030c23a306.png',
    pickupTime: '08:00 - 23:59 WIB',
    stock: 5,
    description:
      'Berisi 1 porsi makanan berat surplus hari ini dengan rasa dan kualitas terjamin. Disiapkan langsung oleh chef dan aman dikonsumsi hingga 4 jam setelah pengambilan.',
  },
];

function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

function parsePriceInput(val: string): number | null {
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : null;
}

const SORT_OPTIONS: { id: 'terbaru' | 'tertinggi' | 'terendah'; label: string }[] = [
  { id: 'terbaru', label: 'Terbaru' },
  { id: 'tertinggi', label: 'Rating Tertinggi' },
  { id: 'terendah', label: 'Rating Terendah' },
];

export function CustomerStoreDetail({
  storeName,
  storeId,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateProfile,
  onNavigateOrders,
  onNavigateProductDetail,
  onNavigateSeller,
  onShowToast,
}: CustomerStoreDetailProps) {
  const [currentUser] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<'tentang' | 'produk' | 'ulasan'>('tentang');
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'tertinggi' | 'terendah'>('terbaru');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Price filter states for "Semua Produk" tab
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.id === sortOrder)?.label || 'Terbaru';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(e.target as Node)
      ) {
        setIsPriceDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSortOpen(false);
        setIsPriceDropdownOpen(false);
      }
    };
    if (isSortOpen || isPriceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen, isPriceDropdownOpen]);

  // Resolve store name from prop, localStorage, or fallback to Toko Rejak
  const effectiveStoreName = useMemo(() => {
    if (storeName && storeName.trim()) return storeName.trim();
    try {
      const savedStore = localStorage.getItem('rescuebyte_selected_store');
      if (savedStore && savedStore.trim()) return savedStore.trim();
      const sellerStore = localStorage.getItem('rescuebyte_store_name');
      if (sellerStore && sellerStore.trim()) return sellerStore.trim();
    } catch { }
    return 'Toko Rejak';
  }, [storeName]);

  // Initial store data based on Toko Rejak
  const [storeData, setStoreData] = useState<StoreDetailInfo>(() => {
    if (effectiveStoreName.toLowerCase().includes('rejak')) {
      return TOKO_REJAK_INFO;
    }
    return {
      ...TOKO_REJAK_INFO,
      name: effectiveStoreName,
      email: `${effectiveStoreName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      socialMedia: `@${effectiveStoreName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    };
  });

  // Initial store products
  const [storeProducts, setStoreProducts] = useState<StoreProductItem[]>(() => TOKO_REJAK_PRODUCTS);

  // Sync store profile & products dynamically from backend API & local storage
  useEffect(() => {
    let isCancelled = false;

    async function loadStoreAndProducts() {
      try {
        const currentTarget = effectiveStoreName.trim().toLowerCase();

        // 1. Fetch live stores from backend GET /api/v1/stores
        const stores = await getAllStores();
        if (isCancelled) return;

        // Find store in backend list by storeId first, then name
        const matchedBackendStore =
          (storeId ? stores.find((s) => s.id === storeId) : undefined) ||
          stores.find((s) => {
            const sName = (s.name || '').toLowerCase();
            return sName === currentTarget || sName.includes(currentTarget) || currentTarget.includes(sName);
          }) ||
          (currentTarget.includes('rejak') ? stores.find((s) => (s.name || '').toLowerCase().includes('rejak')) : undefined);

        if (matchedBackendStore) {
          const fullAddress = [
            matchedBackendStore.address,
            matchedBackendStore.district,
            matchedBackendStore.city,
          ]
            .filter(Boolean)
            .join(', ');

          const opStart = matchedBackendStore.operational_start
            ? matchedBackendStore.operational_start.slice(0, 5)
            : '08:00';
          const opEnd = matchedBackendStore.operational_end
            ? matchedBackendStore.operational_end.slice(0, 5)
            : '23:59';

          setStoreData({
            id: matchedBackendStore.id,
            name: matchedBackendStore.name,
            category: 'Aneka Makanan Berat & Kuliner',
            status: matchedBackendStore.status === 'INACTIVE' ? 'Tutup' : 'Buka',
            rating: 4.9,
            reviewCount: 48,
            distance: '1.2 km',
            area: matchedBackendStore.district
              ? `${matchedBackendStore.district}, ${matchedBackendStore.city || 'Malang'}`
              : matchedBackendStore.city || 'Kota Malang',
            address: fullAddress || 'Jalan Selorejo, Lowokwaru, Kota Malang, Jawa Timur',
            operationalHours: `Senin - Minggu\n${opStart} - ${opEnd} WIB`,
            pickupHours: `${opStart} - ${opEnd} WIB`,
            email: matchedBackendStore.email || 'animeadventrue@gmail.com',
            phone: matchedBackendStore.whatsapp_number || '0812345678',
            socialMedia: `@${matchedBackendStore.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            description: matchedBackendStore.description || '',
            avatarUrl: matchedBackendStore.profile_picture_url || TOKO_REJAK_INFO.avatarUrl,
          });
        }

        const targetStoreId = matchedBackendStore?.id || storeId;

        // 2. Fetch live products from backend GET /api/v1/products?store_id=... & localStorage
        const [publicProducts, localStored] = await Promise.all([
          getPublicProducts(targetStoreId ? { store_id: targetStoreId } : undefined).catch(() => []),
          Promise.resolve(getStoredProducts()),
        ]);
        if (isCancelled) return;

        const liveItems: StoreProductItem[] = [];

        // Match from backend public products strictly by store
        publicProducts.forEach((p) => {
          const isMatch = targetStoreId
            ? p.store_id === targetStoreId
            : (p.store_name || '').toLowerCase() === currentTarget;

          if (isMatch) {
            const discount =
              p.discount_percentage ||
              (p.normal_price > 0
                ? Math.round(((p.normal_price - p.rescue_price) / p.normal_price) * 100)
                : 56);

            liveItems.push({
              id: p.id,
              name: p.name,
              category: 'Surplus Makanan',
              originalPrice: p.normal_price,
              rescuePrice: p.rescue_price,
              discountPercent: discount,
              imageSrc: p.main_image_url || cardPastry,
              pickupTime: p.pickup_time || '08:00 - 23:59 WIB',
              stock: p.stock,
              description: p.description,
            });
          }
        });

        // Also check if current seller's local dagangan matches this store
        const sellerStoreName = (localStorage.getItem('rescuebyte_store_name') || '').toLowerCase();
        if (sellerStoreName && (sellerStoreName === currentTarget || currentTarget.includes(sellerStoreName))) {
          localStored
            .filter((lp) => lp.isActive && lp.status !== 'nonaktif')
            .forEach((lp) => {
              if (!liveItems.some((item) => item.id === lp.id || item.name === lp.name)) {
                const discount =
                  lp.normalPrice > 0
                    ? Math.round(((lp.normalPrice - lp.rescuePrice) / lp.normalPrice) * 100)
                    : 0;

                liveItems.push({
                  id: lp.id,
                  name: lp.name,
                  category: 'Surplus Makanan',
                  originalPrice: lp.normalPrice,
                  rescuePrice: lp.rescuePrice,
                  discountPercent: discount,
                  imageSrc: lp.imageUrl || cardPastry,
                  pickupTime: '08:00 - 23:59 WIB',
                  stock: lp.stock,
                  description: lp.description,
                });
              }
            });
        }

        // If live items found, update products state; otherwise keep default Toko Rejak products
        if (liveItems.length > 0) {
          setStoreProducts(liveItems);
        } else if (currentTarget.includes('rejak')) {
          setStoreProducts(TOKO_REJAK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Failed to load store and products:', err);
      }
    }

    loadStoreAndProducts();

    return () => {
      isCancelled = true;
    };
  }, [effectiveStoreName, storeId]);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((item) => {
      if (appliedMinPrice !== null && item.rescuePrice < appliedMinPrice) return false;
      if (appliedMaxPrice !== null && item.rescuePrice > appliedMaxPrice) return false;
      return true;
    });
  }, [storeProducts, appliedMinPrice, appliedMaxPrice]);

  // Dynamic reviews mentioning this store and area
  const storeReviews: StoreReviewItem[] = useMemo(() => {
    return [
      {
        id: 'rev-1',
        name: 'Reza Akbar',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarReza,
        comment: `Kualitas makanannya masih sangat segar dan porsinya mengenyangkan. Sangat puas dengan pesanan dari ${storeData.name}!`,
        date: '28 Okt 2026',
      },
      {
        id: 'rev-2',
        name: 'Reza Akbar',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarReza,
        comment: 'Pelayanannya cepat dan ramah saat pengambilan langsung di kasir. Makanan masih hangat dan higienis.',
        date: '27 Okt 2026',
      },
      {
        id: 'rev-3',
        name: 'Reza Akbar',
        role: 'Pelanggan',
        rating: 4,
        avatar: avatarReza,
        comment:
          'Inisiatif luar biasa untuk menyelamatkan surplus makanan harian. Rasanya lezat dan harganya hemat banget!',
        date: '25 Okt 2026',
      },
      {
        id: 'rev-4',
        name: 'Fahmi Fayyid',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarFahmi,
        comment: `Porsi makanan mantap dan kemasannya sangat rapi. Pasti akan pesan lagi dari ${storeData.name}!`,
        date: '24 Okt 2026',
      },
      {
        id: 'rev-5',
        name: 'Fahmi Fayyid',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarFahmi,
        comment: `Lokasi toko mudah ditemukan di daerah ${storeData.area}. Sangat terbantu dengan paket makanan hemat ini.`,
        date: '23 Okt 2026',
      },
      {
        id: 'rev-6',
        name: 'Fahmi Fayyid',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarFahmi,
        comment:
          'Sangat hemat untuk santapan harian dan ikut berkontribusi nyata mengurangi food waste di Kota Malang.',
        date: '22 Okt 2026',
      },
    ];
  }, [storeData.name, storeData.area]);

  const sortedReviews = useMemo(() => {
    return [...storeReviews].sort((a, b) => {
      if (sortOrder === 'tertinggi') return b.rating - a.rating;
      if (sortOrder === 'terendah') return a.rating - b.rating;
      return 0;
    });
  }, [storeReviews, sortOrder]);

  const handleSelectProduct = (prod: StoreProductItem) => {
    if (onNavigateProductDetail) {
      const boxItem: CustomerMysteryBox = {
        id: prod.id,
        storeName: storeData.name,
        category: prod.name,
        categoryBadge: prod.name,
        distanceText: storeData.distance,
        remainingBoxesText: `Sisa ${prod.stock ?? 5} Box`,
        discountPercent: prod.discountPercent,
        originalPrice: prod.originalPrice,
        rescuePrice: prod.rescuePrice,
        pickupTime: prod.pickupTime || storeData.pickupHours,
        description:
          prod.description ||
          `${prod.name} dari ${storeData.name}. Berisi sajian pilihan harian berkualitas tinggi.`,
        tags: [storeData.name, storeData.category, '✓ Halal MUI', 'Surplus Harian'],
        rating: storeData.rating,
        reviewCount: storeData.reviewCount,
        imageSrc: prod.imageSrc,
      };
      onNavigateProductDetail(boxItem);
    } else {
      onShowToast?.(`Melihat ${prod.name}`, 'info');
    }
  };

  const handleOpenGoogleMaps = () => {
    const query = `${storeData.name} ${storeData.address}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const avatarSafeId = useMemo(
    () => storeData.name.replace(/[^a-zA-Z0-9]/g, ''),
    [storeData.name]
  );

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col justify-between selection:bg-brand-green/20 selection:text-[#0b1510]">
      <div>
        <CustomerHeader
          activeTab="marketplace"
          currentUser={currentUser}
          onNavigateHome={onNavigateHome}
          onSelectTab={(tab) => {
            if (tab === 'beranda' && onNavigateHome) onNavigateHome();
            else if (tab === 'marketplace' && onNavigateMarketplace) onNavigateMarketplace();
          }}
          onNavigateSeller={onNavigateSeller}
          onNavigateProfile={onNavigateProfile}
          onNavigateOrders={onNavigateOrders}
          onShowToast={onShowToast}
        />

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex-1">
          {/* Hero Banner with Store Card Container */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs mb-8">
            {/* Banner Background */}
            <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
              <img
                src={heroBannerImg}
                alt={storeData.name}
                className="w-full h-full object-cover filter brightness-[0.6] scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Overlapping Floating Store Card */}
            <div className="p-5 sm:p-7 md:p-8 bg-white relative z-10 -mt-16 sm:-mt-20 mx-3 sm:mx-6 md:mx-8 rounded-3xl border border-slate-200/90 shadow-md">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 flex-1 min-w-0">
                  {/* Store Logo Avatar (Real image if available, else initials) */}
                  {storeData.avatarUrl ? (
                    <img
                      src={storeData.avatarUrl}
                      alt={storeData.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-sm shrink-0 bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = document.getElementById(`avatar-fallback-${avatarSafeId}`);
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    id={`avatar-fallback-${avatarSafeId}`}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0b1510] text-[#bbf381] border-2 border-white flex-col items-center justify-center font-bold shrink-0 shadow-sm ${storeData.avatarUrl ? 'hidden' : 'flex'
                      }`}
                  >
                    <span className="text-xl sm:text-2xl tracking-tight font-extrabold">
                      {getInitials(storeData.name)}
                    </span>
                    <span className="text-[9px] text-white/80 font-normal truncate max-w-[55px] text-center px-1">
                      {getShortName(storeData.name)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight truncate">
                        {storeData.name}
                      </h1>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dcfce7] text-primary">
                        {storeData.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500 mb-2">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {storeData.rating}
                        <span className="text-slate-500 font-normal">({storeData.reviewCount} ulasan)</span>
                      </span>
                      <span>•</span>
                      <span>{storeData.distance}</span>
                      <span>•</span>
                      <span>{storeData.area}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Store Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 items-center">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Alamat Toko</p>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
                      {storeData.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Jam Operasional</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 whitespace-pre-line">
                      {storeData.operationalHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Waktu Pickup</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {storeData.pickupHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={handleOpenGoogleMaps}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lihat Lokasi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <nav aria-label="Tab Informasi Toko" className="flex items-center gap-6 border-b border-slate-200/90 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('tentang')}
              className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px ${activeTab === 'tentang'
                ? 'border-[#1b1c1c] text-[#1b1c1c]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
            >
              Tentang Toko
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('produk')}
              className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px ${activeTab === 'produk'
                ? 'border-[#1b1c1c] text-[#1b1c1c]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
            >
              Semua Produk ({storeProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ulasan')}
              className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px ${activeTab === 'ulasan'
                ? 'border-[#1b1c1c] text-[#1b1c1c]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
            >
              Ulasan ({storeData.reviewCount})
            </button>
          </nav>

          {/* TAB 1: Tentang Toko (2x2 Grid) */}
          {activeTab === 'tentang' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* Card 1: Tentang Toko Description */}
                <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-3">
                      Tentang {storeData.name}
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      <p>{storeData.description || 'Belum ada deskripsi untuk toko ini.'}</p>
                    </div>
                  </div>
                </section>

                {/* Card 2: Produk Tersedia */}
                <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c]">Produk Tersedia</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('produk')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Semua</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {storeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {storeProducts.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition bg-slate-50/50"
                        >
                          <div>
                            <div className="relative rounded-xl overflow-hidden aspect-video sm:aspect-square mb-2 bg-slate-200">
                              <img
                                src={prod.imageSrc}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                              {typeof prod.stock === 'number' && (
                                <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                  Sisa {prod.stock}
                                </div>
                              )}
                            </div>
                            <h3 className="text-xs font-bold text-[#1b1c1c] line-clamp-2 min-h-8">
                              {prod.name}
                            </h3>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-xs font-extrabold text-[#1b1c1c]">
                                Rp {formatRupiah(prod.rescuePrice)}
                              </span>
                              <span className="text-[10px] text-white font-bold bg-[#22c55e] px-1 rounded-sm">
                                -{prod.discountPercent}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 line-through block">
                              Rp {formatRupiah(prod.originalPrice)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectProduct(prod)}
                            className="mt-3 w-full py-1.5 rounded-xl bg-[#eef8ee] hover:bg-[#dcfce7] text-[#2d6a2e] text-xs font-bold transition cursor-pointer text-center"
                          >
                            Lihat Produk
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      Belum ada produk aktif yang tersedia saat ini di toko ini.
                    </div>
                  )}
                </section>

                {/* Card 3: Informasi Toko Details */}
                <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                  <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-4">Informasi Toko</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <Tag className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kategori</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{storeData.category}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <Mail className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{storeData.email}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <Phone className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kontak</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{storeData.phone}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <AtSign className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Media Sosial</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{storeData.socialMedia}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 4: Ringkasan Toko */}
                <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c]">Ringkasan Toko</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ulasan')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Semua Ulasan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-[#1b1c1c] block">
                          {storeData.rating}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">Rating Toko</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">({storeData.reviewCount} ulasan)</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-[#1b1c1c] block">
                          {storeData.reviewCount}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">Total Ulasan</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Pelanggan terverifikasi</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-[#1b1c1c] block">
                          {storeData.distance}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">Jarak Lokasi</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Dari posisi Anda</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

                    {activeTab === 'produk' && (
            <div className="space-y-6 mb-12">
              {/* Filter Row: Hanya Filter Harga */}
              <div className="flex items-center gap-3">
                <div ref={priceDropdownRef} className="relative w-full sm:w-72">
                  <button
                    type="button"
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                    className={`w-full bg-white border rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 shadow-2xs cursor-pointer transition-all ${
                      isPriceDropdownOpen
                        ? 'border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#1b1c1c]'
                        : appliedMinPrice !== null || appliedMaxPrice !== null
                          ? 'border-brand-green bg-[#f4f8f4] text-[#1b1c1c]'
                          : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
                    }`}
                    aria-expanded={isPriceDropdownOpen}
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
                      className={`w-4 h-4 shrink-0 text-black transition-transform duration-200 ${
                        isPriceDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isPriceDropdownOpen && (
                    <div className="absolute top-full left-0 w-full min-w-[280px] mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-150">
                      {/* 1. Semua Harga */}
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedMinPrice(null);
                          setAppliedMaxPrice(null);
                          setMinPriceInput('');
                          setMaxPriceInput('');
                          setIsPriceDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-between cursor-pointer mb-1 ${
                          appliedMinPrice === null && appliedMaxPrice === null
                            ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                            : 'text-[#1b1c1c] hover:bg-gray-50 font-medium'
                        }`}
                      >
                        <span>Semua Harga</span>
                        {appliedMinPrice === null && appliedMaxPrice === null && (
                          <Check className="w-4 h-4 text-[#1b1c1c]" />
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

                        {/* Tombol Terapkan */}
                        <button
                          type="button"
                          onClick={() => {
                            const min = parsePriceInput(minPriceInput);
                            const max = parsePriceInput(maxPriceInput);
                            setAppliedMinPrice(min);
                            setAppliedMaxPrice(max);
                            setIsPriceDropdownOpen(false);
                          }}
                          className="w-full mt-2 py-2 bg-[#1f2a24] hover:bg-[#2c3b33] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedMinPrice(null);
                      setAppliedMaxPrice(null);
                      setMinPriceInput('');
                      setMaxPriceInput('');
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline transition cursor-pointer self-center"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Product Cards Grid: Tepat seperti CustomerMarketplace.tsx & image 2 */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredProducts.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => handleSelectProduct(item)}
                      className="bg-white rounded-3xl border border-black/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer"
                    >
                      {/* Top Media Banner Area */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                        <img
                          src={item.imageSrc}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Row Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(item.remainingBoxes ?? item.stock ?? 1) > 2 ? (
                              <span className="px-2.5 py-1 rounded-full bg-[#FDECEB] text-[#D94A38] text-[11px] font-bold flex items-center gap-1 shadow-xs border border-[#FCA5A5]/30">
                                <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span>Sisa {item.remainingBoxes ?? item.stock ?? 1} Box</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-[#b91c1c] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                                <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span>Sisa {item.remainingBoxes ?? item.stock ?? 1} Box</span>
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-full bg-white text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs">
                              {storeData.distance}
                            </span>
                          </div>

                          <div>
                            <span className="px-2.5 py-1 rounded-full bg-brand-green text-white text-[11px] font-black shadow-xs">
                              -{item.discountPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Bottom Dark Gradient with Category & Product Name Overlay */}
                        <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-4 bg-linear-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end pointer-events-none z-10">
                          <span className="text-xs sm:text-[13px] font-bold text-[#b7e472] uppercase tracking-wide drop-shadow-sm truncate mb-0.5">
                            {item.category}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-white font-display leading-tight drop-shadow-sm truncate">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body Content */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <p className="text-xs sm:text-[13px] text-[#434844] line-clamp-2 leading-relaxed mb-3.5">
                          {item.description}
                        </p>

                        {/* Pickup Time Bar */}
                        <div className="w-full bg-[#F4F3F0] rounded-xl py-2.5 px-3.5 flex items-center gap-2 mt-auto">
                          <Clock className="w-3.5 h-3.5 text-[#d94a38] shrink-0" aria-hidden="true" />
                          <div className="text-xs text-[#434844] truncate">
                            <span className="font-normal text-[#5a625d]">Ambil: </span>
                            <span className="font-bold text-[#1b1c1c]">{item.pickupTime}</span>
                          </div>
                        </div>

                        {/* Card Footer: Price & Pesan Sekarang Button */}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(item);
                            }}
                            className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#1f2a24] hover:bg-[#2c3b33] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                          >
                            <span>Pesan Sekarang</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-white rounded-3xl border border-black/10 p-8">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-1">
                    Tidak Ada Produk yang Cocok
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
                    Coba ubah rentang harga untuk melihat produk surplus yang tersedia di toko ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedMinPrice(null);
                      setAppliedMaxPrice(null);
                      setMinPriceInput('');
                      setMaxPriceInput('');
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#1f2a24] hover:bg-[#2c3b33] text-white text-xs font-bold transition cursor-pointer"
                  >
                    Reset Filter Harga
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section: Ulasan Pelanggan */}
          {(activeTab === 'tentang' || activeTab === 'ulasan') && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
                  Ulasan Pelanggan ({storeData.reviewCount})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ulasan nyata dari pelanggan yang telah menyelamatkan makanan di toko ini
                </p>
              </div>

              {/* Custom Sorting Filter Dropdown */}
              <div className="relative flex items-center gap-2 self-start sm:self-auto" ref={sortDropdownRef}>
                <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
                <button
                  type="button"
                  id="sort-reviews-button"
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  className={`bg-white border text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    isSortOpen
                      ? 'border-emerald-600 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      isSortOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>

                {isSortOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="sort-reviews-button"
                    className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortOrder === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSortOrder(opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#EEF8EE] text-emerald-800 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
              {currentSortLabel}
            </div>

            {/* Grid of Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">{rev.name}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}
        </main>
      </div>

      <CustomerFooter onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerStoreDetail;
