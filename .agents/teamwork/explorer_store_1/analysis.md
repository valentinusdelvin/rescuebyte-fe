# Analysis Report: Customer Store Pages Rating & Review Integration

**Author**: Store Reviews Explorer (`explorer_store_1`)  
**Date**: 2026-11-09  
**Target Milestone**: Customer Review Remediation & Rating Dynamic Integration  
**Scope**: `CustomerStoreDetail.tsx`, `StoreInfoCard.tsx`, `StoreHero.tsx`, `StoreReviewsList.tsx`, `useReviews.ts`, `reviewApi.ts`, and related cross-component touchpoints.

---

## Executive Summary
Investigation confirms that customer store pages currently display hardcoded `4.9` rating and `48` review count due to:
1. `src/pages/customer/CustomerStoreDetail.tsx` lines 206-207 explicitly setting `rating: 4.9, reviewCount: 48` during store data resolution, with line 114 initializing `rating: 5.0`, and line 316 hardcoding `storeReviews` to an empty array `[]`.
2. `src/components/customer/store/StoreReviewsList.tsx` lines 64-66 having a flawed fallback logic `liveReviews && liveReviews.length > 0 ? liveTotalReviews : (initialReviewCount || effectiveReviews.length)`. When a store has 0 reviews (`liveReviews.length === 0`), it falls back to `initialReviewCount` (48), causing the header to display `Ulasan Pelanggan (48)` while the body displays `"Belum ada ulasan untuk toko ini"`.
3. `src/components/customer/store/StoreHero.tsx` and `StoreInfoCard.tsx` directly render `storeData.rating` and `storeData.reviewCount` without handling empty rating/count states cleanly (`0.0` and `0 ulasan`).
4. Cross-component touchpoints (`MysteryBoxCard.tsx`, `CheckoutItemsList.tsx`, `cartService.ts`, `CustomerHome.tsx`, `model.ts`, `AppRoutes.tsx`) contain residual `4.9` and `42`/`48` fallbacks.

All required backend endpoints and client hooks (`useStoreReviews`, `useStoreSummary`, `reviewApi.getStoreSummary`, `reviewApi.getStoreReviews`, `reviewApi.createStoreReview`) already exist, are typed, and correctly unwrap backend payloads via Axios interceptors. Connecting `CustomerStoreDetail` to `useStoreReviews` with resolved `effectiveStoreId` will completely eliminate all hardcoded ratings and provide seamless dynamic data.

---

## 1. Codebase Audit & Direct Observations

### 1.1 `src/pages/customer/CustomerStoreDetail.tsx`
* **File location**: `src/pages/customer/CustomerStoreDetail.tsx`
* **Observations**:
  1. **Line 114-115**: Initial state initializes rating to 5.0:
     ```ts
     const [storeData, setStoreData] = useState<StoreDetailInfo>(() => ({
       name: effectiveStoreName,
       category: 'Kuliner & Pangan Surplus',
       status: 'Buka',
       rating: 5.0,        // <--- Initial rating is 5.0 before loading
       reviewCount: 0,
       ...
     }));
     ```
  2. **Lines 201-208**: In `loadStoreAndProducts()`, when a store is matched from `getAllStores()`:
     ```ts
     setStoreData({
       id: matchedBackendStore.id,
       name: matchedBackendStore.name,
       category: 'Aneka Makanan Berat & Kuliner',
       status: displayStatus,
       rating: 4.9,        // <--- HARDCODED 4.9
       reviewCount: 48,    // <--- HARDCODED 48
       distance: dynamicDistance,
       ...
     });
     ```
  3. **Line 316**: Store reviews are hardcoded to an empty array:
     ```ts
     // Reviews list (can be extended with live backend reviews)
     const storeReviews: StoreReviewItem[] = useMemo(() => [], []);
     ```
  4. **Lines 411-416**: Props passed to `StoreReviewsList`:
     ```tsx
     {(activeTab === 'tentang' || activeTab === 'ulasan') && (
       <StoreReviewsList
         reviews={storeReviews}
         reviewCount={storeData.reviewCount}
         storeId={storeId}
       />
     )}
     ```
     **Critical Flaw**: `storeId` passed is the component prop `storeId`. When users navigate via `#toko?name=Toko%20Rejak` or click store links without an ID query, `storeId` is `undefined`. Even though `matchedBackendStore.id` is resolved in `loadStoreAndProducts()`, it was never passed to `StoreReviewsList`.
  5. `CustomerStoreDetail` does not invoke `useStoreReviews` or `useStoreSummary` or `reviewApi.getStoreSummary`.

