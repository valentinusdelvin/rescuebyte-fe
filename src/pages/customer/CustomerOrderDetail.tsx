import { useMemo } from 'react';
import { extractErrorMessage } from '../../api/client';
import {
  Check,
  Clock,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerFooter } from '../../components/customer/CustomerFooter';
import { formatRupiah } from '../../utils/currency';
import {
  OrderStepper,
  OrderItemsList,
  OrderPickupInfo,
  OrderPaymentAction,
  OrderReviewSection,
  OrderReviewModal,
  OrderItemDetail,
} from '../../components/customer/order';
import { PaymentOrderData } from '../../types';
import { getCurrentUser } from '../../services/authService';
import { launchMidtransPayment } from '../../services/midtransService';
import saladStopCard from '../../assets/customer/card-saladstop.jpg';
import { useCustomerOrderDetail } from '../../hooks/useCustomerOrderDetail';
import { useCustomerOrderReviews } from '../../hooks/useCustomerOrderReviews';

export interface CustomerOrderDetailProps {
  orderData?: PaymentOrderData | null;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateOrders?: () => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

// formatRupiah imported from currency.ts

function formatPickupDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
  const {
    activeData,
    activeStep,
    backendOrderDetail,
    currentStatus,
    handlePaymentSuccess,
    isPaymentSessionLoading,
    isSnapPopupOpen,
    isVerifyingPayment,
    orderId,
    paymentSnapToken,
    recommendations,
    resolvedStoreId,
    setIsSnapPopupOpen,
    storeProfile,
  } = useCustomerOrderDetail({ orderData, onShowToast });
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

  const isOrderCompleted = currentStatus === 'selesai' || activeStep === 5;

  const orderItemsList: OrderItemDetail[] = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((it, idx) => ({
        id: it?.id || String(idx),
        productId: it?.productId || backendOrderDetail?.items?.[idx]?.product_id || it?.id,
        name: it?.name || itemName,
        imageSrc: it?.imageSrc || saladStopCard,
        originalPrice: it?.originalPrice || originalUnitPrice,
        rescuePrice: it?.rescuePrice || rescueUnitPrice,
        discountPercent: it?.discountPercent || discountPercent,
        quantity: it?.quantity || 1,
        storeName: it?.storeName || storeName,
      }));
    }
    return [
      {
        id: primaryItem?.id || '1',
        productId: primaryItem?.productId || backendOrderDetail?.items?.[0]?.product_id || primaryItem?.id,
        name: primaryItem?.name || itemName,
        imageSrc: primaryItem?.imageSrc || saladStopCard,
        originalPrice: primaryItem?.originalPrice || originalUnitPrice,
        rescuePrice: primaryItem?.rescuePrice || rescueUnitPrice,
        discountPercent: primaryItem?.discountPercent || discountPercent,
        quantity: primaryItem?.quantity || totalBoxes || 1,
        storeName: primaryItem?.storeName || storeName,
      },
    ];
  }, [items, itemName, originalUnitPrice, rescueUnitPrice, discountPercent, storeName, primaryItem, totalBoxes, backendOrderDetail]);

  const {
    handleSubmitDualReview,
    handleSubmitReview,
    isReviewModalOpen,
    isReviewSubmitted,
    isSubmittingReview,
    reviewComment,
    selectedRating,
    setIsReviewModalOpen,
    setReviewComment,
    setSelectedRating,
  } = useCustomerOrderReviews({
    resolvedStoreId,
    orderItems: orderItemsList,
    onShowToast,
  });

  const handlePayNow = () => {
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
      onShowToast?.(extractErrorMessage(err, 'Pembayaran belum bisa dibuka. Silakan coba lagi dari detail pesanan.'), 'error');
    }
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
          <OrderStepper
            activeStep={activeStep}
            steps={TIMELINE_STEPS}
            timelineNote={statusConfig.timelineNote}
          />

          {/* Feedback & Review Prompt Card - ONLY rendered when order status is selesai */}
          {isOrderCompleted && (
            <OrderReviewSection
              storeName={storeName}
              setIsReviewModalOpen={setIsReviewModalOpen}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              isReviewSubmitted={isReviewSubmitted}
            />
          )}

          {/* Two-Column Grid: Saved Goods & Partner vs Payment & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <OrderItemsList items={orderItemsList} fallbackStoreName={storeName} />
              <OrderPickupInfo
                storeName={storeName}
                storeAvatar={storeAvatar}
                storeAddress={storeAddress}
                pickupSchedule={pickupSchedule}
                activeStep={activeStep}
                onNavigateStore={onNavigateStore}
                onNavigateOrders={onNavigateOrders}
                onNavigateMarketplace={onNavigateMarketplace}
              />
            </div>

            {/* Right Column (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <OrderPaymentAction
                activeStep={activeStep}
                totalOriginalPrice={totalOriginalPrice}
                discountAmount={discountAmount}
                serviceFee={serviceFee}
                grandTotal={grandTotal}
                isVerifyingPayment={isVerifyingPayment}
                isSnapPopupOpen={isSnapPopupOpen}
                isPaymentSessionLoading={isPaymentSessionLoading}
                onPayNow={handlePayNow}
              />

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
                            {rec.store_name || 'Toko Mitra'} • {rec.city || 'Malang'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">
                            Rp {formatRupiah(rec.rescue_price)}
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
      <OrderReviewModal
        storeName={storeName}
        storeId={resolvedStoreId}
        items={orderItemsList}
        isReviewModalOpen={isReviewModalOpen}
        setIsReviewModalOpen={setIsReviewModalOpen}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        isSubmittingReview={isSubmittingReview}
        isReviewSubmitted={isReviewSubmitted}
        onSubmitReview={handleSubmitReview}
        onSubmitDualReview={handleSubmitDualReview}
      />

      {/* Customer Footer */}
      <CustomerFooter variant="compact" onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerOrderDetail;
