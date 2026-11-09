## 2026-11-09T05:54:19Z
You are Customer Reviews Remediation Worker on RescueByte.
Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_customer_reviews

MANDATORY FIRST STEP: Read the full instructions and user request in:
c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
and the scope document in:
c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_3\SCOPE.md
and the 3 Explorer analysis files:
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_store_1\analysis.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_product_2\analysis.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_touchpoints_3\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your File Ownership (Exclusive):
- `src/pages/customer/CustomerStoreDetail.tsx`
- `src/components/customer/store/StoreReviewsList.tsx`
- `src/components/customer/store/StoreHero.tsx`
- `src/components/customer/store/StoreInfoCard.tsx`
- `src/pages/customer/CustomerProductDetail.tsx`
- `src/components/customer/product/ProductReviewsSection.tsx`
- `src/components/customer/home/MysteryBoxCard.tsx`
- `src/components/customer/cart/CartStoreGroup.tsx`
- `src/services/cartService.ts`
- `src/components/customer/checkout/CheckoutItemsList.tsx`
- `src/pages/customer/CustomerCheckout.tsx`
- `src/pages/customer/CustomerHome.tsx`
- `src/features/customer/marketplace/model.ts`
- `src/pages/customer/CustomerMarketplace.tsx`
- `src/app/AppRoutes.tsx`

Implementation Tasks:
1. `CustomerStoreDetail.tsx`:
   - Replace hardcoded `rating: 4.9, reviewCount: 48` (lines ~206-207) and initial `rating: 5.0` (line ~114) with dynamic state initialized to 0.
   - Resolve store UUID properly: pass `matchedBackendStore.id` (or `storeData.id`) to `useStoreReviews(resolvedStoreId)` rather than the raw `storeId` prop (which can be undefined when navigating by store name).
   - Wire `useStoreReviews` to update `storeReviews` dynamically instead of hardcoding `const storeReviews: StoreReviewItem[] = useMemo(() => [], [])`.
   - Update `storeData.rating` and `storeData.reviewCount` dynamically from the store summary / store reviews returned by the backend.
2. `StoreReviewsList.tsx`:
   - Fix line ~64 fallback bug:
     Change `liveReviews && liveReviews.length > 0 ? liveTotalReviews : (initialReviewCount || effectiveReviews.length)`
     to:
     `liveTotalReviews !== undefined ? liveTotalReviews : (initialReviewCount ?? effectiveReviews.length)`.
     This ensures that when a store has 0 reviews (`liveReviews: []`), it correctly shows 0 total reviews and the clean empty state, NOT falling back to 48!
3. `StoreHero.tsx` and `StoreInfoCard.tsx`:
   - Format ratings safely when unreviewed: e.g. `rating > 0 ? rating.toFixed(1) : '-'` or `0.0`, and `${reviewCount} ulasan` or `Belum ada ulasan`.
   - Ensure "Ringkasan Toko" displays the real dynamic store summary without hardcoded 4.9 or 48.
4. `CustomerProductDetail.tsx` & `ProductReviewsSection.tsx`:
   - Verify `ProductReviewsSection` renders visibly beneath "Tentang Produk".
   - Fix line ~83 (`rating ?? 5.0`) & lines ~477-478 to use real rating or clean zero state (`- (Belum ada ulasan)`).
   - Ensure `ProductReviewsSection` handles empty review state cleanly without crashing or hiding itself.
5. All Touchpoints and Cards:
   - Clean up hardcoded fallback ratings (4.9 / 48 / 42 / 1.2k) in `MysteryBoxCard.tsx`, `CartStoreGroup.tsx`, `cartService.ts`, `CheckoutItemsList.tsx`, `CustomerCheckout.tsx`, `CustomerHome.tsx`, `model.ts`, `CustomerMarketplace.tsx`, `AppRoutes.tsx`.
   - Present honest ratings (`item.rating > 0 ? item.rating.toFixed(1) : 'Baru'`, `${item.reviewCount ?? 0} ulasan`, etc.) and ensure navigation to `#ulasan-pelanggan` still works seamlessly.

Verification:
- Run `npm run typecheck`
- Run `npm run build`
Both commands must succeed with 0 errors!

Deliverables:
- Write detailed change log and verification output to:
  `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_customer_reviews\handoff.md`
- Send completion message to orchestrator via send_message.
