# Handoff Report: Explorer 2 (API Integration & Rating Consistency Specialist)

## 1. Observation

### 1.1 Product & Review API Contracts (Swagger vs. Live Backend)
1. **Swagger Schema Analysis (`swagger_doc.json`)**:
   - `GET /api/v1/products` query parameters:
     - Supported parameters: `page` (int), `limit` (int), `store_id` (string), `nama` (string), `name` (string), `search` (string), `city` (string), `latitude` (number), `longitude` (number).
     - **No server-side sorting parameters** (e.g., `sort`, `order_by`, `sort_by`) exist in Swagger.
   - `ProductCardResponse` definition (`swagger_doc.json` line 1243):
     ```json
     {
       "type": "object",
       "properties": {
         "description": { "type": "string" },
         "discount_percentage": { "type": "integer" },
         "distance_km": { "type": "number" },
         "id": { "type": "string" },
         "main_image_url": { "type": "string" },
         "name": { "type": "string" },
         "normal_price": { "type": "integer" },
         "operational_end": { "type": "string" },
         "operational_start": { "type": "string" },
         "pickup_time": { "type": "string" },
         "rescue_price": { "type": "integer" },
         "stock": { "type": "integer" },
         "store_id": { "type": "string" },
         "store_name": { "type": "string" }
       }
     }
     ```
     - **Notice**: Neither `rating` nor `review_count` is present in `ProductCardResponse` or `ProductResponse`.
   - `GET /api/v1/products/{product_id}/reviews` (`swagger_doc.json` line 777):
     - Returns `GetReviewsResponse` containing:
       - `meta`: `{ page, limit, total_data, total_page }`
       - `reviews`: array of `ReviewResponse` with `id`, `user_id`, `product_id`, `rating` (1–5), `content`, `author` (`name`, `avatar_url`, `role`).
   - `GET /api/v1/stores/{id}/summary` (`swagger_doc.json` line 925):
     - Returns `StoreSummaryResponse`: `{ average_rating: number, total_reviews: integer }` specifically for the store entity.

2. **Live Backend Verification (`https://dolpin-fourthree.bccdev.id`)**:
   - Querying `GET /api/v1/products?limit=100` returns 6 active products:
     1. `01a18db1-3ef4-7844-9da6-4a4612d30834` ("Rendang", Store: Masakan Indonesia) -> 0 reviews
     2. `01a18dab-d880-759b-9323-fc100fed2186` ("Rendang", Store: Makanan padang) -> 0 reviews
     3. `01a18da3-b429-7a29-bbb5-04479d13b3ca` ("Makanan Ringan", Store: Toko Makanan) -> 0 reviews
     4. `01a18da2-3e82-72be-817d-04e185bab0cf` ("SALAD SEGAR", Store: Toko Enak) -> 0 reviews
     5. `01a18d95-d27d-719f-8e8b-646aa4fc6b65` ("Brownies Signature", Store: Brownies Manisku) -> 0 reviews
     6. `01a188c0-ef66-7190-a114-287b6d2a5154` ("REJAK ANGE", Store: anjay gurinjay) -> **4 reviews**, all rating 5 (`average_rating: 5.0, total_reviews: 4`).
   - Querying `GET /api/v1/products?latitude=-7.9526&longitude=112.6146&sort=popular`:
     - Returned status 200, but sorting parameter was completely ignored by the backend (items returned in exact database creation order).
     - Distances computed: `SALAD SEGAR` (0 km), `REJAK ANGE` (0.2 km), `Brownies Signature` (1.7 km), `Rendang` (2.8 km).

### 1.2 Frontend Codebase Observations
1. **`src/components/customer/MysteryBoxCard.tsx`**:
   - **Lines 67 & 71**: `variant = 'popular'` defaults `isPopular = true`.
   - **Lines 122–194**: Renders visual stock badges (`"Sisa 0 Box"`, `"Sisa 97 Box"`, `"Sisa 1 Box"`) at the top of the card when `isPopular` is true.
   - **Lines 233–275**:
     ```tsx
     {!isPopular && (
       /* Radius Variant: Star Rating & Review Count */
       <div
         role="button"
         ...
       >
         {(() => {
           const r = item.rating;
           const hasRating = typeof r === 'number' && r > 0;
           const numReviews = typeof item.reviewCount === 'number' ? item.reviewCount : Number(item.reviewCount) || 0;
           return (
             <>
               <span className="text-amber-400">★</span>
               <span>{hasRating && typeof r === 'number' ? r.toFixed(1) : '-'}</span>
               <span className="text-white/70 font-normal">
                 ({numReviews > 0 ? `${numReviews} ulasan` : 'Belum ada ulasan'})
               </span>
             </>
           );
         })()}
       </div>
     )}
     ```
     - **Direct impact**: When `variant === 'popular'`, the rating and review count block is completely hidden.
     - When `variant === 'radius'` is used, if `item.rating` is 0 and `numReviews` is 0, it renders `★ - (Belum ada ulasan)`.