---

### 1.2 `src/components/customer/store/StoreInfoCard.tsx`
* **File location**: `src/components/customer/store/StoreInfoCard.tsx`
* **Observations**:
  1. **Lines 5-11**: Receives `storeData: StoreDetailInfo` and `storeProducts: StoreProductItem[]`.
  2. **Lines 151-172 (Rating Toko)**:
     ```tsx
     {/* Rating Toko */}
     <button
       type="button"
       onClick={onNavigateToReviews}
       className="..."
       aria-label={`Rating Toko: ${storeData.rating} dari ${storeData.reviewCount} ulasan. Klik untuk melihat ulasan.`}
     >
       <div className="...">
         <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
       </div>
       <div className="min-w-0">
         <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
           {storeData.rating}
         </span>
         <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
           Rating Toko
         </span>
         <span className="text-[11px] text-slate-400 font-normal leading-tight block mt-0.5 group-hover:underline">
           ({storeData.reviewCount} ulasan)
         </span>
       </div>
     </button>
     ```
  3. **Lines 174-196 (Total Ulasan)**:
     ```tsx
     {/* Total Ulasan */}
     <button
       type="button"
       onClick={onNavigateToReviews}
       className="..."
       aria-label={`Total Ulasan: ${storeData.reviewCount}. Klik untuk melihat ulasan.`}
     >
       <div className="...">
         <MessageSquare className="w-5 h-5 text-emerald-600" />
       </div>
       <div className="min-w-0">
         <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
           {storeData.reviewCount}
         </span>
         <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
           Total Ulasan
         </span>
         <span className="text-[11px] text-emerald-600 font-semibold leading-tight block mt-0.5 group-hover:underline">
           Lihat ulasan &rarr;
         </span>
       </div>
     </button>
     ```
  4. Values directly reflect `storeData.rating` and `storeData.reviewCount`. When `CustomerStoreDetail` passes `rating: 4.9, reviewCount: 48`, this card renders `4.9 Rating Toko (48 ulasan)` and `48 Total Ulasan`.
  5. When a store has 0 reviews, it displays whatever raw numbers are in `storeData` without formatting `0.0` or empty subtexts.

---

### 1.3 `src/components/customer/store/StoreHero.tsx`
* **File location**: `src/components/customer/store/StoreHero.tsx`
* **Observations**:
  1. **Lines 7-10**: Receives `storeData: StoreDetailInfo`, `onOpenGoogleMaps`, and `onScrollToReviews`.
  2. **Lines 84-102**:
     ```tsx
     <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500 mb-2">
       <button
         type="button"
         onClick={() => {
           if (onScrollToReviews) {
             onScrollToReviews();
           } else {
             document.getElementById('ulasan-pelanggan')?.scrollIntoView({ behavior: 'smooth' });
           }
         }}
         className="font-semibold text-slate-800 flex items-center gap-1 hover:underline cursor-pointer group focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600 rounded px-1 -mx-1"
         aria-label={`Rating ${storeData.rating} dari ${storeData.reviewCount} ulasan. Klik untuk melihat ulasan.`}
       >
         <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
         <span>{storeData.rating}</span>
         <span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
           ({storeData.reviewCount} ulasan)
         </span>
       </button>
     </div>
     ```
  3. Displays `★ {storeData.rating} ({storeData.reviewCount} ulasan)`.
  4. If `storeData.rating: 4.9, reviewCount: 48` is passed, it displays `★ 4.9 (48 ulasan)`.
  5. If `reviewCount === 0`, it needs to display `★ 0.0 (0 ulasan)` or `★ 0.0 (Belum ada ulasan)`.

---

