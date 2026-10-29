import { useState, useMemo } from 'react';
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

import heroBannerImg from '../assets/customer/hero-full-banner.jpg';
import avatarReza from '../assets/customer/avatar-reza.jpg';
import avatarFahmi from '../assets/customer/avatar-fahmi.jpg';
import cardBakery from '../assets/customer/card-tous-les-jours.jpg';
import cardPastry from '../assets/customer/card-monsieur-spoon.jpg';
import cardDinner from '../assets/customer/card-saladstop.jpg';

export interface CustomerStoreDetailProps {
  storeName?: string;
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

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function CustomerStoreDetail({
  storeName = 'TerasRasa Bakery',
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

  // Store data matching reference mockup
  const storeData = useMemo(() => {
    return {
      name: storeName || 'TerasRasa Bakery',
      category: 'Roti & Pastry',
      status: 'Buka',
      rating: 4.8,
      reviewCount: 320,
      distance: '1.2 km',
      area: 'Jakarta Selatan',
      address: 'Jl. Kemang Raya No. 12B, Kemang, Jakarta Selatan, DKI Jakarta 12730',
      operationalHours: 'Senin - Minggu\n08:00 - 21:00 WIB',
      pickupHours: '15:00 - 18:00 WIB',
      email: 'terasrasa@gmail.com',
      phone: '+62 812 3456 7890',
      socialMedia: '@terasrasa.bakery',
      description:
        'TerasRasa Bakery menyajikan aneka roti, pastry, dan kue dengan bahan berkualitas. Bersama RescueBite, kami mengurangi food waste dengan menghadirkan Mystery Box berisi produk segar yang tetap lezat dan layak konsumsi.',
      aboutText1:
        'TerasRasa Bakery adalah artisan bakery and pastry lokal yang telah beroperasi sejak 2020 di kawasan Kemang, Jakarta Selatan. Kami menghadirkan berbagai pilihan roti, pastry, dan kue dengan bahan berkualitas dan dibuat setiap hari oleh baker berpengalaman.',
      aboutText2:
        'Melalui kerjasama dengan RescueBite, kami berkomitmen mengurangi food waste dengan menawarkan Mystery Box berisi produk segar yang tetap layak konsumsi. Nikmati kejutan rasa dengan harga lebih hemat sekaligus ikut berkontribusi untuk lingkungan yang lebih baik.',
    };
  }, [storeName]);

  // Products available in store
  const storeProducts: StoreProductItem[] = useMemo(
    () => [
      {
        id: 'sp-1',
        name: 'Mystery Bakery Box Reguler',
        category: 'Roti & Pastry',
        originalPrice: 40000,
        rescuePrice: 20000,
        discountPercent: 50,
        imageSrc: cardBakery,
        pickupTime: '15:00 - 18:00 WIB',
      },
      {
        id: 'sp-2',
        name: 'Mystery Pastry Box',
        category: 'Pastry & Croissant',
        originalPrice: 40000,
        rescuePrice: 18000,
        discountPercent: 55,
        imageSrc: cardPastry,
        pickupTime: '15:00 - 18:00 WIB',
      },
      {
        id: 'sp-3',
        name: 'Mystery Dinner Box',
        category: 'Roti & Savory',
        originalPrice: 50000,
        rescuePrice: 25000,
        discountPercent: 50,
        imageSrc: cardDinner,
        pickupTime: '16:00 - 18:00 WIB',
      },
    ],
    []
  );

  // Customer reviews
  const storeReviews: StoreReviewItem[] = useMemo(
    () => [
      {
        id: 'rev-1',
        name: 'Reza Akbar',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarReza,
        comment:
          'Kualitas rotinya masih sangat segar dan teksturnya lembut. Sangat puas dengan Mystery Box dari TerasRasa Bakery!',
        date: '28 Okt 2026',
      },
      {
        id: 'rev-2',
        name: 'Reza Akbar',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarReza,
        comment:
          'Pelayanannya cepat dan ramah saat pengambilan di kasir. Porsi makanannya berlimpah dan higienis.',
        date: '27 Okt 2026',
      },
      {
        id: 'rev-3',
        name: 'Reza Akbar',
        role: 'Pelanggan',
        rating: 4,
        avatar: avatarReza,
        comment:
          'Inisiatif luar biasa untuk menyelamatkan surplus bakery. Rasanya tetap lezat seperti baru keluar dari oven.',
        date: '25 Okt 2026',
      },
      {
        id: 'rev-4',
        name: 'Fahmi Fayyid',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarFahmi,
        comment:
          'Variasi pastry di dalamnya lengkap banget, ada croissant dan pain au chocolat. Pasti akan pesan lagi!',
        date: '24 Okt 2026',
      },
      {
        id: 'rev-5',
        name: 'Fahmi Fayyid',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarFahmi,
        comment:
          'Tempatnya bersih dan mudah ditemukan di Kemang. Mystery Box selalu jadi kejutan yang menyenangkan.',
        date: '23 Okt 2026',
      },
      {
        id: 'rev-6',
        name: 'Fahmi Fayyid',
        role: 'Pelanggan',
        rating: 5,
        avatar: avatarFahmi,
        comment:
          'Sangat hemat untuk sarapan sekeluarga dan ikut berkontribusi mengurangi sampah makanan.',
        date: '22 Okt 2026',
      },
    ],
    []
  );

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
        distanceText: storeData.distance,
        remainingBoxesText: 'Sisa 3 Box',
        discountPercent: prod.discountPercent,
        originalPrice: prod.originalPrice,
        rescuePrice: prod.rescuePrice,
        pickupTime: prod.pickupTime,
        description: `${prod.name} dari ${storeData.name}. Berisi aneka produk pilihan harian berkualitas tinggi.`,
        tags: [storeData.category, '✓ Halal'],
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
    const url = `https://maps.google.com/?q=${encodeURIComponent(
      `${storeData.name} ${storeData.address}`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
                  {/* Store Logo Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0b1510] text-[#bbf381] border-2 border-white flex flex-col items-center justify-center font-bold shrink-0 shadow-sm">
                    <span className="text-xl sm:text-2xl tracking-tight">TR</span>
                    <span className="text-[9px] text-white/80 font-normal">TerasRasa</span>
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

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {storeData.description}
                    </p>
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
              className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px ${
                activeTab === 'tentang'
                  ? 'border-[#1b1c1c] text-[#1b1c1c]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Tentang Toko
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('produk')}
              className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px ${
                activeTab === 'produk'
                  ? 'border-[#1b1c1c] text-[#1b1c1c]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Semua Produk ({storeProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ulasan')}
              className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px ${
                activeTab === 'ulasan'
                  ? 'border-[#1b1c1c] text-[#1b1c1c]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Ulasan ({storeData.reviewCount})
            </button>
          </nav>

          {/* Tab 1: Tentang Toko (2x2 Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Card 1: Tentang Toko Description */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-3">
                  Tentang {storeData.name}
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>{storeData.aboutText1}</p>
                  <p>{storeData.aboutText2}</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {storeProducts.map((prod) => (
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
                  Ulasan nyata dari pelanggan yang telah menyelamatkan makanan di toko ini
                </p>
              </div>

              {/* Sorting Filter */}
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

            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
              Terbaru
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
        </main>
      </div>

      <CustomerFooter onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerStoreDetail;

