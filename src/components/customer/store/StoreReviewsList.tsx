import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Star, Store, Utensils } from 'lucide-react';
import { StoreReviewItem, StoreProductItem } from './types';
import { useStoreReviews } from '../../../hooks/useReviews';

export interface StoreReviewsListProps {
  reviews?: StoreReviewItem[];
  reviewCount?: number;
  storeId?: string;
  storeReviews?: StoreReviewItem[];
  productReviews?: StoreReviewItem[];
  storeProducts?: StoreProductItem[];
  onSelectProduct?: (product: StoreProductItem) => void;
  isLoadingProductReviews?: boolean;
}

const SORT_OPTIONS: { id: 'terbaru' | 'rating-tinggi' | 'rating-rendah'; label: string }[] = [
  { id: 'terbaru', label: 'Terbaru' },
  { id: 'rating-tinggi', label: 'Rating Tertinggi' },
  { id: 'rating-rendah', label: 'Rating Terendah' },
];

function formatReviewDate(dateStr?: string): string {
  if (!dateStr) return 'Baru saja';
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes('T')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function StoreReviewsList({
  reviews: initialReviews = [],
  reviewCount: initialReviewCount,
  storeId,
  storeReviews: propStoreReviews,
  productReviews: propProductReviews = [],
  storeProducts = [],
  onSelectProduct,
  isLoadingProductReviews = false,
}: StoreReviewsListProps) {
  const [activeFilter, setActiveFilter] = useState<'semua' | 'toko' | 'produk'>('semua');
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'rating-tinggi' | 'rating-rendah'>('terbaru');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Live reviews hook when storeId is provided
  const { reviews: liveStoreReviews, totalReviews: liveStoreTotalReviews } = useStoreReviews(
    storeId,
    undefined,
    {
      autoFetch: Boolean(storeId),
    }
  );

  // Effective store reviews
  const effectiveStoreReviews: StoreReviewItem[] = useMemo(() => {
    if (liveStoreReviews && liveStoreReviews.length > 0) {
      return liveStoreReviews.map((r) => ({
        id: r.id,
        name: r.author?.name || 'Pelanggan',
        avatar: r.author?.avatar_url || '',
        rating: r.rating,
        date: formatReviewDate(r.created_at),
        comment: r.content,
        type: 'store' as const,
      }));
    }
    if (propStoreReviews && propStoreReviews.length > 0) {
      return propStoreReviews.map((r) => ({
        ...r,
        type: 'store' as const,
      }));
    }
    return (initialReviews || []).map((r) => ({
      ...r,
      type: r.type || ('store' as const),
    }));
  }, [liveStoreReviews, propStoreReviews, initialReviews]);

  // Effective product reviews
  const effectiveProductReviews: StoreReviewItem[] = useMemo(() => {
    return (propProductReviews || []).map((r) => ({
      ...r,
      type: 'product' as const,
    }));
  }, [propProductReviews]);

  // Combined all reviews
  const allReviews: StoreReviewItem[] = useMemo(() => {
    return [...effectiveStoreReviews, ...effectiveProductReviews];
  }, [effectiveStoreReviews, effectiveProductReviews]);

  // Filtered reviews based on active tab
  const filteredReviews = useMemo(() => {
    if (activeFilter === 'toko') return effectiveStoreReviews;
    if (activeFilter === 'produk') return effectiveProductReviews;
    return allReviews;
  }, [activeFilter, effectiveStoreReviews, effectiveProductReviews, allReviews]);

  // Total review count displayed in header
  const totalCombinedCount =
    (liveStoreTotalReviews !== undefined ? liveStoreTotalReviews : (initialReviewCount ?? effectiveStoreReviews.length)) +
    effectiveProductReviews.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort((a, b) => {
      if (sortOrder === 'rating-tinggi') return b.rating - a.rating;
      if (sortOrder === 'rating-rendah') return a.rating - b.rating;
      return 0; // Default: 'terbaru' follows chronological/backend response order
    });
  }, [filteredReviews, sortOrder]);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortOrder)?.label || 'Terbaru';

  const handleProductPillClick = (productId?: string) => {
    if (!productId || !onSelectProduct) return;
    const matchedProduct = storeProducts.find((p) => p.id === productId);
    if (matchedProduct) {
      onSelectProduct(matchedProduct);
    }
  };

  return (
    <section
      id="ulasan-pelanggan"
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 scroll-mt-28"
    >
      {/* Header with Title and Sorting Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
            Ulasan Pelanggan ({totalCombinedCount})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ulasan nyata dari pelanggan yang telah menyelamatkan makanan di toko ini
          </p>
        </div>

        {/* Custom Sorting Filter Dropdown */}
        <div className="relative flex items-center gap-2 self-start sm:self-auto" ref={sortDropdownRef}>
          <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
          <button
            type="button"
            id="sort-reviews-button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            className={`bg-white border text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${isSortOpen
                ? 'border-emerald-600 ring-1 ring-emerald-600'
                : 'border-slate-200 hover:border-slate-300'
              }`}
          >
            <span>{currentSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-emerald-700' : ''
                }`}
            />
          </button>

          {isSortOpen && (
            <div
              role="listbox"
              aria-labelledby="sort-reviews-button"
              className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSortOrder(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${isSelected
                        ? 'bg-[#EEF8EE] text-emerald-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Type Filter Tabs */}
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveFilter('semua')}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${activeFilter === 'semua'
              ? 'bg-[#1b1c1c] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
        >
          <span>Semua Ulasan</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${activeFilter === 'semua' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
          >
            {allReviews.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('toko')}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${activeFilter === 'toko'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100/70'
            }`}
        >
          <Store className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Ulasan Toko</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${activeFilter === 'toko' ? 'bg-white/20 text-white' : 'bg-emerald-200/70 text-emerald-900'
              }`}
          >
            {effectiveStoreReviews.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('produk')}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${activeFilter === 'produk'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-orange-50 text-orange-800 border border-orange-200/60 hover:bg-orange-100/70'
            }`}
        >
          <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Ulasan Produk</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${activeFilter === 'produk' ? 'bg-white/20 text-white' : 'bg-orange-200/70 text-orange-900'
              }`}
          >
            {effectiveProductReviews.length}
          </span>
        </button>
      </div>

      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
        {currentSortLabel}
      </div>

      {/* Grid of Reviews */}
      {sortedReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedReviews.map((rev) => {
            const isProductReview = rev.type === 'product';

            return (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition"
              >
                <div>
                  {/* Top Row: User Avatar, Name, Role, Date */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      {rev.avatar ? (
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs select-none">
                          {rev.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">{rev.name}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{rev.date}</span>
                  </div>

                  {/* Rating Stars & Type Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-0.5" aria-label={`Rating ${rev.rating} dari 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                            }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    {/* Differentiated Visual Badge */}
                    {isProductReview ? (
                      <button
                        type="button"
                        onClick={() => handleProductPillClick(rev.productId)}
                        title={rev.productName ? `Lihat ${rev.productName}` : 'Ulasan Produk'}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-800 bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full hover:bg-orange-100 transition cursor-pointer max-w-[200px] truncate"
                      >
                        {rev.productImage ? (
                          <img
                            src={rev.productImage}
                            alt=""
                            className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <Utensils className="w-3 h-3 text-orange-600 shrink-0" aria-hidden="true" />
                        )}
                        <span className="truncate">{rev.productName || 'Ulasan Produk'}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        <Store className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        <span>Ulasan Toko</span>
                      </span>
                    )}
                  </div>

                  {/* Review Comment Content */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm">
          {isLoadingProductReviews
            ? 'Memuat ulasan...'
            : activeFilter === 'toko'
              ? 'Belum ada ulasan toko.'
              : activeFilter === 'produk'
                ? 'Belum ada ulasan produk untuk toko ini.'
                : 'Belum ada ulasan untuk toko ini.'}
        </div>
      )}
    </section>
  );
}

export default StoreReviewsList;
