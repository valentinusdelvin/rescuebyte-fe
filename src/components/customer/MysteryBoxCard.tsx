import { CustomerMysteryBox } from '../../types';

export interface MysteryBoxCardProps {
  item: CustomerMysteryBox;
  variant?: 'popular' | 'radius';
  onOrderClick: (item: CustomerMysteryBox) => void;
  onStoreClick?: (storeName: string) => void;
}

/**
 * Format currency with dots thousands separator (e.g. 35000 -> "35.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Strip emoji and icons from product name, returning clean text only
 */
function cleanProductName(raw?: string): string {
  if (!raw) return 'SURPRISE BOX';
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/^[^\w\s]+/, '')
    .trim()
    .toUpperCase();
}

/**
 * Render pickup schedule block with clean stopwatch icon and formatted timing
 */
function renderPickupSchedule(pickupTimeStr: string) {
  // Strip redundant "Jadwal Ambil:" or "Ambil:" prefix
  let cleanTime = pickupTimeStr.replace(/^(Jadwal Ambil:\s*|Ambil:\s*)/gi, '').trim();
  // Strip parenthetical remaining time like (45 mnt lagi)
  cleanTime = cleanTime.replace(/\s*\(.*?\)\s*$/, '').trim();

  return (
    <div className="w-full bg-[#F4F3F0] rounded-xl py-2.5 px-3.5 flex items-center gap-2 mt-auto">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#d94a38] shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" />
        <path d="M5 3 2 6" />
        <path d="m22 6-3-3" />
        <path d="M10 2h4" />
      </svg>
      <div className="text-xs text-[#434844] truncate">
        <span className="font-normal text-[#5a625d]">Ambil: </span>
        <span className="font-bold text-[#1b1c1c]">{cleanTime}</span>
      </div>
    </div>
  );
}

/**
 * Reusable Mystery Box Card for Customer Landing Page
 * Pixel-accurate implementation aligned with Design.md and Figma design.
 */
export function MysteryBoxCard({
  item,
  variant = 'popular',
  onOrderClick,
  onStoreClick,
}: MysteryBoxCardProps) {
  const isPopular = variant === 'popular';

  // Check stock quantity from text (e.g. "Sisa 4 Box" -> 4, "Sisa 2 Box!" -> 2, "Hanya 1 Box Tersisa!" -> 1)
  const stockMatch = item.remainingBoxesText.match(/\d+/);
  const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
  const isAboveTwo = stockCount > 2;
  const isSingleLast = stockCount === 1 || item.remainingBoxesText.toLowerCase().includes('1 box') || item.remainingBoxesText.toLowerCase().includes('terakhir');
  const cleanStockText = item.remainingBoxesText.replace(/^[!\s]+/, '').replace(/[!\s]+$/, '');

  // Calculate discount percentage mathematically if needed
  const calculatedDiscount = item.originalPrice > 0
    ? Math.round(((item.originalPrice - item.rescuePrice) / item.originalPrice) * 100)
    : item.discountPercent;
  const displayDiscount = item.discountPercent || calculatedDiscount;

  return (
    <article
      className="bg-white rounded-2xl border border-[#e2e6df] shadow-[0_4px_16px_-2px_rgba(31,42,36,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(31,42,36,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
      id={`box-card-${item.id}`}
    >
      {/* 1. Card Visual Header with Badges & Store Name Overlay */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-[#24201c]">
        <img
          src={item.imageSrc}
          alt={`Mystery Box ${item.storeName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges Overlay (Stock, Distance / Rating, Discount) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            {isPopular ? (
              <>
                {/* Stock Badge: Merah Muda jika > 2, Merah Tebal jika <= 2 */}
                {isAboveTwo ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#FDECEB] text-[#D94A38] text-[11px] font-bold flex items-center gap-1 shadow-xs border border-[#FCA5A5]/30">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 6 12 12 15 14" />
                    </svg>
                    <span>{cleanStockText}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#b91c1c] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    {isSingleLast ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="4.5" x2="12" y2="13.5" />
                        <line x1="12" y1="19" x2="12.01" y2="19" />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                    )}
                    <span>{cleanStockText}</span>
                  </span>
                )}

                {/* Popular Distance Pill */}
                <span className="px-2.5 py-1 rounded-full bg-white text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs">
                  {item.distanceText}
                </span>
              </>
            ) : (
              /* Radius Variant Location Pill with Green Pin */
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-green shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{item.distanceText}</span>
              </span>
            )}
          </div>

          {/* Discount Ratio Pill (Green for Both Popular and Radius) */}
          <div>
            <span className="px-2.5 py-1 text-[11px] font-black shadow-xs rounded-full bg-brand-green text-white">
              -{displayDiscount}%
            </span>
          </div>
        </div>

        {/* Bottom Dark Gradient with Overlay Information */}
        <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-4 bg-linear-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end pointer-events-none z-10">
          {!isPopular && (
            /* Radius Variant: Star Rating & Review Count */
            <div className="flex items-center gap-1 text-white/90 text-xs font-semibold drop-shadow-xs mb-0.5">
              <span className="text-amber-400">★</span>
              <span>{item.rating?.toFixed(1) || '4.9'}</span>
              <span className="text-white/70 font-normal">({item.reviewCount || '1.2k'} ulasan)</span>
            </div>
          )}

          {/* Product Name (Text Only, No Emotes) above Store Name */}
          <span className="text-xs sm:text-[13px] font-bold text-[#b7e472] uppercase tracking-wide drop-shadow-sm truncate mb-0.5">
            {cleanProductName(item.categoryBadge || item.category)}
          </span>

          {/* Store Name */}
          <h3
            onClick={(e) => {
              if (onStoreClick) {
                e.stopPropagation();
                onStoreClick(item.storeName);
              }
            }}
            className={`text-white font-bold text-base sm:text-lg font-display leading-tight truncate drop-shadow-sm ${
              onStoreClick ? 'pointer-events-auto cursor-pointer hover:underline hover:text-[#b7e472]' : ''
            }`}
            title={`Lihat halaman toko ${item.storeName}`}
          >
            {item.storeName}
          </h3>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Description */}
        <p className="text-xs sm:text-[13px] text-[#434844] leading-relaxed line-clamp-2 mb-3.5">
          {item.description}
        </p>

        {/* Pickup Schedule: Gray Box with Stopwatch matching Mystery Box Populer */}
        {renderPickupSchedule(item.pickupTime)}

        {/* Bottom Row (Price & Action) */}
        <div className="border-t border-[#f0eded] pt-3.5 mt-3.5 flex items-center justify-between gap-3">
          {/* Price Stack */}
          <div className="flex flex-col">
            <span className="text-xs text-[#737874] line-through font-medium">
              Rp {formatRupiah(item.originalPrice)}
            </span>
            <span className="text-xl sm:text-[22px] font-bold text-[#1b1c1c] font-display tracking-tight leading-none mt-0.5">
              Rp {formatRupiah(item.rescuePrice)}
            </span>
          </div>

          {/* Action Button: 'Pesan Sekarang' */}
          <button
            type="button"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#18201b] hover:bg-[#2c3b33] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
            id={`btn-order-${item.id}`}
            onClick={() => onOrderClick(item)}
            aria-label={`Pesan Mystery Box dari ${item.storeName}`}
          >
            <span>Pesan Sekarang</span>
          </button>
        </div>
      </div>
    </article>
  );
}
