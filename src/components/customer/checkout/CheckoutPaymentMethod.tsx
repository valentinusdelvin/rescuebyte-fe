import { CreditCard } from 'lucide-react';
import { PaymentMethod } from './types';

export interface CheckoutPaymentMethodProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export function CheckoutPaymentMethod({
  paymentMethod,
  setPaymentMethod,
}: CheckoutPaymentMethodProps) {
  const handleKeyDown = (e: React.KeyboardEvent, targetMethod: PaymentMethod) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setPaymentMethod(targetMethod);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setPaymentMethod('cod');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setPaymentMethod('online');
    }
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <CreditCard className="w-4 h-4 text-gray-700" />
        <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
          Metode Pembayaran
        </h2>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        role="radiogroup"
        aria-label="Pilih metode pembayaran"
      >
        {/* Option 1: Pembayaran Online */}
        <button
          type="button"
          role="radio"
          aria-checked={paymentMethod === 'online'}
          tabIndex={paymentMethod === 'online' ? 0 : -1}
          onClick={() => setPaymentMethod('online')}
          onKeyDown={(e) => handleKeyDown(e, 'online')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            paymentMethod === 'online'
              ? 'border-[#1f2620] bg-white shadow-xs'
              : 'border-gray-200 bg-[#fbfbf9] hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'online'
                    ? 'border-[#1f2620] bg-[#1f2620]'
                    : 'border-gray-300 bg-white'
                }`}
                aria-hidden="true"
              >
                {paymentMethod === 'online' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1b1c1c]">
                Pembayaran Online
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Bayar secara digital dengan QRIS, E-Wallet, atau Transfer Bank.
              </p>
            </div>
          </div>

          {/* Payment partner badges */}
          <div className="flex items-center gap-1.5 flex-wrap pl-7 pt-1">
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
              QRIS
            </span>
            <span className="bg-[#00a5cf] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              GoPay
            </span>
            <span className="bg-[#118eea] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              DANA
            </span>
            <span className="bg-[#4c2a86] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              OVO
            </span>
            <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              ShopeePay
            </span>
            <span className="text-[11px] text-gray-500 font-medium ml-1">
              Lainnya ›
            </span>
          </div>
        </button>

        {/* Option 2: Bayar di Tempat */}
        <button
          type="button"
          role="radio"
          aria-checked={paymentMethod === 'cod'}
          tabIndex={paymentMethod === 'cod' ? 0 : -1}
          onClick={() => setPaymentMethod('cod')}
          onKeyDown={(e) => handleKeyDown(e, 'cod')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            paymentMethod === 'cod'
              ? 'border-[#1f2620] bg-white shadow-xs'
              : 'border-gray-200 bg-[#fbfbf9] hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'cod'
                    ? 'border-[#1f2620] bg-[#1f2620]'
                    : 'border-gray-300 bg-white'
                }`}
                aria-hidden="true"
              >
                {paymentMethod === 'cod' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1b1c1c]">
                Bayar di Tempat (COD)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Lakukan pembayaran saat mengambil pesanan di toko.
              </p>
            </div>
          </div>

          <ul className="text-xs text-gray-500 space-y-1 pl-7 pt-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>Bayar langsung ke kasir di lokasi toko.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>Pastikan datang sesuai jadwal pickup.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>Pesanan akan diproses setelah pembayaran dikonfirmasi.</span>
            </li>
          </ul>
        </button>
      </div>
    </section>
  );
}
