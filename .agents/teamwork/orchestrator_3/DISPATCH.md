# Dispatch Task

## 2026-11-09T05:36:30Z

Fix and complete customer-side review integration on RescueByte:

The user reported the following issues with screenshots:
1. Customer store pages still have hardcoded ratings and review counts:
   - Screenshot C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794202053657_cc9288cf.png shows "Ringkasan Toko" has hardcoded 4.9 Rating Toko (48 ulasan) and 48 Total Ulasan in `StoreInfoCard.tsx` / `CustomerStoreDetail.tsx`.
   - Screenshot C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794202063273_6170de9a.png and C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794202176813_10f7dc26.png show Store header has hardcoded `★ 4.9 (48 ulasan)`.
   - Root cause in `CustomerStoreDetail.tsx` lines 206-207:
     `rating: 4.9, reviewCount: 48`
     and line 316:
     `const storeReviews: StoreReviewItem[] = useMemo(() => [], []);`
   - Store rating and reviews MUST be dynamically fetched from backend API via `useStoreReviews` / `useStoreSummary` / `reviewApi.getStoreSummary(storeId)` or `reviewApi.getStoreReviews(storeId)` without fallback hardcoded 4.9 or 48.

2. Product Detail page:
   - Screenshot C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794202098922_af553cdb.png shows below "Tentang Produk" there is NO UI review section visible on the live page.
   - Investigate why `ProductReviewsSection` is not rendering or missing, ensure it renders cleanly and visibly beneath "Tentang Produk" on Product Detail, with real review fetching from `GET /api/v1/products/{product_id}/reviews`, review submission, edit, and delete.

Requirements:
- Ensure all customer rating displays (MysteryBoxCard, StoreHero, StoreInfoCard, CustomerStoreDetail, CustomerProductDetail, CartStoreGroup, CheckoutItemsList) use real backend data and avoid hardcoded 4.9 or 48.
- Ensure ProductReviewsSection is rendered, fully functional, and visible on CustomerProductDetail.
- Run `npm run typecheck` and `npm run build` to verify 0 errors.
