import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Store, Package } from 'lucide-react';
import {
  ReviewSummaryCards,
  ReviewFilterBar,
  ReviewCard,
  ReviewPagination,
  ReviewSortOption,
} from '../../components/reviews';
import {
  useStoreReviews,
  useStoreProductReviews,
  RatingDistribution,
} from '../../hooks/useReviews';
import { useStoreProfile } from '../../hooks/useStoreProfile';
import { getMerchantProducts } from '../../services/productService';
import { ProductItem } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';

export interface SellerReviewsProps {
  storeName?: string;
  storeId?: string;
  onShowToast?: (message: string) => void;
}

type ReviewScope = 'toko' | 'produk';

interface NormalizedSellerReview {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  createdAtRaw: string;
  createdAtFormatted: string;
  comment: string;
  productName?: string;
  productImage?: string;
}

interface ReviewWithOptionalProduct {
  product_name?: string;
  product_image?: string;
  product?: {
    name?: string;
    image?: string;
  };
}

const REVIEWS_PER_PAGE = 5;
const STORE_REVIEWS_PARAMS = { limit: 100 };

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

function computeAverageFromItems(items: NormalizedSellerReview[]): number {
  const valid = items.filter((r) => typeof r.rating === 'number' && !isNaN(r.rating));
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}

function computeDistributionFromItems(items: NormalizedSellerReview[]): RatingDistribution {
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of items) {
    const raw = Number(item.rating);
    if (!isNaN(raw)) {
      const star = Math.max(1, Math.min(5, Math.round(raw)));
      distribution[star] = (distribution[star] || 0) + 1;
    }
  }
  return distribution;
}

/**
 * Seller Dashboard - Ulasan Pembeli Page
 * Supports switching between Ulasan Toko and Ulasan Produk, with summary cards, filtering, sorting, and pagination.
 */
