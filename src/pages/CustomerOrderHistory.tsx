import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Copy,
  Check,
  CheckCircle2,
  ShoppingBag,
  XCircle,
  Star,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  X,
  LayoutGrid,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerProfileSidebar } from '../components/customer/CustomerProfileSidebar';
import { getCurrentUser, logoutUser, clearAuth } from '../services/authService';
import { PaymentOrderData, UserPayload, CustomerOrderStatus } from '../types';
import {
  CustomerOrderItem,
  getCustomerOrders,
  subscribeToOrders,
  fetchCustomerOrdersApi,
} from '../services/orderService';
import { getAllStores } from '../services/storeService';

export type OrderHistoryFilterTab = 'all' | CustomerOrderStatus;

export interface CustomerOrderHistoryProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateProfile?: () => void;
  onNavigateOrderDetail?: (orderData: PaymentOrderData) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

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
  const [orders, setOrders] = useState<CustomerOrderItem[]>(() => getCustomerOrders());
  const [storeAvatars, setStoreAvatars] = useState<Record<string, string>>({});
  const [storeAddresses, setStoreAddresses] = useState<Record<string, string>>({});
  const [activeStatus, setActiveStatus] = useState<OrderHistoryFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    return subscribeToOrders((latest) => {
      setOrders(latest);
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    getAllStores()
      .then((backendStores) => {
        if (isCancelled || !backendStores) return;
        const avatarMap: Record<string, string> = {};
        const addressMap: Record<string, string> = {};
        backendStores.forEach((store) => {
          if (store.profile_picture_url) {
            if (store.name) avatarMap[store.name.trim().toLowerCase()] = store.profile_picture_url;
            if (store.id) avatarMap[store.id] = store.profile_picture_url;
          }
          const fullAddr = [store.address, store.district, store.city].filter(Boolean).join(', ');
          if (fullAddr) {
            if (store.name) addressMap[store.name.trim().toLowerCase()] = fullAddr;
            if (store.id) addressMap[store.id] = fullAddr;
          }
        });
        setStoreAvatars(avatarMap);
        setStoreAddresses(addressMap);
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    async function loadBackendOrders() {
      try {
        const backendOrders = await fetchCustomerOrdersApi();
        if (!isCancelled && backendOrders !== null) {
          setOrders(backendOrders);
        }
      } catch (err) {
        console.warn('Gagal memuat pesanan dari backend:', err);
      }
    }
    loadBackendOrders();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<CustomerOrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userName = currentUser?.name || 'Michael Dhinanta';
  const userEmail = currentUser?.email || 'fahmimml001@gmail.com';
  const userAvatar = currentUser?.avatar_url || '';

  const handleLogout = () => {
    logoutUser()
      .catch(() => { })
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

  const handleOpenOrderDetail = (order: CustomerOrderItem) => {
    if (order.orderData && onNavigateOrderDetail) {
      onNavigateOrderDetail(order.orderData);
      return;
    }
    const resolvedAvatar =
      storeAvatars[order.storeName.trim().toLowerCase()] ||
      (order.orderData?.primaryStore as any)?.profile_picture_url ||
      order.storeName.slice(0, 2).toUpperCase();

    const paymentData: PaymentOrderData = {
      orderId: order.orderNumber,
      status: order.status,
      items: [
        {
          id: order.id,
          name: order.productName,
          storeId: 'store-1',
          storeName: order.storeName,
          storeAvatar: resolvedAvatar,
          storeAddress: `${order.storeName}, Area Terdekat`,
          rating: order.storeRating,
          reviewCount: order.storeReviewCount,
          distanceText: order.storeDistance,
          categoryTags: order.storeTags || [],
          originalPrice: order.originalPrice || order.finalPrice + 15000,
          rescuePrice: order.finalPrice,
          discountPercent: 50,
          quantity: order.productBoxCount,
          pickupTime: order.pickupTime,
        },
      ],
      primaryStore: {
        storeName: order.storeName,
        storeAvatar: resolvedAvatar,
        storeAddress: `${order.storeName}, Area Terdekat`,
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
      subtotal: order.finalPrice,
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
    return orders.filter((order) => {
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
  }, [orders, activeStatus, searchQuery]);

  // Tab count calculations
  const counts = useMemo(() => {
    return {
      all: orders.length,
      menungguPembayaran: orders.filter((o) => o.status === 'menunggu-pembayaran').length,
      menungguKonfirmasi: orders.filter((o) => o.status === 'menunggu-konfirmasi').length,
      diproses: orders.filter((o) => o.status === 'diproses').length,
      siapDiambil: orders.filter((o) => o.status === 'siap-diambil').length,
      selesai: orders.filter((o) => o.status === 'selesai').length,
      dibatalkan: orders.filter((o) => o.status === 'dibatalkan').length,
    };
  }, [orders]);

  const handleOpenReview = (order: CustomerOrderItem) => {
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
          onNavigateOrders={() => { }}
          onShowToast={onShowToast}
        />

        <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex-1">
          {/* Header Title Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1b1c1c] tracking-tight">
              Riwayat Pesanan
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
              onNavigateOrders={() => { }}
              onLogout={handleLogout}
              onShowToast={onShowToast}
            />

            {/* Right Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
              {/* Status Filter Cards */}
<div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
                {[
                  {
                    id: 'all' as OrderHistoryFilterTab,
                    label: 'Semua Pesanan',
                    count: counts.all,
                    icon: LayoutGrid,
                    inactiveColor: 'text-slate-700',
                  },
                  ...(counts.menungguPembayaran > 0
                    ? [
                        {
                          id: 'menunggu-pembayaran' as OrderHistoryFilterTab,
                          label: 'Menunggu Pembayaran',
                          count: counts.menungguPembayaran,
                          icon: AlertCircle,
                          inactiveColor: 'text-amber-500',
                        },
                      ]
                    : []),
                  {
                    id: 'menunggu-konfirmasi' as OrderHistoryFilterTab,
                    label: 'Menunggu Konfirmasi',
                    count: counts.menungguKonfirmasi,
                    icon: AlertCircle,
                    inactiveColor: 'text-amber-500',
                  },
                  {
                    id: 'diproses' as OrderHistoryFilterTab,
                    label: 'Diproses',
                    count: counts.diproses,
                    icon: RefreshCw,
                    inactiveColor: 'text-blue-500',
                  },
                  {
                    id: 'siap-diambil' as OrderHistoryFilterTab,
                    label: 'Siap Diambil',
                    count: counts.siapDiambil,
                    icon: ShoppingBag,
                    inactiveColor: 'text-emerald-600',
                  },
                  {
                    id: 'selesai' as OrderHistoryFilterTab,
                    label: 'Selesai',
                    count: counts.selesai,
                    icon: CheckCircle2,
                    inactiveColor: 'text-blue-600',
                  },
                  {
                    id: 'dibatalkan' as OrderHistoryFilterTab,
                    label: 'Dibatalkan',
                    count: counts.dibatalkan,
                    icon: XCircle,
                    inactiveColor: 'text-rose-500',
                  },
                ].map((tab) => {
                  const isActive = activeStatus === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveStatus(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition cursor-pointer border ${
                        isActive
                          ? 'bg-[#1b1c1c] text-white border-[#1b1c1c] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : tab.inactiveColor
                          }`}
                        />
                        <span className="text-xs sm:text-sm font-bold truncate">
                          {tab.label}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 transition ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
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
                            {(() => {
                              const avatarUrl =
                                storeAvatars[order.storeName.trim().toLowerCase()] ||
                                (order.orderData?.primaryStore as any)?.profile_picture_url;
                              return (
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1b1c1c] text-white font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-800 transition border border-black/5">
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={order.storeName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : null}
                                  <span className={avatarUrl ? 'hidden' : 'block'}>
                                    {order.storeName.slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[#1b1c1c] group-hover:text-emerald-700 group-hover:underline truncate transition">
                                {order.storeName}
                              </h4>
                            </div>
                          </div>

                          {(() => {
                            const addr =
                              order.storeAddress ||
                              storeAddresses[order.storeName.trim().toLowerCase()] ||
                              (order.orderData?.primaryStore as any)?.storeAddress;
                            return (
                              <div className="flex flex-col gap-1 mt-1 text-xs text-slate-500">
                                {addr ? (
                                  <div className="flex items-start gap-1 text-slate-600 leading-snug">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{addr}</span>
                                  </div>
                                ) : null}
                                <a
                                  href={`https://maps.google.com/?q=${encodeURIComponent(
                                    addr ? `${order.storeName}, ${addr}` : order.storeName
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition w-fit"
                                >
                                  {!addr && <MapPin className="w-3 h-3 text-slate-400" />}
                                  <span>Lihat di Google Maps</span>
                                </a>
                              </div>
                            );
                          })()}
                        </div>

                        {/* 2. Middle Item Details */}
                        <div className="flex-1 min-w-0 flex items-start gap-4">
                          {/* Product Image Thumbnail */}
                          {(() => {
                            const itemImg = order.imageUrl || order.orderData?.items?.[0]?.imageSrc;
                            return (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-xs border border-black/5">
                                {itemImg ? (
                                  <img
                                    src={itemImg}
                                    alt={order.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <ShoppingBag className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                            );
                          })()}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-[#1b1c1c] truncate">
                              {order.productName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {order.productBoxCount} box
                            </p>
                            {order.productDescription &&
                            order.productDescription !== order.productName &&
                            order.productDescription !== `1x ${order.productName}` && (
                              <p className="text-xs text-slate-400 mt-0.5 truncate">
                                {order.productDescription}
                              </p>
                            )}

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
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${currentPage === 1 ? 'bg-[#1b1c1c] text-white' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(2)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${currentPage === 2 ? 'bg-[#1b1c1c] text-white' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(3)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${currentPage === 3 ? 'bg-[#1b1c1c] text-white' : 'hover:bg-slate-100 text-slate-700'
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
                        className={`w-7 h-7 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
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
