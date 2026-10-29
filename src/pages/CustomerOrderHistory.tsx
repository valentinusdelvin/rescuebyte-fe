import { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShoppingBag,
  XCircle,
  Star,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Utensils,
  Cookie,
  Carrot,
  Croissant,
  Sandwich,
  X,
  LayoutGrid,
  AlertCircle,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerProfileSidebar } from '../components/customer/CustomerProfileSidebar';
import { getCurrentUser, logoutUser, clearAuth } from '../services/authService';
import { PaymentOrderData, UserPayload } from '../types';

export type CustomerOrderStatus =
  | 'all'
  | 'menunggu-pembayaran'
  | 'menunggu-konfirmasi'
  | 'diproses'
  | 'siap-diambil'
  | 'selesai'
  | 'dibatalkan';

export interface CustomerOrderHistoryProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateProfile?: () => void;
  onNavigateOrderDetail?: (orderData: PaymentOrderData) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: 'menunggu-pembayaran' | 'menunggu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'dibatalkan';
  statusLabel: string;
  storeName: string;
  storeRating: number;
  storeReviewCount: number;
  storeDistance: string;
  storeTags: string[];
  productName: string;
  productBoxCount: number;
  productDescription: string;
  pickupDate: string;
  pickupTime: string;
  originalPrice?: number;
  finalPrice: number;
  category: 'bakery' | 'meal' | 'snack' | 'fresh' | 'deli';
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'RB251026-00123',
    status: 'menunggu-konfirmasi',
    statusLabel: 'Menunggu Konfirmasi',
    storeName: 'TerasRasa Bakery',
    storeRating: 4.8,
    storeReviewCount: 320,
    storeDistance: '1.2 km',
    storeTags: ['Roti & Pastry', 'Halal'],
    productName: 'Mystery Bakery Box Reguler',
    productBoxCount: 1,
    productDescription: 'Roti, pastry, dan kue pilihan',
    pickupDate: '26 Oktober 2026',
    pickupTime: '16.00 - 18.00 WIB',
    finalPrice: 22000,
    category: 'bakery',
  },
  {
    id: 'ord-2',
    orderNumber: 'RB251025-00891',
    status: 'diproses',
    statusLabel: 'Diproses',
    storeName: 'GreenBowl',
    storeRating: 4.7,
    storeReviewCount: 210,
    storeDistance: '2.5 km',
    storeTags: ['Makanan Sehat', 'Halal'],
    productName: 'Mystery Meal Box',
    productBoxCount: 2,
    productDescription: 'Nasi, lauk, dan sayur pilihan',
    pickupDate: '25 Oktober 2026',
    pickupTime: '12.00 - 13.00 WIB',
    finalPrice: 52000,
    category: 'meal',
  },
  {
    id: 'ord-3',
    orderNumber: 'RB251024-00567',
    status: 'siap-diambil',
    statusLabel: 'Siap Diambil',
    storeName: 'SnackTime',
    storeRating: 4.5,
    storeReviewCount: 95,
    storeDistance: '3.1 km',
    storeTags: ['Camilan & Snack', 'Halal'],
    productName: 'Mystery Snack Box',
    productBoxCount: 1,
    productDescription: 'Snack dan camilan pilihan',
    pickupDate: '24 Oktober 2026',
    pickupTime: '17.00 - 18.00 WIB',
    originalPrice: 45000,
    finalPrice: 20000,
    category: 'snack',
  },
  {
    id: 'ord-4',
    orderNumber: 'RB251023-00455',
    status: 'selesai',
    statusLabel: 'Selesai',
    storeName: 'SayurKita',
    storeRating: 4.6,
    storeReviewCount: 180,
    storeDistance: '2.8 km',
    storeTags: ['Sayur & Buah', 'Halal'],
    productName: 'Mystery Fresh Box',
    productBoxCount: 1,
    productDescription: 'Sayur dan buah segar pilihan',
    pickupDate: '23 Oktober 2026',
    pickupTime: '15.00 - 16.00 WIB',
    finalPrice: 22000,
    category: 'fresh',
  },
  {
    id: 'ord-5',
    orderNumber: 'RB251022-00312',
    status: 'dibatalkan',
    statusLabel: 'Dibatalkan',
    storeName: 'DailyDeli',
    storeRating: 4.4,
    storeReviewCount: 120,
    storeDistance: '4.2 km',
    storeTags: ['Makanan Siap Saji', 'Halal'],
    productName: 'Mystery Deli Box',
    productBoxCount: 1,
    productDescription: 'Makanan siap saji pilihan',
    pickupDate: '22 Oktober 2026',
    pickupTime: '14.00 - 15.00 WIB',
    finalPrice: 20000,
    category: 'deli',
  },
];

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function CustomerOrderHistory({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateStore,
  onNavigateProfile,
  onNavigateOrderDetail,
  onNavigateSeller,
  onShowToast,
}: CustomerOrderHistoryProps) {
  const [currentUser] = useState<UserPayload | null>(() => getCurrentUser());
  const [activeStatus, setActiveStatus] = useState<CustomerOrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userName = currentUser?.name || 'Michael Dhinanta';
  const userEmail = currentUser?.email || 'fahmimml001@gmail.com';
  const userAvatar = currentUser?.avatar_url || '';

  const handleLogout = () => {
    logoutUser()
      .catch(() => {})
      .finally(() => {
        clearAuth();
        onShowToast?.('Berhasil keluar dari akun.', 'info');
        if (onNavigateHome) onNavigateHome();
      });
  };

  const handleCopyOrderNumber = (e: React.MouseEvent, orderNumber: string) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(orderNumber);
      setCopiedId(orderNumber);
      onShowToast?.(`Nomor pesanan #${orderNumber} disalin!`, 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast?.('Gagal menyalin nomor pesanan.', 'error');
    }
  };

  const handleOpenOrderDetail = (order: OrderItem) => {
    const paymentData: PaymentOrderData = {
      orderId: order.orderNumber,
      items: [
        {
          id: order.id,
          name: order.productName,
          storeId: 'store-1',
          storeName: order.storeName,
          storeAvatar: order.storeName.slice(0, 2).toUpperCase(),
          storeAddress: `${order.storeName}, Jakarta Selatan`,
          rating: order.storeRating,
          reviewCount: order.storeReviewCount,
          distanceText: order.storeDistance,
          categoryTags: order.storeTags,
          originalPrice: order.originalPrice || order.finalPrice + 15000,
          rescuePrice: order.finalPrice - 7000,
          discountPercent: 50,
          quantity: order.productBoxCount,
          pickupTime: order.pickupTime,
        },
      ],
      primaryStore: {
        storeName: order.storeName,
        storeAvatar: order.storeName.slice(0, 2).toUpperCase(),
        storeAddress: `${order.storeName}, Jakarta Selatan`,
        rating: order.storeRating,
        reviewCount: order.storeReviewCount,
      },
      pickupDate: order.pickupDate,
      pickupTimeSlot: order.pickupTime,
      customerInfo: {
        name: userName,
        phone: '08123456789',
        email: userEmail,
      },
      totalBoxes: order.productBoxCount,
      subtotal: order.finalPrice - 7000,
      discountTotal: 15000,
      serviceFee: 2000,
      grandTotal: order.finalPrice,
    };

    if (onNavigateOrderDetail) {
      onNavigateOrderDetail(paymentData);
    }
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      const matchStatus =
        activeStatus === 'all'
          ? true
          : activeStatus === 'menunggu-konfirmasi'
          ? order.status === 'menunggu-konfirmasi'
          : activeStatus === 'diproses'
          ? order.status === 'diproses'
          : activeStatus === 'siap-diambil'
          ? order.status === 'siap-diambil'
          : activeStatus === 'selesai'
          ? order.status === 'selesai'
          : activeStatus === 'dibatalkan'
          ? order.status === 'dibatalkan'
          : activeStatus === 'menunggu-pembayaran'
          ? order.status === 'menunggu-pembayaran'
          : true;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.storeName.toLowerCase().includes(q) ||
        order.productName.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [activeStatus, searchQuery]);

  // Tab count calculations
  const counts = useMemo(() => {
    return {
      all: MOCK_ORDERS.length,
      menungguPembayaran: 1,
      menungguKonfirmasi: MOCK_ORDERS.filter((o) => o.status === 'menunggu-konfirmasi').length,
      siapDiambil: MOCK_ORDERS.filter((o) => o.status === 'siap-diambil').length,
      selesai: MOCK_ORDERS.filter((o) => o.status === 'selesai').length,
      dibatalkan: MOCK_ORDERS.filter((o) => o.status === 'dibatalkan').length,
    };
  }, []);

  const handleOpenReview = (order: OrderItem) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewText('');
    setIsReviewOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setIsReviewOpen(false);
      onShowToast?.(`Ulasan untuk ${reviewOrder?.storeName} berhasil dikirim!`, 'success');
    }, 500);
  };

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
          onNavigateOrders={() => {}}
          onShowToast={onShowToast}
        />

        <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex-1">
          {/* Header Title Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#1b1c1c] tracking-tight">
              Pesanan Saya
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau pesanan Mystery Box kamu hingga siap diambil.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Left Sidebar */}
            <CustomerProfileSidebar
              name={userName}
              email={userEmail}
              avatarUrl={userAvatar}
              activeTab="orders"
              onNavigateProfile={onNavigateProfile}
              onNavigateOrders={() => {}}
              onLogout={handleLogout}
              onShowToast={onShowToast}
            />

            {/* Right Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
              {/* Status Filter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
                {/* 1. Semua Pesanan */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus('all');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                    activeStatus === 'all'
                      ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LayoutGrid className="w-4 h-4 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">Semua Pesanan</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeStatus === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {counts.all}
                  </span>
                </button>

                {/* 2. Menunggu Pembayaran */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus('menunggu-pembayaran');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                    activeStatus === 'menunggu-pembayaran'
                      ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">Menunggu Pembayaran</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeStatus === 'menunggu-pembayaran' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {counts.menungguPembayaran}
                  </span>
                </button>

                {/* 3. Menunggu Konfirmasi */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus('menunggu-konfirmasi');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                    activeStatus === 'menunggu-konfirmasi'
                      ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">Menunggu Konfirmasi</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeStatus === 'menunggu-konfirmasi' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {counts.menungguKonfirmasi}
                  </span>
                </button>

                {/* 4. Siap Diambil */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus('siap-diambil');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                    activeStatus === 'siap-diambil'
                      ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">Siap Diambil</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeStatus === 'siap-diambil' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {counts.siapDiambil}
                  </span>
                </button>

                {/* 5. Selesai */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus('selesai');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                    activeStatus === 'selesai'
                      ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">Selesai</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeStatus === 'selesai' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {counts.selesai}
                  </span>
                </button>

                {/* 6. Dibatalkan */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus('dibatalkan');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                    activeStatus === 'dibatalkan'
                      ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold truncate">Dibatalkan</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeStatus === 'dibatalkan' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {counts.dibatalkan}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nomor pesanan, nama toko, atau produk..."
                  className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Orders List */}
              <div className="flex flex-col gap-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Tidak ada pesanan ditemukan</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {searchQuery
                        ? `Tidak ada hasil untuk pencarian "${searchQuery}".`
                        : 'Belum ada transaksi di kategori status ini.'}
                    </p>
                    {(searchQuery || activeStatus !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveStatus('all');
                        }}
                        className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    return (
                      <article
                        key={order.id}
                        className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 hover:border-slate-300 transition"
                      >
                        {/* 1. Left Store Info */}
                        <div className="lg:w-1/4 shrink-0 flex flex-col gap-1.5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-5">
                          <div
                            onClick={() => (onNavigateStore ? onNavigateStore(order.storeName) : onNavigateMarketplace?.())}
                            className="flex items-center gap-2 cursor-pointer group w-fit"
                            role="button"
                            tabIndex={0}
                            title={`Lihat profil toko ${order.storeName}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                if (onNavigateStore) onNavigateStore(order.storeName);
                                else onNavigateMarketplace?.();
                              }
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-[#1b1c1c] text-white font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-800 transition">
                              {order.storeName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[#1b1c1c] group-hover:text-emerald-700 group-hover:underline truncate transition">
                                {order.storeName}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Terverifikasi
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">★ {order.storeRating}</span>
                            <span>({order.storeReviewCount} ulasan)</span>
                            <span>•</span>
                            <span>{order.storeDistance}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {order.storeTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(order.storeName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 mt-1 transition"
                          >
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>Lihat di Google Maps</span>
                          </a>
                        </div>

                        {/* 2. Middle Item Details */}
                        <div className="flex-1 min-w-0 flex items-start gap-4">
                          {/* Box Category Thumbnail */}
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-xs ${
                              order.category === 'fresh'
                                ? 'bg-emerald-700'
                                : order.category === 'meal'
                                ? 'bg-amber-800'
                                : order.category === 'snack'
                                ? 'bg-amber-900'
                                : order.category === 'bakery'
                                ? 'bg-[#7c4d28]'
                                : 'bg-[#6d3e23]'
                            }`}
                          >
                            {order.category === 'bakery' && <Croissant className="w-6 h-6 mb-0.5" />}
                            {order.category === 'meal' && <Utensils className="w-6 h-6 mb-0.5" />}
                            {order.category === 'snack' && <Cookie className="w-6 h-6 mb-0.5" />}
                            {order.category === 'fresh' && <Carrot className="w-6 h-6 mb-0.5" />}
                            {order.category === 'deli' && <Sandwich className="w-6 h-6 mb-0.5" />}
                            <span className="text-[9px] font-bold tracking-wider uppercase opacity-90">
                              {order.category}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-[#1b1c1c] truncate">
                              {order.productName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {order.productBoxCount} box
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {order.productDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <span>No. Pesanan</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyOrderNumber(e, order.orderNumber)}
                                  className="inline-flex items-center gap-0.5 text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer"
                                  title="Salin nomor pesanan"
                                >
                                  <span>{order.orderNumber}</span>
                                  {copiedId === order.orderNumber ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              </span>
                              <span>•</span>
                              <span>{order.pickupDate}</span>
                              <span>•</span>
                              <span>{order.pickupTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Right Status, Price & Actions */}
                        <div className="lg:w-1/4 shrink-0 flex flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {/* Status Badge */}
                          <div>
                            {order.status === 'menunggu-konfirmasi' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Menunggu Konfirmasi <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                            {order.status === 'diproses' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Diproses <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                            {order.status === 'siap-diambil' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Siap Diambil <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                            {order.status === 'selesai' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Selesai <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                            {order.status === 'dibatalkan' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Dibatalkan <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="lg:text-right">
                            {order.originalPrice && (
                              <span className="text-xs text-slate-400 line-through block">
                                Rp {formatRupiah(order.originalPrice)}
                              </span>
                            )}
                            <span className="text-base sm:text-lg font-black text-[#1b1c1c]">
                              Rp {formatRupiah(order.finalPrice)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                            {order.status === 'selesai' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => (onNavigateStore ? onNavigateStore(order.storeName) : onNavigateMarketplace?.())}
                                  className="bg-[#1b1c1c] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>Beli Lagi</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(order)}
                                  className="border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Beri Ulasan</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenOrderDetail(order)}
                                className="border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <span>Lihat Detail</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {filteredOrders.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${
                      currentPage === 1 ? 'bg-[#1b1c1c] text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(2)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${
                      currentPage === 2 ? 'bg-[#1b1c1c] text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(3)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${
                      currentPage === 3 ? 'bg-[#1b1c1c] text-white' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    3
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                    disabled={currentPage === 3}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {isReviewOpen && reviewOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsReviewOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setIsReviewOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 id="review-title" className="text-xl font-bold text-[#1b1c1c] mb-1">
              Beri Ulasan untuk {reviewOrder.storeName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              Pesanan: <span className="font-semibold text-slate-800">{reviewOrder.productName}</span> (#{reviewOrder.orderNumber})
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Penilaian
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-600 ml-2">
                    {reviewRating === 5 && 'Sangat Puas!'}
                    {reviewRating === 4 && 'Puas'}
                    {reviewRating === 3 && 'Cukup'}
                    {reviewRating === 2 && 'Kurang'}
                    {reviewRating === 1 && 'Kecewa'}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-input"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Ulasan Kamu
                </label>
                <textarea
                  id="review-input"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Ceritakan pengalamanmu menikmati makanan surplus ini..."
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Footer */}
      <CustomerFooter onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerOrderHistory;
