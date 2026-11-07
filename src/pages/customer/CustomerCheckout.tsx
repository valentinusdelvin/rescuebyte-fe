import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { extractErrorMessage } from '../../api/client';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerFooter } from '../../components/customer/CustomerFooter';
import { CheckoutItem, CheckoutPayload, PaymentOrderData, CustomerOrderStatus } from '../../types';
import {
  createCustomerOrder,
  checkoutOrderApi,
  fetchPaymentStatusApi,
  fetchOrderDetailApi,
  mapBackendStatusToCustomerStatus,
} from '../../services/orderService';
import { getProductVariantId } from '../../services/cartService';
import { getCurrentUser } from '../../services/authService';
import { calculateDistanceKm, formatDistanceKm, getUserCoordinates } from '../../services/locationService';
import { getAllStores, StoreProfileData } from '../../services/storeService';
import { launchMidtransPayment } from '../../services/midtransService';
import { formatRupiah } from '../../utils/currency';
import {
  CheckoutContactForm,
  CheckoutItemsList,
  CheckoutPaymentMethod,
  CheckoutSummary,
  StoreCheckoutGroup,
  PaymentMethod,
} from '../../components/customer/checkout';

export type { StoreCheckoutGroup, PaymentMethod };

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
          onShowToast(`Pesanan berhasil dibuat untuk ${successfulOrders.length} toko! Membuka Riwayat Pesanan...`, 'success');
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
          const message = extractErrorMessage(err, 'Pembayaran belum bisa dibuka. Pesanan tersimpan dan bisa dibayar lagi dari detail pesanan.');
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
      const errorMessage = extractErrorMessage(err, 'Gagal membuat pesanan. Periksa kembali detail pesanan lalu coba lagi.');
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
    if (tab === 'beranda') {
      if (onNavigateHome) onNavigateHome();
      else window.location.hash = '#beranda-customer';
    } else if (tab === 'marketplace') {
      if (onNavigateMarketplace) onNavigateMarketplace();
      else window.location.hash = '#marketplace';
    } else if (tab === 'kontak') {
      window.location.hash = '#kontak';
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
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 max-sm:pb-28">
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
            <CheckoutContactForm
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerPhoneError={customerPhoneError}
              setCustomerPhoneError={setCustomerPhoneError}
              customerEmail={customerEmail}
              isEditingCustomer={isEditingCustomer}
              setIsEditingCustomer={setIsEditingCustomer}
            />

            {/* Store Checkout Groups & Item list */}
            <CheckoutItemsList
              storeGroups={storeGroups}
              orderDateFormatted={orderDateFormatted}
              totalCheckoutItemsCount={checkoutItems.length}
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
              onRemoveItem={handleRemoveItem}
              onChangeOrder={() => {
                if (payload?.source === 'cart' && onNavigateCart) {
                  onNavigateCart();
                } else if (onNavigateDetail) {
                  onNavigateDetail();
                } else if (onNavigateCart) {
                  onNavigateCart();
                }
              }}
            />

            {/* Payment Method Selection */}
            <CheckoutPaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            {/* Order Summary & Desktop Pay Button */}
            <CheckoutSummary
              checkoutItems={checkoutItems}
              storeGroups={storeGroups}
              subtotal={subtotal}
              discountTotal={discountTotal}
              serviceFee={serviceFee}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              isSnapPopupOpen={isSnapPopupOpen}
              onPayNow={handlePayNow}
            />
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Conversion Action Bar */}
      {totalBoxes > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                Total Pembayaran
              </span>
              <span className="font-black text-lg text-[#e11d48]">
                Rp {formatRupiah(grandTotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isSubmitting || isSnapPopupOpen}
              className="py-3 px-5 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed select-none min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Footer */}
      <CustomerFooter variant="compact"
        onNavigateSeller={onNavigateSeller}
      />
    </div>
  );
}

export default CustomerCheckout;