### 1.4 `src/components/customer/store/StoreReviewsList.tsx`
* **File location**: `src/components/customer/store/StoreReviewsList.tsx`
* **Observations**:
  1. **Lines 44-46**: Uses `useStoreReviews(storeId, undefined, { autoFetch: Boolean(storeId) })`.
  2. **Lines 49-62**: Maps `liveReviews` to `StoreReviewItem` if `liveReviews.length > 0`, else falls back to `initialReviews` (`storeReviews` from parent).
  3. **Lines 64-66 (Critical Fallback Defect)**:
     ```ts
     const effectiveCount = liveReviews && liveReviews.length > 0
       ? liveTotalReviews
       : (initialReviewCount || effectiveReviews.length);
     ```
     **Why this breaks empty state**:
     When a store has 0 reviews, `liveReviews` is `[]`.
     `liveReviews.length > 0` is `false`.
     The ternary falls back to `(initialReviewCount || effectiveReviews.length)`.
     Because `initialReviewCount` was passed as `storeData.reviewCount` (which was hardcoded to 48), `effectiveCount` becomes `48`!
     So line 99 renders:
     ```tsx
     <h2 className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
       Ulasan Pelanggan (48)
     </h2>
     ```
     While lines 220-224 render:
     ```tsx
     <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm">
       Belum ada ulasan untuk toko ini.
     </div>
     ```
     This produces the exact visual bug reported by the user!
  4. **Sorting**: Has client-side sort for `'terbaru' | 'rating-tinggi' | 'rating-rendah'`.
  5. **Review Submission**: Does not currently expose a "Tulis Ulasan Toko" action for customers to submit store reviews, even though `POST /api/v1/stores/{store_id}/reviews` is supported.

---

### 1.5 `src/hooks/useReviews.ts` & `src/api/services/reviewApi.ts`
* **Available Endpoints**:
  1. `GET /api/v1/stores/{store_id}/reviews` (`reviewApi.getStoreReviews(storeId, params)`)
  2. `POST /api/v1/stores/{store_id}/reviews` (`reviewApi.createStoreReview(storeId, data)`)
  3. `GET /api/v1/stores/{id}/summary` (`reviewApi.getStoreSummary(storeId)`)
  4. `GET /api/v1/products/{product_id}/reviews` (`reviewApi.getProductReviews(productId, params)`)
  5. `POST /api/v1/products/{product_id}/reviews` (`reviewApi.createProductReview(productId, data)`)
  6. `PATCH /api/v1/reviews/{id}` (`reviewApi.updateReview(id, data)`)
  7. `DELETE /api/v1/reviews/{id}` (`reviewApi.deleteReview(id)`)
* **Available Hooks**:
  1. `useStoreReviews(storeId, params, options)`:
     Fetches both `getStoreReviews` and `getStoreSummary` concurrently via `Promise.allSettled`.
     Returns: `reviews`, `meta`, `summary`, `averageRating`, `totalReviews`, `ratingDistribution`, `isLoading`, `isError`, `error`, `refetch`.
  2. `useStoreSummary(storeId, options)`:
     Fetches store summary (`average_rating`, `total_reviews`).
  3. `useReviewMutations(options)`:
     Provides `createProductReview`, `createStoreReview`, `updateReview`, `deleteReview`, and `isSubmitting`.
* **Axios Unwrapping**:
  In `src/api/client.ts` lines 136-170, the response interceptor automatically unwraps `{ request_id, payload }` so `res.data` directly contains the payload.
* **Backend Live Verification**:
  Direct API query to `GET /api/v1/stores/01a187c3-82a3-7f06-afe1-e276c3c4a142/summary` (Toko Rejak) returned:
  ```json
  {
    "average_rating": 0,
    "total_reviews": 0
  }
  ```
  And `GET /api/v1/stores/01a187c3-82a3-7f06-afe1-e276c3c4a142/reviews` returned:
  ```json
  {
    "reviews": [],
    "meta": { "total_data": 0, "total_page": 0, "page": 1, "limit": 10 }
  }
  ```
  All backend stores in the demo database currently have 0 reviews. Therefore, displaying `0.0` and `0 ulasan` is 100% accurate and reflects the actual live backend state.

---

### 1.6 Additional Cross-Component Touchpoints (Residual Hardcoded Ratings)
During static audit, the following residual hardcoded 4.9/42 values were identified:

