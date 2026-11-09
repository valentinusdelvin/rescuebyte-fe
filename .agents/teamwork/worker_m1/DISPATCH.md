## 2026-11-09T03:36:01Z
You are the API Integration Specialist (teamwork_worker) for Milestone 1: Review API & Types Integration.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Instructions:
- Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
- State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m1\
- Original request path: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope document: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_2\SCOPE.md
- Spec Miner report: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\spec_miner_survey\handoff.md

Your Exclusive File Ownership:
- `src/api/types.ts` (add review DTOs & StoreSummaryResponse)
- `src/api/services/reviewApi.ts` (create new service)
- `src/hooks/useReviews.ts` (create custom hooks)

Task Deliverables:
1. `src/api/types.ts`:
   Add the authoritative Review DTO interfaces matching backend Swagger:
   - `CreateReviewRequest`: `{ rating: number; content: string; }`
   - `UpdateReviewRequest`: `{ rating: number; content: string; }`
   - `ReviewAuthorResponse`: `{ id?: string; name?: string; role?: string; avatar_url?: string; }`
   - `ReviewResponse`: `{ id: string; user_id?: string; product_id?: string; store_id?: string; rating: number; content: string; author?: ReviewAuthorResponse; created_at: string; updated_at?: string; }`
   - `GetReviewsResponse`: `{ meta?: PaginationMeta; reviews?: ReviewResponse[]; }`
   - `StoreSummaryResponse`: `{ average_rating: number; total_reviews: number; }`

2. `src/api/services/reviewApi.ts`:
   Create pure API service functions using `apiClient` (`src/api/client.ts`):
   - `getProductReviews(productId: string, params?: { page?: number; limit?: number })`: calls `GET /api/v1/products/${productId}/reviews`
   - `createProductReview(productId: string, data: CreateReviewRequest)`: calls `POST /api/v1/products/${productId}/reviews`
   - `getStoreReviews(storeId: string, params?: { page?: number; limit?: number })`: calls `GET /api/v1/stores/${storeId}/reviews`
   - `createStoreReview(storeId: string, data: CreateReviewRequest)`: calls `POST /api/v1/stores/${storeId}/reviews`
   - `getStoreSummary(storeId: string)`: calls `GET /api/v1/stores/${storeId}/summary`
   - `updateReview(id: string, data: UpdateReviewRequest)`: calls `PATCH /api/v1/reviews/${id}`
   - `deleteReview(id: string)`: calls `DELETE /api/v1/reviews/${id}`

3. `src/hooks/useReviews.ts`:
   Build robust React hooks for data fetching and mutations:
   - `useProductReviews(productId?: string, params?: { page?: number; limit?: number })`: returns `{ reviews, meta, averageRating, totalReviews, ratingDistribution, isLoading, isError, error, refetch }`
     * Note: Calculate `averageRating` and `ratingDistribution` (1 to 5 stars counts) from reviews array when backend does not provide them.
   - `useStoreReviews(storeId?: string, params?: { page?: number; limit?: number })`: returns `{ reviews, meta, averageRating, totalReviews, ratingDistribution, isLoading, isError, error, refetch }`
     * Also fetches store summary from `getStoreSummary` for accurate aggregate rating and total reviews.
   - `useStoreSummary(storeId?: string)`: returns `{ summary, isLoading, isError, error, refetch }`
   - `useReviewMutations()`: provides `{ createProductReview, createStoreReview, updateReview, deleteReview, isSubmitting, error }` with toast feedback and clean error handling.

4. Build & Typecheck Verification:
   Run `npm run build` or `npx tsc -b` via `run_command` and verify 0 TypeScript and bundling errors.

5. Write a detailed handoff report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m1\handoff.md` and send a message to orchestrator when completed.