2. **`src/pages/customer/CustomerHome.tsx`**:
   - **Lines 88–89**:
     ```tsx
     rating: (p as any).rating ?? 0,
     reviewCount: (p as any).review_count ?? (p as any).reviewCount ?? 0,
     ```
     Because `p` (`PublicProductItem`) does not have `rating` or `review_count`, it always defaults to 0.
   - **Lines 270–279**:
     ```tsx
     const sortedByDistance = [...products]
       .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
       .map((p) => mapPublicProductToCustomerBox(p, false));

     const sortedByDiscount = [...products]
       .sort((a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))
       .map((p) => mapPublicProductToCustomerBox(p, true));

     setNearbyBoxes(sortedByDistance);
     setBestSellerBoxes(sortedByDiscount);
     ```
     - Neither `sortedByDistance` nor `sortedByDiscount` is capped at 6 items in `loadBoxes()` (if 10 items were returned, 10 were rendered).
   - **Line 450**: Section "Mystery Box di Sekitar" passes `variant="popular"` -> Hides ratings entirely!
   - **Line 483**: Section "Mystery Box Terlaris" passes `variant="radius"` -> Displays rating, but because `item.rating` is 0, it renders `★ - (Belum ada ulasan)` even for `REJAK ANGE` which has 4 reviews!

3. **`src/pages/customer/CustomerMarketplace.tsx`**:
   - **Lines 93–94**: `sortField` defaults to `'lokasi'`, `sortOrder` defaults to `'asc'`.
   - **Lines 250–254**:
     ```tsx
     if (sortField === 'lokasi') {
       const distA = parseFloat(a.distanceText) || 0;
       const distB = parseFloat(b.distanceText) || 0;
       return sortOrder === 'asc' ? distA - distB : distB - distA;
     }
     ```
     - Using `parseFloat(a.distanceText) || 0` parses `"0.0 km"` (missing/unknown distance fallback) as `0`, erroneously sorting products without distance calculation to the very front.
   - **Lines 739–746**:
     ```tsx
     <MysteryBoxCard
       key={item.id}
       item={item}
       onOrderClick={handleOpenOrder}
       onStoreClick={(storeName) => {
         if (onNavigateStore) onNavigateStore(storeName, item.storeId);
       }}
     />
     ```
     - Omits `variant` prop -> defaults to `variant="popular"` -> ratings are completely hidden on Marketplace!
   - **`src/features/customer/marketplace/model.ts` Lines 78–79**:
     `rating: (p as any).rating ?? 0, reviewCount: (p as any).review_count ?? (p as any).reviewCount ?? 0`
     Always passes 0 for product ratings.

4. **Reviewer Identity Role Labels**:
   - `src/components/customer/store/StoreReviewsList.tsx` line 306:
     `<span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>`
   - `src/hooks/useReviews.ts` line 489:
     `role: r.author?.role || 'Penyelamat Makanan'`
   - `src/pages/customer/CustomerHome.tsx` line 629:
     `<span className="text-xs text-gray-500 font-medium">{testi.role}</span>`

---

## 2. Logic Chain

1. **Root Cause of Product Rating Inconsistency (R3)**:
   - Backend `ProductCardResponse` does not provide aggregate product rating or review count fields.
   - `CustomerHome.tsx` and `CustomerMarketplace.tsx` map raw product items with `(p as any).rating ?? 0`, yielding 0 for all products.
   - In `MysteryBoxCard.tsx`, ratings are hidden entirely if `variant === 'popular'`. Marketplace omits `variant` (defaulting to `'popular'`) and "Mystery Box di Sekitar" explicitly passes `'popular'`. Therefore, ratings were invisible across those screens.
   - For "Mystery Box Terlaris" (`variant="radius"`), ratings were visible, but because `item.rating = 0`, it displayed `★ - (Belum ada ulasan)`, even though `REJAK ANGE` has 4 real 5-star reviews on the backend.
   - Store rating (`GET /api/v1/stores/{id}/summary`) was occasionally conflated with product ratings. A store review belongs to the store; a product review belongs to a specific `product_id`.

