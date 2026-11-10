import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export type ReviewSortOption =
  | 'terbaru'
  | 'terlama'
  | 'rating-tinggi'
  | 'rating-rendah';

export interface ReviewFilterBarProps {
  /** Current search input query */
  searchQuery: string;
  /** Search query change handler */
  onSearchChange: (query: string) => void;
  /** Rating filter value (null = Semua Rating, 1-5 = specific rating) */
  ratingFilter: number | null;
  /** Rating filter change handler */
  onRatingFilterChange: (rating: number | null) => void;
  /** Current sort ordering option */
  sortBy: ReviewSortOption;
  /** Sort order change handler */
  onSortChange: (sort: ReviewSortOption) => void;
  /** Optional custom placeholder text for the search input */
  searchPlaceholder?: string;
  /** Custom CSS classes */
  className?: string;
}

const RATING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Semua Rating' },
  { value: 5, label: '5 Bintang' },
  { value: 4, label: '4 Bintang' },
  { value: 3, label: '3 Bintang' },
  { value: 2, label: '2 Bintang' },
  { value: 1, label: '1 Bintang' },
];

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terlama', label: 'Terlama' },
  { value: 'rating-tinggi', label: 'Rating Tertinggi' },
  { value: 'rating-rendah', label: 'Rating Terendah' },
];

export const ReviewFilterBar: React.FC<ReviewFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingFilterChange,
  sortBy,
  onSortChange,
  searchPlaceholder = 'Cari produk atau ulasan...',
  className = '',
}) => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRatingOpen(false);
      }
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

  const currentRatingLabel =
    RATING_OPTIONS.find((opt) => opt.value === ratingFilter)?.label ||
    'Semua Rating';

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Terbaru';

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      {/* Search Input Field */}
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 shadow-2xs transition-colors focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          aria-label={searchPlaceholder}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Hapus pencarian"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter & Sort Dropdowns */}
      <div className="flex items-center gap-2.5">
        {/* Rating Filter Dropdown */}
        <div className="relative" ref={ratingDropdownRef}>
          <button
            type="button"
            id="rating-filter-button"
            onClick={() => {
              setIsRatingOpen((prev) => !prev);
              setIsSortOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={isRatingOpen}
            className={`bg-white border text-xs sm:text-sm font-medium text-gray-700 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              isRatingOpen || ratingFilter !== null
                ? 'border-emerald-600 text-emerald-800'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span>{currentRatingLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isRatingOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {isRatingOpen && (
            <div
              role="listbox"
              aria-labelledby="rating-filter-button"
              className="absolute right-0 sm:left-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {RATING_OPTIONS.map((opt) => {
                const isSelected = ratingFilter === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onRatingFilterChange(opt.value);
                      setIsRatingOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EEF8EE] text-emerald-800 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sort Filter Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            type="button"
            id="sort-filter-button"
            onClick={() => {
              setIsSortOpen((prev) => !prev);
              setIsRatingOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            className={`bg-white border text-xs sm:text-sm font-medium text-gray-700 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              isSortOpen
                ? 'border-emerald-600 text-emerald-800'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span>{currentSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isSortOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {isSortOpen && (
            <div
              role="listbox"
              aria-labelledby="sort-filter-button"
              className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSortChange(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EEF8EE] text-emerald-800 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewFilterBar;
