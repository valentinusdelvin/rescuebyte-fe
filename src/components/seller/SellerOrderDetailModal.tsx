import { useState } from 'react';
import { X, Copy, Check, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MerchantOrderItem } from '../../services/orderService';
import cardMonsieurSpoon from '../../assets/customer/card-monsieur-spoon.jpg';

export interface SellerOrderDetailModalProps {
  order: MerchantOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (order: MerchantOrderItem) => void;
  onCancel: (order: MerchantOrderItem) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * SellerOrderDetailModal Component
 * Interactive order verification popup before confirming order handover.
 * Strictly replicates visual layout from reference image.
 */
export function SellerOrderDetailModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onShowToast,
}: SellerOrderDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    if (onShowToast) onShowToast('ID Pesanan disalin ke clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmClick = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = async () => {
    setIsSubmitting(true);
    try {
      await onCancel(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerInitials = order.customerName
    ? order.customerName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AP';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-order-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full mx-auto shadow-2xl relative border border-gray-100 flex flex-col gap-4 text-gray-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title & Close Button */}
        <div className="flex items-start justify-between">
          <div>
            <h3
              className="text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight"
              id="modal-order-title"
            >
              Detail Pesanan
            </h3>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 mt-2 transition-colors cursor-pointer select-none"
              title="Salin ID Pesanan"
            >
              <span>ID: #{order.orderNumber}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            aria-label="Tutup Detail Pesanan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer, Waktu Pesan, Mitra Lokasi (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-xs">
          {/* Customer */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              CUSTOMER
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0 border border-gray-300">
                {customerInitials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1b1c1c] truncate">{order.customerName}</p>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {order.customerPhone || '+62 812-9876-5432'}
                </p>
              </div>
            </div>
          </div>

          {/* Waktu Pesan */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              WAKTU PESAN
            </span>
            <p className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
              {order.pickupDate || '29 Okt 2026, 14:15 WIB'}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">Dibuat via RescueBite App</p>
          </div>

          {/* Mitra Lokasi */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              MITRA LOKASI
            </span>
            <p className="font-bold text-xs sm:text-sm text-[#1b1c1c] truncate">
              {order.storeName || 'Toko Reza'}
            </p>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              Cabang Tebet, Jakarta Selatan
            </p>
          </div>
        </div>

        {/* Section: ITEM PESANAN */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            ITEM PESANAN
          </span>

          <div className="border border-gray-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfcfb]">
            {/* Left: Thumbnail & Item Description */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                <img
                  src={order.productImage || cardMonsieurSpoon}
                  alt={order.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = cardMonsieurSpoon;
                  }}
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                    {order.productName}
                  </h4>
                  <span className="bg-[#1b1c1c] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {order.totalBoxes} Box
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">
                  Kategori: Roti &amp; Pastry • <span className="text-emerald-700 font-bold">✓ Halal</span> • Per box isi 1–2 pcs roti + 1 pcs pastry.
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">
                  Harga Satuan: Rp {formatRupiah(order.rescuePrice)} /box
                </p>
              </div>
            </div>

            {/* Right: Price & Payment Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
              <div className="flex items-baseline gap-2">
                {order.originalPrice > order.rescuePrice && (
                  <span className="text-xs text-gray-400 line-through">
                    Rp {formatRupiah(order.originalPrice * order.totalBoxes)}
                  </span>
                )}
                <span className="text-sm sm:text-base font-extrabold text-[#1b1c1c]">
                  Rp {formatRupiah(order.grandTotal)}
                </span>
              </div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Lunas
              </span>
            </div>
          </div>
        </div>

        {/* Dua Kartu Info (Jadwal Pengambilan & Status Pembayaran) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Card 1: Jadwal Pengambilan */}
          <div className="bg-[#fffdf2] border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900">Jadwal Pengambilan</p>
              <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] mt-0.5">
                {order.pickupDate || 'Hari Ini, 30 Oktober 2026'}
              </p>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                {order.pickupTime || '16.00 – 17.00 WIB'} (Sisa 40 menit)
              </p>
            </div>
          </div>

          {/* Card 2: Status Pembayaran */}
          <div className="bg-[#f4fcf6] border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">Status Pembayaran</p>
              <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] mt-0.5">
                Lunas (Terverifikasi)
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                QRIS Settlement Otomatis
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Warning Alert Note & Action Buttons */}
        <div className="mt-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 max-w-sm">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Pastikan produk dan jumlah pesanan sudah sesuai sebelum mengonfirmasi penyerahan kepada pembeli.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-end shrink-0">
            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-[#3c6a00] hover:bg-[#325800] active:scale-[0.98] text-white font-bold text-sm sm:text-base px-8 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Ya!'}
            </button>

            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-[#ba1a1a] hover:bg-[#991414] active:scale-[0.98] text-white font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              Batalkan!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

