## 2026-11-09T04:29:19Z
You are the Seller UI Specialist (teamwork_worker) for Milestone 3: Seller Dashboard "Ulasan Pembeli" Page Implementation.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Instructions:
- Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
- State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m3\
- Original request path: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope document: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_2\SCOPE.md
- Reference screenshot: C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794193326013_1e8c58c4.jpg
- UI Primitives built in Milestone 2: `src/components/reviews/` (`StarRating`, `RatingDistribution`, `ReviewSummaryCards`, `ReviewCard`, `ReviewFilterBar`, `ReviewPagination`, `ReviewSubmissionModal`, `index.ts`)
- Data Hooks built in Milestone 1: `src/hooks/useReviews.ts` (`useStoreReviews`, `useStoreSummary`, `calculateAverageRating`, `calculateRatingDistribution`)

Your Exclusive File Ownership:
- `src/pages/seller/SellerReviews.tsx` (create)
- `src/app/AppRoutes.tsx` (wire SellerReviews into activeView === 'view-ulasan')

Task Deliverables:
1. Create `src/pages/seller/SellerReviews.tsx`:
   - Follow the reference screenshot `media_1794193326013_1e8c58c4.jpg` faithfully.
   - Header:
     * Title: "Ulasan Pembeli" (`font-display font-bold text-2xl text-gray-900 mb-6 sm:mb-8`)
   - Summary Cards Section:
     * Render `<ReviewSummaryCards averageRating={averageRating} totalReviews={totalReviews} distribution={ratingDistribution} isLoading={isLoading} />`.
     * Data: fetch store reviews and summary via `useStoreReviews(storeId)` or `useStoreSummary(storeId)`.
     * IMPORTANT: DO NOT HARDCODE screenshot example numbers (4.8 or 128). Use real backend data / calculations.
   - Search & Filter Bar:
     * Render `<ReviewFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} ratingFilter={ratingFilter} onRatingFilterChange={setRatingFilter} sortBy={sortBy} onSortChange={setSortBy} />`.
     * Filter logic:
       - Search: match reviewer name, review content, or product name (case-insensitive).
       - Rating filter: null for "Semua Rating", or 1, 2, 3, 4, 5.
       - Sort: 'terbaru' (created_at desc), 'terlama' (created_at asc), 'rating-tinggi' (rating desc), 'rating-rendah' (rating asc).
   - Review List Cards:
     * For each review in filtered list, render `<ReviewCard key={review.id} id={review.id} reviewerName={review.author?.name || 'Pembeli'} reviewerAvatar={review.author?.avatar_url} rating={review.rating} createdAt={formatDate(review.created_at)} comment={review.content} productName={...} />`.
     * Loading state: render 3 Skeleton cards when `isLoading`.
     * Empty state: when 0 reviews exist or 0 match filter, render `<EmptyState title="Belum Ada Ulasan" description="Toko ini belum memiliki ulasan dari pembeli." />` (from `src/components/ui/EmptyState.tsx`).
   - Pagination:
     * Render `<ReviewPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />`.
     * Paginate client-side (e.g. 5 or 10 reviews per page).
   - Responsive styling: warm off-white background (`bg-[#f7f7f5]` / `bg-surface-app`), white cards with subtle border and shadow, clean padding.

2. In `src/app/AppRoutes.tsx`:
   - Import `SellerReviews` (or `React.lazy(() => import('../pages/seller/SellerReviews'))`).
   - Find lines 342-351 where unmatched views fall into `<PlaceholderPage>`.
   - Replace placeholder for `'view-ulasan'` with:
     ```tsx
     {activeView === 'view-ulasan' && (
       <SellerReviews storeName={storeName} storeId={storeId} />
     )}
     ```
   - Ensure other views remain untouched.
   - Verify sidebar navigation: clicking "Ulasan Pembeli" in Sidebar (`activeView === 'view-ulasan'`) renders `SellerReviews` and highlights the menu item.

3. Build & Static Verification:
   Run `npm run build` (`tsc -b && vite build`) and `npx oxlint src/pages/seller/SellerReviews.tsx src/app/AppRoutes.tsx` via `run_command` ensuring 0 TypeScript and bundling errors.

4. File handoff report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m3\handoff.md` and message the orchestrator when completed.
