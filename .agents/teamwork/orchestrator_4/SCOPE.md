# Scope: Review Submission and Display Remediation

## 1. Problem Description & Requirements
Competition showcase fixes for review submission and display logic in RescueByte frontend:

### R1. Read-Only Reviews on Product Detail
- In Product Detail (`CustomerProductDetail.tsx` / `ProductReviewsSection.tsx`), remove the "Tulis Ulasan" and "Tulis Ulasan Pertama" buttons.
- The product detail page must strictly display existing reviews for that product and not offer an option to submit reviews directly from the product page.
- Status: **VERIFIED & PASSED**

### R2. Order Detail Review Trigger and Dual Submission Flow
- In Order Detail (`CustomerOrderDetail.tsx`):
  - The "Bagaimana Pengalamanmu? Beri Ulasan Sekarang" card must ONLY be displayed when the order status is completed ("selesai").
  - Clicking "Beri Ulasan Sekarang" must open a review modal with two separate review sections:
    1. Store Review section, submitting a review to `POST /api/v1/stores/{store_id}/reviews`.
    2. Product Review section, submitting a review to `POST /api/v1/products/{product_id}/reviews`.
- Status: **VERIFIED & PASSED**

### R3. Seller Dashboard and Store Page Review Display
- In the Seller Dashboard (`#ulasan-seller`), display store reviews fetched via `GET /api/v1/stores/{store_id}/reviews`.
- On the Customer Store Detail page (`CustomerStoreDetail.tsx`), display store reviews fetched from `GET /api/v1/stores/{store_id}/reviews` alongside product reviews for products belonging to that store.
- Status: **VERIFIED & PASSED**

### Verification Standards
- `npm run typecheck` passes with zero errors. (VERIFIED: 0 errors)
- `npm run build` passes with zero errors. (VERIFIED: built in 1.37s, 0 errors)
- No dummy/hardcoded fallback reviews; real backend endpoints wired cleanly. (AUDITED: CLEAN)

## 2. Code Layout & File Boundaries
- Customer Product Detail:
  - `src/pages/customer/CustomerProductDetail.tsx`
  - `src/components/customer/product/ProductReviewsSection.tsx`
- Customer Order Detail:
  - `src/pages/customer/CustomerOrderDetail.tsx`
  - `src/components/customer/order/OrderReviewModal.tsx`
  - `src/components/customer/order/types.ts`
- Seller Reviews Dashboard:
  - `src/pages/seller/SellerReviews.tsx`
  - `src/app/AppRoutes.tsx`
  - `src/App.tsx`
- Customer Store Detail:
  - `src/pages/customer/CustomerStoreDetail.tsx`
  - `src/components/customer/store/StoreReviewsList.tsx`
  - `src/components/customer/store/types.ts`
- API & Hooks:
  - `src/hooks/useReviews.ts`
  - `src/api/services/reviewApi.ts`
  - `src/app/useHashNavigation.ts`

## 3. Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Review Submission & Display Remediation | Implement R1, R2, R3 across Product Detail, Order Detail, Seller Reviews, and Store Detail | none | DONE |
