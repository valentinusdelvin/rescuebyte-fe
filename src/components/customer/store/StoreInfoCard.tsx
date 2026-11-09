import { ChevronRight, Mail, Phone, Star, MessageSquare, MapPin } from 'lucide-react';
import { StoreDetailInfo, StoreProductItem } from './types';
import { formatRupiah } from '../../../utils/currency';

export interface StoreInfoCardProps {
  storeData: StoreDetailInfo;
  storeProducts: StoreProductItem[];
  onNavigateToProducts: () => void;
  onNavigateToReviews: () => void;
  onSelectProduct: (product: StoreProductItem) => void;
}

export function StoreInfoCard({
  storeData,
  storeProducts,
  onNavigateToProducts,
  onNavigateToReviews,
  onSelectProduct,
}: StoreInfoCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      {/* Card 1: Tentang Toko Description */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-3">
            Tentang {storeData.name}
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            <p>{storeData.description || 'Belum ada deskripsi untuk toko ini.'}</p>
          </div>
        </div>
      </section>

      {/* Card 2: Produk Tersedia Preview */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c]">Produk Tersedia</h2>
          <button
            type="button"
            onClick={onNavigateToProducts}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {storeProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition bg-slate-50/50"
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-video sm:aspect-square mb-2 bg-slate-200">
                    <img
                      src={prod.imageSrc}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    {typeof prod.stock === 'number' && (
                      <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Sisa {prod.stock}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-[#1b1c1c] line-clamp-2 min-h-8">
                    {prod.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xs font-extrabold text-[#1b1c1c]">
                      Rp {formatRupiah(prod.rescuePrice)}
                    </span>
                    <span className="text-[10px] text-white font-bold bg-[#22c55e] px-1 rounded-sm">
                      -{prod.discountPercent}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-through block">
                    Rp {formatRupiah(prod.originalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectProduct(prod)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-[#eef8ee] hover:bg-[#dcfce7] text-[#2d6a2e] text-xs font-bold transition cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Lihat Produk
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            Belum ada produk aktif yang tersedia saat ini di toko ini.
          </div>
        )}
      </section>

      {/* Card 3: Informasi Kontak */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-4 sm:mb-5">
            Informasi Toko
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-center">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate" title={storeData.email}>
                  {storeData.email}
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kontak</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate" title={storeData.phone}>
                  {storeData.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card 4: Ringkasan Toko */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-[#1b1c1c]">Ringkasan Toko</h2>
            <button
              type="button"
              onClick={onNavigateToReviews}
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <span>Lihat Semua Ulasan</span>
              <span aria-hidden="true" className="font-bold">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 lg:gap-4 items-center pt-0.5">
            {/* Rating Toko */}
            <button
              type="button"
              onClick={onNavigateToReviews}
              className="flex items-center gap-3 sm:gap-3.5 text-left p-1.5 -m-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label={`Rating Toko: ${storeData.rating > 0 ? storeData.rating.toFixed(1) : 'Belum ada rating'} dari ${storeData.reviewCount || 0} ulasan. Klik untuk melihat ulasan.`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#fef8ea] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
                  {storeData.rating > 0 ? storeData.rating.toFixed(1) : '-'}
                </span>
                <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
                  Rating Toko
                </span>
                <span className="text-[11px] text-slate-400 font-normal leading-tight block mt-0.5 group-hover:underline">
                  ({storeData.reviewCount > 0 ? `${storeData.reviewCount} ulasan` : 'Belum ada ulasan'})
                </span>
              </div>
            </button>

            {/* Total Ulasan */}
            <button
              type="button"
              onClick={onNavigateToReviews}
              className="flex items-center gap-3 sm:gap-3.5 text-left p-1.5 -m-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label={`Total Ulasan: ${storeData.reviewCount || 0}. Klik untuk melihat ulasan.`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ecfdf3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
                  {storeData.reviewCount || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
                  Total Ulasan
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold leading-tight block mt-0.5 group-hover:underline">
                  Lihat ulasan &rarr;
                </span>
              </div>
            </button>

            {/* Jarak Lokasi */}
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ecfdf3] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block">
                  {storeData.distance}
                </span>
                <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
                  Jarak dari lokasi kamu
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
