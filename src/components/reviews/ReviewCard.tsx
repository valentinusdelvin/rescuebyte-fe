import React from 'react';
import { Package, Pencil, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

export interface ReviewCardProps {
  /** Unique review ID */
  id: string;
  /** Full name of reviewer */
  reviewerName: string;
  /** URL to reviewer's avatar image */
  reviewerAvatar?: string;
  /** Rating score (1-5) */
  rating: number;
  /** Created timestamp (ISO string or formatted date) */
  createdAt: string;
  /** Quoted review comment */
  comment: string;
  /** Associated product title (optional) */
  productName?: string;
  /** Associated product image (optional) */
  productImage?: string;
  /** Whether the current user is authorized to edit */
  canEdit?: boolean;
  /** Whether the current user is authorized to delete */
  canDelete?: boolean;
  /** Edit callback */
  onEdit?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Custom CSS classes */
  className?: string;
}

const AVATAR_PALETTES = [
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
  'bg-indigo-100 text-indigo-800',
  'bg-rose-100 text-rose-800',
  'bg-orange-100 text-orange-800',
];

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getPalette(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function formatReviewDate(dateStr: string): string {
  if (!dateStr) return '';
  // If already formatted like "28 Oktober 2026", return as is
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes('T')) {
    return dateStr;
  }
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

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  reviewerAvatar,
  rating,
  createdAt,
  comment,
  productName,
  productImage,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(reviewerName);
  const palette = getPalette(reviewerName);
  const formattedDate = formatReviewDate(createdAt);

  return (
    <article
      className={`bg-white border border-[#e2e6df] rounded-2xl p-5 sm:p-6 shadow-level-1 hover:border-gray-300 transition-colors ${className}`}
    >
      {/* Header Row: Reviewer Details and Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {reviewerAvatar && !imgError ? (
            <img
              src={reviewerAvatar}
              alt={reviewerName}
              onError={() => setImgError(true)}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0 bg-gray-50"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${palette}`}
              aria-hidden="true"
            >
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
              {reviewerName}
            </h3>
            <div className="mt-1">
              <StarRating rating={rating} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {formattedDate && (
            <span className="text-xs text-gray-400 font-normal tabular-nums">
              {formattedDate}
            </span>
          )}

          {/* Action buttons if user can edit/delete */}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1.5 ml-2 border-l border-gray-100 pl-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Edit ulasan"
                  className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="Hapus ulasan"
                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Tag / Pill if review is tied to a product */}
      {productName && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fafaf8] border border-gray-200/80 rounded-lg mt-3 max-w-full">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="w-7 h-7 rounded object-cover shrink-0 border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
              <Package className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-gray-800 truncate">
            {productName}
          </span>
        </div>
      )}

      {/* Review Comment in quotes */}
      <p className="text-sm text-gray-600 leading-relaxed font-normal mt-3">
        &ldquo;{comment}&rdquo;
      </p>
    </article>
  );
};

export default ReviewCard;
