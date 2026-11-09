# Dispatch Log

## 2026-11-09T08:49:09Z
Fix review submission and display logic across Product Detail, Order Detail, Seller Reviews, and Store Detail pages in RescueByte frontend for a competition showcase.

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
Integrity mode: demo
The team must NOT: copy code from existing open-source projects for core logic, run external scripts or delegate execution to other tools

## Requirements

### R1. Read-Only Reviews on Product Detail
In Product Detail (`CustomerProductDetail.tsx` / `ProductReviewsSection.tsx`), remove the "Tulis Ulasan" and "Tulis Ulasan Pertama" buttons. The product detail page must strictly display existing reviews for that product and not offer an option to submit reviews directly from the product page.

### R2. Order Detail Review Trigger and Dual Submission Flow
In Order Detail (`CustomerOrderDetail.tsx`):
- The "Bagaimana Pengalamanmu? Beri Ulasan Sekarang" card must only be displayed when the order status is completed ("selesai").
- Clicking "Beri Ulasan Sekarang" must open a review modal with two separate review sections:
  1. Store Review section, submitting a review to `POST /api/v1/stores/{store_id}/reviews`.
  2. Product Review section, submitting a review to `POST /api/v1/products/{product_id}/reviews`.

### R3. Seller Dashboard and Store Page Review Display
- In the Seller Dashboard (`#ulasan-seller`), display store reviews fetched via `GET /api/v1/stores/{store_id}/reviews`.
- On the Customer Store Detail page (`CustomerStoreDetail.tsx`), display store reviews fetched from `GET /api/v1/stores/{store_id}/reviews` alongside product reviews for products belonging to that store.

## Verification Resources
- Project typecheck script: `npm run typecheck`
- Project build script: `npm run build`

## Acceptance Criteria

### Product Detail Review UI
- [ ] No "Tulis Ulasan" or "Tulis Ulasan Pertama" buttons appear on the Product Detail page (`#detail-produk`).
- [ ] Existing product reviews continue to render and display correctly on the Product Detail page.

### Order Detail Review Card and Modal
- [ ] The "Bagaimana Pengalamanmu? Beri Ulasan Sekarang" card is hidden if the order status is not completed.
- [ ] The "Bagaimana Pengalamanmu? Beri Ulasan Sekarang" card is visible when the order status is completed ("selesai").
- [ ] Clicking "Beri Ulasan Sekarang" opens the review modal.
- [ ] The review modal contains two distinct sections: one for Store Review and one for Product Review.
- [ ] Submitting a store review sends a request to `POST /api/v1/stores/{store_id}/reviews`.
- [ ] Submitting a product review sends a request to `POST /api/v1/products/{product_id}/reviews`.

### Seller Dashboard & Store Reviews
- [ ] The Seller Dashboard reviews view (`#ulasan-seller`) displays reviews returned from `GET /api/v1/stores/{store_id}/reviews`.
- [ ] The Store Detail page (`#toko` / `CustomerStoreDetail.tsx`) displays store reviews from `GET /api/v1/stores/{store_id}/reviews` and displays reviews for products belonging to that store.

### Build and Type Safety
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run build` passes with zero errors.
