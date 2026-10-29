import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { PaymentOrderData } from '../types';

import saladStopCard from '../assets/customer/card-saladstop.jpg';
import breadCard from '../assets/customer/card-tous-les-jours.jpg';
import bentoCard from '../assets/customer/card-dapur-solo.jpg';

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

  // Active step in tracking timeline (1 to 5)
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (orderData?.status === 'menunggu-pembayaran') return 1;
    if (orderData?.status === 'menunggu-konfirmasi' || orderData?.status === 'dibayar') return 2;
    if (orderData?.status === 'diproses') return 3;
    if (orderData?.status === 'siap-diambil') return 4;
    return 5;
  });

  const TIMELINE_STEPS = useMemo(() => [
    {
      step: 1,
      title: '1. Pesanan Dibuat',
      desc: '23 Okt • 14:10 WIB',
    },
    {
      step: 2,
      title: '2. Pembayaran',
      desc: activeStep >= 2 ? (activeStep >= 5 ? 'Lunas QRIS • 14:12 WIB' : '23 Okt • 14:12 WIB') : '23 Okt • 14:12 WIB',
    },
    {
      step: 3,
      title: '3. Dikonfirmasi',
      desc: activeStep >= 3 ? 'Diterima Toko • 14:15 WIB' : '',
    },
    {
      step: 4,
      title: '4. Siap Diambil',
      desc: activeStep >= 4 ? 'Di Rak Khusus • 15:00 WIB' : '',
    },
    {
      step: 5,
      title: '5. Selesai',
      desc: activeStep >= 5 ? 'Diambil • 15:42 WIB' : '',
    },
  ], [activeStep]);

  // Fallback defaults matching design specification
  const orderId = orderData?.orderId || 'RB251023-00455';
  const primaryItem = orderData?.items?.[0];

  const itemName = primaryItem?.name || 'Mystery Fresh Box';
  const itemDescription =
    'Koleksi sayuran hidroponik, buah potong premium, dan salad segar sortiran harian yang lolos uji mutu kesegaran.';
  const storeName = orderData?.primaryStore?.storeName || primaryItem?.storeName || 'SayurKita Outlet Dharmawangsa';
  const storeAddress =
    orderData?.primaryStore?.storeAddress ||
    'Jl. Dharmawangsa Raya No. 42B, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160';
  const storeRating = orderData?.primaryStore?.rating || 4.6;
  const storeReviewCount = orderData?.primaryStore?.reviewCount || 180;
  const storeAvatar = orderData?.primaryStore?.storeAvatar || 'SK';

  const recipientName = orderData?.customerInfo?.name || 'Reza Pratama';
  const totalBoxes = orderData?.totalBoxes || primaryItem?.quantity || 1;

  const originalUnitPrice = primaryItem?.originalPrice || 30000;
  const rescueUnitPrice = primaryItem?.rescuePrice || 15000;
  const discountPercent = primaryItem?.discountPercent || 50;

  const totalOriginalPrice = originalUnitPrice * totalBoxes;
  const totalRescuePrice = rescueUnitPrice * totalBoxes;
  const discountAmount = totalOriginalPrice - totalRescuePrice;

  const serviceFee = orderData?.serviceFee || 2000;
  const packagingFee = 5000;
  const grandTotal = totalRescuePrice + serviceFee + packagingFee;

  const completionTimestamp = useMemo(() => {
    return '23 Okt 2026, 15:42 WIB';
  }, []);

  const fullOrderDate = useMemo(() => {
    return '23 Oktober 2026, 15:42 WIB';
  }, []);

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
              pembayaranmu sebelum batas waktu berakhir agar mitra toko dapat segera memproses dan menyiapkan makananmu.
            </>
          ),
          timeLabel: 'Batas Pembayaran',
          timeValue: '23 Okt 2026, 14:25 WIB',
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
          timeValue: '23 Okt 2026, 14:12 WIB',
          timelineNote: `Pembayaran terverifikasi dan pesanan sedang diteruskan ke ${storeName}.`,
        };
      case 3:
        return {
          badgeText: 'Menunggu Konfirmasi',
          badgeClass: 'bg-[#fef3c7] text-[#92400e] border border-amber-200/60',
          title: 'Menunggu Konfirmasi dari Toko',
          description: (
            <>
              Pihak <strong className="text-slate-800 font-semibold">{storeName}</strong> sedang memeriksa ketersediaan
              stok surplus dan mulai menyiapkan paket pesananmu. Status pesanan akan otomatis diperbarui begitu paket
              siap diambil.
            </>
          ),
          timeLabel: 'Waktu Konfirmasi',
          timeValue: '23 Okt 2026, 14:15 WIB',
          timelineNote: 'Mitra toko sedang memeriksa ketersediaan dan menyiapkan paket surplus pesananmu.',
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
  }, [activeStep, storeName, grandTotal, totalBoxes, completionTimestamp]);

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
          onNavigateSeller={onNavigateSeller}
          onNavigateOrders={onNavigateOrders}
          onShowToast={onShowToast}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
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
              Pesanan Saya
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
                <div className="flex items-center gap-3 pt-2 sm:pt-0 lg:pt-2 border-t sm:border-t-0 lg:border-t border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Clock className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">{statusConfig.timeLabel}</p>
                    <p className="text-sm font-bold text-[#1b1c1c]">{statusConfig.timeValue}</p>
                  </div>
                </div>
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
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveStep(item.step)}
                    className="relative z-10 flex flex-col items-center text-center cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 rounded-xl p-1 transition"
                    title={`Klik untuk melihat kondisi: ${item.title}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all select-none ${
                        isCompleted
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
                  </button>
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
                    Bagikan ulasanmu saat menikmati Mystery Fresh Box dari {storeName}. Pendapatmu membantu
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
                        className={`w-5 h-5 ${
                          star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
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
                <div className="flex items-center justify-between gap-3 mb-5">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Barang yang Diselamatkan</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-primary">
                    {totalBoxes} Kotak Diclaim
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Thumbnail with discount badge */}
                  <div className="relative w-full sm:w-28 sm:h-28 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={primaryItem?.imageSrc || saladStopCard}
                      alt={itemName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-primary-light text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                      -{discountPercent}%
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-[#1b1c1c] truncate">{itemName}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {itemDescription}
                    </p>

                    <div className="flex items-baseline justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 line-through block">
                          Rp {formatRupiah(totalOriginalPrice)}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-[#1b1c1c]">
                            Rp {formatRupiah(rescueUnitPrice)}
                          </span>
                          <span className="text-xs text-slate-500">/ 1 Box</span>
                        </div>
                      </div>

                      <div className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                        Subtotal: Rp {formatRupiah(totalRescuePrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Card 2: Mitra F&B Penyedia */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Mitra F&B Penyedia</h3>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                    {storeAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4
                        onClick={() => (onNavigateStore ? onNavigateStore(storeName) : onNavigateMarketplace?.())}
                        className="text-sm font-bold text-[#1b1c1c] hover:text-emerald-700 hover:underline cursor-pointer truncate"
                      >
                        {storeName}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        ★ {storeRating} ({storeReviewCount} ulasan)
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 mt-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
                      <p className="line-clamp-2">{storeAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                    Jadwal Ambil Reguler: 14:00 - 16:30 WIB
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
                    <span>Beli Lagi di SayurKita</span>
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
                      Diskon Penyelamatan ({discountPercent}%)
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
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Biaya Pengemasan Ramah Lingkungan</span>
                    <span className="font-medium text-slate-800">Rp {formatRupiah(packagingFee)}</span>
                  </div>

                  <div className="border-t border-slate-100 my-2 pt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Total Pembayaran Akhir</p>
                      <p className="text-2xl font-black text-[#1b1c1c]">Rp {formatRupiah(grandTotal)}</p>
                    </div>
                  </div>

                  {activeStep === 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStep(2);
                        onShowToast?.('Pembayaran berhasil diverifikasi!', 'success');
                      }}
                      className="mt-3 w-full py-3.5 bg-[#3c6a00] hover:bg-[#325800] text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              </section>

              {/* Card 2: Rekomendasi Lainnya */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="mb-1">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Rekomendasi Lainnya</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Mystery Box terdekat di area Dharmawangsa yang butuh diselamatkan sore ini:
                </p>

                <div className="flex flex-col gap-3">
                  {/* Rec 1 */}
                  <div
                    onClick={() => (onNavigateStore ? onNavigateStore('Rotiku Dharmawangsa') : onNavigateMarketplace?.())}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (onNavigateStore) onNavigateStore('Rotiku Dharmawangsa');
                        else onNavigateMarketplace?.();
                      }
                    }}
                  >
                    <img
                      src={breadCard}
                      alt="Artisan Bread & Pastry Box"
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] truncate">
                        Artisan Bread &amp; Pastry Box
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">Rotiku Dharmawangsa • 0.8 km</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">Rp 25.000</p>
                      <p className="text-[11px] font-semibold text-emerald-600">Sisa 3 Box</p>
                    </div>
                  </div>

                  {/* Rec 2 */}
                  <div
                    onClick={() => (onNavigateStore ? onNavigateStore('Dapoer Pandan Wangi') : onNavigateMarketplace?.())}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (onNavigateStore) onNavigateStore('Dapoer Pandan Wangi');
                        else onNavigateMarketplace?.();
                      }
                    }}
                  >
                    <img
                      src={bentoCard}
                      alt="Nusantara Surplus Bento"
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] truncate">
                        Nusantara Surplus Bento
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">Dapoer Pandan Wangi • 1.4 km</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">Rp 18.000</p>
                      <p className="text-[11px] font-semibold text-emerald-600">Sisa 2 Box</p>
                    </div>
                  </div>
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
                        className={`w-7 h-7 ${
                          star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
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
      <CustomerFooter onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerOrderDetail;
