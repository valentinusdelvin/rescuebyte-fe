import { useState, useMemo, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Store,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Info,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CheckoutItem, CheckoutPayload, PaymentOrderData } from '../types';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import { createCustomerOrder } from '../services/orderService';
import { getCurrentUser } from '../services/authService';
import { getAllStores, StoreProfileData } from '../services/storeService';

export interface CustomerCheckoutProps {
  payload?: CheckoutPayload | null;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateCart?: () => void;
  onNavigateDetail?: () => void;
  onNavigateSeller?: () => void;
  onNavigatePayment?: (orderData: PaymentOrderData) => void;
  onNavigateOrderDetail?: (orderData: PaymentOrderData) => void;
  onShowToast?: (message: string) => void;
}

export interface StoreCheckoutGroup {
  key: string;
  storeId?: string;
  storeName: string;
  storeAvatar?: string;
  storeAddress: string;
  operationalHours: string;
  rating: number;
  reviewCount: number | string;
  distanceText: string;
  items: CheckoutItem[];
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getOrderDateFormatted(): string {
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function CustomerCheckout({
  payload,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateCart,
  onNavigateDetail,
  onNavigateSeller,
  onNavigatePayment,
  onNavigateOrderDetail,
  onShowToast,
}: CustomerCheckoutProps) {
  // Customer Info State from current user or defaults
  const currentUser = getCurrentUser();
  const [customerName, setCustomerName] = useState(() => currentUser?.name || 'Reza Pratama');
  const [customerPhone, setCustomerPhone] = useState(() => currentUser?.phone_number || '081234567890');
  const [customerEmail] = useState(() => currentUser?.email || 'customer@rescuebite.com');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Items State (defaults to TerasRasa Bakery Mystery Box matching Image 2 if payload empty)
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(() => {
    if (payload && payload.items && payload.items.length > 0) {
      return payload.items;
    }
    return [
      {
        id: 'item-bakery-box-reguler',
        name: 'Mystery Bakery Box',
        storeId: 'store-terasa',
        storeName: 'Toko Rejak',
        storeAvatar: 'TR',
        storeAddress: 'Jalan Selorejo, Lowokwaru, Kota Malang, Jawa Timur',
        rating: 4.8,
        reviewCount: 320,
        distanceText: '1.2 km',
        categoryTags: ['Roti & Pastry', '✓ Halal'],
        originalPrice: 40000,
        rescuePrice: 20000,
        discountPercent: 50,
        quantity: 1,
        imageSrc: cardMonsieurSpoon,
        pickupTime: '15.00 - 18.00 WIB',
      },
    ];
  });

  // Keep items synced if payload changes
  const [prevPayload, setPrevPayload] = useState(payload);
  if (payload !== prevPayload) {
    setPrevPayload(payload);
    if (payload && payload.items && payload.items.length > 0) {
      setCheckoutItems(payload.items);
    }
  }

  // Tanggal pickup sebagai tanggal pemesanan (hari ini)
  const [orderDateFormatted] = useState(getOrderDateFormatted);

  // Data toko dari database backend
  const [dbStores, setDbStores] = useState<StoreProfileData[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function fetchStores() {
      try {
        const stores = await getAllStores();
        if (!isCancelled && stores.length > 0) {
          setDbStores(stores);
        }
      } catch (err) {
        console.warn('Gagal memuat daftar toko dari database:', err);
      }
    }
    fetchStores();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Group items by store and resolve each store's address, avatar, and operational hours from database
  const storeGroups = useMemo<StoreCheckoutGroup[]>(() => {
    const groupMap = new Map<string, StoreCheckoutGroup>();

    checkoutItems.forEach((item) => {
      const rawStoreName = (item.storeName || '').trim();
      const targetName = rawStoreName.toLowerCase();
      const targetId = item.storeId;

      // Find matching database store by id or name
      const matchedStore =
        dbStores.find((s) => {
          if (targetId && s.id === targetId) return true;
          const sName = (s.name || '').toLowerCase().trim();
          return Boolean(
            targetName &&
              (sName === targetName || sName.includes(targetName) || targetName.includes(sName))
          );
        }) ||
        (targetName.includes('rejak')
          ? dbStores.find((s) => (s.name || '').toLowerCase().includes('rejak'))
          : null) ||
        (targetName.includes('gurinjay')
          ? dbStores.find((s) => (s.name || '').toLowerCase().includes('gurinjay'))
          : null);

      const storeKey = matchedStore?.id || item.storeId || targetName || 'default-store';
      const displayName = matchedStore?.name || rawStoreName || 'Toko Mitra';

      const avatarUrl =
        matchedStore?.profile_picture_url ||
        (displayName.toLowerCase().includes('rejak')
          ? 'https://abiaxlkxogtnlemxeaev.supabase.co/storage/v1/object/public/rescuebyte-bucket/stores/01a187eb-f43d-764d-ac5b-a363a4ddf871.png'
          : displayName.toLowerCase().includes('gurinjay')
          ? 'https://abiaxlkxogtnlemxeaev.supabase.co/storage/v1/object/public/rescuebyte-bucket/stores/01a188bf-7228-7825-8163-35bf31db6ba5.jpg'
          : item.storeAvatar);

      let fullAddress = item.storeAddress || 'Kota Malang, Jawa Timur';
      if (matchedStore) {
        const parts = [matchedStore.address, matchedStore.district, matchedStore.city].filter(Boolean);
        if (parts.length > 0) {
          fullAddress = parts.join(', ');
        }
      } else if (displayName.toLowerCase().includes('rejak')) {
        fullAddress = 'Jalan Selorejo, Lowokwaru, Kota Malang, Jawa Timur';
      } else if (displayName.toLowerCase().includes('gurinjay')) {
        fullAddress = 'Jalan Kebon Jeruk V, Tulusrejo, Lowokwaru, Kota Malang';
      }

      let operationalHours = item.pickupTime || '08.00 - 22.00 WIB';
      if (matchedStore?.operational_start && matchedStore?.operational_end) {
        const opStart = matchedStore.operational_start.slice(0, 5).replace(':', '.');
        const opEnd = matchedStore.operational_end.slice(0, 5).replace(':', '.');
        operationalHours = `${opStart} - ${opEnd} WIB`;
      }

      if (!groupMap.has(storeKey)) {
        groupMap.set(storeKey, {
          key: storeKey,
          storeId: matchedStore?.id || item.storeId,
          storeName: displayName,
          storeAvatar: avatarUrl,
          storeAddress: fullAddress,
          operationalHours,
          rating: item.rating || 4.9,
          reviewCount: item.reviewCount || 42,
          distanceText: item.distanceText || '0.9 km',
          items: [item],
        });
      } else {
        groupMap.get(storeKey)!.items.push(item);
      }
    });

    return Array.from(groupMap.values());
  }, [checkoutItems, dbStores]);

  // Payment Method: 'online' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stepper handlers
  const handleIncreaseQty = (itemId: string) => {
    setCheckoutItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (item.quantity >= 5) {
            if (onShowToast) onShowToast('Maksimal 5 box per transaksi.');
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const handleDecreaseQty = (itemId: string) => {
    setCheckoutItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: Math.max(1, item.quantity - 1) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    if (checkoutItems.length <= 1) {
      if (onShowToast) onShowToast('Minimal 1 item untuk checkout.');
      return;
    }
    setCheckoutItems((prev) => prev.filter((item) => item.id !== itemId));
    if (onShowToast) onShowToast('Item dihapus dari checkout.');
  };

  // Calculations
  const { totalBoxes, subtotal, discountTotal, serviceFee, grandTotal } = useMemo(() => {
    let boxes = 0;
    let sub = 0;
    let disc = 0;

    checkoutItems.forEach((item) => {
      boxes += item.quantity;
      const originalTotal = item.originalPrice * item.quantity;
      const rescueTotal = item.rescuePrice * item.quantity;
      sub += rescueTotal;
      disc += originalTotal - rescueTotal;
    });

    const fee = boxes > 0 ? 2000 : 0;
    const finalTotal = sub + fee;

    return {
      totalBoxes: boxes,
      subtotal: sub,
      discountTotal: disc,
      serviceFee: fee,
      grandTotal: finalTotal,
    };
  }, [checkoutItems]);

  const handlePayNow = () => {
    if (totalBoxes === 0) {
      if (onShowToast) onShowToast('Tidak ada item untuk dipesan.');
      return;
    }

    setIsSubmitting(true);
    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const generatedCode = `RB${todayStr}-${randomSuffix}`;

    const firstGroup = storeGroups[0];
    const orderData: PaymentOrderData = {
      orderId: generatedCode,
      items: checkoutItems,
      primaryStore: {
        storeName: firstGroup?.storeName || checkoutItems[0]?.storeName || 'Toko Mitra',
        storeAvatar: firstGroup?.storeAvatar || checkoutItems[0]?.storeAvatar,
        storeAddress: firstGroup?.storeAddress || checkoutItems[0]?.storeAddress,
        rating: firstGroup?.rating || checkoutItems[0]?.rating || 4.9,
        reviewCount: firstGroup?.reviewCount || checkoutItems[0]?.reviewCount || 48,
      },
      pickupDate: orderDateFormatted,
      pickupTimeSlot: firstGroup?.operationalHours || '08.00 - 22.00 WIB',
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      totalBoxes,
      subtotal,
      discountTotal,
      serviceFee,
      grandTotal,
      source: payload?.source,
      status: 'menunggu-konfirmasi',
      createdAt: new Date().toISOString(),
    };

    // Save order, deduct merchant stock, clear cart if source was cart
    createCustomerOrder(orderData, 'menunggu-konfirmasi');
    if (onShowToast) onShowToast('Pesanan berhasil dibuat! Menunggu konfirmasi toko.');

    setTimeout(() => {
      setIsSubmitting(false);
      if (onNavigateOrderDetail) {
        onNavigateOrderDetail(orderData);
      } else if (onNavigatePayment) {
        onNavigatePayment(orderData);
      }
    }, 300);
  };

  const handleHeaderTab = (tab: string) => {
    if (tab === 'beranda' && onNavigateHome) {
      onNavigateHome();
    } else if (tab === 'marketplace' && onNavigateMarketplace) {
      onNavigateMarketplace();
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="checkout-page-root">
      <div>
        {/* 1. Header (Active Marketplace pill matching design) */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
        />

        {/* 2. Main Container */}
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Periksa pesananmu, lengkapi informasi, dan pilih metode pembayaran.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* CARD 1: Informasi Customer */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-700" />
                  <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                    Informasi Customer
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer((prev) => !prev)}
                  className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer select-none transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingCustomer ? 'Simpan' : 'Ubah Data'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    NAMA LENGKAP
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={!isEditingCustomer}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    NOMOR HP
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={!isEditingCustomer}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      EMAIL
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">Terkunci</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={customerEmail}
                      readOnly
                      disabled
                      aria-readonly="true"
                      title="Email akun terdaftar dan tidak dapat diubah saat checkout"
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-100/90 text-xs sm:text-sm font-medium text-gray-600 cursor-not-allowed select-none transition-colors"
                    />
                    <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </section>

            {/* STORE GROUPS: Per-store products directly followed by per-store pickup info */}
            {storeGroups.map((group, groupIdx) => (
              <section
                key={group.key}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-5"
              >
                {/* Store Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1e2a22] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200 shadow-2xs">
                      {group.storeAvatar && group.storeAvatar.startsWith('http') ? (
                        <img
                          src={group.storeAvatar}
                          alt={group.storeName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{group.storeName.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                          {group.storeName}
                        </h2>
                        {storeGroups.length > 1 && (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Toko {groupIdx + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (payload?.source === 'cart' && onNavigateCart) {
                        onNavigateCart();
                      } else if (onNavigateDetail) {
                        onNavigateDetail();
                      } else if (onNavigateCart) {
                        onNavigateCart();
                      }
                    }}
                    className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer select-none transition-colors shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Pesanan</span>
                  </button>
                </div>

                {/* Product List for this store */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Image & Info (menampilkan NAMA TOKO dan NAMA PRODUK) */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#24201c] shrink-0 border border-black/10 relative">
                          <img
                            src={item.imageSrc || cardMonsieurSpoon}
                            alt={item.name?.replace(/\s+Reguler$/i, '')}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          {/* Nama Toko */}
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                            {group.storeName}
                          </span>

                          {/* Nama Produk */}
                          <h3 className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                            {item.name?.replace(/\s+Reguler$/i, '')}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <span className="text-amber-500 font-bold">★ {item.rating || group.rating || 4.9}</span>
                            <span className="text-gray-400">({item.reviewCount || group.reviewCount || 42} ulasan)</span>
                            <span className="text-gray-300">•</span>
                            <span>{item.distanceText || group.distanceText || '0.9 km'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Stepper */}
                      <div className="flex flex-col sm:items-end justify-between gap-1.5 shrink-0">
                        <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-base sm:text-lg text-[#e11d48]">
                              Rp {formatRupiah(item.rescuePrice)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">/box</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400 line-through">
                              Rp {formatRupiah(item.originalPrice)}
                            </span>
                            <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.2 rounded">
                              {item.discountPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-2.5 border border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQty(item.id)}
                              className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                              title="Kurangi box"
                              aria-label="Kurangi box"
                            >
                              –
                            </button>
                            <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] min-w-4 text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncreaseQty(item.id)}
                              className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                              title="Tambah box"
                              aria-label="Tambah box"
                            >
                              +
                            </button>
                          </div>

                          {checkoutItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                              title="Hapus produk ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dedicated Store Pickup Section for this store */}
                <div className="bg-[#fbfbf9] rounded-2xl p-4 sm:p-5 border border-gray-200/90 flex flex-col gap-3.5 mt-1">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200/70">
                    <Store className="w-4 h-4 text-gray-700" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                      Pengambilan Pesanan: {group.storeName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                    {/* Left: Store info & address */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1e2a22] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200 shadow-2xs select-none">
                          {group.storeAvatar && group.storeAvatar.startsWith('http') ? (
                            <img
                              src={group.storeAvatar}
                              alt={group.storeName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{group.storeName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1b1c1c]">
                            {group.storeName}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <span className="text-amber-500 font-bold">★ {group.rating}</span>
                            <span className="text-gray-400">({group.reviewCount} ulasan)</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {group.storeAddress}
                      </p>
                    </div>

                    {/* Right: Pickup Date & Operational Hours */}
                    <div className="flex flex-col gap-3">
                      {/* Tanggal Pickup (Tanggal Pemesanan) */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Tanggal Pickup
                        </label>
                        <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                          <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                          <span>{orderDateFormatted}</span>
                        </div>
                      </div>

                      {/* Waktu Pickup (Jam Toko) */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Waktu Pickup
                        </label>
                        <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                          <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                          <span>{group.operationalHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Light Green Alert Banner (tanpa emoji sprout) */}
                  <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 text-xs text-[#24521e] leading-relaxed">
                    <span>
                      Pesanan harus diambil langsung di lokasi {group.storeName} sesuai jadwal operasional yang tertera.
                    </span>
                  </div>
                </div>
              </section>
            ))}

            {/* CARD: Ringkasan Pembayaran */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FileText className="w-4 h-4 text-gray-700" />
                <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                  Ringkasan Pembayaran
                </h2>
              </div>

              {/* Item preview list for all products */}
              <div className="flex flex-col gap-2">
                {checkoutItems.map((item) => {
                  const parentGroup = storeGroups.find((g) =>
                    g.items.some((it) => it.id === item.id)
                  );
                  const sName = parentGroup?.storeName || item.storeName || 'Toko Mitra';
                  return (
                    <div
                      key={item.id}
                      className="bg-[#fbfbf9] border border-gray-150 rounded-2xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageSrc || cardMonsieurSpoon}
                          alt={item.name || ''}
                          className="w-11 h-11 rounded-xl object-cover border border-black/10 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] truncate">
                            {item.name?.replace(/\s+Reguler$/i, '')}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium truncate">
                            {sName} • {item.quantity} box
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-gray-900 shrink-0">
                        Rp {formatRupiah(item.rescuePrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown lines */}
              <div className="flex flex-col gap-2 text-xs text-gray-600 pt-1">
                <div className="flex items-center justify-between">
                  <span>Jumlah box</span>
                  <span className="font-semibold text-gray-900">{totalBoxes} box</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rp {formatRupiah(subtotal)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Total Diskon</span>
                    <span className="font-semibold text-[#e11d48]">
                      - Rp {formatRupiah(discountTotal)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Biaya layanan</span>
                    <span className="relative group inline-flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:text-gray-700 focus:outline-none transition-colors cursor-help p-0.5 rounded"
                        aria-label="Informasi biaya layanan"
                        title="Biaya layanan untuk pengembangan aplikasi"
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-[#1b1c1c] text-white text-[11px] leading-relaxed rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-20 text-center"
                      >
                        Biaya layanan untuk pengembangan dan pemeliharaan aplikasi RescueBite.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1b1c1c]" aria-hidden="true" />
                      </span>
                    </span>
                  </span>
                  <span className="font-semibold text-gray-900">Rp {formatRupiah(serviceFee)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
                <span className="font-bold text-sm text-[#1b1c1c]">Total Pembayaran</span>
                <span className="font-black text-2xl text-[#e11d48] font-display">
                  Rp {formatRupiah(grandTotal)}
                </span>
              </div>

              {/* Impact Card (tanpa logo sprout) */}
              <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 text-xs text-[#24521e]">
                <span className="leading-relaxed">
                  Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung bisnis lokal.
                </span>
              </div>
            </section>

            {/* CARD: Metode Pembayaran */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                  Metode Pembayaran
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Pembayaran Online */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${paymentMethod === 'online'
                    ? 'border-[#1f2620] bg-white shadow-xs'
                    : 'border-gray-200 bg-[#fbfbf9] hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'online'
                          ? 'border-[#1f2620] bg-[#1f2620]'
                          : 'border-gray-300 bg-white'
                          }`}
                      >
                        {paymentMethod === 'online' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1b1c1c]">
                        Pembayaran Online
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Bayar secara digital dengan metode pembayaran yang tersedia.
                      </p>
                    </div>
                  </div>

                  {/* Payment partner badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pl-7 pt-1">
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      QRIS
                    </span>
                    <span className="bg-[#00a5cf] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      GoPay
                    </span>
                    <span className="bg-[#118eea] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      DANA
                    </span>
                    <span className="bg-[#4c2a86] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      OVO
                    </span>
                    <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      ShopeePay
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium ml-1">
                      Lainnya ›
                    </span>
                  </div>
                </div>

                {/* Option 2: Bayar di Tempat */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${paymentMethod === 'cod'
                    ? 'border-[#1f2620] bg-white shadow-xs'
                    : 'border-gray-200 bg-[#fbfbf9] hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod'
                          ? 'border-[#1f2620] bg-[#1f2620]'
                          : 'border-gray-300 bg-white'
                          }`}
                      >
                        {paymentMethod === 'cod' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1b1c1c]">
                        Bayar di Tempat
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lakukan pembayaran saat mengambil pesanan di toko.
                      </p>
                    </div>
                  </div>

                  <ul className="text-xs text-gray-500 space-y-1 pl-7 pt-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>Bayar langsung ke kasir di lokasi toko.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>Pastikan datang sesuai jadwal pickup.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>Pesanan akan diproses setelah pembayaran dikonfirmasi.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bottom Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isSubmitting || totalBoxes === 0}
                className="w-full sm:w-auto min-w-55 py-3.5 px-6 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                id="btn-bayar-sekarang"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Bayar Sekarang →'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Footer */}
      <CustomerFooter
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Membuka live chat Customer Service RescueBite...');
        }}
      />
    </div>
  );
}

export default CustomerCheckout;