| File | Line(s) | Current Code | Recommended Fix |
|---|---|---|---|
| `src/components/customer/MysteryBoxCard.tsx` | 261-262 | `item.rating?.toFixed(1) \|\| '4.9'`, `item.reviewCount \|\| '1.2k'` | `{item.rating && item.rating > 0 ? item.rating.toFixed(1) : '0.0'}`, `({item.reviewCount ?? 0} ulasan)` |
| `src/components/customer/checkout/CheckoutItemsList.tsx` | 109-110 | `★ {item.rating \|\| group.rating \|\| 4.9}`, `({item.reviewCount \|\| group.reviewCount \|\| 42} ulasan)` | `★ {item.rating \|\| group.rating \|\| 0}`, `({item.reviewCount ?? group.reviewCount ?? 0} ulasan)` |
| `src/components/customer/cart/CartStoreGroup.tsx` | 115-116 | `★ {store.rating.toFixed(1)}`, `({store.reviewCount} ulasan)` | `★ {store.rating ? store.rating.toFixed(1) : '0.0'}`, `({store.reviewCount ?? 0} ulasan)` |
| `src/services/cartService.ts` | 178-179 | `rating: 4.9, reviewCount: 42` | `rating: 0, reviewCount: 0` |
| `src/pages/customer/CustomerHome.tsx` | 88-89 | `rating: 4.9, reviewCount: '42'` | `rating: 0, reviewCount: 0` |
| `src/features/customer/marketplace/model.ts` | 78-79 | `rating: 4.9, reviewCount: 42` | `rating: 0, reviewCount: 0` |
| `src/pages/customer/CustomerProductDetail.tsx` | 83 | `const rating = product?.rating ?? 5.0;` | `const rating = product?.rating ?? 0;` |
| `src/app/AppRoutes.tsx` | 130-131 | `rating: product.rating \|\| 4.8`, `... \|\| 320` | `rating: product.rating \|\| 0`, `... \|\| 0` |

---

## 2. Dynamic Integration Architecture & Implementation Recommendations

### Architecture Overview
```
+-------------------------------------------------------------+
| CustomerStoreDetail.tsx                                     |
|                                                             |
| 1. Resolve effectiveStoreId (from storeId prop or stores API)|
| 2. Call useStoreReviews(effectiveStoreId)                   |
|    --> fetches GET /api/v1/stores/{id}/reviews              |
|    --> fetches GET /api/v1/stores/{id}/summary              |
| 3. State:                                                   |
|    storeData.rating = averageRating || 0                    |
|    storeData.reviewCount = totalReviews || 0                |
+--------------+-------------------+--------------------------+
               |                   |
               v                   v
      +-----------------+  +-----------------+
      |  StoreHero.tsx  |  | StoreInfoCard   |
      |  "Ringkasan"    |  | "Tentang Toko"  |
      |  rating: 0.0    |  | rating: 0.0     |
      |  count: 0 ulasan|  | count: 0 ulasan |
      +-----------------+  +-----------------+
                                   |
                                   v
                      +--------------------------+
                      | StoreReviewsList.tsx     |
                      | Header: "Ulasan (0)"     |
                      | Body: EmptyState box     |
                      | Optional: Write Store Rev|
                      +--------------------------+
```

### Specific Implementation Steps

#### Step 1: `CustomerStoreDetail.tsx`
1. Initialize `storeData`:
   - Change `rating: 5.0` (line 114) to `rating: 0`.
2. Introduce `resolvedStoreId` state:
   - `const [resolvedStoreId, setResolvedStoreId] = useState<string | undefined>(storeId);`
   - In `loadStoreAndProducts()`, after finding `matchedBackendStore`:
     ```ts
     const targetStoreId = matchedBackendStore?.id || storeId;
     if (targetStoreId && targetStoreId !== resolvedStoreId) {
       setResolvedStoreId(targetStoreId);
     }
     ```
3. Remove hardcoded rating in `setStoreData` (lines 206-207):
   ```ts
   // In loadStoreAndProducts:
   setStoreData(prev => ({
     ...prev,
     id: matchedBackendStore.id,
     name: matchedBackendStore.name,
     category: 'Aneka Makanan Berat & Kuliner',
     status: displayStatus,
     // Keep current rating & reviewCount from reactive hook or initial 0
     distance: dynamicDistance,
     ...
   }));
   ```
4. Call `useStoreReviews` at the top level of `CustomerStoreDetail`:
   ```ts
   const {
     reviews: rawReviews,
     averageRating,
     totalReviews,
     isLoading: isLoadingReviews,
     refetch: refetchStoreReviews,
   } = useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) });
   ```
