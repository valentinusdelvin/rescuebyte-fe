# Scope: RescueByte Review Feature — API Integration, UI Implementation & Navigation

## 1. Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                              │
│  - App.tsx & AppRoutes.tsx (Routing: view-ulasan, deep-linking)       │
│  - Seller Dashboard: src/pages/seller/SellerReviews.tsx                │
│    (3 summary cards, search & filter bar, review cards, pagination)    │
│  - Product Detail: src/components/customer/product/ProductReviewsSection│
│    (Ulasan Pengguna section, review submission modal, edit/delete)    │
│  - Store Page: src/components/customer/store/StoreReviewsList.tsx      │
│    (Target anchor id="ulasan-pelanggan", scroll-mt-28)                 │
│  - Interactive Navigation Touchpoints (Product, Store, Cart, Checkout) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ consumes reusable components & hooks
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    Reusable Review UI Primitives                       │
│  - src/components/reviews/:                                            │
│    ├── StarRating.tsx (display with fractional fill & interactive)     │
│    ├── RatingDistribution.tsx (5 horizontal bars, 5-to-1, green fill) │
│    ├── ReviewSummaryCards.tsx (Rating Toko, Total Ulasan, Distribusi) │
│    ├── ReviewCard.tsx (avatar, stars, date, product pill, comment, etc)│
│    ├── ReviewFilterBar.tsx (search input, rating filter, sort dropdown)│
│    ├── ReviewPagination.tsx (sebelumnya, page numbers, selanjutnya)   │
│    └── ReviewSubmissionModal.tsx (accessible modal form for review)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ consumes custom hooks
┌──────────────────────────────────▼─────────────────────────────────────┐
│                   State & Business Logic Layer                         │
│  - src/hooks/useReviews.ts:                                            │
│    ├── useProductReviews(productId, page, limit)                       │
│    ├── useStoreReviews(storeId, page, limit)                           │
│    ├── useStoreSummary(storeId)                                        │
│    └── useReviewMutations() (createProductReview, createStoreReview,   │
│        updateReview, deleteReview)                                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ consumes typed API client
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    API Transport & Data Layer                          │
│  - src/api/types.ts:                                                   │
│    ├── CreateReviewRequest, UpdateReviewRequest                        │
│    ├── ReviewAuthorResponse, ReviewResponse, GetReviewsResponse       │
│    └── StoreSummaryResponse                                            │
│  - src/api/services/reviewApi.ts:                                      │
│    ├── 6 Review endpoints + getStoreSummary                            │
│  - src/api/client.ts (Central Axios Client with Bearer injection)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Feature Inventory

