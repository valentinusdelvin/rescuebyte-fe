import { FileText, ShoppingBag } from 'lucide-react';
import { CheckoutItem } from '../../../types';
import { StoreCheckoutGroup } from './types';
import { formatRupiah } from '../../../utils/currency';
import cardMonsieurSpoon from '../../../assets/customer/card-monsieur-spoon.jpg';

export interface CheckoutSummaryProps {
  checkoutItems: CheckoutItem[];
  storeGroups: StoreCheckoutGroup[];
  subtotal: number;
  discountTotal: number;
  serviceFee: number;
  grandTotal: number;
  isSubmitting: boolean;
  isSnapPopupOpen: boolean;
  onPayNow: () => void;
}

export function CheckoutSummary({
  checkoutItems,
  storeGroups,
  subtotal,
  discountTotal,
  serviceFee,
  grandTotal,
  isSubmitting,
  isSnapPopupOpen,
  onPayNow,
}: CheckoutSummaryProps) {
  const totalBoxes = checkoutItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <>
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <FileText className="w-4 h-4 text-gray-700" />
          <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
            Ringkasan Pembayaran
          </h2>
        </div>

        {/* Item preview list */}
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

        {/* Price Breakdown */}
        <div className="space-y-2 pt-2 border-t border-gray-150 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-gray-600">
            <span>Subtotal Makanan</span>
            <span className="font-semibold text-gray-900">Rp {formatRupiah(subtotal)}</span>
          </div>

          {discountTotal > 0 && (
            <div className="flex items-center justify-between text-gray-600">
              <span>Hemat (Diskon Surplus)</span>
              <span className="font-semibold text-emerald-600">
                - Rp {formatRupiah(discountTotal)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-gray-600">
            <span>Biaya Layanan</span>
            <span className="font-semibold text-gray-900">Rp {formatRupiah(serviceFee)}</span>
          </div>

          <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
            <span className="font-bold text-sm text-[#1b1c1c]">Total Pembayaran</span>
            <span className="font-black text-xl text-[#e11d48] font-display">
              Rp {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* Impact Card */}
        <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 text-xs text-[#24521e]">
          <span className="leading-relaxed">
            Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung bisnis lokal.
          </span>
        </div>
      </section>

      {/* Pay Button for Desktop */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onPayNow}
          disabled={isSubmitting || isSnapPopupOpen || totalBoxes === 0}
          className="w-full sm:w-auto min-w-55 py-3.5 px-6 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          id="btn-bayar-sekarang"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Memproses Pesanan...'
              : isSnapPopupOpen
                ? 'Popup pembayaran terbuka…'
                : 'Bayar Sekarang →'}
          </span>
        </button>
      </div>
    </>
  );
}
