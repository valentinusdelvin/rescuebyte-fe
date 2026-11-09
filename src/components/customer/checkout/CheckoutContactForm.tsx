import { User, Edit2, Lock } from 'lucide-react';

export interface CheckoutContactFormProps {
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerPhoneError: string;
  setCustomerPhoneError: (val: string) => void;
  customerEmail: string;
  isEditingCustomer: boolean;
  setIsEditingCustomer: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CheckoutContactForm({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerPhoneError,
  setCustomerPhoneError,
  customerEmail,
  isEditingCustomer,
  setIsEditingCustomer,
}: CheckoutContactFormProps) {
  return (
    <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-700" />
          <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
            Informasi Customer
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsEditingCustomer((prev) => !prev)}
          className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditingCustomer ? 'Simpan' : 'Ubah Data'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
            NAMA LENGKAP
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={!isEditingCustomer}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
            NOMOR HP
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              if (e.target.value.trim()) setCustomerPhoneError('');
            }}
            disabled={!isEditingCustomer}
            autoComplete="tel"
            aria-invalid={Boolean(customerPhoneError)}
            aria-describedby={customerPhoneError ? 'checkout-phone-error' : undefined}
            className={`w-full px-3.5 py-2.5 rounded-xl border ${
              customerPhoneError ? 'border-[#ba1a1a]' : 'border-gray-200'
            } bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors focus-visible:ring-2 focus-visible:ring-primary`}
          />
          {customerPhoneError && (
            <p id="checkout-phone-error" className="mt-1.5 text-xs text-[#ba1a1a]" role="alert">
              {customerPhoneError}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              EMAIL
            </label>
            <span className="text-[10px] text-gray-400 font-medium">Terkunci</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="email"
              value={customerEmail}
              readOnly
              disabled
              aria-readonly="true"
              title="Email akun terdaftar dan tidak dapat diubah saat checkout"
              className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-100/90 text-xs sm:text-sm font-medium text-gray-600 cursor-not-allowed select-none transition-colors"
            />
            <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
