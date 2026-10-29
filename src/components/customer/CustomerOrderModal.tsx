import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { CustomerMysteryBox } from '../../types';

export interface CustomerOrderModalProps {
  item: CustomerMysteryBox | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (item: CustomerMysteryBox, quantity: number, notes: string) => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Interactive Customer Order Checkout Modal
 * Provides order preview, quantity adjustment, store notes, and instant confirmation.
 * Complies with .agents/docs/architecture.md, security.md, and accessibility standards.
 */
export function CustomerOrderModal({
  item,
  isOpen,
  onClose,
  onConfirmOrder,
}: CustomerOrderModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('Reza Akbar');
  const [phone, setPhone] = useState<string>('0812-3456-7890');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset state when modal opens with new item
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const subtotal = item.rescuePrice * quantity;
  const originalSubtotal = item.originalPrice * quantity;
  const totalSavings = originalSubtotal - subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmOrder(item, quantity, notes);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full">
              Penyelamatan Pangan
            </span>
            <h2 id="order-modal-title" className="text-xl font-bold text-[#1b1c1c] mt-1.5">
              Amankan Mystery Box
            </h2>
          </div>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Tutup modal pesanan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Selected Item Summary Card */}
          <div className="flex gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={item.imageSrc}
              alt={item.storeName}
              className="w-20 h-20 object-cover rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-500 font-medium block truncate">
                {item.category}
              </span>
              <h3 className="font-bold text-[#1b1c1c] text-base truncate">
                {item.storeName}
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                {item.pickupTime}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-[#1b1c1c]">
                  Rp {formatRupiah(item.rescuePrice)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  Rp {formatRupiah(item.originalPrice)}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Hemat {item.discountPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
            <div>
              <label htmlFor="quantity-input" className="font-semibold text-sm text-[#1b1c1c] block">
                Jumlah Box
              </label>
              <span className="text-xs text-gray-500">
                Maks. sisa box tersedia
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Kurangi porsi"
              >
                -
              </button>
              <span id="quantity-input" className="w-8 text-center font-bold text-base text-[#1b1c1c]">
                {quantity}
              </span>
              <button
                type="button"
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                disabled={quantity >= 5}
                onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                aria-label="Tambah porsi"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Pengambil
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                No. WhatsApp (Notifikasi)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
              />
            </div>
          </div>

          {/* Notes for Store */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Catatan untuk Toko (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Tidak pakai sambal, atau ada alergi kacang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
            />
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Harga Normal ({quantity}x)</span>
              <span className="line-through">Rp {formatRupiah(originalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Penghematan Kamu</span>
              <span>-Rp {formatRupiah(totalSavings)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1b1c1c] pt-2 border-t border-emerald-200/50">
              <span>Total Bayar di Tempat</span>
              <span className="text-brand-green text-base">
                Rp {formatRupiah(subtotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-4 rounded-xl bg-[#0b1510] hover:bg-[#202a24] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Amankan Box Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
