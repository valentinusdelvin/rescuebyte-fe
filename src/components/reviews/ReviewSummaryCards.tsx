import React from 'react';
import StarRating from './StarRating';
import RatingDistribution from './RatingDistribution';

export interface ReviewSummaryCardsProps {
  /** Average rating score out of 5.0 */
  averageRating: number;
  /** Total number of reviews received */
  totalReviews: number;
  /** Distribution of reviews mapped by star count (1-5) */
  distribution: Record<number, number>;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Container CSS classes */
  className?: string;
}

export const ReviewSummaryCards: React.FC<ReviewSummaryCardsProps> = ({
  averageRating,
  totalReviews,
  distribution,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="bg-white rounded-2xl border border-[#e2e6df] p-6 shadow-level-1 animate-pulse min-h-[168px] flex flex-col justify-between"
          >
            <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
            <div className="h-9 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {/* Card 1: Rating Toko */}
      <div className="bg-white rounded-2xl border border-[#e2e6df] p-6 shadow-level-1 flex flex-col justify-between min-h-[168px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            RATING TOKO
          </span>

          <div className="flex items-baseline mt-2 mb-2">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-sm font-medium text-gray-400 ml-1.5">
              / 5.0
            </span>
          </div>

          <div className="mt-1">
            <StarRating rating={averageRating} size="lg" />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100/80">
          Berdasarkan ulasan pembeli
        </p>
      </div>

      {/* Card 2: Total Ulasan */}
      <div className="bg-white rounded-2xl border border-[#e2e6df] p-6 shadow-level-1 flex flex-col justify-between min-h-[168px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            TOTAL ULASAN
          </span>

          <div className="mt-2 mb-2">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
              {totalReviews.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Alignment spacer matching Card 1's star row */}
          <div className="h-5 flex items-center" aria-hidden="true" />
        </div>

        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100/80 leading-tight max-w-[220px]">
          Ulasan dari pesanan yang telah selesai
        </p>
      </div>

      {/* Card 3: Distribusi Penilaian */}
      <div className="bg-white rounded-2xl border border-[#e2e6df] p-6 shadow-level-1 flex flex-col justify-between min-h-[168px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2.5">
            DISTRIBUSI PENILAIAN
          </span>

          <RatingDistribution
            distribution={distribution}
            totalReviews={totalReviews}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewSummaryCards;
