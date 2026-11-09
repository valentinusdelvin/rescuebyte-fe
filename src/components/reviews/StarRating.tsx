import React, { useState, useId } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  /** Numerical rating score, can be integer or fractional (e.g. 4.8) */
  rating: number;
  /** Maximum number of stars (default: 5) */
  maxRating?: number;
  /** Size variant for stars */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the user can click/hover to select a rating */
  interactive?: boolean;
  /** Callback fired when a rating is selected in interactive mode */
  onChange?: (rating: number) => void;
  /** Whether to render the numerical score text next to the stars */
  showScoreText?: boolean;
  /** Custom classes for score text */
  scoreTextClassName?: string;
  /** Container CSS classes */
  className?: string;
}

const SIZE_CONFIG: Record<
  NonNullable<StarRatingProps['size']>,
  { starSize: string; iconPx: number; textClass: string }
> = {
  sm: { starSize: 'w-3.5 h-3.5', iconPx: 14, textClass: 'text-xs' },
  md: { starSize: 'w-4.5 h-4.5', iconPx: 18, textClass: 'text-sm' },
  lg: { starSize: 'w-5.5 h-5.5', iconPx: 22, textClass: 'text-base' },
  xl: { starSize: 'w-7 h-7', iconPx: 28, textClass: 'text-lg font-bold' },
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showScoreText = false,
  scoreTextClassName = '',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const groupId = useId();
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const effectiveRating = interactive && hoverRating !== null ? hoverRating : Math.max(0, rating);

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (!interactive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange?.(starValue);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(maxRating, starValue + 1);
      onChange?.(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, starValue - 1);
      onChange?.(prev);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={
        interactive
          ? 'Pilih penilaian bintang'
          : `Penilaian: ${rating.toFixed(1)} dari ${maxRating} bintang`
      }
      onMouseLeave={() => interactive && setHoverRating(null)}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, idx) => {
          const starIndex = idx + 1;
          const fillRatio = Math.max(0, Math.min(1, effectiveRating - idx));

          if (interactive) {
            const isFilled = starIndex <= effectiveRating;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={rating === starIndex}
                aria-label={`${starIndex} bintang`}
                tabIndex={0}
                onClick={() => onChange?.(starIndex)}
                onMouseEnter={() => setHoverRating(starIndex)}
                onKeyDown={(e) => handleKeyDown(e, starIndex)}
                className={`p-0.5 border-0 bg-transparent cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
              >
                <Star
                  className={`${config.starSize} transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                      : 'fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200'
                  }`}
                />
              </button>
            );
          }

          // Non-interactive display mode with fractional fill support
          return (
            <div
              key={idx}
              className={`relative inline-block ${config.starSize} shrink-0`}
              aria-hidden="true"
            >
              {/* Background: Empty Gray Star */}
              <Star
                className={`absolute inset-0 ${config.starSize} fill-gray-200 text-gray-200`}
              />

              {/* Foreground: Fractional or Full Amber Star clipped by width */}
              {fillRatio > 0 && (
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${Math.round(fillRatio * 100)}%` }}
                >
                  <Star
                    className={`${config.starSize} fill-amber-400 text-amber-400`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showScoreText && (
        <span
          className={`font-bold text-gray-900 ml-1 select-none ${config.textClass} ${scoreTextClassName}`}
          id={`${groupId}-score`}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
