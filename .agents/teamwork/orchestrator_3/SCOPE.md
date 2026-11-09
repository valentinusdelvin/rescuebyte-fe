# Scope: Customer-Side Review Integration & Rating Remediation

## 1. Problem Description & Root Causes
From user screenshots and report:
1. **Customer Store Pages**:
   - `CustomerStoreDetail.tsx`: Lines ~206-207 hardcode `rating: 4.9, reviewCount: 48`. Line ~316 has `const storeReviews: StoreReviewItem[] = useMemo(() => [], []);`.
   - "Ringkasan Toko" (`StoreInfoCard.tsx`) displays hardcoded 4.9 Rating Toko (48 ulasan) and 48 Total Ulasan.
   - Store header (`StoreHero.tsx` or similar) displays hardcoded `★ 4.9 (48 ulasan)`.
   - Must dynamically fetch real data from backend API using `useStoreReviews` / `useStoreSummary` / `reviewApi.getStoreSummary(storeId)` or `reviewApi.getStoreReviews(storeId)` without fallback hardcoded 4.9 or 48.
2. **Customer Product Detail Page**:
   - Below "Tentang Produk" on `CustomerProductDetail.tsx`, `ProductReviewsSection` is not rendering or missing on live page.
   - Must investigate why it is not rendering, and ensure it renders cleanly and visibly beneath "Tentang Produk" with real review fetching from `GET /api/v1/products/{product_id}/reviews`, review submission, edit, and delete.
3. **Cross-Component Customer Rating Displays**:
   - Check and eliminate all hardcoded 4.9 / 48 in `MysteryBoxCard`, `StoreHero`, `StoreInfoCard`, `CustomerStoreDetail`, `CustomerProductDetail`, `CartStoreGroup`, `CheckoutItemsList`.
4. **Acceptance Criteria**:
   - TypeScript checks pass (`npm run typecheck`).
   - Production build succeeds (`npm run build`).
   - Zero hardcoded fallback ratings (4.9 / 48).
   - Real backend data wired end-to-end.

## 2. Architecture & File Boundaries
- Presentation:
  - `src/pages/customer/CustomerStoreDetail.tsx`
  - `src/pages/customer/CustomerProductDetail.tsx`
  - `src/components/customer/store/StoreInfoCard.tsx`
  - `src/components/customer/store/StoreHero.tsx`
  - `src/components/customer/store/StoreReviewsList.tsx`
  - `src/components/customer/product/ProductReviewsSection.tsx`
  - `src/components/customer/home/MysteryBoxCard.tsx`
  - `src/components/customer/cart/CartStoreGroup.tsx`
  - `src/components/customer/checkout/CheckoutItemsList.tsx`
- Hooks & Services:
  - `src/hooks/useReviews.ts`
  - `src/api/services/reviewApi.ts`
  - `src/api/types.ts`

## 3. Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Customer Review Remediation | Fix hardcoded ratings in store & card components; fix ProductReviewsSection rendering on CustomerProductDetail | none | DONE |
