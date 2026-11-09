import { Info, Lock, Receipt, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../../../utils/currency';

interface CartSummaryProps {
  totalBoxes: number;
  subtotal: number;
  discountTotal: number;
  serviceFee: number;
  grandTotal: number;
  onCheckout: () => void;
}

export function CartSummary({
  totalBoxes, subtotal, discountTotal, serviceFee, grandTotal, onCheckout,
}: CartSummaryProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28 z-20 self-start">
                {/* 1. Card: Penting untuk Diketahui */}
                <article className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-gray-700" />
                    <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                      Penting untuk Diketahui
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3.5 mt-1">
                    {/* Item 1: Pesanan dikelompokkan per toko */}
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#1b1c1c]">
                        Pesanan dikelompokkan per toko
                      </span>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        Setiap toko memiliki lokasi dan waktu pickup yang berbeda.
                      </p>
                    </div>

                    {/* Item 2: Stok tidak dijamin */}
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#1b1c1c]">
                        Stok tidak dijamin
                      </span>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        Stok akan divalidasi ulang saat checkout.
                      </p>
                    </div>

                    {/* Item 3: Mystery Box */}
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#1b1c1c]">
                        Mystery Box
                      </span>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        Isi menyesuaikan stok harian toko. Tidak dapat memilih menu tertentu.
                      </p>
                    </div>
                  </div>
                </article>

                {/* 2. Card: Ringkasan Pesanan */}
                <article className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4.5 h-4.5 text-gray-700" />
                    <h2 className="font-bold text-base text-[#1b1c1c]">
                      Ringkasan Pesanan
                    </h2>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-gray-600 pt-1">
                    <div className="flex items-center justify-between">
                      <span>Total Item</span>
                      <span className="font-semibold text-gray-900">{totalBoxes} box</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">Rp {formatRupiah(subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        Diskon <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.5 rounded-md">50%</span>
                      </span>
                      <span className="font-semibold text-[#e11d48]">
                        - Rp {formatRupiah(discountTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Biaya Layanan</span>
                        <span className="relative group inline-flex items-center">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 focus:text-gray-700 focus:outline-none transition-colors cursor-help p-0.5 rounded"
                            aria-label="Informasi biaya layanan"
                            title="Biaya layanan untuk pengembangan aplikasi"
                          >
                            <Info className="w-3.5 h-3.5" />
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
                      <span className="font-semibold text-gray-900">Rp {formatRupiah(serviceFee)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1b1c1c]">Total Pembayaran</span>
                    <span className="font-black text-xl text-[#e11d48] font-display">
                      Rp {formatRupiah(grandTotal)}
                    </span>
                  </div>

                  {/* Impact Note Banner */}
                  <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#24521e]">
                    <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung bisnis lokal.
                    </p>
                  </div>

                  {/* Checkout Button matching Image 3 */}
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={onCheckout}
                      disabled={totalBoxes === 0}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                      id="btn-lanjut-checkout"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Lanjut ke Checkout →</span>
                    </button>
                  </div>
                </article>
              </div>
  );
}