export function SellerReviews({ storeName, storeId: propStoreId }: SellerReviewsProps) {
  const [reviewScope, setReviewScope] = useState<ReviewScope>('toko');
  const tokoTabRef = useRef<HTMLButtonElement>(null);
  const produkTabRef = useRef<HTMLButtonElement>(null);

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
    reviews: storeReviews,
    averageRating: storeAverageRating,
    totalReviews: storeTotalReviews,
    ratingDistribution: storeRatingDistribution,
    isLoading: isStoreReviewsLoading,
    isError: isStoreError,
    error: storeError,
    refetch: refetchStoreReviews,
  } = useStoreReviews(effectiveStoreId, STORE_REVIEWS_PARAMS, {
    autoFetch: Boolean(effectiveStoreId),
  });

  // Fetch merchant products for product reviews and product metadata mapping
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  const loadProducts = useCallback(async () => {
    setIsProductsLoading(true);
    try {
      const items = await getMerchantProducts();
      setProducts(items);
    } catch (err) {
      console.warn('Gagal memuat produk merchant untuk pemetaan ulasan:', err);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getMerchantProducts()
      .then((items) => {
        if (isMounted) setProducts(items);
      })
      .catch((err) => {
        console.warn('Gagal memuat produk merchant untuk pemetaan ulasan:', err);
      })
      .finally(() => {
        if (isMounted) setIsProductsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Real product review aggregation across all merchant products
  const {
    productReviews,
    isLoading: isProductReviewsLoading,
    isError: isProductReviewsError,
    error: productReviewsError,
    refetch: refetchProductReviews,
  } = useStoreProductReviews(products);

  const productsMap = useMemo(() => {
    const map = new Map<string, { name: string; image?: string }>();
    for (const p of products) {
      if (p.id) {
        map.set(p.id, { name: p.name, image: p.imageUrl });
      }
    }
    return map;
  }, [products]);

  const storeReviewItems = useMemo<NormalizedSellerReview[]>(() => {
    return storeReviews.map((r) => {
      const productInfo = r.product_id ? productsMap.get(r.product_id) : undefined;
      const ext = r as unknown as ReviewWithOptionalProduct;
      return {
        id: r.id,
        reviewerName: r.author?.name || 'Pembeli',
        reviewerAvatar: r.author?.avatar_url,
        rating: r.rating,
        createdAtRaw: r.created_at,
        createdAtFormatted: formatDate(r.created_at),
        comment: r.content,
        productName: ext.product_name || ext.product?.name || productInfo?.name,
        productImage: ext.product_image || ext.product?.image || productInfo?.image,
      };
    });
  }, [storeReviews, productsMap]);

  const productReviewItems = useMemo<NormalizedSellerReview[]>(() => {
    return productReviews.map((pr) => ({
      id: `${pr.productId}-${pr.id}`,
      reviewerName: pr.name || 'Pembeli',
      reviewerAvatar: pr.avatar || undefined,
      rating: pr.rating,
      createdAtRaw: pr.createdAt || pr.date,
      createdAtFormatted: formatDate(pr.createdAt) || pr.date,
      comment: pr.comment,
      productName: pr.productName,
      productImage: pr.productImage,
    }));
  }, [productReviews]);

  const productAverageRating = useMemo(
    () => computeAverageFromItems(productReviewItems),
    [productReviewItems]
  );
  const productTotalReviews = productReviewItems.length;
  const productRatingDistribution = useMemo(
    () => computeDistributionFromItems(productReviewItems),
    [productReviewItems]
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('terbaru');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleScopeChange = (scope: ReviewScope) => {
    if (scope === reviewScope) return;
    setReviewScope(scope);
    setCurrentPage(1);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, scope: ReviewScope) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextScope: ReviewScope = scope === 'toko' ? 'produk' : 'toko';
      handleScopeChange(nextScope);
      if (nextScope === 'toko') {
        tokoTabRef.current?.focus();
      } else {
        produkTabRef.current?.focus();
      }
    }
  };

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

  const activeSourceReviews = reviewScope === 'toko' ? storeReviewItems : productReviewItems;

  // Filter and sort active scope reviews
  const filteredReviews = useMemo(() => {
    let result = [...activeSourceReviews];

    // 1. Rating filter (Semua Rating = null, or 1 - 5)
    if (ratingFilter !== null) {
      result = result.filter((r) => Math.round(r.rating) === ratingFilter);
    }

    // 2. Search query filter (reviewer name, review content, product name)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((r) => {
        const authorName = r.reviewerName.toLowerCase();
        const content = r.comment.toLowerCase();
        const productName = (r.productName || '').toLowerCase();

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
        const timeA = new Date(a.createdAtRaw).getTime() || 0;
        const timeB = new Date(b.createdAtRaw).getTime() || 0;
        return timeA - timeB;
      }
      if (sortBy === 'rating-tinggi') {
        return b.rating - a.rating;
      }
      if (sortBy === 'rating-rendah') {
        return a.rating - b.rating;
      }
      // Default: 'terbaru'
      const timeA = new Date(a.createdAtRaw).getTime() || 0;
      const timeB = new Date(b.createdAtRaw).getTime() || 0;
      return timeB - timeA;
    });

    return result;
  }, [activeSourceReviews, ratingFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  const isStoreTabLoading = (isProfileLoading && !effectiveStoreId) || isStoreReviewsLoading;
  const isProductTabLoading = isProductsLoading || isProductReviewsLoading;
  const isLoading = reviewScope === 'toko' ? isStoreTabLoading : isProductTabLoading;

  const isError = reviewScope === 'toko' ? isStoreError : isProductReviewsError;
  const error = reviewScope === 'toko' ? storeError : productReviewsError;

  const activeAverageRating = reviewScope === 'toko' ? storeAverageRating : productAverageRating;
  const activeTotalReviews = reviewScope === 'toko' ? storeTotalReviews : productTotalReviews;
  const activeDistribution =
    reviewScope === 'toko' ? storeRatingDistribution : productRatingDistribution;

  const handleRetry = () => {
    if (reviewScope === 'toko') {
      void refetchStoreReviews();
    } else {
      void loadProducts().then(() => refetchProductReviews());
    }
  };

  return (
    <section
      className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full animate-[fadeIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      id="view-ulasan"
      aria-labelledby="heading-ulasan-pembeli"
    >
      {/* Header, Review Type Switcher & Summary Cards Section */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1
              id="heading-ulasan-pembeli"
              className="font-display font-bold text-2xl text-gray-900 tracking-tight"
              aria-label={`Ulasan Pembeli${storeName ? ` - ${storeName}` : ''}`}
            >
              Ulasan Pembeli
            </h1>
            {storeName && <span className="sr-only">Toko {storeName}</span>}
          </div>

          <div
            role="tablist"
            aria-label="Jenis ulasan pembeli"
            className="inline-flex w-full sm:w-auto items-center gap-1.5 p-1 bg-white border border-[#e2e6df] rounded-2xl shadow-level-1"
          >
            <button
              ref={tokoTabRef}
              type="button"
              role="tab"
              id="tab-ulasan-toko"
              aria-selected={reviewScope === 'toko'}
              aria-controls="panel-ulasan-pembeli"
              tabIndex={reviewScope === 'toko' ? 0 : -1}
              onClick={() => handleScopeChange('toko')}
              onKeyDown={(e) => handleTabKeyDown(e, 'toko')}
              className={`flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2A24] ${
                reviewScope === 'toko'
                  ? 'bg-[#1F2A24] text-white shadow-xs'
                  : 'text-[#252525] hover:bg-[#F8F7F2] hover:text-[#1F2A24]'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ulasan Toko</span>
              {!isStoreTabLoading && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                    reviewScope === 'toko'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#f0eded] text-[#252525]'
                  }`}
                >
                  {storeTotalReviews.toLocaleString('id-ID')}
                </span>
              )}
            </button>

            <button
              ref={produkTabRef}
              type="button"
              role="tab"
              id="tab-ulasan-produk"
              aria-selected={reviewScope === 'produk'}
              aria-controls="panel-ulasan-pembeli"
              tabIndex={reviewScope === 'produk' ? 0 : -1}
              onClick={() => handleScopeChange('produk')}
              onKeyDown={(e) => handleTabKeyDown(e, 'produk')}
              className={`flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2A24] ${
                reviewScope === 'produk'
                  ? 'bg-[#1F2A24] text-white shadow-xs'
                  : 'text-[#252525] hover:bg-[#F8F7F2] hover:text-[#1F2A24]'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ulasan Produk</span>
              {!isProductTabLoading && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                    reviewScope === 'produk'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#f0eded] text-[#252525]'
                  }`}
                >
                  {productTotalReviews.toLocaleString('id-ID')}
                </span>
              )}
            </button>
          </div>
        </div>

        <ReviewSummaryCards
          averageRating={activeAverageRating}
          totalReviews={activeTotalReviews}
          distribution={activeDistribution}
          ratingLabel={reviewScope === 'toko' ? 'RATING TOKO' : 'RATING PRODUK'}
          ratingDescription={
            reviewScope === 'toko'
              ? 'Berdasarkan ulasan toko dari pembeli'
              : 'Berdasarkan ulasan produk dari pembeli'
          }
          totalDescription={
            reviewScope === 'toko'
              ? 'Ulasan toko dari pesanan yang telah selesai'
              : 'Ulasan produk dari pesanan yang telah selesai'
          }
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
            onClick={handleRetry}
            className="text-xs font-semibold text-rose-900 underline hover:no-underline cursor-pointer ml-3 shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Search & Filter Controls + Active Tab Panel */}
      <div
        id="panel-ulasan-pembeli"
        role="tabpanel"
        aria-labelledby={reviewScope === 'toko' ? 'tab-ulasan-toko' : 'tab-ulasan-produk'}
        className="space-y-4 sm:space-y-6"
      >
        <ReviewFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          ratingFilter={ratingFilter}
          onRatingFilterChange={handleRatingFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          searchPlaceholder={
            reviewScope === 'toko'
              ? 'Cari nama pembeli atau ulasan...'
              : 'Cari produk, pembeli, atau ulasan...'
          }
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
        ) : activeSourceReviews.length === 0 ? (
          /* Empty state when the selected scope has no reviews yet */
          <div className="bg-white border border-[#e2e6df] rounded-2xl p-8 shadow-level-1">
            <EmptyState
              title={reviewScope === 'toko' ? 'Belum Ada Ulasan Toko' : 'Belum Ada Ulasan Produk'}
              description={
                reviewScope === 'toko'
                  ? 'Toko ini belum memiliki ulasan toko dari pembeli.'
                  : 'Dagangan toko ini belum memiliki ulasan produk dari pembeli.'
              }
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
                  setCurrentPage(1);
                },
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                reviewerName={review.reviewerName}
                reviewerAvatar={review.reviewerAvatar}
                rating={review.rating}
                createdAt={review.createdAtFormatted}
                comment={review.comment}
                productName={review.productName}
                productImage={review.productImage}
              />
            ))}
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
