import { MapPin, ExternalLink, RefreshCw, ArrowLeft, ClipboardList } from 'lucide-react';

export interface OrderPickupInfoProps {
  storeName: string;
  storeAvatar?: string;
  storeAddress?: string;
  pickupSchedule?: string;
  activeStep: number;
  onNavigateStore?: (storeName: string) => void;
  onNavigateOrders?: () => void;
  onNavigateMarketplace?: () => void;
}

export function OrderPickupInfo({
  storeName,
  storeAvatar,
  storeAddress,
  pickupSchedule,
  activeStep,
  onNavigateStore,
  onNavigateOrders,
  onNavigateMarketplace,
}: OrderPickupInfoProps) {
  const handleStoreClick = () => {
    if (onNavigateStore) onNavigateStore(storeName);
    else onNavigateMarketplace?.();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Card: Mitra F&B Penyedia */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-[#1b1c1c]">Mitra F&B Penyedia</h3>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#1b1c1c] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {storeAvatar && (storeAvatar.startsWith('http') || storeAvatar.startsWith('/')) ? (
              <img src={storeAvatar} alt={storeName} className="w-full h-full object-cover" />
            ) : (
              <span>{(storeName || 'TK').slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h4
                onClick={handleStoreClick}
                className="text-sm font-bold text-[#1b1c1c] hover:text-emerald-700 hover:underline cursor-pointer truncate"
              >
                {storeName}
              </h4>
            </div>

            <div className="flex items-start gap-1.5 mt-1 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
              <p className="line-clamp-2">{storeAddress || 'Alamat toko belum tersedia'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            Jadwal Ambil: {pickupSchedule || 'Belum tersedia'}
          </span>
          <button
            type="button"
            onClick={handleStoreClick}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1b1c1c] hover:text-emerald-700 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span>Kunjungi Halaman Toko</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Action Buttons */}
      {activeStep === 1 ? (
        <button
          type="button"
          onClick={onNavigateOrders}
          className="bg-[#eae7e7] hover:bg-slate-300 text-slate-800 text-sm font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 transition cursor-pointer w-full focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[44px]"
        >
          <ClipboardList className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Riwayat Pesanan</span>
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <button
            type="button"
            onClick={handleStoreClick}
            className="bg-[#1b1c1c] hover:bg-black text-white text-sm font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Beli Lagi di {storeName}</span>
          </button>
          <button
            type="button"
            onClick={onNavigateOrders}
            className="bg-[#eae7e7] hover:bg-slate-300 text-slate-800 text-sm font-bold px-6 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 transition cursor-pointer flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Riwayat Pesanan</span>
          </button>
        </div>
      )}
    </div>
  );
}