5. Synchronize `storeData.rating` and `storeData.reviewCount`:
   ```ts
   useEffect(() => {
     setStoreData(prev => ({
       ...prev,
       rating: averageRating,
       reviewCount: totalReviews,
     }));
   }, [averageRating, totalReviews]);
   ```
6. Map `rawReviews` to `storeReviews`:
   ```ts
   const storeReviews: StoreReviewItem[] = useMemo(() => {
     return rawReviews.map((r) => ({
       id: r.id,
       name: r.author?.name || 'Pelanggan',
       role: r.author?.role || 'Penyelamat Makanan',
       avatar: r.author?.avatar_url || '',
       rating: r.rating,
       date: formatReviewDate(r.created_at),
       comment: r.content,
     }));
   }, [rawReviews]);
   ```
7. Pass `resolvedStoreId` to `StoreReviewsList`:
   ```tsx
   <StoreReviewsList
     reviews={storeReviews}
     reviewCount={totalReviews}
     storeId={resolvedStoreId}
     isLoading={isLoadingReviews}
   />
   ```

#### Step 2: `StoreHero.tsx`
Handle empty rating display cleanly:
```tsx
const hasReviews = (storeData.reviewCount ?? 0) > 0;
const formattedRating = hasReviews && typeof storeData.rating === 'number' && storeData.rating > 0
  ? storeData.rating.toFixed(1)
  : '0.0';
const reviewsLabel = hasReviews
  ? `(${storeData.reviewCount} ulasan)`
  : '(0 ulasan)';
```
Update JSX on line 97:
```tsx
<span>{formattedRating}</span>
<span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
  {reviewsLabel}
</span>
```

#### Step 3: `StoreInfoCard.tsx`
Handle empty rating and total reviews display:
```tsx
const hasReviews = (storeData.reviewCount ?? 0) > 0;
const formattedRating = hasReviews && typeof storeData.rating === 'number' && storeData.rating > 0
  ? storeData.rating.toFixed(1)
  : '0.0';
```
In Rating Toko card:
- Score: `{formattedRating}`
- Count: `({storeData.reviewCount || 0} ulasan)`
In Total Ulasan card:
- Score: `{storeData.reviewCount || 0}`
- Link: `{hasReviews ? 'Lihat semua ulasan →' : 'Belum ada ulasan →'}`

#### Step 4: `StoreReviewsList.tsx`
Fix effective count and fallback logic:
```ts
// If storeId is provided, trust the liveTotalReviews or reviewCount prop directly
const effectiveCount = typeof liveTotalReviews === 'number' && Boolean(storeId)
  ? liveTotalReviews
  : (initialReviewCount ?? effectiveReviews.length ?? 0);
```
Ensure that when `effectiveCount === 0`, it displays:
`Ulasan Pelanggan (0)`
and renders the clean empty state container:
`Belum ada ulasan untuk toko ini.`

#### Step 5: Residual Cross-Component Cleanup
Replace all fallback `4.9` and `42` in `MysteryBoxCard.tsx`, `CheckoutItemsList.tsx`, `CartStoreGroup.tsx`, `cartService.ts`, `CustomerHome.tsx`, and `model.ts` with `0.0` / `0`.

---

## 3. Risk Assessment & Mitigations

1. **Risk**: Asynchronous store matching — `CustomerStoreDetail` may take a moment to match `Toko Rejak` from `getAllStores()`.
   **Mitigation**: Initial state has `rating: 0, reviewCount: 0`. During load, `useStoreReviews` fetches automatically once `resolvedStoreId` is populated. No flash of hardcoded 4.9.
2. **Risk**: Backend failure or slow network when fetching store summary.
   **Mitigation**: `useStoreReviews` uses `Promise.allSettled`, so if `getStoreSummary` fails, it falls back to computing averages from `reviews`. If both fail, `averageRating: 0, totalReviews: 0`.
3. **Risk**: Direct URL access via `#toko?name=Toko%20Rejak` without `id`.
   **Mitigation**: `CustomerStoreDetail` matches the store from `getAllStores()`, sets `resolvedStoreId = matchedBackendStore.id`, and automatically triggers `useStoreReviews`.
