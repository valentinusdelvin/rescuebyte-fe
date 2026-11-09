# Product Reviews Section Investigation Report

## Executive Summary
The absence of the review section below "Tentang Produk" reported on the live site (`https://rescuebyte-fe.vercel.app/#detail-produk`, documented in `media_1794202098922_af553cdb.png`) was caused by the live Vercel deployment running Git commit `f853a0b`, in which `ProductReviewsSection` was completely missing. In the current local working tree, `ProductReviewsSection` has been implemented, imported, and mounted directly beneath "Tentang Produk" in `src/pages/customer/CustomerProductDetail.tsx`. It is unconditionally rendered, handles all four UI states (loading skeleton, error alert, empty state, and review list), and integrates with backend review endpoints (`GET/POST /api/v1/products/{product_id}/reviews` and `PATCH/DELETE /api/v1/reviews/{id}`).

---

## 1. Investigation of `CustomerProductDetail.tsx`

### 1.1 Placement & DOM Hierarchy
In `src/pages/customer/CustomerProductDetail.tsx` (lines 645–669):
```tsx
{/* Full-Width Card: Tentang Produk */}
<article className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs mt-6 sm:mt-8">
  <h2 className="font-display font-extrabold text-base sm:text-lg text-[#1b1c1c]">
    Tentang Produk
  </h2>
  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2.5">
    {description}
  </p>
</article>

{/* Product Reviews Section: Ulasan Pengguna */}
<ProductReviewsSection
  productId={product?.id}
  productName={title}
  productImage={currentImage}
  onShowToast={onShowToast}
  onRequireAuth={() => {
    if (onNavigateAuth) {
      onNavigateAuth();
    } else {
      setIsAuthModalOpen(true);
    }
  }}
/>
```

- **Placement**: Placed immediately following the `<article>` representing "Tentang Produk" (lines 646–653).
- **Container**: Placed inside the main container `<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">` (lines 331–669).
- **Subsequent Elements**: Followed by `</main>`, then the floating cart button, mobile conversion sticky bar, and `CustomerFooter`.

### 1.2 Root Cause of Absence on Live Page
1. **Git Commit History**:
   - The production deployment on Vercel corresponds to commit `f853a0b` ("Perjelas notifikasi error untuk pengguna").
   - Inspection via `git show f853a0b:src/pages/customer/CustomerProductDetail.tsx | Select-String "ProductReviewsSection"` returns **0 results**.
   - Commit `f853a0b` only contained "Tentang Produk" and immediately concluded `<main>`.
2. **Current Local Working Tree**:
   - `ProductReviewsSection` was created as an untracked component in `src/components/customer/product/ProductReviewsSection.tsx` and wired into `CustomerProductDetail.tsx` during Milestone 4.
   - The user tested the live URL `rescuebyte-fe.vercel.app` prior to deploying these changes.

### 1.3 Conditional Rendering & Layout Audit
- **Conditional branches**: None. `<ProductReviewsSection />` is mounted directly in JSX without wrapping ternaries, `&&` guards, or `if` blocks.
- **Review count / flag guards**: It does **not** check `product.hasReviews`, `reviews.length > 0`, or `activeTab`.
- **CSS / Layout constraints**: No `overflow-hidden`, `height: 0`, `opacity-0`, `hidden`, or conflicting z-indexes exist on `<main>` or the section.
- **Tab restrictions**: The Product Detail page is a single-scroll page without tab navigation for content cards.
- **Undefined product behavior**: If `product` is undefined or null (e.g., accessed directly via `#detail-produk` without an `id` query parameter):
  - `product?.id` evaluates to `undefined`.
  - `ProductReviewsSection` receives `productId={undefined}`.
  - As verified below, `ProductReviewsSection` does **not** return `null` when `productId` is undefined. It renders the card header and the empty state ("Belum Ada Ulasan").

---

## 2. Investigation of `ProductReviewsSection.tsx`

### 2.1 Review Fetching (`useProductReviews`)
- Component imports `useProductReviews` from `src/hooks/useReviews.ts`.
- Invocation (lines 37–47):
  ```tsx
  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductReviews(productId, undefined, {
    autoFetch: Boolean(productId),
  });
  ```
- Endpoint executed: `GET /api/v1/products/{product_id}/reviews` via `reviewApi.getProductReviews(productId, queryParams)`.
- If `productId` is provided, `autoFetch: true` triggers `fetchReviews()` on component mount and on `productId` change.

### 2.2 UI States & Empty State Behavior
`ProductReviewsSection.tsx` unconditionally renders the root container:
```tsx
<section
  id="ulasan-produk"
  aria-label="Ulasan Pengguna"
  className={`bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs mt-6 sm:mt-8 ${className}`.trim()}
>
  {/* Header with Title and "Tulis Ulasan" button */}
  ...
```

The component handles all 4 states explicitly:

| State | Condition | UI Rendered |
|---|---|---|
| **Loading** | `isLoading` | Animated pulsing skeleton with score bar and 2 review cards (`aria-busy="true"`). |
| **Error** | `!isLoading && isError` | Rose alert box (`role="alert"`) displaying error text and a "Coba Lagi" retry button calling `refetch()`. |
| **Empty** | `!isLoading && !isError && reviews.length === 0` | `EmptyState` component with `title="Belum Ada Ulasan"`, `description="Jadilah yang pertama memberikan ulasan untuk produk ini!"`, and CTA button "Tulis Ulasan Pertama". **It never returns `null`.** |
| **Loaded** | `!isLoading && !isError && reviews.length > 0` | 2-column rating summary card (`averageRating`, `StarRating`, `totalReviews`, and `RatingDistribution` progress bars) + mapped list of `ReviewCard` components. |

### 2.3 Interactive Review Mutations (Create, Edit, Delete)
Mutations are managed via `useReviewMutations({ showToast: true })`:
- **Create ("Tulis Ulasan" / "Tulis Ulasan Pertama")**:
  - Validates authentication: if not logged in, calls `onRequireAuth()` (opens auth modal or redirects to `#auth`).
  - Opens `ReviewSubmissionModal` with interactive 1–5 star picker and 2,000-character textarea.
  - Submits via `createProductReview(productId, data)` calling `POST /api/v1/products/{product_id}/reviews` with `{ rating, content }`.
  - On success: triggers toast notification, closes modal, and calls `refetch()` to update the review list.
- **Edit**:
  - Each review card checks authorization:
    `canEdit = Boolean(user?.id && (review.user_id === user.id || review.author?.id === user.id))`.
  - Clicking pencil icon opens `ReviewSubmissionModal` prefilled with existing rating and text.
  - Submits via `updateReview(review.id, data)` calling `PATCH /api/v1/reviews/{id}` with `{ rating, content }`.
  - On success: triggers toast notification, closes modal, and calls `refetch()`.
- **Delete**:
  - Authorization check:
    `canDelete = Boolean(user?.id && (review.user_id === user.id || review.author?.id === user.id))`.
  - Clicking trash icon opens confirmation modal (`Modal` component).
  - Submits via `deleteReview(reviewId)` calling `DELETE /api/v1/reviews/{id}`.
  - On success: triggers toast notification, closes modal, and calls `refetch()`.

---

## 3. Hook & API Contract Verification

### 3.1 Swagger & DTO Compliance
Inspected backend schemas in `swagger_doc.json`:
- `GET /api/v1/products/{product_id}/reviews`:
  Returns `GetReviewsResponse` with `{ meta?: PaginationMeta, reviews?: ReviewResponse[] }`.
- `POST /api/v1/products/{product_id}/reviews`:
  Accepts `CreateReviewRequest` with `{ rating: integer, content: string }`. Returns `ReviewResponse`.
- `PATCH /api/v1/reviews/{id}`:
  Accepts `UpdateReviewRequest` with `{ rating: integer, content: string }`. Returns `ReviewResponse`.
- `DELETE /api/v1/reviews/{id}`:
  Path parameter `id` (UUID). Returns success response.

In `src/api/types.ts` (lines 525–562):
```ts
export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export interface UpdateReviewRequest {
  rating: number;
  content: string;
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
```
All DTO interfaces are a 100% exact match with the backend Swagger schema.

### 3.2 Response Interceptor Unwrapping
In `src/api/client.ts` (lines 136–171):
Axios response interceptor automatically unwraps `{ request_id, payload }` so `res.data` provides `GetReviewsResponse` directly.
In `useProductReviews`:
`res.reviews` is directly populated into `setReviews(res.reviews || [])`, preventing nested envelope bugs.

---

## 4. Key Findings & Recommendations

### Finding 1: The feature is already implemented locally and verified
`ProductReviewsSection.tsx` is completely implemented and integrated into `CustomerProductDetail.tsx`. Running `npm run typecheck` and `npm run build` succeeds with 0 errors. The absence observed by the user on the live site is due to the live Vercel environment running an older commit (`f853a0b`) prior to deployment of Milestone 4.

### Finding 2: Edge Case with Missing `productId` in `ProductReviewsSection`
In `ProductReviewsSection.tsx` (lines 66–75 & line 92):
If `CustomerProductDetail` is accessed without a valid product ID (e.g., bare `#detail-produk` URL with fallback mock box), `productId` is `undefined`.
- `handleOpenCreateModal` allows opening the modal.
- On submit, `if (!productId) return;` silently returns without notifying the user.

**Recommendation**: Add a check in `handleOpenCreateModal`:
```tsx
const handleOpenCreateModal = () => {
  if (!productId) {
    if (onShowToast) onShowToast('Informasi produk tidak lengkap untuk memberikan ulasan.');
    return;
  }
  if (!isAuthenticated || !user) {
    if (onRequireAuth) {
      onRequireAuth();
    }
    return;
  }
  setEditingReview(null);
  setIsModalOpen(true);
};
```

### Finding 3: Store Rating Touchpoint on Product Detail
On `CustomerProductDetail.tsx` (lines 444–479), the store header displays:
`★ {rating.toFixed(1)} ({reviewCount} ulasan)`
Currently, this uses `const rating = product?.rating ?? 5.0` and `const reviewCount = product?.reviewCount ?? 0`.
Clicking this element navigates to `#toko?name=...&section=ulasan-pelanggan` (Store Reviews).
**Recommendation**: Use `useStoreSummary(product?.storeId)` to fetch real store rating and total reviews dynamically, so this store touchpoint also eliminates fallback defaults when `product.storeId` is available.
