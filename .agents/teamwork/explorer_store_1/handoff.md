# Handoff Report: Customer Store Pages Rating & Review Integration

**Agent**: Store Reviews Explorer (`explorer_store_1`)  
**Recipient**: Orchestrator / Implementation Worker  
**Date**: 2026-11-09  
**Type**: Hard (Task Complete)

---

## 1. Observation

Direct observations from codebase inspection, file audits, and backend API testing:

1. **`src/pages/customer/CustomerStoreDetail.tsx`**:
   - Line 114:
     ```ts
     rating: 5.0,
     reviewCount: 0,
     ```
   - Lines 206-207 in `loadStoreAndProducts()`:
     ```ts
     rating: 4.9,
     reviewCount: 48,
     ```
   - Line 316:
     ```ts
     const storeReviews: StoreReviewItem[] = useMemo(() => [], []);
     ```
   - Line 414:
     ```tsx
     <StoreReviewsList
       reviews={storeReviews}
       reviewCount={storeData.reviewCount}
       storeId={storeId}
     />
     ```
     The prop `storeId` is passed, which is `undefined` when navigating via `#toko` or by store name without an ID query param. The resolved store UUID `matchedBackendStore.id` was never passed down.

2. **`src/components/customer/store/StoreInfoCard.tsx`**:
   - Lines 151-172: "Rating Toko" button renders `storeData.rating` (Line 163) and `({storeData.reviewCount} ulasan)` (Line 169).
   - Lines 174-196: "Total Ulasan" button renders `storeData.reviewCount` (Line 186).
   - Direct consumer of `storeData` from `CustomerStoreDetail`.

3. **`src/components/customer/store/StoreHero.tsx`**:
   - Lines 96-100:
     ```tsx
     <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
     <span>{storeData.rating}</span>
     <span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
       ({storeData.reviewCount} ulasan)
     </span>
     ```
   - Direct consumer of `storeData` from `CustomerStoreDetail`.

4. **`src/components/customer/store/StoreReviewsList.tsx`**:
   - Lines 44-46:
     ```ts
     const { reviews: liveReviews, totalReviews: liveTotalReviews } = useStoreReviews(storeId, undefined, {
       autoFetch: Boolean(storeId),
     });
     ```
   - Lines 64-66 (Critical defect):
     ```ts
     const effectiveCount = liveReviews && liveReviews.length > 0
       ? liveTotalReviews
       : (initialReviewCount || effectiveReviews.length);
     ```
     When a store has 0 reviews in the backend, `liveReviews` is `[]` (length 0). The ternary condition `liveReviews && liveReviews.length > 0` evaluates to `false`. It falls back to `(initialReviewCount || effectiveReviews.length)`, which receives `storeData.reviewCount` (48), displaying `Ulasan Pelanggan (48)` despite 0 reviews in the list.

5. **Live Backend API Queries**:
   - Executed `GET https://dolpin-fourthree.bccdev.id/api/v1/stores/01a187c3-82a3-7f06-afe1-e276c3c4a142/summary`:
     ```json
     {
       "request_id": "t93yEaDb_vXnKWi5DyHrhhwEWGtkrF7BEtf_x2JiDtk",
       "payload": {
         "average_rating": 0,
         "total_reviews": 0
       }
     }
     ```
   - Executed `GET https://dolpin-fourthree.bccdev.id/api/v1/stores/01a187c3-82a3-7f06-afe1-e276c3c4a142/reviews`:
     ```json
     {
       "payload": {
         "reviews": [],
         "meta": { "total_data": 0, "total_page": 0, "page": 1, "limit": 10 }
       }
     }
     ```
   - All 11 stores in the backend database currently have 0 reviews and 0 average rating.

6. **Residual Hardcoded Rating Touchpoints in Other Files**:
   - `src/components/customer/MysteryBoxCard.tsx` lines 261-262: `item.rating?.toFixed(1) || '4.9'` and `item.reviewCount || '1.2k'`.
   - `src/components/customer/checkout/CheckoutItemsList.tsx` lines 109-110: `item.rating || group.rating || 4.9` and `item.reviewCount || group.reviewCount || 42`.
   - `src/services/cartService.ts` lines 178-179: `rating: 4.9, reviewCount: 42`.
   - `src/pages/customer/CustomerHome.tsx` lines 88-89: `rating: 4.9, reviewCount: '42'`.
   - `src/features/customer/marketplace/model.ts` lines 78-79: `rating: 4.9, reviewCount: 42`.
   - `src/pages/customer/CustomerProductDetail.tsx` line 83: `product?.rating ?? 5.0`.
   - `src/app/AppRoutes.tsx` lines 130-131: `rating: product.rating || 4.8` and `... || 320`.

---

## 2. Logic Chain

1. **Why `StoreHero` and `StoreInfoCard` display 4.9 rating and 48 reviews**:
   - `StoreHero` renders `storeData.rating` and `storeData.reviewCount`.
   - `StoreInfoCard` renders `storeData.rating` and `storeData.reviewCount`.
   - In `CustomerStoreDetail.tsx`, `storeData` is set to `rating: 4.9, reviewCount: 48` on lines 206-207.
   - Therefore, any store loaded through `CustomerStoreDetail` displays `4.9` and `48` unconditionally.

