import { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Clock,
  ShoppingBag,
  Star,
  Mail,
  Phone,
  AtSign,
  Tag,
  MessageSquare,
  ChevronRight,
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
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col justify-between selection:bg-[#3c6a00]/20 selection:text-[#0b1510]">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d]">
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

          {/* TAB 1: Tentang Toko (2x2 Grid + Reviews) */}
          {activeTab === 'tentang' && (
            <>
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

              {/* Section: Ulasan Pelanggan */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
                      Ulasan Pelanggan ({storeData.reviewCount})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ulasan nyata dari pelanggan yang telah berbelanja di {storeData.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'terbaru' | 'tertinggi' | 'terendah')}
                      className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="tertinggi">Rating Tertinggi</option>
                      <option value="terendah">Rating Terendah</option>
                    </select>
                  </div>
                </div>

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
                              className={`w-3.5 h-3.5 ${star <= rev.rating
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
            </>
          )}

          {/* TAB 2: Semua Produk */}
          {activeTab === 'produk' && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1b1c1c]">
                    Semua Produk dari {storeData.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Pilih dan selamatkan paket makanan lezat berkualitas dengan harga hemat hari ini.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  Total {storeProducts.length} Produk
                </span>
              </div>

              {storeProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="border border-slate-200/80 rounded-3xl p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition bg-white"
                    >
                      <div>
                        <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[4/3] mb-3 bg-slate-100">
                          <img
                            src={prod.imageSrc}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 right-2.5 bg-[#22c55e] text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
                            -{prod.discountPercent}%
                          </div>
                          {typeof prod.stock === 'number' && (
                            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                              Sisa {prod.stock} Box
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          {prod.category}
                        </div>
                        <h3 className="text-base font-bold text-[#1b1c1c] line-clamp-2">
                          {prod.name}
                        </h3>
                        {prod.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {prod.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                          <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">Ambil: {prod.pickupTime}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-[11px] text-slate-400 line-through block">
                              Rp {formatRupiah(prod.originalPrice)}
                            </span>
                            <span className="text-lg font-black text-[#1b1c1c]">
                              Rp {formatRupiah(prod.rescuePrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-[#0b1510] hover:bg-[#1a2c22] text-[#bbf381] text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-2 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Pesan Sekarang</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">Belum ada produk aktif</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Toko ini belum menambahkan paket surplus makanan untuk hari ini. Silakan periksa kembali nanti.
                  </p>
                  {onNavigateMarketplace && (
                    <button
                      type="button"
                      onClick={onNavigateMarketplace}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      <span>Jelajahi Marketplace</span>
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: Ulasan */}
          {activeTab === 'ulasan' && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
                    Ulasan Pelanggan ({storeData.reviewCount})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ulasan nyata dari pelanggan yang telah berbelanja di {storeData.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'terbaru' | 'tertinggi' | 'terendah')}
                    className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="tertinggi">Rating Tertinggi</option>
                    <option value="terendah">Rating Terendah</option>
                  </select>
                </div>
              </div>

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
                            className={`w-3.5 h-3.5 ${star <= rev.rating
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
