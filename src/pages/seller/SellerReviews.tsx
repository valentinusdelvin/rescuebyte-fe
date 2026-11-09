import { useState, useMemo, useEffect } from 'react';
import {
  ReviewSummaryCards,
  ReviewFilterBar,
  ReviewCard,
  ReviewPagination,
  ReviewSortOption,
} from '../../components/reviews';
import { useStoreReviews } from '../../hooks/useReviews';
import { useStoreProfile } from '../../hooks/useStoreProfile';
import { getMerchantProducts } from '../../services/productService';
import { ProductItem } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';

export interface SellerReviewsProps {
  storeName?: string;
  storeId?: string;
  onShowToast?: (message: string) => void;
}

const REVIEWS_PER_PAGE = 5;

/**
 * Format ISO date string into Indonesian readable format e.g. "28 Oktober 2026"
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
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

/**
 * Seller Dashboard - Ulasan Pembeli Page
 * Faithful to reference design: 3 summary cards, filter/search bar, review card list, client pagination.
 */
export function SellerReviews({ storeName, storeId: propStoreId }: SellerReviewsProps) {
  // Stored seller store ID from localStorage
  const storedSellerStoreId = useMemo(() => {
    try {
      return localStorage.getItem('rescuebyte_store_id') || undefined;
    } catch {
      return undefined;
    }
  }, []);

  // Resolve merchant store profile if storeId is not explicitly provided
  const { store: myStore, isLoading: isProfileLoading } = useStoreProfile({
    autoFetch: !propStoreId && !storedSellerStoreId,
  });
  const effectiveStoreId = propStoreId || storedSellerStoreId || myStore?.id;

  // Real store review data and rating summary from backend API
  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading: isReviewsLoading,
    isError,
    error,
    refetch,
  } = useStoreReviews(effectiveStoreId, undefined, {
    autoFetch: Boolean(effectiveStoreId),
  });

  // Fetch merchant products for product mapping (e.g. Mystery Box titles & thumbnails)
  const [products, setProducts] = useState<ProductItem[]>([]);
  useEffect(() => {
    let isMounted = true;
    getMerchantProducts()
      .then((items) => {
        if (isMounted) setProducts(items);
      })
      .catch((err) => {
        console.warn('Gagal memuat produk merchant untuk pemetaan ulasan:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const productsMap = useMemo(() => {
    const map = new Map<string, { name: string; image?: string }>();
    for (const p of products) {
      if (p.id) {
        map.set(p.id, { name: p.name, image: p.imageUrl });
      }
    }
    return map;
  }, [products]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('terbaru');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (rating: number | null) => {
    setRatingFilter(rating);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: ReviewSortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // 1. Rating filter (Semua Rating = null, or 1 - 5)
    if (ratingFilter !== null) {
      result = result.filter((r) => Math.round(r.rating) === ratingFilter);
    }

    // 2. Search query filter (reviewer name, review content, product name)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((r) => {
        const authorName = (r.author?.name || '').toLowerCase();
        const content = (r.content || '').toLowerCase();
        const productInfo = r.product_id ? productsMap.get(r.product_id) : undefined;
        const productName = (
          (r as unknown as { product_name?: string }).product_name ||
          (r as unknown as { product?: { name?: string } }).product?.name ||
          productInfo?.name ||
          ''
        ).toLowerCase();

        return (
          authorName.includes(query) ||
          content.includes(query) ||
          productName.includes(query)
        );
      });
    }

    // 3. Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'terlama') {
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
        return timeA - timeB;
      }
      if (sortBy === 'rating-tinggi') {
        return b.rating - a.rating;
      }
      if (sortBy === 'rating-rendah') {
        return a.rating - b.rating;
      }
      // Default: 'terbaru'
      const timeA = new Date(a.created_at).getTime() || 0;
      const timeB = new Date(b.created_at).getTime() || 0;
      return timeB - timeA;
    });

    return result;
  }, [reviews, ratingFilter, searchQuery, sortBy, productsMap]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  const isLoading = (isProfileLoading && !propStoreId) || isReviewsLoading;

  return (
    <section
      className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full animate-[fadeIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      id="view-ulasan"
      aria-labelledby="heading-ulasan-pembeli"
    >
      {/* Header & Summary Cards Section */}
      <header>
        <h1
          id="heading-ulasan-pembeli"
          className="font-display font-bold text-2xl text-gray-900 mb-6 sm:mb-8 tracking-tight"
          aria-label={`Ulasan Pembeli${storeName ? ` - ${storeName}` : ''}`}
        >
          Ulasan Pembeli
        </h1>
        {storeName && <span className="sr-only">Toko {storeName}</span>}

        <ReviewSummaryCards
          averageRating={averageRating}
          totalReviews={totalReviews}
          distribution={ratingDistribution}
          isLoading={isLoading}
        />
      </header>

      {/* Error state alert if API request fails */}
      {isError && error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-xs font-semibold text-rose-900 underline hover:no-underline cursor-pointer ml-3 shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-4 sm:space-y-6">
        <ReviewFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          ratingFilter={ratingFilter}
          onRatingFilterChange={handleRatingFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Review Cards List */}
        {isLoading ? (
          <div className="space-y-4" role="status" aria-label="Memuat ulasan...">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="bg-white border border-[#e2e6df] rounded-2xl p-5 sm:p-6 shadow-level-1 animate-pulse"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-7 w-36 bg-gray-100 rounded-lg mt-3" />
                <div className="space-y-2 mt-3">
                  <div className="h-3.5 w-full bg-gray-100 rounded" />
                  <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty state when the store has no reviews yet */
          <div className="bg-white border border-[#e2e6df] rounded-2xl p-8 shadow-level-1">
            <EmptyState
              title="Belum Ada Ulasan"
              description="Toko ini belum memiliki ulasan dari pembeli."
            />
          </div>
        ) : filteredReviews.length === 0 ? (
          /* Empty state when reviews exist but none match search/filter */
          <div className="bg-white border border-[#e2e6df] rounded-2xl p-8 shadow-level-1">
            <EmptyState
              title="Tidak Ada Ulasan Ditemukan"
              description="Tidak ada ulasan yang cocok dengan kata kunci atau filter rating yang dipilih."
              action={{
                label: 'Reset Filter',
                onClick: () => {
                  setSearchQuery('');
                  setRatingFilter(null);
                  setSortBy('terbaru');
                },
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedReviews.map((review) => {
              const productInfo = review.product_id ? productsMap.get(review.product_id) : undefined;
              const productName =
                (review as unknown as { product_name?: string }).product_name ||
                (review as unknown as { product?: { name?: string } }).product?.name ||
                productInfo?.name;
              const productImage =
                (review as unknown as { product_image?: string }).product_image ||
                (review as unknown as { product?: { image?: string } }).product?.image ||
                productInfo?.image;

              return (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  reviewerName={review.author?.name || 'Pembeli'}
                  reviewerAvatar={review.author?.avatar_url}
                  rating={review.rating}
                  createdAt={formatDate(review.created_at)}
                  comment={review.content}
                  productName={productName}
                  productImage={productImage}
                />
              );
            })}
          </div>
        )}

        {/* Client-Side Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center pt-2 sm:pt-4">
            <ReviewPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default SellerReviews;
