import { useState } from 'react';
import { MapPin, Calendar, ShoppingBag, Star } from 'lucide-react';
import { StoreDetailInfo } from './types';
import heroBannerImg from '../../../assets/customer/hero-full-banner.jpg';

export interface StoreHeroProps {
  storeData: StoreDetailInfo;
  onOpenGoogleMaps: () => void;
  onScrollToReviews?: () => void;
}

function getInitials(name: string): string {
  if (!name) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getShortName(name: string): string {
  if (!name) return '';
  const firstWord = name.trim().split(/\s+/)[0];
  return firstWord.length > 9 ? firstWord.slice(0, 8) + '…' : firstWord;
}

export function StoreHero({ storeData, onOpenGoogleMaps, onScrollToReviews }: StoreHeroProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs mb-8">
      {/* Banner Background */}
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
        <img
          src={heroBannerImg}
          alt={storeData.name}
          className="w-full h-full object-cover filter brightness-[0.6] scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Overlapping Floating Store Card */}
      <div className="p-5 sm:p-7 md:p-8 bg-white relative z-10 -mt-16 sm:-mt-20 mx-3 sm:mx-6 md:mx-8 rounded-3xl border border-slate-200/90 shadow-md">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 flex-1 min-w-0">
            {/* Store Logo Avatar (Real image if available, else initials) */}
            {storeData.avatarUrl && !imgError ? (
              <img
                src={storeData.avatarUrl}
                alt={storeData.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-sm shrink-0 bg-slate-100"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0b1510] text-[#bbf381] border-2 border-white flex flex-col items-center justify-center font-bold shrink-0 shadow-sm"
              >
                <span className="text-xl sm:text-2xl tracking-tight font-extrabold">
                  {getInitials(storeData.name)}
                </span>
                <span className="text-[9px] text-white/80 font-normal truncate max-w-[55px] text-center px-1">
                  {getShortName(storeData.name)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight truncate">
                  {storeData.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    storeData.status.toLowerCase() === 'buka' || storeData.status.toUpperCase() === 'ACTIVE'
                      ? 'bg-[#dcfce7] text-primary'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {storeData.status.toUpperCase() === 'ACTIVE' ? 'Buka' : storeData.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onScrollToReviews) {
                      onScrollToReviews();
                    } else {
                      document.getElementById('ulasan-pelanggan')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="font-semibold text-slate-800 flex items-center gap-1 hover:underline cursor-pointer group focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600 rounded px-1 -mx-1"
                  aria-label={`Rating ${storeData.rating > 0 ? storeData.rating.toFixed(1) : 'Belum ada rating'} dari ${storeData.reviewCount} ulasan. Klik untuk melihat ulasan.`}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{storeData.rating > 0 ? storeData.rating.toFixed(1) : '-'}</span>
                  <span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
                    ({storeData.reviewCount > 0 ? `${storeData.reviewCount} ulasan` : 'Belum ada ulasan'})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Store Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 items-center">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Alamat Toko</p>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
                {storeData.address}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Hari Operasional</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {storeData.operationalHours || 'Senin - Minggu'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Waktu Pickup</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {storeData.pickupHours}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <button
              type="button"
              onClick={onOpenGoogleMaps}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-bold transition cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Lihat Lokasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
