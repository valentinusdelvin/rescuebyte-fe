import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ReviewPaginationProps {
  /** 1-based current page number */
  currentPage: number;
  /** Total available pages */
  totalPages: number;
  /** Page selection callback */
  onPageChange: (page: number) => void;
  /** Custom CSS classes */
  className?: string;
}

export const ReviewPagination: React.FC<ReviewPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis support
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 sm:gap-2 select-none ${className}`}
      aria-label="Navigasi Halaman Ulasan"
    >
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
        className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 shadow-2xs"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Sebelumnya</span>
      </button>

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-xs text-gray-400 select-none"
              >
                &hellip;
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Halaman ${pageNum}`}
              className={`min-w-8 sm:min-w-9 h-8 sm:h-9 px-2.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                isActive
                  ? 'bg-gray-900 text-white font-semibold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 bg-white sm:bg-transparent'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Halaman selanjutnya"
        className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 shadow-2xs"
      >
        <span>Selanjutnya</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
};

export default ReviewPagination;
