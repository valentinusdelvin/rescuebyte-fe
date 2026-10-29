import { useState, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  UserCheck,
  MapPin,
  ExternalLink,
  Star,
  RefreshCw,
  ArrowLeft,
  Copy,
  Sparkles,
  Info,
  ShieldCheck,
  X,
  MessageSquare,
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
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

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

  const handleCopyOrderId = () => {
    try {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      onShowToast?.(`ID Pesanan #${orderId} berhasil disalin!`, 'success');
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch {
      onShowToast?.('Gagal menyalin ID Pesanan.', 'error');
    }
  };

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
              Beranda
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
            <span aria-hidden="true" className="text-slate-400">&gt;</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-primary">
              Selesai
            </span>
          </nav>

          {/* Page Heading & Transaction Meta */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase mb-1">
                Konfirmasi Penyelesaian Transaksi
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1b1c1c] tracking-tight">
                Detail Pesanan
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs sm:text-sm text-slate-500">
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="font-medium text-slate-700 hover:text-emerald-700 inline-flex items-center gap-1 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                  title="Klik untuk menyalin ID pesanan"
                >
                  <span>#{orderId}</span>
                  {copiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  )}
                </button>
                <span aria-hidden="true" className="text-slate-300">•</span>
                <span>{fullOrderDate}</span>
                <span aria-hidden="true" className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  QRIS Verifikasi Otomatis
                </span>
              </div>
            </div>

            <div className="flex items-center self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#bbf381] text-[#0e2000] border border-[#a0d668] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2c5000]" aria-hidden="true" />
                Pesanan Selesai
              </span>
            </div>
          </section>

          {/* Celebration / Successful Pickup Banner */}
          <section className="bg-linear-to-r from-[#edf9ef] via-[#f2faf3] to-[#edf9ef] border border-emerald-200/90 rounded-3xl p-5 sm:p-7 shadow-xs mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-6 h-6 stroke-3" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#86efac] text-[#14532d]">
                      100% Berhasil Diselamatkan
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/90 border border-emerald-300 text-slate-700">
                      Pengambilan Langsung
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1b1c1c]">
                    Pesanan Telah Berhasil Diambil!
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Terima kasih telah menyelamatkan {totalBoxes} porsi makanan surplus bermutu tinggi dari{' '}
                    <strong className="text-slate-800 font-semibold">{storeName}</strong>. Kontribusimu langsung
                    memutus rantai emisi gas rumah kaca di area Jakarta Selatan.
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
                    <p className="text-[11px] text-slate-500 font-medium">Waktu Selesai</p>
                    <p className="text-sm font-bold text-[#1b1c1c]">{completionTimestamp}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Order Tracking Timeline */}
          <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#1b1c1c]">Jejak Status Pesanan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh 5 tahap telah selesai dan diverifikasi oleh sistem loket {storeName}
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Log Verifikasi Lengkap
                </span>
              </div>
            </div>

            {/* Step Progress Track */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
              {/* Connector line for large screens */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-4 left-[10%] right-[10%] h-1 bg-primary-light z-0"
              />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center shadow-xs mb-2">
                  <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-[#1b1c1c]">1. Pesanan Dibuat</p>
                <p className="text-[11px] text-slate-500 mt-0.5">23 Okt • 14:10 WIB</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center shadow-xs mb-2">
                  <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-[#1b1c1c]">2. Pembayaran</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lunas QRIS • 14:12 WIB</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center shadow-xs mb-2">
                  <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-[#1b1c1c]">3. Dikonfirmasi</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Diterima Toko • 14:15 WIB</p>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center shadow-xs mb-2">
                  <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-[#1b1c1c]">4. Siap Diambil</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Di Rak Khusus • 15:00 WIB</p>
              </div>

              {/* Step 5 */}
              <div className="relative z-10 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center shadow-xs mb-2">
                  <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-[#1b1c1c]">5. Selesai</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Diambil • 15:42 WIB</p>
              </div>
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
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ffedd5] text-[#c2410c]">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        Mystery Box
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-primary">
                        Halal MUI
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        Organik & Segar
                      </span>
                    </div>

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
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Mitra Resmi
                  </span>
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
                  <span>Kembali ke Pesanan Saya</span>
                </button>
              </div>
            </div>

            {/* Right Column (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card 1: Rincian Pembayaran */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Rincian Pembayaran</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dcfce7] text-primary">
                    <Check className="w-3 h-3 stroke-3" aria-hidden="true" />
                    Lunas
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Harga Barang Asli</span>
                    <span className="font-medium text-slate-800">Rp {formatRupiah(totalOriginalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      Diskon Penyelamatan ({discountPercent}%)
                    </span>
                    <span className="font-semibold text-emerald-600">-Rp {formatRupiah(discountAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      Biaya Layanan RescueBite
                      <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
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
                </div>
              </section>

              {/* Card 2: Rekomendasi Lainnya */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
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