2. **Avoiding the N+1 API Problem**:
   - If each product card triggered its own `useProductReviews` hook or independently made a fetch request, rendering 6 nearby cards + 6 best seller cards + 10 marketplace cards would fire 22 separate network requests simultaneously.
   - A centralized, deduplicated batch-fetching service with an in-memory cache resolves this:
     - For any product list loaded by Homepage or Marketplace, collect the unique product IDs (`new Set(ids)`).
     - Filter out IDs already present in cache.
     - For uncached IDs, fetch `GET /api/v1/products/{id}/reviews?limit=100` concurrently with `Promise.allSettled`.
     - Compute `{ rating: averageRating, reviewCount: totalReviews }` and write to cache.
     - Enrich product objects before rendering.
     - Total network overhead: exactly 1 parallel batch per page load; subsequent renders or shared product occurrences cost 0ms.

3. **Homepage 6-Product Queries (R5)**:
   - The backend `GET /api/v1/products` does not support server-side sorting parameters (`sort=popular`, etc. are ignored).
   - Sending `latitude` and `longitude` returns `distance_km` on each item, but backend order is DB insertion order.
   - Thus, client-side sorting is required and compliant with Swagger:
     - Nearby: sort by `distance_km` ascending, slice exactly 6 items.
     - Best Seller: sort by rating/popularity or discount descending, slice exactly 6 items.
     - Responsive grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` naturally forms a 3x2 grid on desktop for 6 items.

4. **Marketplace Default Nearest Sorting (R6)**:
   - `sortField` is already defaulted to `'lokasi'`, but the sorting comparator used `parseFloat(distanceText) || 0`.
   - Storing the numeric `distance_km` as `distanceKm` (with `Infinity` / `9999` fallback for unknown distances) ensures actual nearest products (e.g. 0 km and 0.2 km) are reliably ordered first.
   - In `MysteryBoxCard.tsx`, ratings must be rendered regardless of `variant`, enabling the existing 'ulasan' sort option in Marketplace to function properly.

---

## 3. Caveats

1. **Backend Sort Parameters**: We confirmed through direct API testing that `GET /api/v1/products` does not sort on the server side. If the backend team later adds an endpoint or query parameter, the frontend service can pass it, but client-side sorting remains necessary now to satisfy R5 and R6.
2. **Review Pagination for High-Volume Products**: Using `limit=100` on `GET /api/v1/products/{product_id}/reviews` retrieves up to 100 reviews in one call, which is sufficient for accurate rating calculation in current demo/production data. If a single product ever has >100 reviews and the backend still lacks an aggregate rating endpoint, `meta.total_data` still provides the exact total review count.
3. **No Caveats on Core Logic**: All endpoints and schemas were verified against `swagger_doc.json` and the live server.

---

## 4. Conclusion & Actionable Recommendations

### Recommendation 1 (R3): Centralized Product Rating Cache & Batch Fetcher
Create a lightweight rating helper in `src/services/productRatingService.ts` (or within `src/services/productService.ts`):
```ts
import { reviewApi } from '../api/services/reviewApi';

export interface ProductRatingSummary {
  rating: number;
  reviewCount: number;
}

const ratingCache = new Map<string, ProductRatingSummary>();

