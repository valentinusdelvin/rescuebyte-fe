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
import { CheckoutItem, CheckoutPayload, PaymentOrderData, CustomerOrderStatus } from '../types';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import {
  createCustomerOrder,
  checkoutOrderApi,
  fetchPaymentStatusApi,
  fetchOrderDetailApi,
  mapBackendStatusToCustomerStatus,
} from '../services/orderService';
import { getProductVariantId } from '../services/cartService';
import { getCurrentUser } from '../services/authService';
import { calculateDistanceKm, formatDistanceKm, getUserCoordinates } from '../services/locationService';
import { getAllStores, StoreProfileData } from '../services/storeService';
import { launchMidtransPayment } from '../services/midtransService';

export interface CustomerCheckoutProps {
  payload?: CheckoutPayload | null;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateCart?: () => void;
  onNavigateDetail?: () => void;
  onNavigateSeller?: () => void;
  onNavigatePayment?: (orderData: PaymentOrderData) => void;
  onNavigateOrderDetail?: (orderData: PaymentOrderData) => void;
  onNavigateOrders?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
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

function getApiPickupWindow(pickupHours: string): { start: string; end: string } {
  const match = pickupHours.match(/(\d{2})[.:](\d{2})\s*[–-]\s*(\d{2})[.:](\d{2})/);
  return {
    start: match ? `${match[1]}:${match[2]}:00` : '08:00:00',
    end: match ? `${match[3]}:${match[4]}:00` : '22:00:00',
  };
}

function getApiPickupDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function getApiCheckoutItems(items: CheckoutItem[]) {
  const apiItems: Array<{ product_variant_id: string; quantity: number }> = [];

  for (const item of items) {
    let variantId = item.variantId;
    if (!variantId && item.productId) {
      variantId = (await getProductVariantId(item.productId)) || undefined;
    }
    if (!variantId) {
      variantId = (await getProductVariantId(item.id)) || undefined;
    }
    if (!variantId) {
      throw new Error(`Varian produk ${item.name} tidak ditemukan di server.`);
    }
    apiItems.push({ product_variant_id: variantId, quantity: item.quantity });
  }

  return apiItems;
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
  onNavigateOrders,
  onShowToast,
}: CustomerCheckoutProps) {
  // Customer Info State from current user or defaults
  const currentUser = getCurrentUser();
  const [customerName, setCustomerName] = useState(() => currentUser?.name || 'Pengguna');
  const [customerPhone, setCustomerPhone] = useState(() => currentUser?.phone_number || '');
  const [customerEmail] = useState(() => currentUser?.email || '');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerPhoneError, setCustomerPhoneError] = useState('');
  const [isSnapPopupOpen, setIsSnapPopupOpen] = useState(false);

  // Items State directly from checkout payload
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(() => {
    if (payload && payload.items && payload.items.length > 0) {
      return payload.items;
    }
    return [];
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
          distanceText: (() => {
            if (item.distanceText) return item.distanceText;
            if (matchedStore?.latitude && matchedStore?.longitude) {
              const uCoords = getUserCoordinates();
              const distKm = calculateDistanceKm(uCoords.lat, uCoords.lng, Number(matchedStore.latitude), Number(matchedStore.longitude));
              return formatDistanceKm(distKm);
            }
            return '0.0 km';
          })(),
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

const handlePayNow = async () => {
    if (isSubmitting || isSnapPopupOpen) return;

    if (totalBoxes === 0) {
      if (onShowToast) onShowToast('Tidak ada item untuk dipesan.');
      return;
    }

    const checkoutCustomerPhone = customerPhone.trim();
    if (!checkoutCustomerPhone) {
      setCustomerPhoneError('Nomor HP wajib diisi untuk membuat pesanan. Pilih “Ubah Data” lalu isi nomor HP.');
      setIsEditingCustomer(true);
      if (onShowToast) onShowToast('Isi nomor HP terlebih dahulu agar pesanan bisa dibuat.', 'error');
      return;
    }
    setCustomerPhoneError('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      if (onShowToast) onShowToast('Silakan masuk terlebih dahulu sebelum membuat pesanan.', 'error');
      return;
    }

    setIsSubmitting(true);
    const successfulOrders: PaymentOrderData[] = [];

    try {
      if (storeGroups.length === 0) {
        throw new Error('Toko untuk pesanan ini tidak ditemukan.');
      }

      for (const group of storeGroups) {
        if (!group.storeId || group.storeId.startsWith('store-')) {
          throw new Error(`Toko ${group.storeName} belum terhubung ke server.`);
        }

        const apiItems = await getApiCheckoutItems(group.items);
        const { start, end } = getApiPickupWindow(group.operationalHours);
        const checkoutRes = await checkoutOrderApi({
          store_id: group.storeId,
          customer_name: customerName,
          customer_phone: checkoutCustomerPhone,
          customer_email: customerEmail,
          payment_method: paymentMethod === 'online' ? 'ONLINE' : 'CASH_ON_PICKUP',
          pickup_date: getApiPickupDate(),
          pickup_time_start: start,
          pickup_time_end: end,
          items: apiItems,
        });
        if (!checkoutRes?.order) {
          throw new Error(`Server belum mengonfirmasi pesanan untuk ${group.storeName}.`);
        }

        const backendOrder = checkoutRes.order;
        const groupBoxes = group.items.reduce((sum, item) => sum + item.quantity, 0);
        const groupSubtotal = group.items.reduce((sum, item) => sum + item.rescuePrice * item.quantity, 0);
        const groupOriginal = group.items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
        const finalStatus: CustomerOrderStatus = paymentMethod === 'online'
          ? 'menunggu-pembayaran'
          : mapBackendStatusToCustomerStatus(backendOrder.status);

        const orderData: PaymentOrderData = {
          orderId: backendOrder.order_number || backendOrder.id,
          backendOrderId: backendOrder.id,
          items: group.items,
          primaryStore: {
            storeId: backendOrder.store_id || group.storeId,
            storeName: group.storeName,
            storeAvatar: group.storeAvatar,
            storeAddress: group.storeAddress,
            rating: group.rating,
            reviewCount: group.reviewCount,
          },
          pickupDate: backendOrder.pickup_date || orderDateFormatted,
          pickupTimeSlot: backendOrder.pickup_time || group.operationalHours,
          customerInfo: {
            name: customerName,
            phone: checkoutCustomerPhone,
            email: customerEmail,
          },
          totalBoxes: groupBoxes,
          subtotal: backendOrder.subtotal ?? groupSubtotal,
          discountTotal: backendOrder.total_discount ?? Math.max(0, groupOriginal - groupSubtotal),
          serviceFee: backendOrder.service_fee ?? 2000,
          grandTotal: backendOrder.total_amount ?? groupSubtotal + 2000,
          source: payload?.source,
          status: finalStatus,
          snapToken: checkoutRes.snap_token || (backendOrder as any)?.payment?.snap_token,
          snapRedirectUrl: checkoutRes.snap_redirect_url || (backendOrder as any)?.payment?.snap_redirect_url,
          createdAt: backendOrder.created_at,
        };

        // Backend checkout is the source of truth for stock; this only saves the order view/cache.
        createCustomerOrder(orderData, finalStatus);
        successfulOrders.push(orderData);
      }

      if (successfulOrders.length > 1) {
        if (onShowToast) {
          onShowToast(`Pesanan berhasil dibuat untuk ${successfulOrders.length} toko! Membuka Pesanan Saya...`, 'success');
        }
        setTimeout(() => {
          setIsSubmitting(false);
          if (onNavigateOrders) onNavigateOrders();
          else window.location.assign('#pesanan-saya');
        }, 350);
        return;
      }

      const orderData = successfulOrders[0];
      setIsSubmitting(false);
      if (paymentMethod === 'online') {
        const goToPendingOrder = (message?: string) => {
          if (message && onShowToast) onShowToast(message, 'info');
          if (onNavigateOrderDetail) onNavigateOrderDetail(orderData);
          else if (onNavigatePayment) onNavigatePayment(orderData);
          else if (onNavigateOrders) onNavigateOrders();
        };

        const confirmPaidOrder = async () => {
          if (!orderData.backendOrderId) {
            goToPendingOrder('Pembayaran belum dapat diverifikasi karena ID order backend tidak tersedia.');
            return;
          }

          let paymentVerified = false;
          let paidStatus: CustomerOrderStatus = 'menunggu-konfirmasi';
          for (let attempt = 0; attempt < 6; attempt++) {
            const [paymentState, latest] = await Promise.all([
              fetchPaymentStatusApi(orderData.backendOrderId),
              fetchOrderDetailApi(orderData.backendOrderId),
            ]);
            const latestStatus = String(latest?.status || '').toUpperCase();
            const orderHasConfirmedPayment = [
              'PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS',
              'WAITING_CONFIRMATION', 'WAITING_FOR_CONFIRMATION', 'IN_PROCESS', 'PROCESSING',
              'READY_FOR_PICKUP', 'COMPLETED', 'FINISHED',
            ].includes(latestStatus);
            if (paymentState === 'paid' || orderHasConfirmedPayment) {
              paymentVerified = true;
              if (orderHasConfirmedPayment && latest?.status) {
                paidStatus = mapBackendStatusToCustomerStatus(latest.status);
              }
              break;
            }
            if (paymentState === 'failed') break;
            if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          if (!paymentVerified) {
            goToPendingOrder('Midtrans belum terkonfirmasi di backend. Pesanan tetap menunggu pembayaran dan bisa diperiksa lagi dari detail pesanan.');
            return;
          }

          const paidOrder: PaymentOrderData = {
            ...orderData,
            status: paidStatus,
            paymentConfirmedByGateway: true,
          };
          createCustomerOrder(paidOrder, paidStatus);
          if (onShowToast) onShowToast('Pembayaran berhasil diverifikasi backend. Pesanan menunggu konfirmasi toko.', 'success');
          if (onNavigateOrderDetail) onNavigateOrderDetail(paidOrder);
          else if (onNavigatePayment) onNavigatePayment(paidOrder);
          else if (onNavigateOrders) onNavigateOrders();
        };

        try {
          setIsSnapPopupOpen(true);
          launchMidtransPayment(orderData.snapToken, {
            onSuccess: () => {
              setIsSnapPopupOpen(false);
              return confirmPaidOrder();
            },
            onPending: () => {
              setIsSnapPopupOpen(false);
              goToPendingOrder('Pembayaran masih menunggu. Kamu bisa melanjutkannya dari detail pesanan.');
            },
            onError: () => {
              setIsSnapPopupOpen(false);
              goToPendingOrder('Pembayaran belum berhasil. Pesanan tersimpan dan bisa dibayar lagi dari detail pesanan.');
            },
            onClose: () => {
              setIsSnapPopupOpen(false);
              goToPendingOrder('Pesanan tersimpan dengan status menunggu pembayaran.');
            },
          });
        } catch (err) {
          setIsSnapPopupOpen(false);
          const message = err instanceof Error ? err.message : 'Pembayaran Midtrans belum bisa dibuka.';
          goToPendingOrder(message);
        }
      } else {
        if (onShowToast) onShowToast('Pesanan berhasil dibuat! Menunggu konfirmasi toko.', 'success');
        setTimeout(() => {
          if (onNavigateOrderDetail) onNavigateOrderDetail(orderData);
          else if (onNavigatePayment) onNavigatePayment(orderData);
        }, 300);
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat pesanan.';
      if (successfulOrders.length > 0) {
        if (onShowToast) {
          onShowToast(`${successfulOrders.length} pesanan berhasil; pesanan lainnya gagal. Buka Riwayat Pesanan untuk melihat yang berhasil.`, 'warning');
        }
        if (onNavigateOrders) onNavigateOrders();
        else window.location.assign('#pesanan-saya');
      } else if (onShowToast) {
        onShowToast(errorMessage, 'error');
      }
    }
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
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (e.target.value.trim()) setCustomerPhoneError('');
                    }}
                    disabled={!isEditingCustomer}
                    autoComplete="tel"
                    aria-invalid={Boolean(customerPhoneError)}
                    aria-describedby={customerPhoneError ? 'checkout-phone-error' : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${customerPhoneError ? 'border-[#ba1a1a]' : 'border-gray-200'} bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors`}
                  />
                  {customerPhoneError && (
                    <p id="checkout-phone-error" className="mt-1.5 text-xs text-[#ba1a1a]" role="alert">
                      {customerPhoneError}
                    </p>
                  )}
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
                            <span>{item.distanceText || group.distanceText || '0.0 km'}</span>
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
                disabled={isSubmitting || isSnapPopupOpen || totalBoxes === 0}
                className="w-full sm:w-auto min-w-55 py-3.5 px-6 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                id="btn-bayar-sekarang"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Pesanan...' : isSnapPopupOpen ? 'Popup pembayaran terbuka…' : 'Bayar Sekarang →'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Footer */}
      <CustomerFooter variant="compact"
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Membuka live chat Customer Service RescueBite...');
        }}
      />
    </div>
  );
}

export default CustomerCheckout;