Every feature discovered during the survey phase is inventoried and assigned to an autonomous milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Authoritative Review DTOs & Types | Add `CreateReviewRequest`, `UpdateReviewRequest`, `ReviewAuthorResponse`, `ReviewResponse`, `GetReviewsResponse`, and `StoreSummaryResponse` to `src/api/types.ts` | M1 | Spec Miner |
| 2 | Centralized Review API Service | Create `src/api/services/reviewApi.ts` covering all 6 Review endpoints + `getStoreSummary` | M1 | Spec Miner |
| 3 | Reusable Custom Review Hooks | Implement `useReviews.ts` (`useProductReviews`, `useStoreReviews`, `useStoreSummary`, `useReviewMutations`) with loading, error, empty, and cache invalidation states | M1 | Spec Miner & Lead Architect |
| 4 | Reusable StarRating Primitive | Build `StarRating.tsx` supporting fractional fill display and accessible interactive rating input | M2 | UI Explorer |
| 5 | Reusable RatingDistribution Primitive | Build `RatingDistribution.tsx` rendering 5-to-1 horizontal progress bars with leaf green fill and review counts | M2 | UI Explorer |
| 6 | Reusable ReviewCard Primitive | Build `ReviewCard.tsx` with initials/avatar, star rating, date, product pill badge, quoted comment, and edit/delete actions | M2 | UI Explorer |
| 7 | Reusable ReviewFilterBar Primitive | Build `ReviewFilterBar.tsx` with search input, rating dropdown filter, and sort dropdown | M2 | UI Explorer |
| 8 | Reusable ReviewPagination Primitive | Build `ReviewPagination.tsx` with Sebelumnya, page numbers, and Selanjutnya controls | M2 | UI Explorer |
| 9 | Reusable ReviewSubmissionModal Primitive | Build `ReviewSubmissionModal.tsx` using `Modal` primitive with star selection, comment textarea, and submit feedback | M2 | UI Explorer |
| 10 | Hash Routing Support for Seller Reviews | Update `src/app/hashRouting.ts`, `src/app/useHashNavigation.ts`, and `src/App.tsx` for `#ulasan-seller` / `'view-ulasan'` | M2 | Codebase Explorer |
| 11 | Store Detail `#ulasan-pelanggan` Anchor & Offset | Add `id="ulasan-pelanggan"` and `scroll-mt-28` to `StoreReviewsList.tsx` | M2 | Codebase Explorer |
| 12 | Asynchronous Store Smooth Scroll & Tab Switch | Update `CustomerStoreDetail.tsx` to switch to `'ulasan'` tab and reliably smooth scroll to `#ulasan-pelanggan` with polling/retry | M2 | Codebase Explorer |
| 13 | Interactive Navigation Touchpoints Across App | Connect rating stars/counts in `CustomerProductDetail`, `StoreHero`, `StoreInfoCard`, `CartStoreGroup`, `CheckoutItemsList`, and `MysteryBoxCard` to navigate to Store `#ulasan-pelanggan` | M2 | Codebase Explorer |
| 14 | Seller Dashboard "Ulasan Pembeli" View | Create `src/pages/seller/SellerReviews.tsx` matching reference screenshot `media_1794193326013_1e8c58c4.jpg` | M3 | UI Explorer & Dispatch |
| 15 | Seller Dashboard Top Summary Cards | Implement Rating Toko, Total Ulasan, and Distribusi Penilaian cards from actual backend data in `SellerReviews.tsx` | M3 | UI Explorer & Dispatch |
| 16 | Seller Dashboard Search, Filter & Pagination | Wire search input, rating filter (Semua, 5, 4, 3, 2, 1), sort options (Terbaru, Terlama), and pagination in `SellerReviews.tsx` | M3 | UI Explorer & Dispatch |
| 17 | Seller Dashboard Integration in AppRoutes | Replace `<PlaceholderPage>` with `<SellerReviews>` in `AppRoutes.tsx` and verify sidebar active highlight | M3 | Codebase Explorer |
| 18 | Product Detail "Ulasan Pengguna" Section | Create `src/components/customer/product/ProductReviewsSection.tsx` and place below "Tentang Produk" in `CustomerProductDetail.tsx` | M4 | UI Explorer & Dispatch |
| 19 | Product Detail Rating Summary & List | Display product average rating, total review count, rating distribution, and review cards via `useProductReviews` | M4 | UI Explorer & Dispatch |
| 20 | Product Review Submission Flow | Implement "Tulis Ulasan" action opening `ReviewSubmissionModal` calling `POST /api/v1/products/{product_id}/reviews` | M4 | UI Explorer & Dispatch |
| 21 | Product Review Edit & Delete Ownership Actions | Allow authenticated review owners (`currentUser.id === review.user_id`) to update and delete reviews with prompt feedback | M4 | Spec Miner & Dispatch |
| 22 | Static Verification & Build Audit | Run `npm run typecheck` (`tsc -b`) and `npm run build` ensuring 0 compilation errors and bundle stability | M5 | Lead Architect & Dispatch |
| 23 | Independent QA Review & E2E Validation | Validate all 6 review endpoints, navigation flows, and responsive layouts across desktop, tablet, and mobile | M5 | Lead Architect & Dispatch |
| 24 | Challenger Adversarial Validation | Stress test rating distribution calculations (e.g. 0 reviews, divide-by-zero), search/filter combinations, and deep links | M5 | Lead Architect & Dispatch |
| 25 | Forensic Integrity Audit | Validate authentic backend callers, zero hardcoded screenshot statistics, and absence of dummy facades | M5 | Lead Architect & Dispatch |
| 26 | Final Deliverables Report | Author the comprehensive 8-part final report covering summary, changes, navigation, API results, files, QA, and notes | M5 | Dispatch |

---

## 3. Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Review API & Types Integration | Add Swagger DTOs to `src/api/types.ts`, implement `src/api/services/reviewApi.ts` (6 Review endpoints + `getStoreSummary`), and build `src/hooks/useReviews.ts` | None | DONE |
| M2 | Review UI Primitives & Interactive Navigation | Create reusable components in `src/components/reviews/`, configure hash routing for `view-ulasan`, add `id="ulasan-pelanggan"` with scroll retry in `CustomerStoreDetail`, and wire all rating touchpoints | M1 | DONE |
| M3 | Seller Dashboard "Ulasan Pembeli" Page | Build `src/pages/seller/SellerReviews.tsx` matching reference screenshot (3 summary cards, filter bar, review list, pagination), register in `AppRoutes.tsx`, and verify sidebar active state | M1, M2 | PLANNED |
| M4 | Product Detail Customer Reviews Section | Build `ProductReviewsSection.tsx` in `CustomerProductDetail.tsx`, wire review list, review submission modal, and author edit/delete actions with real backend data | M1, M2 | PLANNED |
| M5 | Verification, QA, Audit & Final Deliverables | Run typecheck/build, independent QA review, challenger verification, forensic integrity audit, bug remediation, and compile 8-part final report | M3, M4 | PLANNED |

