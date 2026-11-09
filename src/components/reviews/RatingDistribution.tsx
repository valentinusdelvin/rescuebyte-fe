import React from 'react';

export interface RatingDistributionProps {
  /** Record of star count to number of reviews, e.g. { 5: 104, 4: 16, 3: 6, 2: 2, 1: 0 } */
  distribution: Record<number, number>;
  /** Total count of all reviews */
  totalReviews: number;
  /** Container CSS classes */
  className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  totalReviews,
  className = '',
}) => {
  const starsList = [5, 4, 3, 2, 1];

  return (
    <div
      className={`space-y-2 w-full ${className}`}
      role="region"
      aria-label="Distribusi Penilaian Bintang"
    >
      {starsList.map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalReviews > 0 ? Math.min(100, Math.max(0, (count / totalReviews) * 100)) : 0;

        return (
          <div key={stars} className="flex items-center text-xs">
            {/* Star label */}
            <span className="w-16 shrink-0 text-gray-600 font-medium">
              {stars} Bintang
            </span>

            {/* Progress track */}
            <div
              className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden"
              role="meter"
              aria-label={`${stars} bintang`}
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={totalReviews}
            >
              {/* Green Progress Fill */}
              <div
                className="h-full bg-[#4C9A2A] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Trailing Review Count */}
            <span className="w-8 shrink-0 text-right text-gray-500 font-medium tabular-nums">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingDistribution;