export async function batchFetchProductRatings(
  productIds: string[]
): Promise<Map<string, ProductRatingSummary>> {
  const uniqueIds = Array.from(new Set(productIds)).filter(Boolean);
  const uncachedIds = uniqueIds.filter((id) => !ratingCache.has(id));

  if (uncachedIds.length > 0) {
    const results = await Promise.allSettled(
      uncachedIds.map(async (id) => {
        const res = await reviewApi.getProductReviews(id, { limit: 100 });
        const metaCount = res.meta?.total_data;
        const reviews = res.reviews || [];
        const count = typeof metaCount === 'number' ? metaCount : reviews.length;
        const avg =
          reviews.length > 0
            ? Math.round(
                (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length) * 10
              ) / 10
            : 0;
        return { id, summary: { rating: avg, reviewCount: count } };
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

export function getCachedProductRating(productId: string): ProductRatingSummary | undefined {
  return ratingCache.get(productId);
}
```

### Recommendation 2 (R3 & R4): Universal Rating Display & Stock Badge Removal in `MysteryBoxCard.tsx`
1. **Remove stock badge overlays** (Lines 122–194 of `MysteryBoxCard.tsx`):
   - Delete the entire `<div className="flex items-center gap-1.5">{isPopular ? ... : ...}</div>` stock badge branch.
   - Keep only the distance pill and discount ratio pill.
2. **Always render rating block** (Lines 233–275 of `MysteryBoxCard.tsx`):
   - Remove the `{!isPopular && (` condition so star rating and review count render on ALL cards.
   - If `item.reviewCount > 0` and `item.rating > 0`, render `★ {item.rating.toFixed(1)} ({item.reviewCount} ulasan)`.
   - If `item.reviewCount === 0`, render `★ - (Belum ada ulasan)`.
3. In `StoreDaganganGrid.tsx` lines 193–217: Remove the visual stock badges (`"Sisa X Box"`), keeping only distance and discount pills.

### Recommendation 3 (R5): Homepage 6-Card Queries in `CustomerHome.tsx`
In `loadBoxes()`:
```ts
const products = await getPublicProducts({
  latitude: coords.lat,
  longitude: coords.lng,
  limit: 12,
});

// Batch fetch ratings for all products in one parallel pass
const ratingMap = await batchFetchProductRatings(products.map((p) => p.id));

// Map with actual ratings
const enriched = products.map((p) => {
  const summary = ratingMap.get(p.id) || { rating: 0, reviewCount: 0 };
  return mapPublicProductToCustomerBox({
    ...p,
    rating: summary.rating,
    reviewCount: summary.reviewCount,
  });
});

// Exactly 6 nearby products (sorted by distance ascending)
const sortedByDistance = [...enriched]
  .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
  .slice(0, 6);

// Exactly 6 best-selling / popular products (sorted by reviewCount/rating or discount descending)
const sortedByPopularity = [...enriched]
  .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.discountPercent || 0) - (a.discountPercent || 0))
  .slice(0, 6);

setNearbyBoxes(sortedByDistance);
setBestSellerBoxes(sortedByPopularity);
```

### Recommendation 4 (R6): Marketplace Default Sorting in `CustomerMarketplace.tsx`
1. In `fetchMarketplaceProducts`:
   - After fetching `publicItems`, call `await batchFetchProductRatings(publicItems.map(p => p.id))`.
   - Map `publicItems` attaching real `rating`, `reviewCount`, and numeric `distanceKm: p.distance_km ?? 9999`.
2. In `filteredProducts.sort()`:
   - For `sortField === 'lokasi'`:
     ```ts
     const distA = typeof a.distanceKm === 'number' ? a.distanceKm : (parseFloat(a.distanceText) || 9999);
     const distB = typeof b.distanceKm === 'number' ? b.distanceKm : (parseFloat(b.distanceText) || 9999);
     return sortOrder === 'asc' ? distA - distB : distB - distA;
     ```
   - For `sortField === 'ulasan'`:
     ```ts
     const ratingA = Number(a.rating) || 0;
     const ratingB = Number(b.rating) || 0;
     return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
     ```

### Recommendation 5 (R2): Clean Role Subtitles from Review Cards
1. In `StoreReviewsList.tsx` line 306:
   Remove `<span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>`.
2. In `CustomerHome.tsx` line 629:
   Remove `<span className="text-xs text-gray-500 font-medium">{testi.role}</span>`.

---

## 5. Verification Method

1. **Independent Verification Commands**:
   - `npm run typecheck` (`npx tsc --noEmit`) to verify strict TypeScript adherence with 0 errors.
   - `npm run build` to verify clean compilation without bundle errors.
2. **Live Data Inspection**:
   - Run:
     ```bash
     node -e "fetch('https://dolpin-fourthree.bccdev.id/api/v1/products/01a188c0-ef66-7190-a114-287b6d2a5154/reviews').then(r=>r.json()).then(d=>console.log(d.payload.meta))"
     ```
     Verifies product `01a188c0-ef66-7190-a114-287b6d2a5154` ("REJAK ANGE") returns 4 reviews.
3. **UI Verification**:
   - Open `#beranda`:
     - "Mystery Box di Sekitar" displays exactly 6 cards (or total available if < 6) in a 3x2 grid on desktop, sorted closest first.
     - "Mystery Box Terlaris" displays exactly 6 cards.
     - "REJAK ANGE" card displays `★ 5.0 (4 ulasan)`.
     - No stock badges (`Sisa X Box`) appear on any cards.
   - Open `#marketplace`:
     - Default active sort option is "Lokasi Terdekat".
     - Nearest product (e.g., 0 km, 0.2 km) appears first.
     - All product cards display star rating and review count.