---

## 4. Interface Contracts

### 4.1 Swagger Review DTOs (`src/api/types.ts`)
```typescript
export interface CreateReviewRequest {
  rating: number; // 1 to 5
  content: string; // 1 to 2000 characters
}

export interface UpdateReviewRequest {
  rating: number; // 1 to 5
  content: string; // 1 to 2000 characters
}

export interface ReviewAuthorResponse {
  id?: string;
  name?: string;
  role?: string;
  avatar_url?: string;
}

export interface ReviewResponse {
  id: string;
  user_id?: string;
  product_id?: string;
  store_id?: string;
  rating: number;
  content: string;
  author?: ReviewAuthorResponse;
  created_at: string;
  updated_at?: string;
}

export interface GetReviewsResponse {
  meta?: PaginationMeta;
  reviews?: ReviewResponse[];
}

export interface StoreSummaryResponse {
  average_rating: number;
  total_reviews: number;
}
```

### 4.2 Centralized Service (`src/api/services/reviewApi.ts`)
```typescript
export interface GetReviewsParams {
  page?: number;
  limit?: number;
}

export const reviewApi = {
  getProductReviews(productId: string, params?: GetReviewsParams): Promise<GetReviewsResponse>;
  createProductReview(productId: string, data: CreateReviewRequest): Promise<ReviewResponse>;
  getStoreReviews(storeId: string, params?: GetReviewsParams): Promise<GetReviewsResponse>;
  createStoreReview(storeId: string, data: CreateReviewRequest): Promise<ReviewResponse>;
  getStoreSummary(storeId: string): Promise<StoreSummaryResponse>;
  updateReview(id: string, data: UpdateReviewRequest): Promise<ReviewResponse>;
  deleteReview(id: string): Promise<Record<string, string> | MessageResponse>;
};
```

### 4.3 Reusable Review Primitives (`src/components/reviews/`)
- `StarRating`: `{ rating, maxRating?, size?, interactive?, onChange?, showScoreText?, className? }`
- `RatingDistribution`: `{ distribution: Record<number, number>, totalReviews: number, className? }`
- `ReviewSummaryCards`: `{ averageRating, totalReviews, distribution, isLoading? }`
- `ReviewFilterBar`: `{ searchQuery, onSearchChange, ratingFilter, onRatingFilterChange, sortBy, onSortChange }`
- `ReviewCard`: `{ id, reviewerName, reviewerAvatar?, rating, createdAt, comment, productName?, productImage?, canEdit?, canDelete?, onEdit?, onDelete? }`
- `ReviewPagination`: `{ currentPage, totalPages, onPageChange }`
- `ReviewSubmissionModal`: `{ isOpen, onClose, onSubmit, initialRating?, initialContent?, title?, isSubmitting? }`

### 4.4 Navigation Contracts
- Product Detail -> Store Reviews:
  `window.location.hash = '#toko?name=' + encodeURIComponent(storeName) + '&id=' + (storeId || '') + '&section=ulasan-pelanggan'`
- Target element on Store Detail:
  `<section id="ulasan-pelanggan" className="... scroll-mt-28">`
- Seller Dashboard Review Page:
  `activeView === 'view-ulasan'`, hash `#ulasan-seller` or `#ulasan`, sidebar id `#nav-ulasan`.

---

## 5. Code Layout & Exclusive File Boundaries

To prevent file collision during parallel or sequential execution, file ownership is assigned as follows:

| Milestone / Task | Exclusive Files Owned |
|---|---|
| **M1: API & Types** | `src/api/types.ts` (review additions only), `src/api/services/reviewApi.ts`, `src/hooks/useReviews.ts` |
| **M2: UI Primitives & Navigation** | `src/components/reviews/*` (all 7 files + index.ts), `src/app/hashRouting.ts`, `src/app/useHashNavigation.ts`, `src/App.tsx`, `src/components/customer/store/StoreReviewsList.tsx`, `src/pages/customer/CustomerStoreDetail.tsx`, `src/components/customer/store/StoreHero.tsx`, `src/components/customer/store/StoreInfoCard.tsx`, `src/components/customer/MysteryBoxCard.tsx`, `src/components/customer/cart/CartStoreGroup.tsx`, `src/components/customer/checkout/CheckoutItemsList.tsx` |
| **M3: Seller Dashboard** | `src/pages/seller/SellerReviews.tsx`, `src/app/AppRoutes.tsx` |
| **M4: Product Detail Reviews** | `src/components/customer/product/ProductReviewsSection.tsx`, `src/pages/customer/CustomerProductDetail.tsx` |
| **M5: QA & Deliverables** | Test execution, verification reports, bug fixes, final report |
