# DISPATCH — Worker M4: Product Detail Customer Reviews Section

## Objective
Implement Milestone 4: Product Detail Customer Reviews section ("Ulasan Pengguna") with review summary, dynamic rating distribution, review card list, interactive review submission modal, and author edit/delete actions using real backend API integration.

## Mandatory Files Owned (Exclusive)
- `src/components/customer/product/ProductReviewsSection.tsx` (create new file)
- `src/pages/customer/CustomerProductDetail.tsx` (mount `ProductReviewsSection` directly below "Tentang Produk")

## Input Context & Files to Read
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_2\SCOPE.md`
- `src/hooks/useReviews.ts` (provides `useProductReviews`, `useReviewMutations`, `calculateAverageRating`, `calculateRatingDistribution`)
- `src/hooks/useAuth.ts` and `src/context/AuthContext.tsx` (provides `useAuth()` with `user`, `isAuthenticated`)
- `src/components/reviews/` primitives:
  - `StarRating.tsx`
  - `RatingDistribution.tsx`
  - `ReviewCard.tsx`
  - `ReviewSubmissionModal.tsx`
- `src/components/ui/` primitives: `Button.tsx`, `Modal.tsx`, `EmptyState.tsx`

## Detailed Implementation Requirements

### 1. Create `src/components/customer/product/ProductReviewsSection.tsx`
- **Section Container**:
  `<section id="ulasan-produk" aria-label="Ulasan Pengguna" className="bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs mt-6 sm:mt-8">`
- **Header & Title**:
  - Heading: "Ulasan Pengguna" (`font-display font-extrabold text-base sm:text-lg text-[#1b1c1c]`)
  - "Tulis Ulasan" action button with Plus/Pencil icon:
    - If user is not authenticated: prompt login / auth modal (`onRequireAuth` or open auth modal)
    - If user is authenticated: open `ReviewSubmissionModal` in create mode.
- **Review Summary**:
  - Compute statistics from `useProductReviews(productId)`:
    - `averageRating`: formatted to 1 decimal place (e.g. `4.8` or `0.0` when no reviews)
    - `totalReviews`: total count (e.g. `12 ulasan` or `Belum ada ulasan`)
    - `StarRating`: display stars reflecting `averageRating`
    - `RatingDistribution`: horizontal progress bars for 5, 4, 3, 2, 1 stars when `totalReviews > 0`
- **Review List**:
  - Render list of `ReviewCard` components from `reviews`:
    - Reviewer name: `review.author?.name || 'Pelanggan RescueByte'`
    - Reviewer avatar: `review.author?.avatar_url`
    - Rating: `review.rating`
    - Date: `review.created_at`
    - Comment: `review.content`
    - Edit & Delete authorization:
      `canEdit={Boolean(user?.id && (review.user_id === user.id || review.author?.id === user.id))}`
      `canDelete={Boolean(user?.id && (review.user_id === user.id || review.author?.id === user.id))}`
- **Interactive Mutations**:
  - `createProductReview(productId, { rating, content })`: calls `useReviewMutations().createProductReview`, refetches reviews, closes modal, shows success toast.
  - `updateReview(reviewId, { rating, content })`: opens modal in edit mode with prefilled values, calls `useReviewMutations().updateReview`, refetches reviews, closes modal, shows success toast.
  - `deleteReview(reviewId)`: opens confirmation dialog / handles delete action, calls `useReviewMutations().deleteReview`, refetches reviews, shows success toast.
- **States**:
  - Loading: skeleton cards with pulse animation
  - Empty: `<EmptyState title="Belum Ada Ulasan" description="Jadilah yang pertama memberikan ulasan untuk produk ini!" />` with CTA button "Tulis Ulasan Pertama"
  - Error: accessible error alert banner with "Coba Lagi" retry button.
- **Responsive Layout**:
  - Works seamlessly on mobile (<640px), tablet (640-1024px), and desktop (>1024px).

### 2. Update `src/pages/customer/CustomerProductDetail.tsx`
- Import `ProductReviewsSection` from `../../components/customer/product/ProductReviewsSection`.
- Mount it directly below the "Tentang Produk" `<article>` within `<main>`:
  `<ProductReviewsSection productId={product?.id} productName={title} onShowToast={onShowToast} onRequireAuth={() => setIsAuthModalOpen(true)} />`

### 3. MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Criteria
1. `npm run typecheck` passes with 0 errors.
2. `npx oxlint src/components/customer/product/ProductReviewsSection.tsx src/pages/customer/CustomerProductDetail.tsx` passes with 0 errors.
3. `npm run build` succeeds and produces valid production bundles.
4. Output report in `.agents/teamwork/worker_m4/handoff.md`.


## 2026-11-09T04:51:43Z
Implement Milestone 4: Product Detail Customer Reviews Section ("Ulasan Pengguna").
Tasks:
1. Create `ProductReviewsSection.tsx`
2. Mount `ProductReviewsSection` in `CustomerProductDetail.tsx` directly below "Tentang Produk"
3. Run verification: `npm run typecheck`, `npx oxlint ...`, `npm run build`
4. Write handoff report in `.agents/teamwork/worker_m4/handoff.md` and message orchestrator when complete.
