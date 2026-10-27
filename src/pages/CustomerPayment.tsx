import { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Clock,
  Copy,
  Download,
  Check,
  CheckCircle2,
  RefreshCw,
  FileText,
  Calendar,
  MapPin,
  Info,
  Lock,
  Leaf,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { PaymentOrderData } from '../types';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import rescueBiteLogo from '../assets/logo.svg';
import { clearCart } from '../services/cartService';

export interface CustomerPaymentProps {
  orderData?: PaymentOrderData | null;
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateOrders?: () => void;
  onNavigateOrderDetail?: (orderData: PaymentOrderData) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type PaymentMethodType =
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'bca_va'
  | 'mandiri_va'
  | 'bni_va'
  | 'bri_va';

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * QR Code SVG Component with RescueBite Leaf Emblem in Center
 */
function QRCodeDisplay({ orderId, amount }: { orderId: string; amount: number }) {
  return (
    <div className="relative w-44 h-44 sm:w-48 sm:h-48 p-2 bg-white rounded-xl flex items-center justify-center">
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full text-[#1b1c1c]"
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-label={`QR Code QRIS untuk pesanan ${orderId} senilai Rp ${formatRupiah(amount)}`}
      >
        {/* Top-Left Finder */}
        <rect x="10" y="10" width="36" height="36" fill="#1b1c1c" />
        <rect x="16" y="16" width="24" height="24" fill="#ffffff" />
        <rect x="22" y="22" width="12" height="12" fill="#1b1c1c" />

        {/* Top-Right Finder */}
        <rect x="114" y="10" width="36" height="36" fill="#1b1c1c" />
        <rect x="120" y="16" width="24" height="24" fill="#ffffff" />
        <rect x="126" y="22" width="12" height="12" fill="#1b1c1c" />

        {/* Bottom-Left Finder */}
        <rect x="10" y="114" width="36" height="36" fill="#1b1c1c" />
        <rect x="16" y="120" width="24" height="24" fill="#ffffff" />
        <rect x="22" y="126" width="12" height="12" fill="#1b1c1c" />

        {/* Alignment Patterns & Matrix Data Modules */}
        <rect x="52" y="14" width="6" height="6" />
        <rect x="64" y="14" width="6" height="6" />
        <rect x="76" y="14" width="6" height="6" />
        <rect x="88" y="14" width="6" height="6" />
        <rect x="100" y="14" width="6" height="6" />

        <rect x="14" y="52" width="6" height="6" />
        <rect x="26" y="52" width="6" height="6" />
        <rect x="38" y="52" width="6" height="6" />
        <rect x="14" y="64" width="6" height="6" />
        <rect x="32" y="64" width="6" height="6" />
        <rect x="14" y="76" width="6" height="6" />
        <rect x="26" y="76" width="6" height="6" />
        <rect x="38" y="76" width="6" height="6" />
        <rect x="14" y="88" width="6" height="6" />
        <rect x="32" y="88" width="6" height="6" />
        <rect x="14" y="100" width="6" height="6" />

        {/* Timing Pattern Rows & Columns */}
        <rect x="52" y="26" width="6" height="6" />
        <rect x="64" y="26" width="6" height="6" />
        <rect x="76" y="26" width="6" height="6" />
        <rect x="88" y="26" width="6" height="6" />

        <rect x="52" y="38" width="6" height="6" />
        <rect x="70" y="38" width="6" height="6" />
        <rect x="88" y="38" width="6" height="6" />
        <rect x="100" y="38" width="6" height="6" />

        <rect x="120" y="52" width="6" height="6" />
        <rect x="132" y="52" width="6" height="6" />
        <rect x="114" y="64" width="6" height="6" />
        <rect x="138" y="64" width="6" height="6" />
        <rect x="126" y="76" width="6" height="6" />
        <rect x="138" y="76" width="6" height="6" />
        <rect x="114" y="88" width="6" height="6" />
        <rect x="126" y="88" width="6" height="6" />
        <rect x="120" y="100" width="6" height="6" />

        {/* Bottom Modules */}
        <rect x="52" y="114" width="6" height="6" />
        <rect x="64" y="114" width="6" height="6" />
        <rect x="76" y="114" width="6" height="6" />
        <rect x="100" y="114" width="6" height="6" />
        <rect x="126" y="114" width="6" height="6" />
        <rect x="138" y="114" width="6" height="6" />

        <rect x="52" y="126" width="6" height="6" />
        <rect x="70" y="126" width="6" height="6" />
        <rect x="88" y="126" width="6" height="6" />
        <rect x="114" y="126" width="6" height="6" />
        <rect x="132" y="126" width="6" height="6" />

        <rect x="64" y="138" width="6" height="6" />
        <rect x="76" y="138" width="6" height="6" />
        <rect x="100" y="138" width="6" height="6" />
        <rect x="120" y="138" width="6" height="6" />
        <rect x="138" y="138" width="6" height="6" />

        {/* Center cutout for logo badge */}
        <rect x="62" y="62" width="36" height="36" rx="8" fill="#ffffff" />
        <rect x="65" y="65" width="30" height="30" rx="6" fill="#e8f5e9" />
      </svg>

      {/* RescueBite Leaf Emblem in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-full bg-white border border-brand-green/30 shadow-xs flex items-center justify-center p-1">
          <img src={rescueBiteLogo} alt="RescueBite" className="w-5 h-5 object-contain" />
        </div>
      </div>
    </div>
  );
}

/**
 * CustomerPayment Page Component
 * Renders the full payment confirmation page matching Image 2 with QRIS, E-Wallet,
 * Virtual Account selection, live countdown timer, and booking summary.
 */
export function CustomerPayment({
  orderData,
  onNavigateBack,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onNavigateOrders,
  onNavigateOrderDetail,
  onShowToast,
}: CustomerPaymentProps) {
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
    imageSrc: cardMonsieurSpoon,
    storeAddress: 'Jl. Senopati No. 42, Kebayoran Baru',
  };

  const selectedDate = orderData?.pickupDate || 'Sabtu, 26 Oktober 2025';
  const selectedTimeSlot = orderData?.pickupTimeSlot || '15.00 - 18.00 WIB';
  const storeAddress =
    orderData?.primaryStore?.storeAddress ||
    primaryItem.storeAddress ||
    'Jl. Senopati No. 42, Kebayoran Baru';

  const totalBoxes = orderData?.totalBoxes || primaryItem.quantity || 1;
  const subtotal = orderData?.subtotal || primaryItem.rescuePrice * totalBoxes;
  const discountTotal =
    orderData?.discountTotal ||
    (primaryItem.originalPrice - primaryItem.rescuePrice) * totalBoxes;
  const serviceFee = orderData?.serviceFee || 2000;
  const grandTotal = orderData?.grandTotal || subtotal + serviceFee;

  // Selected Payment Method
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('qris');

  // Countdown Timer: 14:56 (896 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(896);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [secondsRemaining]);

  // Loading & Submission states
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasCopiedNominal, setHasCopiedNominal] = useState(false);

  // Method Labels for dynamic total highlight
  const methodLabels: Record<PaymentMethodType, string> = {
    qris: 'QRIS (Instant QR Pay)',
    gopay: 'GoPay (E-Wallet)',
    ovo: 'OVO (E-Wallet)',
    dana: 'DANA (E-Wallet)',
    shopeepay: 'ShopeePay (E-Wallet)',
    bca_va: 'BCA Virtual Account',
    mandiri_va: "Mandiri Livin' VA",
    bni_va: 'BNI Virtual Account',
    bri_va: 'BRI BRIVA',
  };

  // Copy nominal handler
  const handleCopyNominal = () => {
    try {
      navigator.clipboard.writeText(grandTotal.toString());
      setHasCopiedNominal(true);
      if (onShowToast) {
        onShowToast(`Nominal Rp ${formatRupiah(grandTotal)} berhasil disalin!`, 'success');
      }
      setTimeout(() => setHasCopiedNominal(false), 2500);
    } catch {
      if (onShowToast) {
        onShowToast(`Nominal Rp ${formatRupiah(grandTotal)} disalin.`, 'info');
      }
    }
  };

  // Download / Copy QR Code handler
  const handleDownloadQr = () => {
    if (onShowToast) {
      onShowToast('QR Code pembayaran berhasil disalin ke clipboard!', 'success');
    }
  };

  // Check Status handler
  const handleCheckStatus = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (onShowToast) {
        onShowToast(
          'Pembayaran sedang diverifikasi secara otomatis. Silakan selesaikan transaksi di aplikasi perbankanmu.',
          'info'
        );
      }
    }, 1200);
  };

  // Final confirmation: Bayar Sekarang
  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);

      // If came from cart, clear cart
      if (orderData?.source === 'cart') {
        clearCart();
      }

      if (onShowToast) {
        onShowToast('Pembayaran berhasil diverifikasi! Pesanan dibuat.', 'success');
      }

      // Directly navigate to Order Detail page
      if (onNavigateOrderDetail) {
        const finalOrder: PaymentOrderData = orderData || {
          orderId,
          items: [primaryItem],
          primaryStore: {
            storeName: primaryItem.storeName,
            storeAvatar: 'TR',
            storeAddress,
            rating: 4.8,
            reviewCount: 320,
          },
          pickupDate: selectedDate,
          pickupTimeSlot: selectedTimeSlot,
          customerInfo: {
            name: 'Budi Santoso',
            phone: '081234567890',
            email: 'budi@example.com',
          },
          totalBoxes,
          subtotal,
          discountTotal,
          serviceFee,
          grandTotal,
          source: 'direct',
        };
        onNavigateOrderDetail(finalOrder);
      } else if (onNavigateOrders) {
        onNavigateOrders();
      } else if (onNavigateMarketplace) {
        onNavigateMarketplace();
      }
    }, 1000);
  };

  return (
    <div
      className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between"
      id="customer-payment-page-root"
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

        {/* Main Content Area */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Page Heading */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Pembayaran
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Selesaikan pembayaran untuk mengamankan reservasi Mystery Box kamu.
            </p>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Metode Pembayaran (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-black/10 shadow-xs flex flex-col gap-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base sm:text-lg text-[#1b1c1c]">
                        Pilih Metode Pembayaran
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pilih metode pembayaran online yang paling nyaman untuk kamu.
                      </p>
                    </div>
                  </div>

                  {/* Countdown Timer Badge */}
                  <div className="self-start sm:self-center bg-[#fef3e2] text-[#b45309] border border-[#fed7aa] px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold tracking-tight shrink-0 shadow-2xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Selesaikan dalam {formattedTimer}</span>
                  </div>
                </div>

                {/* CATEGORY 1: QRIS (Instant QR Pay) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1b1c1c]">
                        QRIS (Instant QR Pay)
                      </span>
                      <span className="bg-[#dcfce7] text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        Rekomendasi
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-primary">
                      Bebas Biaya Admin
                    </span>
                  </div>

                  {/* QRIS Inner Card */}
                  <div
                    onClick={() => setSelectedMethod('qris')}
                    className={`bg-[#fbfbf9] rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer ${
                      selectedMethod === 'qris'
                        ? 'border-[#1b1c1c] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Left: QR Code Display Card */}
                      <div className="md:col-span-5 flex flex-col items-center bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
                        <div className="w-full flex items-center justify-between text-xs font-bold mb-2 px-1">
                          <span className="tracking-tight text-gray-900 font-extrabold text-sm">
                            QRIS
                          </span>
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                            RESCUEBITE PAY
                          </span>
                        </div>

                        {/* Interactive QR SVG */}
                        <QRCodeDisplay orderId={orderId} amount={grandTotal} />

                        <div className="mt-2 text-center w-full">
                          <p className="text-[11px] text-gray-500 font-mono">
                            Order ID: <span className="font-bold text-gray-700">{orderId}</span>
                          </p>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="font-display font-extrabold text-lg sm:text-xl text-[#e11d48]">
                              Rp {formatRupiah(grandTotal)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyNominal();
                              }}
                              className="text-gray-400 hover:text-black transition-colors p-1 cursor-pointer"
                              title="Salin nominal transfer"
                              aria-label="Salin nominal transfer"
                            >
                              {hasCopiedNominal ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadQr();
                          }}
                          className="mt-3 w-full py-2 px-3 rounded-xl bg-[#f4f4f2] hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh / Salin QR Code</span>
                        </button>
                      </div>

                      {/* Right: Scan QR Instructions */}
                      <div className="md:col-span-7 flex flex-col gap-3">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                            Scan QR untuk Membayar
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Buka aplikasi mobile banking (BCA, Mandiri, BRI, BNI) atau e-wallet (GoPay, OVO, DANA, ShopeePay) pilihanmu.
                          </p>
                        </div>

                        {/* Numbered Steps */}
                        <div className="flex flex-col gap-2.5 mt-1 text-xs text-gray-700">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              1
                            </span>
                            <p className="leading-snug">
                              Buka fitur <strong className="font-bold text-gray-900">QRIS / Bayar</strong> pada aplikasi e-wallet atau perbankanmu.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              2
                            </span>
                            <p className="leading-snug">
                              Arahkan kamera ke QR code di samping atau unggah screenshot gambar QR.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              3
                            </span>
                            <p className="leading-snug">
                              Periksa nominal tepat <strong className="font-bold text-gray-900">Rp {formatRupiah(grandTotal)}</strong> dan konfirmasi nama merchant: <strong className="font-bold text-gray-900">RescueBite Indonesia</strong>.
                            </p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              4
                            </span>
                            <p className="leading-snug">
                              Masukkan PIN dan sistem akan memperbarui status secara otomatis.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 2: Dompet Digital (E-Wallet) */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1b1c1c]">
                      Dompet Digital (E-Wallet)
                    </span>
                    <span className="text-xs text-gray-400">
                      Langsung terhubung
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* GoPay */}
                    <div
                      onClick={() => setSelectedMethod('gopay')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'gopay'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00a5cf]/15 text-[#00a5cf] flex items-center justify-center font-bold text-xs shrink-0">
                          <Smartphone className="w-5 h-5 text-[#00a5cf]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            GoPay
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Satu klik via aplikasi Gojek
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'gopay'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'gopay' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* OVO */}
                    <div
                      onClick={() => setSelectedMethod('ovo')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'ovo'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4c2a86]/15 text-[#4c2a86] flex items-center justify-center font-bold text-xs shrink-0">
                          <Wallet className="w-5 h-5 text-[#4c2a86]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            OVO
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Notifikasi push otomatis
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'ovo'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'ovo' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* DANA */}
                    <div
                      onClick={() => setSelectedMethod('dana')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'dana'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#118eea]/15 text-[#118eea] flex items-center justify-center font-bold text-xs shrink-0">
                          <Smartphone className="w-5 h-5 text-[#118eea]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            DANA
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            DANA Saldo &amp; Terhubung
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'dana'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'dana' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* ShopeePay */}
                    <div
                      onClick={() => setSelectedMethod('shopeepay')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'shopeepay'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ee4d2d]/15 text-[#ee4d2d] flex items-center justify-center font-bold text-xs shrink-0">
                          <Wallet className="w-5 h-5 text-[#ee4d2d]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            ShopeePay
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Bisa gunakan koin Shopee
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'shopeepay'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'shopeepay' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 3: Virtual Account (Verifikasi Otomatis) */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1b1c1c]">
                      Virtual Account (Verifikasi Otomatis)
                    </span>
                    <span className="text-xs text-gray-400">
                      ATM &amp; Mobile Banking
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* BCA VA */}
                    <div
                      onClick={() => setSelectedMethod('bca_va')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'bca_va'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#003884]/15 text-[#003884] flex items-center justify-center font-extrabold text-xs shrink-0">
                          BCA
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            BCA Virtual Account
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Verifikasi Instan 24 Jam
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'bca_va'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'bca_va' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* Mandiri Livin' VA */}
                    <div
                      onClick={() => setSelectedMethod('mandiri_va')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'mandiri_va'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#002f6c]/15 text-[#002f6c] flex items-center justify-center font-extrabold text-xs shrink-0">
                          MDR
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            Mandiri Livin' VA
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Konfirmasi otomatis
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'mandiri_va'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'mandiri_va' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* BNI VA */}
                    <div
                      onClick={() => setSelectedMethod('bni_va')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'bni_va'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#f15a24]/15 text-[#f15a24] flex items-center justify-center font-extrabold text-xs shrink-0">
                          BNI
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            BNI Virtual Account
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Konfirmasi otomatis
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'bni_va'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'bni_va' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* BRI BRIVA */}
                    <div
                      onClick={() => setSelectedMethod('bri_va')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedMethod === 'bri_va'
                          ? 'border-[#1b1c1c] bg-white shadow-xs'
                          : 'border-gray-200 bg-[#fbfbf9] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00529c]/15 text-[#00529c] flex items-center justify-center font-extrabold text-xs shrink-0">
                          BRI
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                            BRI BRIVA
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Konfirmasi otomatis
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedMethod === 'bri_va'
                            ? 'border-[#1b1c1c] bg-[#1b1c1c]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedMethod === 'bri_va' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Notice & Cek Status Button */}
                <div className="bg-[#fbfbf9] border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="font-bold text-gray-900 block sm:inline">
                        Setelah pembayaran berhasil, halaman akan otomatis diperbarui.
                      </strong>{' '}
                      Jika status belum berubah dalam 1 menit, klik tombol periksa status di samping.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={isVerifying}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer shadow-2xs select-none disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>Cek Status Pembayaran</span>
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column: Ringkasan Reservasi & Important Info (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5 sticky top-28">
              {/* CARD 1: Ringkasan Reservasi */}
              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <h2 className="font-bold text-base text-[#1b1c1c]">
                    Ringkasan Reservasi
                  </h2>
                </div>

                {/* Product Item Preview */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-black/10">
                    <img
                      src={primaryItem.imageSrc || cardMonsieurSpoon}
                      alt={primaryItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-[#1b1c1c] truncate">
                      {primaryItem.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {primaryItem.storeName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Roti &amp; Pastry
                      </span>
                      <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                        ✓ Halal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pickup Details Box */}
                <div className="bg-[#f4f7f2] border border-[#e0ebd7] rounded-2xl p-3.5 flex flex-col gap-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="font-semibold text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>Jadwal Ambil: <strong className="font-bold text-gray-900">{selectedTimeSlot}</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600 leading-tight">{storeAddress}</span>
                  </div>
                </div>

                {/* Breakdown Lines */}
                <div className="flex flex-col gap-2 text-xs text-gray-600 pt-1">
                  <div className="flex items-center justify-between">
                    <span>Harga per box</span>
                    <span className="font-semibold text-gray-900">
                      Rp {formatRupiah(primaryItem.rescuePrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Jumlah pesanan</span>
                    <span className="font-semibold text-gray-900">{totalBoxes} Box</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      Rp {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      Hemat Surplus{' '}
                      <span className="bg-[#dcfce7] text-primary text-[10px] font-bold px-1.5 py-0.2 rounded">
                        50%
                      </span>
                    </span>
                    <span className="font-semibold text-primary">
                      - Rp {formatRupiah(discountTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      Biaya Layanan Penyelamatan
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-semibold text-gray-900">
                      Rp {formatRupiah(serviceFee)}
                    </span>
                  </div>
                </div>

                {/* Highlight Total Card */}
                <div className="bg-[#edf7e4] border border-[#d3ecc0] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-brand-green uppercase tracking-wider">
                      TOTAL PEMBAYARAN
                    </span>
                    <span className="text-[11px] font-medium text-gray-600 mt-0.5">
                      Metode: {methodLabels[selectedMethod]}
                    </span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#e11d48]">
                    Rp {formatRupiah(grandTotal)}
                  </span>
                </div>

                {/* Notice text */}
                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  *Reservasi akan otomatis terkonfirmasi dan Kupon Pengambilan QR akan langsung diterbitkan begitu pembayaran terverifikasi.
                </p>

                {/* Primary Button: Bayar Sekarang */}
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isVerifying}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#1b1c1c] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                  id="btn-confirm-payment-now"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isVerifying
                      ? 'Memverifikasi Pembayaran...'
                      : `Bayar Sekarang Rp ${formatRupiah(grandTotal)}`}
                  </span>
                </button>

                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateBack) onNavigateBack();
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-black transition-colors text-center cursor-pointer py-1"
                >
                  ← Kembali ke Rincian Reservasi
                </button>
              </section>

              {/* CARD 2: Informasi Penting */}
              <section className="bg-white rounded-3xl p-5 border border-black/10 shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                  <h3 className="font-bold text-sm text-[#1b1c1c]">
                    Informasi Penting
                  </h3>
                </div>

                <ul className="text-xs text-gray-600 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0 mt-1.5" />
                    <span>
                      Pastikan nominal transfer/bayar persis <strong className="font-bold text-gray-900">Rp {formatRupiah(grandTotal)}</strong> tanpa pembulatan agar tercatat instan.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0 mt-1.5" />
                    <span>
                      Periksa jadwal toko: penjemputan hanya berlaku pukul <strong className="font-bold text-gray-900">{selectedTimeSlot}</strong> hari ini.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0 mt-1.5" />
                    <span>
                      Status pesanan akan langsung dialihkan ke tiket kupon pengambilan setelah transaksi sukses.
                    </span>
                  </li>
                </ul>
              </section>

              {/* CARD 3: Dampak Nyata Aksi Kamu */}
              <section className="bg-[#edf7e4] border border-[#d3ecc0] rounded-3xl p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                    Dampak Nyata Aksi Kamu
                  </h4>
                  <p className="text-xs text-[#2c5000] leading-snug mt-0.5">
                    Kamu berhasil menyelamatkan <strong className="font-bold">1 porsi kuliner</strong> bernutrisi dan mereduksi <strong className="font-bold">0.8 kg jejak emisi CO₂</strong>.
                  </p>
                </div>
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

export default CustomerPayment;
