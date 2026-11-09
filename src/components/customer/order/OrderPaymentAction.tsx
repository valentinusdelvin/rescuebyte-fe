import { Check, Tag, Info, CreditCard } from 'lucide-react';
import { formatRupiah } from '../../../utils/currency';

export interface OrderPaymentActionProps {
  activeStep: number;
  totalOriginalPrice: number;
  discountAmount: number;
  serviceFee: number;
  grandTotal: number;
  isVerifyingPayment: boolean;
  isSnapPopupOpen: boolean;
  isPaymentSessionLoading: boolean;
  onPayNow: () => void;
}

export function OrderPaymentAction({
  activeStep,
  totalOriginalPrice,
  discountAmount,
  serviceFee,
  grandTotal,
  isVerifyingPayment,
  isSnapPopupOpen,
  isPaymentSessionLoading,
  onPayNow,
}: OrderPaymentActionProps) {
  const isPaid = activeStep > 1;

  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-[#1b1c1c]">Rincian Pembayaran</h3>
        {!isPaid ? (
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

        {!isPaid ? (
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              disabled={isVerifyingPayment || isSnapPopupOpen || isPaymentSessionLoading}
              onClick={onPayNow}
              className="w-full py-3.5 bg-[#002b49] hover:bg-[#001f35] disabled:opacity-60 disabled:cursor-wait text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            >
              <CreditCard className="w-4 h-4 text-[#00b4d8]" />
              <span>
                {isVerifyingPayment
                  ? 'Memverifikasi pembayaran…'
                  : isPaymentSessionLoading
                  ? 'Memuat sesi pembayaran…'
                  : isSnapPopupOpen
                  ? 'Popup pembayaran terbuka…'
                  : 'Bayar Sekarang via Midtrans'}
              </span>
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
  );
}
