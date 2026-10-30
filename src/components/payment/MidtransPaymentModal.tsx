import { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, Building2, Smartphone } from 'lucide-react';

export interface MidtransPaymentModalProps {
  isOpen: boolean;
  orderId: string;
  storeName: string;
  totalAmount: number;
  snapToken?: string;
  snapRedirectUrl?: string;
  onSuccess: () => void;
  onClose: () => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function MidtransPaymentModal({
  isOpen,
  orderId,
  storeName,
  totalAmount,
  snapToken,
  snapRedirectUrl,
  onSuccess,
  onClose,
}: MidtransPaymentModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<'qris' | 'bca' | 'mandiri' | 'shopeepay'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsPaid(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Attempt to invoke real Midtrans Snap JS popup if token is present
  useEffect(() => {
    if (isOpen && snapToken && typeof window !== 'undefined' && (window as any).snap?.pay) {
      try {
        (window as any).snap.pay(snapToken, {
          onSuccess: () => {
            setIsPaid(true);
            setTimeout(() => {
              onSuccess();
            }, 600);
          },
          onPending: () => {
            setIsPaid(true);
            setTimeout(() => {
              onSuccess();
            }, 600);
          },
          onError: () => {
            setIsProcessing(false);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      } catch (err) {
        console.warn('Midtrans Snap SDK execution fallback to simulator modal:', err);
      }
    }
  }, [isOpen, snapToken, onSuccess]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        onSuccess();
      }, 700);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="midtrans-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Midtrans Branding */}
        <div className="bg-[#002b49] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#00b4d8] font-black text-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">MIDTRANS</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-[#00b4d8]/20 text-[#90e0ef]">
                  Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Payment Gateway Simulator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Tutup halaman pembayaran"
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          {isPaid ? (
            <div className="py-8 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
              <h3 className="text-xl font-extrabold text-slate-800">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Transaksi Anda sebesar Rp {formatRupiah(totalAmount)} telah berhasil diproses oleh Midtrans Sandbox.
              </p>
            </div>
          ) : (
            <>
              {/* Transaction Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Total Pembayaran</p>
                  <p className="text-xl font-black text-[#002b49]">Rp {formatRupiah(totalAmount)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Order: #{orderId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">
                    {storeName}
                  </span>
                </div>
              </div>

              {/* Channel Selector */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Pilih Metode Pembayaran
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('qris')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      selectedChannel === 'qris'
                        ? 'border-[#002b49] bg-[#002b49]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-[#002b49]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">GoPay / QRIS</p>
                      <p className="text-[10px] text-slate-500">Scan & Pay</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('bca')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      selectedChannel === 'bca'
                        ? 'border-[#002b49] bg-[#002b49]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#002b49]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">BCA Virtual</p>
                      <p className="text-[10px] text-slate-500">Verifikasi instan</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('mandiri')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      selectedChannel === 'mandiri'
                        ? 'border-[#002b49] bg-[#002b49]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#002b49]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Mandiri Bill</p>
                      <p className="text-[10px] text-slate-500">ATM & Livin</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('shopeepay')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      selectedChannel === 'shopeepay'
                        ? 'border-[#002b49] bg-[#002b49]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#002b49]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">ShopeePay</p>
                      <p className="text-[10px] text-slate-500">E-Wallet</p>
                    </div>
                  </button>
                </div>
              </div>

              {snapRedirectUrl && (
                <div className="text-center">
                  <a
                    href={snapRedirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#002b49] font-bold underline hover:text-[#001f35]"
                  >
                    Buka Halaman Snap Asli di Tab Baru &gt;
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 bg-[#002b49] hover:bg-[#001f35] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00b4d8]" />
                  <span>{isProcessing ? 'Memproses Pembayaran...' : `Bayar Sekarang (Rp ${formatRupiah(totalAmount)})`}</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