2. **Why `StoreReviewsList` displays `Ulasan Pelanggan (48)` with an empty list**:
   - In `StoreReviewsList.tsx` line 64, `effectiveCount` checks `liveReviews && liveReviews.length > 0`.
   - For stores with 0 reviews, `liveReviews` is empty (`[]`), so this condition fails.
   - The expression falls back to `(initialReviewCount || effectiveReviews.length)`.
   - Since `initialReviewCount` is `storeData.reviewCount` (48), `effectiveCount` evaluates to 48.
   - Meanwhile, `sortedReviews.length === 0` renders `"Belum ada ulasan untuk toko ini"`.

3. **Why `useStoreReviews` was not firing properly**:
   - `CustomerStoreDetail` only passed the prop `storeId` to `StoreReviewsList`.
   - In typical hash navigation (`#toko` or `#toko?name=Toko%20Rejak`), `storeId` prop is `undefined`.
   - `useStoreReviews(storeId)` had `autoFetch: Boolean(storeId) = false`.
   - The resolved store UUID `matchedBackendStore.id` was available inside `loadStoreAndProducts()` but was not saved into state or provided to `useStoreReviews`.

4. **Resolution Strategy**:
   - Track `resolvedStoreId` in `CustomerStoreDetail.tsx` (initialized from `storeId` prop, updated from `matchedBackendStore.id`).
   - Call `useStoreReviews(resolvedStoreId)` at the top level of `CustomerStoreDetail.tsx`.
   - Remove hardcoded `rating: 4.9, reviewCount: 48` from `setStoreData` in `CustomerStoreDetail.tsx` and initialize `storeData.rating: 0`.
   - Reactively sync `storeData.rating` and `storeData.reviewCount` with `averageRating` and `totalReviews` from `useStoreReviews`.
   - Map `rawStoreReviews` to `StoreReviewItem[]` and pass to `StoreReviewsList`.
   - Fix `effectiveCount` in `StoreReviewsList.tsx` so that 0 reviews correctly resolves to 0.
   - Format `StoreHero.tsx` and `StoreInfoCard.tsx` to handle 0 reviews (`0.0` and `0 ulasan`) cleanly.

---

## 3. Caveats

1. **No backend reviews in current database**:
   Because all stores in the test database currently have 0 reviews, the dynamic integration will correctly show `0.0` rating and `0 ulasan` with the empty state container. Once a store receives a review via `POST /api/v1/stores/{store_id}/reviews`, the backend summary will reflect non-zero values.
2. **Review submission on store page**:
   `POST /api/v1/stores/{store_id}/reviews` exists in `reviewApi.ts` and `useReviewMutations()`. A "Tulis Ulasan Toko" button can be optionally wired on `StoreReviewsList` using `ReviewSubmissionModal` to allow users to add store reviews.
3. **No source code was modified during this investigation** in compliance with read-only explorer constraints.

---

## 4. Conclusion

1. **Root cause fully located**:
   - Hardcoded `rating: 4.9, reviewCount: 48` in `CustomerStoreDetail.tsx:206-207`.
   - Hardcoded `storeReviews: StoreReviewItem[] = useMemo(() => [], [])` in `CustomerStoreDetail.tsx:316`.
   - Defective count fallback in `StoreReviewsList.tsx:64-66`.
   - Disconnected store ID resolution between `loadStoreAndProducts()` and `useStoreReviews()`.
2. **Actionable remediation plan formulated**:
   Detailed step-by-step code changes documented in `analysis.md` across `CustomerStoreDetail.tsx`, `StoreHero.tsx`, `StoreInfoCard.tsx`, and `StoreReviewsList.tsx`, along with 8 cross-component residual fallback fixes.
3. **Build & Typecheck verification passed**:
   Current workspace builds cleanly (`npm run build` exit code 0) and typechecks with 0 errors (`npm run typecheck` exit code 0).

---

## 5. Verification Method

1. **Static Typecheck**:
   ```bash
   npm run typecheck
   ```
   *Expected outcome*: 0 errors.

2. **Production Build**:
   ```bash
   npm run build
   ```
   *Expected outcome*: Build succeeds in < 3s, 0 errors.

3. **Verify Removal of Hardcoded Values**:
   ```bash
   git grep -n "4.9" src/pages/customer/CustomerStoreDetail.tsx
   git grep -n "reviewCount: 48" src/
   ```
   *Expected outcome*: 0 matches.

4. **Live UI Verification**:
   - Navigate to `#toko` or `#detail-toko` (Toko Rejak).
   - Verify Store Hero displays `★ 0.0 (0 ulasan)`.
   - Verify Store Info Card displays `0.0 Rating Toko (0 ulasan)` and `0 Total Ulasan`.
   - Verify Store Tabs displays `Ulasan (0)`.
   - Verify Store Reviews List displays `Ulasan Pelanggan (0)` and the empty state box `"Belum ada ulasan untuk toko ini"`.
   - Verify clicking `★ 0.0 (0 ulasan)` smoothly scrolls to `#ulasan-pelanggan`.
