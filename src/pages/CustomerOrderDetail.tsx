import { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  FileText,
  Building2,
  Package,
  CheckCircle2,
  Leaf,
  Info,
  ArrowRight,
  Store,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { PaymentOrderData } from '../types';
import mystBoxSvg from '../assets/myst-box.svg';

export interface CustomerOrderDetailProps {
  orderData?: PaymentOrderData | null;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateOrders?: () => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * CustomerOrderDetail Page Component
 * Renders the order confirmation and details page matching Image 2
 * ("Pesanan Berhasil Dibuat!") after payment completion.
 */
export function CustomerOrderDetail({
  orderData,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateOrders,
  onNavigateSeller,
  onShowToast,
}: CustomerOrderDetailProps) {
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Fallback defaults matching design screenshot
  const orderId = orderData?.orderId || 'RB251026-00123';
  const primaryItem = orderData?.items?.[0] || {
    id: 'item-bakery-box-reguler',
    name: 'Mystery Bakery Box Reguler',
    storeName: 'TerasRasa Bakery',
    categoryTags: ['Roti & Pastry', '✓ Halal'],
    originalPrice: 40000,
    rescuePrice: 20000,
    discountPercent: 50,
    quantity: 1,
    imageSrc: mystBoxSvg,
    storeAddress: 'Jl. Soekarno Hatta No. 12, Lowokwaru, Malang, Jawa Timur',
  };

  const storeName = orderData?.primaryStore?.storeName || primaryItem.storeName || 'TerasRasa Bakery';
  const storeAddress =
    orderData?.primaryStore?.storeAddress ||
    primaryItem.storeAddress ||
    'Jl. Soekarno Hatta No. 12, Lowokwaru, Malang, Jawa Timur';
  const storeRating = orderData?.primaryStore?.rating || 4.8;
  const storeReviewCount = orderData?.primaryStore?.reviewCount || 320;

  const pickupDate = orderData?.pickupDate || 'Sabtu, 26 Oktober 2025';
  const pickupTimeSlot = orderData?.pickupTimeSlot || '16.00 - 17.00 WIB';

  const totalBoxes = orderData?.totalBoxes || primaryItem.quantity || 1;
  const itemUnitPrice = primaryItem.rescuePrice || 20000;
  const subtotal = orderData?.subtotal || itemUnitPrice * totalBoxes;
  const discountTotal =
    orderData?.discountTotal ||
    ((primaryItem.originalPrice || 40000) - itemUnitPrice) * totalBoxes;
  const serviceFee = orderData?.serviceFee || 2000;
  const grandTotal = orderData?.grandTotal || subtotal + serviceFee;

  // Formatted current date for order timestamp
  const orderTimestamp = useMemo(() => {
    return '26 Oktober 2025 14:23 WIB';
  }, []);

  const paymentVerifiedTimestamp = useMemo(() => {
    return '26 Oktober 2025, 14:24 WIB';
  }, []);

  // Copy order id handler
  const handleCopyOrderId = () => {
    try {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      if (onShowToast) {
        onShowToast(`Nomor pesanan ${orderId} berhasil disalin!`, 'success');
      }
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch {
      if (onShowToast) {
        onShowToast(`Nomor pesanan ${orderId} disalin.`, 'info');
      }
    }
  };

  // Google Maps navigation handler
  const handleOpenGoogleMaps = () => {
    const mapsQuery = encodeURIComponent(`${storeName} ${storeAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between"
      id="customer-order-detail-page-root"
    >
      <div>
        {/* Floating Header */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={(tab) => {
            if (tab === 'beranda' && onNavigateHome) onNavigateHome();
            if (tab === 'marketplace' && onNavigateMarketplace) onNavigateMarketplace();
          }}
          onNavigateSeller={onNavigateSeller}
          onNavigateOrders={onNavigateOrders}
          onShowToast={onShowToast}
        />

        {/* Main Container */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Success Hero Card, Progress Tracker, & Pickup Information */}
            <div className="lg:col-span-8 space-y-6">
              {/* CARD 1: Banner Pesanan Berhasil Dibuat! & Progress Stepper */}
              <section
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6 sm:space-y-8"
                aria-label="Status Pesanan Berhasil"
              >
                {/* Hero Header Row with Mystery Box Illustration & Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                  {/* Mystery Box Container with Green Checkmark Badge */}
                  <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-linear-to-br from-[#f8f6f0] to-[#f0ebde] p-3 flex items-center justify-center border border-amber-200/50 shadow-xs">
                    {/* Soft background aura */}
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl filter blur-sm pointer-events-none" />

                    <img
                      src={mystBoxSvg}
                      alt="RescueBite Mystery Box"
                      className="w-full h-full object-contain drop-shadow-sm relative z-0"
                    />

                    {/* Green checkmark circle overlay badge */}
                    <div
                      className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-md border-2 border-white z-10"
                      title="Pesanan Berhasil"
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-3" />
                    </div>
                  </div>

                  {/* Heading Text */}
                  <div className="space-y-1 sm:space-y-1.5 flex-1">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
                      Pesanan Berhasil Dibuat!
                    </h1>
                    <p className="text-brand-green font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>Terima kasih sudah ikut menyelamatkan makanan</span>
                      <span className="text-sm">🌿</span>
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed pt-0.5">
                      Pesanan kamu sudah berhasil dibuat dan akan segera diproses oleh pihak toko. Silakan
                      cek detail pesanan dan ikuti informasi pengambilan di bawah ini.
                    </p>
                  </div>
                </div>

                {/* Sub-Card: Nomor Pesanan & Tanggal Pesanan */}
                <div className="bg-[#fbfaf8] border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Nomor Pesanan */}
                  <div className="space-y-1">
                    <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                      Nomor Pesanan
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm sm:text-base text-gray-900 tracking-wide">
                        {orderId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyOrderId}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                        title="Salin nomor pesanan"
                        aria-label="Salin nomor pesanan"
                      >
                        {copiedOrderId ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-10 bg-gray-200" />

                  {/* Tanggal Pesanan */}
                  <div className="space-y-1 text-left sm:text-right">
                    <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                      Tanggal Pesanan
                    </span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 block">
                      {orderTimestamp}
                    </span>
                  </div>
                </div>

                {/* 4-Step Horizontal Progress Stepper Tracker */}
                <div className="pt-2">
                  <div className="relative flex items-start justify-between">
                    {/* Step 1: Pesanan Dibuat (Completed) */}
                    <div className="flex flex-col items-center text-center flex-1 z-10">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#eef8ee] border-2 border-[#16a34a] text-[#16a34a] flex items-center justify-center shadow-xs">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="mt-2.5">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                          Pesanan Dibuat
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-gray-400 block mt-0.5">
                          26 Okt 2025, 14:23
                        </span>
                      </div>
                    </div>

                    {/* Step 2: Diproses Toko (Active / In Progress) */}
                    <div className="flex flex-col items-center text-center flex-1 z-10">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#eef8ee] border-2 border-[#16a34a] text-[#16a34a] flex items-center justify-center shadow-xs">
                        <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="mt-2.5">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                          Diproses Toko
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block mt-0.5">
                          Segera diproses
                        </span>
                      </div>
                    </div>

                    {/* Step 3: Siap diambil (Pending) */}
                    <div className="flex flex-col items-center text-center flex-1 z-10">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 border-2 border-gray-200 text-gray-400 flex items-center justify-center">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="mt-2.5">
                        <span className="font-semibold text-xs sm:text-sm text-gray-500 block">
                          Siap diambil
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-gray-400 block mt-0.5">
                          Sesuai jadwal
                        </span>
                      </div>
                    </div>

                    {/* Step 4: Selesai (Pending) */}
                    <div className="flex flex-col items-center text-center flex-1 z-10">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 border-2 border-gray-200 text-gray-400 flex items-center justify-center">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="mt-2.5">
                        <span className="font-semibold text-xs sm:text-sm text-gray-500 block">
                          Selesai
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-gray-400 block mt-0.5">
                          Setelah pickup
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track Lines behind Step Badges */}
                    <div className="absolute top-4 sm:top-5 left-[12%] right-[12%] -translate-y-1/2 flex items-center z-0">
                      {/* Segment 1: Completed (Green) */}
                      <div className="h-0.5 flex-1 bg-[#16a34a]" />
                      {/* Segment 2: Transition (Green to Gray) */}
                      <div className="h-0.5 flex-1 bg-gray-200" />
                      {/* Segment 3: Pending (Gray) */}
                      <div className="h-0.5 flex-1 bg-gray-200" />
                    </div>
                  </div>
                </div>
              </section>

              {/* CARD 2: Informasi Pengambilan Pesanan */}
              <section
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6"
                aria-label="Informasi Pengambilan Pesanan"
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 text-[#1b1c1c] pb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-extrabold text-base sm:text-lg text-[#1b1c1c]">
                    Informasi Pengambilan Pesanan
                  </h2>
                </div>

                {/* Content Grid: Merchant Info vs Pickup Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                  {/* Column A: Store Identity, Address & Maps Button */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {/* Store Avatar Badge */}
                      <div className="w-11 h-11 rounded-full bg-[#1b1c1c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        TR
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-gray-900">
                            {storeName}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-3" /> Terverifikasi
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="text-amber-500 font-bold">★ {storeRating}</span>
                          <span>({storeReviewCount} ulasan)</span>
                        </div>
                      </div>
                    </div>

                    {/* Store Address */}
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>{storeAddress}</span>
                    </div>

                    {/* Google Maps Button */}
                    <div>
                      <button
                        type="button"
                        onClick={handleOpenGoogleMaps}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Lihat di Google Maps</span>
                      </button>
                    </div>
                  </div>

                  {/* Column B: Pickup Schedule & Notice */}
                  <div className="space-y-3.5">
                    {/* Tanggal Pickup */}
                    <div className="flex items-center justify-between text-xs sm:text-sm py-1">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Tanggal Pickup</span>
                      </span>
                      <span className="font-bold text-gray-900">{pickupDate}</span>
                    </div>

                    {/* Waktu Pickup */}
                    <div className="flex items-center justify-between text-xs sm:text-sm py-1">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Waktu Pickup</span>
                      </span>
                      <span className="font-bold text-gray-900">{pickupTimeSlot}</span>
                    </div>

                    {/* Green Advisory Banner */}
                    <div className="bg-[#edf7e4] text-[#2c5000] p-3.5 rounded-2xl text-xs flex items-start gap-2.5 leading-relaxed mt-2 border border-[#d2eab5]/60">
                      <div className="w-4 h-4 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        i
                      </div>
                      <span>Pesanan harus diambil langsung di lokasi toko sesuai jadwal yang dipilih.</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateOrders) {
                        onNavigateOrders();
                      } else if (onNavigateMarketplace) {
                        onNavigateMarketplace();
                      }
                    }}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Lihat Pesanan Saya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateMarketplace) onNavigateMarketplace();
                    }}
                    className="flex-1 py-3.5 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-gray-500" />
                    <span>Kembali ke Marketplace</span>
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Ringkasan Pesanan, Status Pembayaran, & Impact */}
            <div className="lg:col-span-4 space-y-6">
              {/* CARD 1: Ringkasan Pesanan */}
              <section
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4"
                aria-label="Ringkasan Pesanan"
              >
                {/* Header */}
                <div className="flex items-center gap-2 text-[#1b1c1c]">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="font-display font-bold text-sm sm:text-base text-gray-900">
                    Ringkasan Pesanan
                  </h3>
                </div>

                {/* Item Thumbnail & Info */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#fbfaf8] border border-gray-100">
                  <div className="w-14 h-14 rounded-xl bg-[#f8f6f0] border border-amber-200/50 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={primaryItem.imageSrc || mystBoxSvg}
                      alt={primaryItem.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {primaryItem.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 truncate">{storeName}</p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Roti & Pastry
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Halal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Lines */}
                <div className="space-y-2.5 text-xs text-gray-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga per box</span>
                    <span className="font-medium text-gray-900">Rp {formatRupiah(itemUnitPrice)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Jumlah box</span>
                    <span className="font-medium text-gray-900">{totalBoxes} box</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">Rp {formatRupiah(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#e11d48]">
                    <span className="font-medium flex items-center gap-1">
                      <span>Diskon</span>
                      <span className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 text-[10px] rounded">
                        50%
                      </span>
                    </span>
                    <span className="font-bold">- Rp {formatRupiah(discountTotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>Biaya layanan</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-medium text-gray-900">Rp {formatRupiah(serviceFee)}</span>
                  </div>
                </div>

                {/* Total Highlight Green Card */}
                <div className="bg-[#edf7e4] rounded-2xl p-4 flex justify-between items-center border border-[#d2eab5]/70 mt-3">
                  <span className="font-bold text-xs sm:text-sm text-gray-900">
                    Total Pembayaran
                  </span>
                  <span className="font-black text-base sm:text-lg text-[#e11d48]">
                    Rp {formatRupiah(grandTotal)}
                  </span>
                </div>
              </section>

              {/* CARD 2: Status Pembayaran */}
              <section
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3.5"
                aria-label="Status Pembayaran"
              >
                {/* Header */}
                <div className="flex items-center gap-2 text-[#1b1c1c]">
                  <ShieldCheck className="w-4 h-4 text-gray-500" />
                  <h3 className="font-display font-bold text-sm sm:text-base text-gray-900">
                    Status Pembayaran
                  </h3>
                </div>

                {/* Status Verified Banner */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                      Pembayaran Berhasil
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {paymentVerifiedTimestamp}
                    </span>
                  </div>
                </div>

                {/* Verified Confirmation Sub-Box */}
                <div className="bg-[#fbfaf8] border border-gray-100 rounded-xl p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pembayaran kamu sudah terverifikasi. Pesanan sedang diproses oleh pihak toko.
                  </p>
                </div>
              </section>

              {/* CARD 3: Green Eco Impact Card */}
              <section
                className="bg-[#edf7e4] border border-[#d2eab5] rounded-3xl p-4 sm:p-5 flex items-start gap-3.5"
                aria-label="Dampak Lingkungan"
              >
                <div className="w-8 h-8 rounded-full bg-white text-brand-green flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Leaf className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-[#2c5000] leading-relaxed">
                  Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung
                  bisnis lokal.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Customer Footer */}
      <CustomerFooter
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Hubungi tim bantuan kami via WhatsApp: 0812-3456-7890', 'info');
        }}
      />
    </div>
  );
}

export default CustomerOrderDetail;
