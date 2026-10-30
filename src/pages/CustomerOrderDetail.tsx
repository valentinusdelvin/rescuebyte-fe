import { useState, useMemo, useEffect } from 'react';
import {
  Check,
  Clock,
  UserCheck,
  MapPin,
  ExternalLink,
  Star,
  RefreshCw,
  ArrowLeft,
  Info,
  X,
  MessageSquare,
  Calendar,
  Tag,
  ClipboardList,
  CreditCard,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { PaymentOrderData, CustomerOrderStatus } from '../types';
import {
  fetchOrderDetailApi,
  fetchPaymentDetailsApi,
  fetchPaymentStatusApi,
  mapBackendStatusToCustomerStatus,
  updateCustomerOrderStatus,
  createCustomerOrder,
  subscribeToCustomerOrders,
  getCustomerOrders,
} from '../services/orderService';
import { getPublicProducts, PublicProductItem } from '../services/productService';
import { getUserCoordinates } from '../services/locationService';
import { getCurrentUser } from '../services/authService';
import { launchMidtransPayment } from '../services/midtransService';
import { getStoreById, StoreProfileData } from '../services/storeService';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';

import saladStopCard from '../assets/customer/card-saladstop.jpg';

export interface CustomerOrderDetailProps {
  orderData?: PaymentOrderData | null;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateOrders?: () => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatPickupDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function hasConfirmedPayment(orderStatus: unknown): boolean {
  const status = String(orderStatus || '').toUpperCase();
  return [
    'PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS',
    'WAITING_CONFIRMATION', 'WAITING_FOR_CONFIRMATION', 'IN_PROCESS', 'PROCESSING',
    'READY_FOR_PICKUP', 'COMPLETED', 'FINISHED',
  ].includes(status);
}

export function CustomerOrderDetail({
  orderData,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateOrders,
  onNavigateStore,
  onNavigateSeller,
  onShowToast,
}: CustomerOrderDetailProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isSnapPopupOpen, setIsSnapPopupOpen] = useState(false);
  const [isPaymentSessionLoading, setIsPaymentSessionLoading] = useState(false);
  const [retrievedPayment, setRetrievedPayment] = useState<{
    backendOrderId: string;
    snapToken?: string;
  } | null>(null);
  const [storeProfile, setStoreProfile] = useState<StoreProfileData | null>(null);
  const [recommendations, setRecommendations] = useState<PublicProductItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const coords = getUserCoordinates();
    getPublicProducts({ latitude: coords.lat, longitude: coords.lng })
      .then((items) => {
        if (!isMounted || !items) return;
        setRecommendations(items.slice(0, 3));
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, []);


  const effectiveOrderData = useMemo<PaymentOrderData | null>(() => {
    if (orderData) return orderData;
    const all = getCustomerOrders();
    if (all.length > 0) {
      const latest = all[0];
      if (latest.orderData) return latest.orderData;
      return {
        orderId: latest.orderNumber,
        items: [
          {
            id: latest.id,
            name: latest.productName,
            storeName: latest.storeName,
            storeAddress: latest.storeAddress,
            rescuePrice: latest.finalPrice,
            quantity: latest.productBoxCount,
            categoryTags: ['Penyelamatan Pangan'],
            imageSrc: latest.imageUrl || cardMonsieurSpoon,
          },
        ],
        primaryStore: {
          storeId: latest.storeId,
          storeName: latest.storeName,
          storeAddress: latest.storeAddress,
        },
        pickupDate: latest.pickupDate,
        pickupTimeSlot: latest.pickupTime,
        customerInfo: {
          name: getCurrentUser()?.name || 'Pelanggan RescueByte',
          phone: getCurrentUser()?.phone_number || '081234567890',
          email: getCurrentUser()?.email || 'customer@rescuebyte.com',
        },
        totalBoxes: latest.productBoxCount,
        subtotal: latest.finalPrice,
        grandTotal: latest.finalPrice,
        status: latest.status,
        createdAt: latest.createdAt,
      } as PaymentOrderData;
    }
    return null;
  }, [orderData]);

  const profileStoreId = effectiveOrderData?.primaryStore?.storeId;
  useEffect(() => {
    let isMounted = true;
    setStoreProfile(null);
    if (!profileStoreId) return () => { isMounted = false; };

    getStoreById(profileStoreId).then((profile) => {
      if (isMounted) setStoreProfile(profile);
    });
    return () => { isMounted = false; };
  }, [profileStoreId]);

  const [currentStatus, setCurrentStatus] = useState<CustomerOrderStatus>(() => {
    const s = effectiveOrderData?.status || orderData?.status;
    if (s === 'menunggu-pembayaran' || s === 'menunggu-konfirmasi' || s === 'diproses' || s === 'siap-diambil' || s === 'selesai' || s === 'dibatalkan') {
      return s;
    }
    if (effectiveOrderData?.snapRedirectUrl || effectiveOrderData?.snapToken) {
      return 'menunggu-pembayaran';
    }
    return 'menunggu-konfirmasi';
  });

  useEffect(() => {
    const data = effectiveOrderData || orderData;
    if (data?.status) {
      const s = data.status;
      if (s === 'menunggu-pembayaran' || s === 'menunggu-konfirmasi' || s === 'diproses' || s === 'siap-diambil' || s === 'selesai' || s === 'dibatalkan') {
        setCurrentStatus(s);
      }
    }
    const backendOrderId = data?.backendOrderId;
    if (!backendOrderId) return;

    const needsSnapToken = !data.snapToken;
    if (needsSnapToken) setIsPaymentSessionLoading(true);
    let cancelled = false;
    let statusPollId: number | undefined;

    const refreshOrderStatus = async (includePaymentDetails: boolean) => {
      const latest = await fetchOrderDetailApi(backendOrderId);
      const payment = includePaymentDetails
        ? await fetchPaymentDetailsApi(backendOrderId)
        : null;
      if (cancelled) return null;

      const snapToken = payment?.snap_token || latest?.payment?.snap_token || latest?.snap_token;
      if (snapToken) {
        setRetrievedPayment({ backendOrderId, snapToken });
      }

      if (!latest?.status) return null;

      const backendStatus = mapBackendStatusToCustomerStatus(latest.status);
      if (!(data.paymentConfirmedByGateway && backendStatus === 'menunggu-pembayaran')) {
        setCurrentStatus(backendStatus);
      }
      return backendStatus;
    };

    const loadInitialStatus = async () => {
      const attempts = data.paymentConfirmedByGateway ? 6 : 1;
      let latestStatus: CustomerOrderStatus | null = null;
      try {
        for (let attempt = 0; attempt < attempts; attempt++) {
          latestStatus = await refreshOrderStatus(true);
          if (cancelled || (latestStatus && latestStatus !== 'menunggu-pembayaran')) break;
          if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        if (!cancelled && needsSnapToken) setIsPaymentSessionLoading(false);
      }

      const pollOrderStatus = async () => {
        const status = await refreshOrderStatus(false);
        if (!cancelled && status !== 'selesai' && status !== 'dibatalkan') {
          statusPollId = window.setTimeout(() => void pollOrderStatus(), 5000);
        }
      };

      if (!cancelled && latestStatus !== 'selesai' && latestStatus !== 'dibatalkan') {
        statusPollId = window.setTimeout(() => void pollOrderStatus(), 5000);
      }
    };

    void loadInitialStatus();
    return () => {
      cancelled = true;
      if (statusPollId) window.clearTimeout(statusPollId);
    };
  }, [effectiveOrderData, orderData]);

  const orderId = effectiveOrderData?.orderId || orderData?.orderId || 'RB261030-001';

  // Active step in tracking timeline (1 to 5) determined purely by live database status
  useEffect(() => {
    return subscribeToCustomerOrders((orders) => {
      const targetId = orderId || effectiveOrderData?.orderId || orderData?.orderId;
      if (!targetId) return;
      const found = orders.find((o) => o.orderNumber === targetId || o.id === targetId);
      if (found?.status) {
        setCurrentStatus(found.status);
      }
    });
  }, [orderId, effectiveOrderData?.orderId, orderData?.orderId]);

  const activeStep = useMemo(() => {
    if (currentStatus === 'menunggu-pembayaran') return 1;
    if (currentStatus === 'menunggu-konfirmasi') return 2;
    if (currentStatus === 'diproses') return 3;
    if (currentStatus === 'siap-diambil') return 4;
    if (currentStatus === 'selesai') return 5;
    if (currentStatus === 'dibatalkan') return 1;
    return 2;
  }, [currentStatus]);

  const handlePaymentSuccess = async () => {
    const targetData = effectiveOrderData || orderData;
    const backendOrderId = targetData?.backendOrderId;
    if (!backendOrderId) {
      onShowToast?.('Pesanan ini belum memiliki ID backend, jadi status pembayaran belum bisa diverifikasi.', 'error');
      return;
    }

    setIsVerifyingPayment(true);
    try {
      let verifiedStatus: CustomerOrderStatus = 'menunggu-konfirmasi';
      let paymentVerified = false;
      let latestPaymentState: Awaited<ReturnType<typeof fetchPaymentStatusApi>> = 'unknown';
      for (let attempt = 0; attempt < 6; attempt++) {
        const [paymentState, latestOrder] = await Promise.all([
          fetchPaymentStatusApi(backendOrderId),
          fetchOrderDetailApi(backendOrderId),
        ]);
        latestPaymentState = paymentState;
        if (paymentState === 'paid' || hasConfirmedPayment(latestOrder?.status)) {
          paymentVerified = true;
          if (latestOrder?.status && hasConfirmedPayment(latestOrder.status)) {
            verifiedStatus = mapBackendStatusToCustomerStatus(latestOrder.status);
          }
          break;
        }
        if (paymentState === 'failed') break;
        if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!paymentVerified) {
        setCurrentStatus('menunggu-pembayaran');
        if (latestPaymentState === 'failed') {
          onShowToast?.('Midtrans melaporkan pembayaran gagal atau kedaluwarsa. Pesanan tetap menunggu pembayaran; silakan coba lagi.', 'warning');
        } else if (latestPaymentState === 'pending') {
          onShowToast?.('Pembayaran masih diproses Midtrans. Status pesanan tetap menunggu pembayaran sampai backend mengonfirmasi.', 'info');
        } else {
          onShowToast?.('Backend belum mengonfirmasi pembayaran. Status pesanan tetap menunggu pembayaran; coba periksa lagi sebentar.', 'info');
        }
        return;
      }

      setCurrentStatus(verifiedStatus);
      if (targetData) {
        createCustomerOrder(
          { ...targetData, status: verifiedStatus, paymentConfirmedByGateway: true },
          verifiedStatus
        );
      }
      onShowToast?.('Pembayaran berhasil diverifikasi oleh backend. Menunggu konfirmasi toko mitra.', 'success');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  useEffect(() => {
    if (currentStatus === 'menunggu-konfirmasi') {
      const targetId = orderId || effectiveOrderData?.orderId || orderData?.orderId;
      const targetData = effectiveOrderData || orderData;
      if (targetId && targetData) {
        const updated = updateCustomerOrderStatus(targetId, 'menunggu-konfirmasi');
        if (!updated) {
          createCustomerOrder(
            {
              ...targetData,
              status: 'menunggu-konfirmasi',
            },
            'menunggu-konfirmasi'
          );
        }
      }
    }
  }, [currentStatus, orderId, effectiveOrderData, orderData]);

  const activeData = effectiveOrderData || orderData;
  const paymentSnapToken = activeData?.snapToken || (
    retrievedPayment?.backendOrderId === activeData?.backendOrderId
      ? retrievedPayment?.snapToken
      : undefined
  );
  const items = activeData?.items && activeData.items.length > 0 ? activeData.items : null;
  const primaryItem = items?.[0];

  const itemName = primaryItem?.name || 'Paket Makanan Surplus';
  const storeName = storeProfile?.name || activeData?.primaryStore?.storeName || primaryItem?.storeName || 'Mitra F&B';
  const profileAddress = [storeProfile?.address, storeProfile?.district, storeProfile?.city]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ');
  const storeAddress = profileAddress || activeData?.primaryStore?.storeAddress || '';
  const storeAvatar = storeProfile?.profile_picture_url || activeData?.primaryStore?.storeAvatar || storeName.slice(0, 2).toUpperCase();
  const profilePickupHours = storeProfile?.operational_start && storeProfile?.operational_end
    ? `${storeProfile.operational_start.slice(0, 5).replace(':', '.')}–${storeProfile.operational_end.slice(0, 5).replace(':', '.')} WIB`
    : '';
  const pickupSchedule = [formatPickupDate(activeData?.pickupDate), activeData?.pickupTimeSlot || profilePickupHours]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' | ');

  const recipientName = activeData?.customerInfo?.name || getCurrentUser()?.name || 'Pengguna';
  const totalBoxes = activeData?.totalBoxes || primaryItem?.quantity || 1;

  const originalUnitPrice = primaryItem?.originalPrice || 40000;
  const rescueUnitPrice = primaryItem?.rescuePrice || 20000;
  const discountPercent = primaryItem?.discountPercent || 50;

  const totalOriginalPrice =
    activeData?.discountTotal != null && activeData?.subtotal != null
      ? activeData.subtotal + activeData.discountTotal
      : originalUnitPrice * totalBoxes;
  const totalRescuePrice = activeData?.subtotal ?? rescueUnitPrice * totalBoxes;
  const discountAmount = activeData?.discountTotal ?? Math.max(0, totalOriginalPrice - totalRescuePrice);

  const serviceFee = activeData?.serviceFee ?? 2000;
  const grandTotal = activeData?.grandTotal ?? (totalRescuePrice + serviceFee);

  const orderCreatedAt = activeData?.createdAt;

  const orderTimeFormatted = useMemo(() => {
    if (orderCreatedAt) {
      const d = new Date(orderCreatedAt);
      if (!Number.isNaN(d.getTime())) {
        const day = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
        return `${day} • ${time} WIB`;
      }
    }
    return '';
  }, [orderCreatedAt]);

  const TIMELINE_STEPS = useMemo(() => [
    {
      step: 1,
      title: '1. Pesanan Dibuat',
      desc: orderTimeFormatted || 'Tercatat di sistem',
    },
    {
      step: 2,
      title: '2. Pembayaran',
      desc: activeStep >= 2 ? (currentStatus === 'menunggu-konfirmasi' ? 'Terverifikasi' : 'Lunas') : '',
    },
    {
      step: 3,
      title: '3. Dikonfirmasi',
      desc: activeStep >= 3 ? 'Dikonfirmasi Toko' : '',
    },
    {
      step: 4,
      title: '4. Siap Diambil',
      desc: activeStep >= 4 ? 'Di Rak Khusus' : '',
    },
    {
      step: 5,
      title: '5. Selesai',
      desc: activeStep >= 5 ? 'Pesanan Selesai' : '',
    },
  ], [activeStep, orderTimeFormatted, currentStatus]);

  const completionTimestamp = useMemo(() => {
    if (orderCreatedAt) {
      const d = new Date(orderCreatedAt);
      if (!Number.isNaN(d.getTime())) {
        return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      }
    }
    return 'Waktu belum tersedia';
  }, [orderCreatedAt]);

  const fullOrderDate = useMemo(() => {
    if (orderCreatedAt) {
      const d = new Date(orderCreatedAt);
      if (!Number.isNaN(d.getTime())) {
        return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      }
    }
    return 'Tanggal belum tersedia';
  }, [orderCreatedAt]);

  const statusConfig = useMemo(() => {
    switch (activeStep) {
      case 1:
        return {
          badgeText: 'Perlu Dibayar',
          badgeClass: 'border border-[#d94a38] text-[#d94a38] bg-[#fdeceb]',
          title: 'Selesaikan Pembayaran Pesananmu',
          description: (
            <>
              Pesanan paket surplus dari{' '}
              <strong className="text-slate-800 font-semibold">{storeName}</strong> sudah berhasil dibuat. Selesaikan
              pembayaranmu melalui Midtrans agar mitra toko dapat memproses pesanan setelah pembayaran terverifikasi.
            </>
          ),
          timeLabel: '',
          timeValue: '',
          timelineNote: 'Pesanan telah dibuat dan menunggu penyelesaian pembayaran dari pelanggan.',
        };
      case 2:
        return {
          badgeText: 'Pembayaran Diterima',
          badgeClass: 'bg-[#dcfce7] text-[#14532d] border border-emerald-200/60',
          title: 'Pesanan Berhasil Dibayar',
          description: (
            <>
              Pembayaran sebesar <strong className="text-slate-800 font-semibold">Rp {formatRupiah(grandTotal)}</strong>{' '}
              telah diverifikasi oleh sistem. Pesananmu sedang diteruskan ke pihak{' '}
              <strong className="text-slate-800 font-semibold">{storeName}</strong> untuk segera dikonfirmasi.
            </>
          ),
          timeLabel: 'Waktu Pembayaran',
          timeValue: orderTimeFormatted || 'Hari ini, Pembayaran Terverifikasi',
          timelineNote: `Pembayaran terverifikasi dan pesanan sedang diteruskan ke ${storeName}.`,
        };
      case 3:
        return {
          badgeText: 'Pesanan Dikonfirmasi',
          badgeClass: 'bg-[#dcfce7] text-[#14532d] border border-emerald-200/60',
          title: 'Pesanan Telah Dikonfirmasi Toko',
          description: (
            <>
              Pihak <strong className="text-slate-800 font-semibold">{storeName}</strong> telah mengonfirmasi pesananmu
              dan mulai menyiapkan paket makanan surplusmu. Status akan otomatis diperbarui begitu paket siap diambil.
            </>
          ),
          timeLabel: 'Waktu Konfirmasi',
          timeValue: orderTimeFormatted || 'Hari ini, Telah Dikonfirmasi',
          timelineNote: 'Mitra toko telah mengonfirmasi pesanan dan sedang menyiapkannya.',
        };
      case 4:
        return {
          badgeText: 'Siap Diambil di Lokasi',
          badgeClass: 'bg-[#dcfce7] text-[#14532d] border border-emerald-200/60',
          title: 'Pesanan Siap Diambil!',
          description: (
            <>
              Paket makanan surplusmu sudah selesai disiapkan di gerai{' '}
              <strong className="text-slate-800 font-semibold">{storeName}</strong>. Silakan datang ke toko sesuai jadwal
              pengambilan dan tunjukkan nomor pesanan ini ke staf kasir.
            </>
          ),
          timeLabel: 'Jadwal Pengambilan',
          timeValue: 'Hari ini, 15:00 - 16:30 WIB',
          timelineNote: 'Paket makanan surplus sudah siap di rak khusus. Silakan datang ke toko untuk mengambilnya.',
        };
      case 5:
      default:
        return {
          badgeText: '100% Berhasil Diselamatkan',
          badgeClass: 'bg-[#86efac] text-[#14532d]',
          title: 'Pesanan Telah Berhasil Diambil!',
          description: (
            <>
              Terima kasih telah menyelamatkan {totalBoxes} porsi makanan surplus bermutu tinggi dari{' '}
              <strong className="text-slate-800 font-semibold">{storeName}</strong>. Kontribusimu langsung memutus
              rantai emisi gas rumah kaca di area Jakarta Selatan.
            </>
          ),
          timeLabel: 'Waktu Selesai',
          timeValue: completionTimestamp,
          timelineNote: `Seluruh 5 tahap telah selesai dan diverifikasi oleh sistem loket ${storeName}.`,
        };
    }
  }, [activeStep, storeName, grandTotal, totalBoxes, completionTimestamp, orderTimeFormatted]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setIsReviewModalOpen(false);
      setIsReviewSubmitted(true);
      onShowToast?.('Terima kasih! Ulasan kamu berhasil dikirim.', 'success');
    }, 600);
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between selection:bg-[#bbf381] selection:text-[#0e2000]">
      <div>
        <CustomerHeader
          activeTab="marketplace"
          onNavigateHome={onNavigateHome}
          onSelectTab={(tab) => {
            if (tab === 'beranda') {
              if (onNavigateHome) onNavigateHome();
              else window.location.hash = '#beranda-customer';
            } else if (tab === 'marketplace') {
              window.location.hash = '#marketplace';
            } else if (tab === 'kontak') {
              window.location.hash = '#kontak';
            }
          }}
          onNavigateSeller={onNavigateSeller}
          onNavigateOrders={onNavigateOrders}
          onShowToast={onShowToast}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-6">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#1b1c1c] transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Profil
            </button>
            <span aria-hidden="true" className="text-slate-400">&gt;</span>
            <button
              type="button"
              onClick={onNavigateOrders}
              className="hover:text-[#1b1c1c] transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Riwayat Pesanan
            </button>
            <span aria-hidden="true" className="text-slate-400">&gt;</span>
            <span className="text-slate-800 font-medium">Detail Pesanan</span>
          </nav>

          {/* Page Heading & Transaction Meta */}
          <section className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1b1c1c] tracking-tight">
              Detail Pesanan
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs sm:text-sm text-slate-500">
              <span className="font-semibold text-slate-700">#{orderId}</span>
              <span aria-hidden="true" className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{fullOrderDate}</span>
              </span>
            </div>
          </section>

          {/* Status Banner */}
          <section className="bg-linear-to-r from-[#edf9ef] via-[#f2faf3] to-[#edf9ef] border border-emerald-200/90 rounded-3xl p-5 sm:p-7 shadow-xs mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-6 h-6 stroke-3" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusConfig.badgeClass}`}>
                      {statusConfig.badgeText}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1b1c1c]">
                    {statusConfig.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    {statusConfig.description}
                  </p>
                </div>
              </div>

              {/* Verified Recipient & Timestamp Card */}
              <div className="w-full lg:w-auto bg-white/90 border border-emerald-100 rounded-2xl p-4 shadow-xs shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-57.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <UserCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">Penerima Resmi</p>
                    <p className="text-sm font-bold text-[#1b1c1c]">{recipientName}</p>
                  </div>
                </div>
                {statusConfig.timeLabel && statusConfig.timeValue && (
                  <div className="flex items-center gap-3 pt-2 sm:pt-0 lg:pt-2 border-t sm:border-t-0 lg:border-t border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Clock className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">{statusConfig.timeLabel}</p>
                      <p className="text-sm font-bold text-[#1b1c1c]">{statusConfig.timeValue}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Order Tracking Timeline */}
          <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1b1c1c]">Jejak Status Pesanan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {statusConfig.timelineNote}
              </p>
            </div>

            {/* Step Progress Track */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
              {/* Connector line for large screens */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-3.5 sm:top-4 left-[10%] right-[10%] h-1 bg-[#1e2a22] z-0"
              />
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-3.5 sm:top-4 left-[10%] h-1 bg-[#16a34a] z-0 transition-all duration-300"
                style={{
                  width: `${((activeStep - 1) / 4) * 80}%`,
                }}
              />

              {TIMELINE_STEPS.map((item) => {
                const isCompleted = item.step <= activeStep;
                return (
                  <div
                    key={item.step}
                    className="relative z-10 flex flex-col items-center text-center select-none p-1 pointer-events-none"
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all select-none ${isCompleted
                          ? 'bg-[#16a34a] text-white shadow-xs'
                          : 'bg-[#1e2a22] text-transparent'
                        }`}
                    >
                      {isCompleted && (
                        <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#1b1c1c]">{item.title}</p>
                    {item.desc ? (
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Feedback & Review Prompt Card */}
          <section className="bg-[#fffbf0] border border-[#fde68a] rounded-3xl p-5 sm:p-6 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#fed7aa] text-[#c2410c] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1b1c1c]">Bagaimana Pengalamanmu?</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                    Bagikan ulasanmu saat menikmati hidangan dari {storeName}. Pendapatmu membantu
                    pelanggan lain menemukan pangan surplus bermutu dan memberi apresiasi kepada mitra toko.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-3 self-start md:self-auto shrink-0">
                <div className="flex items-center gap-1" aria-label="Beri rating bintang">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setSelectedRating(star);
                        setIsReviewModalOpen(true);
                      }}
                      className="text-amber-400 hover:text-amber-500 transition p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                      title={`Beri ${star} bintang`}
                    >
                      <Star
                        className={`w-5 h-5 ${star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                          }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span>{isReviewSubmitted ? 'Ubah Ulasan' : 'Beri Ulasan Sekarang'}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          {/* Two-Column Grid: Saved Goods & Partner vs Payment & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Card 1: Barang yang Diselamatkan */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Barang yang Diselamatkan</h3>
                </div>

                <div className="flex flex-col gap-4">
                  {(items || [primaryItem]).map((item, idx) => {
                    const itName = item?.name || itemName;
                    const itOriginal = item?.originalPrice || originalUnitPrice;
                    const itRescue = item?.rescuePrice || rescueUnitPrice;
                    const itDisc = item?.discountPercent || discountPercent;
                    const itQty = item?.quantity || 1;
                    return (
                      <div
                        key={item?.id || idx}
                        className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                      >
                        {/* Thumbnail with discount badge */}
                        <div className="relative w-full sm:w-24 sm:h-24 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={item?.imageSrc || saladStopCard}
                            alt={itName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#22c55e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                            -{itDisc}%
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-[#1b1c1c] truncate">{itName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {itQty} Box ({item?.storeName || storeName})
                          </p>

                          <div className="flex items-baseline justify-between gap-2 mt-2 pt-2 border-t border-slate-50">
                            <div>
                              <span className="text-xs text-slate-400 line-through block">
                                Rp {formatRupiah(itOriginal * itQty)}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-base font-black text-[#1b1c1c]">
                                  Rp {formatRupiah(itRescue)}
                                </span>
                                <span className="text-xs text-slate-500">/ 1 Box</span>
                              </div>
                            </div>

                            <div className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                              Subtotal: Rp {formatRupiah(itRescue * itQty)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Card 2: Mitra F&B Penyedia */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Mitra F&B Penyedia</h3>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#1b1c1c] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {storeAvatar && (storeAvatar.startsWith('http') || storeAvatar.startsWith('/')) ? (
                      <img src={storeAvatar} alt={storeName} className="w-full h-full object-cover" />
                    ) : (
                      storeAvatar
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4
                        onClick={() => (onNavigateStore ? onNavigateStore(storeName) : onNavigateMarketplace?.())}
                        className="text-sm font-bold text-[#1b1c1c] hover:text-emerald-700 hover:underline cursor-pointer truncate"
                      >
                        {storeName}
                      </h4>
                    </div>

                    <div className="flex items-start gap-1.5 mt-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
                      <p className="line-clamp-2">{storeAddress || 'Alamat toko belum tersedia'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                    Jadwal Ambil: {pickupSchedule || 'Belum tersedia'}
                  </span>
                  <button
                    type="button"
                    onClick={() => (onNavigateStore ? onNavigateStore(storeName) : onNavigateMarketplace?.())}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1b1c1c] hover:text-emerald-700 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span>Kunjungi Halaman Toko</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              </section>

              {/* Action Buttons */}
              {activeStep === 1 ? (
                <button
                  type="button"
                  onClick={onNavigateOrders}
                  className="bg-[#eae7e7] hover:bg-slate-300 text-slate-800 text-sm font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 transition cursor-pointer w-full focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <ClipboardList className="w-4 h-4" aria-hidden="true" />
                  <span>Kembali ke Riwayat Pesanan</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <button
                    type="button"
                    onClick={() => (onNavigateStore ? onNavigateStore(storeName) : onNavigateMarketplace?.())}
                    className="bg-[#1b1c1c] hover:bg-black text-white text-sm font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer flex-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>Beli Lagi di {storeName}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateOrders}
                    className="bg-[#eae7e7] hover:bg-slate-300 text-slate-800 text-sm font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 transition cursor-pointer flex-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Kembali ke Riwayat Pesanan</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card 1: Rincian Pembayaran */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Rincian Pembayaran</h3>
                  {activeStep === 1 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#d94a38] text-[#d94a38] bg-[#fdeceb]">
                      Perlu Dibayar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-primary">
                      <Check className="w-3 h-3 stroke-3" aria-hidden="true" />
                      Lunas
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Harga Barang Asli</span>
                    <span className="font-medium text-slate-800">Rp {formatRupiah(totalOriginalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      Diskon Penyelamatan
                    </span>
                    <span className="font-semibold text-emerald-600">-Rp {formatRupiah(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span>Biaya Layanan RescueBite</span>
                      <span className="relative group inline-flex items-center">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 focus:text-slate-700 focus:outline-none transition-colors cursor-help p-0.5 rounded"
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
                    <span className="font-medium text-slate-800">Rp {formatRupiah(serviceFee)}</span>
                  </div>

                  <div className="border-t border-slate-100 my-2 pt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Total Pembayaran Akhir</p>
                      <p className="text-2xl font-black text-[#1b1c1c]">Rp {formatRupiah(grandTotal)}</p>
                    </div>
                  </div>

                  {activeStep === 1 ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={isVerifyingPayment || isSnapPopupOpen || isPaymentSessionLoading}
                        onClick={() => {
                          if (isVerifyingPayment || isSnapPopupOpen || isPaymentSessionLoading) return;
                          setIsSnapPopupOpen(true);
                          try {
                            launchMidtransPayment(paymentSnapToken, {
                              onSuccess: () => {
                                setIsSnapPopupOpen(false);
                                return handlePaymentSuccess();
                              },
                              onPending: () => {
                                setIsSnapPopupOpen(false);
                                onShowToast?.('Pembayaran masih menunggu. Status pesanan tetap menunggu pembayaran.', 'info');
                              },
                              onError: () => {
                                setIsSnapPopupOpen(false);
                                onShowToast?.('Pembayaran belum berhasil. Silakan coba lagi.', 'error');
                              },
                              onClose: () => {
                                setIsSnapPopupOpen(false);
                                onShowToast?.('Pesanan tetap menunggu pembayaran.', 'info');
                              },
                            });
                          } catch (err) {
                            setIsSnapPopupOpen(false);
                            onShowToast?.(err instanceof Error ? err.message : 'Halaman Midtrans belum tersedia.', 'error');
                          }
                        }}
                        className="w-full py-3.5 bg-[#002b49] hover:bg-[#001f35] disabled:opacity-60 disabled:cursor-wait text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 text-[#00b4d8]" />
                        <span>{isVerifyingPayment ? 'Memverifikasi pembayaran…' : isPaymentSessionLoading ? 'Memuat sesi pembayaran…' : isSnapPopupOpen ? 'Popup pembayaran terbuka…' : 'Bayar Sekarang via Midtrans'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                      <Check className="w-4 h-4 text-emerald-600 stroke-3" />
                      <span>Pembayaran Midtrans Terverifikasi (Lunas)</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Card 2: Rekomendasi Lainnya */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="mb-1">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Rekomendasi Lainnya</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Makanan surplus dari mitra terdekat yang butuh diselamatkan sore ini:
                </p>

                <div className="flex flex-col gap-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => (onNavigateStore ? onNavigateStore(rec.store_name || 'Toko Mitra') : onNavigateMarketplace?.())}
                        className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (onNavigateStore) onNavigateStore(rec.store_name || 'Toko Mitra');
                            else onNavigateMarketplace?.();
                          }
                        }}
                      >
                        <img
                          src={rec.main_image_url || saladStopCard}
                          alt={rec.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] truncate">
                            {rec.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {rec.store_name || 'Toko Mitra'} • {(rec as any).city || 'Malang'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">
                            Rp {formatRupiah(rec.rescue_price)}
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-600">
                            Sisa {rec.stock} Box
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      Belum ada rekomendasi produk surplus lainnya saat ini.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Review Modal Dialog */}
      {isReviewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsReviewModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <h3 id="review-modal-title" className="text-xl font-bold text-[#1b1c1c] mb-1">
              Beri Ulasan untuk {storeName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              Bagaimana kualitas makanan surplus yang kamu dapatkan? Ulasanmu sangat berarti untuk menjaga mutu
              penyelamatan makanan.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Tingkat Kepuasan
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="text-amber-400 hover:scale-110 transition p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                          }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-600 ml-2">
                    {selectedRating === 5 && 'Sangat Puas!'}
                    {selectedRating === 4 && 'Puas'}
                    {selectedRating === 3 && 'Cukup'}
                    {selectedRating === 2 && 'Kurang'}
                    {selectedRating === 1 && 'Kecewa'}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                >
                  Catatan Pengalaman (Opsional)
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Contoh: Sayurannya masih sangat segar dan porsinya melimpah!"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Footer */}
      <CustomerFooter variant="compact" onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerOrderDetail;
