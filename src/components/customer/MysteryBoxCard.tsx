import { CustomerMysteryBox } from '../../types';

export interface MysteryBoxCardProps {
  item: CustomerMysteryBox;
  variant?: 'popular' | 'radius';
  onOrderClick: (item: CustomerMysteryBox) => void;
}

/**
 * Format currency with dots thousands separator (e.g. 35000 -> "35.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Reusable Mystery Box Card for Customer Landing Page
 * Styled with Tailwind CSS classes.
 */
export function MysteryBoxCard({
  item,
  variant = 'popular',
  onOrderClick,
}: MysteryBoxCardProps) {
  const isPopular = variant === 'popular';

  return (
    <article
      className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
      id={`box-card-${item.id}`}
    >
      {/* Card Visual Header with Badges */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <img
          src={item.imageSrc}
          alt={`Mystery Box ${item.storeName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {isPopular ? (
              <>
                <span className="px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-black tracking-wide shadow-xs">
                  {item.remainingBoxesText.toUpperCase()}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                  {item.distanceText}
                </span>
              </>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                ⭐ {item.rating?.toFixed(1) || '4.9'} ({item.reviewCount || 100}+)
              </span>
            )}
          </div>

          <div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-xs">
              -{item.discountPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category & Store Name */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="font-semibold text-emerald-800">{item.category}</span>
          {!isPopular && (
            <span className="text-gray-400">{item.distanceText}</span>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-900 font-display truncate">{item.storeName}</h3>

        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap my-3">
          {item.tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                idx === 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Pickup Time */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto pt-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{item.pickupTime}</span>
        </div>
      </div>

      {/* Card Footer with Price and Action */}
      <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-gray-50 mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 line-through">
            Rp {formatRupiah(item.originalPrice)}
          </span>
          <span className="text-base font-black text-emerald-700 font-display">
            Rp {formatRupiah(item.rescuePrice)}
          </span>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          id={`btn-order-${item.id}`}
          onClick={() => onOrderClick(item)}
          aria-label={`Ambil Mystery Box dari ${item.storeName}`}
        >
          {isPopular ? (
            <>
              <span>Ambil Sekarang</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          ) : (
            <span>Pesan Box</span>
          )}
        </button>
      </div>
    </article>
  );
}
