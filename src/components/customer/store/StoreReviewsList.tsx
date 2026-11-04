import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Star } from 'lucide-react';
import { StoreReviewItem } from './types';

export interface StoreReviewsListProps {
  reviews: StoreReviewItem[];
  reviewCount: number;
}

const SORT_OPTIONS: { id: 'terbaru' | 'rating-tinggi' | 'rating-rendah'; label: string }[] = [
  { id: 'terbaru', label: 'Terbaru' },
  { id: 'rating-tinggi', label: 'Rating Tertinggi' },
  { id: 'rating-rendah', label: 'Rating Terendah' },
];

export function StoreReviewsList({
  reviews,
  reviewCount,
}: StoreReviewsListProps) {
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'rating-tinggi' | 'rating-rendah'>('terbaru');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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
    return [...reviews].sort((a, b) => {
      if (sortOrder === 'rating-tinggi') return b.rating - a.rating;
      if (sortOrder === 'rating-rendah') return a.rating - b.rating;
      return 0; // Default: 'terbaru' follows list insertion order
    });
  }, [reviews, sortOrder]);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortOrder)?.label || 'Terbaru';

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
            Ulasan Pelanggan ({reviewCount})
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
            className={`bg-white border text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              isSortOpen
                ? 'border-emerald-600 ring-1 ring-emerald-600'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{currentSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                isSortOpen ? 'rotate-180 text-emerald-700' : ''
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
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
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

      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
        {currentSortLabel}
      </div>

      {/* Grid of Reviews */}
      {sortedReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">{rev.name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm">
          Belum ada ulasan untuk toko ini.
        </div>
      )}
    </section>
  );
}
