import { getProductReviews } from '../api/services/reviewApi';

export interface ProductRatingSummary {
  rating: number;
  reviewCount: number;
}

const ratingCache = new Map<string, ProductRatingSummary>();

/**
 * Concurrently fetches product ratings and review counts for an array of product IDs.
 * Filters out already-cached product IDs to avoid duplicate network requests (prevents N+1 query problem).
 */
export async function batchFetchProductRatings(
  productIds: string[]
): Promise<Map<string, ProductRatingSummary>> {
  const uniqueIds = Array.from(new Set(productIds)).filter(Boolean);
  const uncachedIds = uniqueIds.filter((id) => !ratingCache.has(id));

  if (uncachedIds.length > 0) {
    const results = await Promise.allSettled(
      uncachedIds.map(async (id) => {
        try {
          const res = await getProductReviews(id, { limit: 100 });
          const reviews = res.reviews || [];
          const metaTotal = res.meta?.total_data;
          const count = typeof metaTotal === 'number' ? metaTotal : reviews.length;

          const avgRating =
            reviews.length > 0
              ? Math.round(
                  (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length) * 10
                ) / 10
              : 0;

          return { id, summary: { rating: avgRating, reviewCount: count } };
        } catch {
          return { id, summary: { rating: 0, reviewCount: 0 } };
        }
      })
    );

    for (const res of results) {
      if (res.status === 'fulfilled') {
        ratingCache.set(res.value.id, res.value.summary);
      }
    }
  }

  return ratingCache;
}

/**
 * Returns cached product rating if available.
 */
export function getCachedProductRating(productId: string): ProductRatingSummary | undefined {
  return ratingCache.get(productId);
}

/**
 * Sets or updates a product's rating cache entry.
 */
export function setCachedProductRating(productId: string, summary: ProductRatingSummary): void {
  ratingCache.set(productId, summary);
}
