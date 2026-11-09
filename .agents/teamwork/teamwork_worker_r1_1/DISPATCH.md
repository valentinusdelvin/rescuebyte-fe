## 2026-11-09T10:47:10Z

You are a Worker agent implementing the RescueByte UI and Notification requirements.
Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_worker_r1_1\
Original request path: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
Scope document: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_5\SCOPE.md
Parent conversation ID: 7365f8f8-f834-4bc9-b2f6-003e67f5a755

Read ORIGINAL_REQUEST.md and SCOPE.md first.
Also read the detailed Explorer findings:
- Explorer 1 (R1): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_r1_1\handoff.md
- Explorer 2 (R2, R4): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_r1_2\handoff.md
- Explorer 3 (R3): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_r1_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You have exclusive write ownership of the following files:
1. `src/pages/customer/CustomerProductDetail.tsx`
2. `src/pages/customer/CustomerOrderHistory.tsx`
3. `src/pages/customer/CustomerMarketplace.tsx`
4. `src/features/customer/marketplace/model.ts`
5. `src/pages/customer/CustomerContact.tsx`
6. `src/pages/customer/CustomerHome.tsx`
7. `src/context/ToastContext.tsx`
8. `src/App.tsx`

Tasks to execute:
1. R1: Store Rating Display on Product Detail (#detail-produk)
In `src/pages/customer/CustomerProductDetail.tsx`:
- Import `useStoreReviews` from `../../hooks/useReviews`.
- Maintain `resolvedStoreId` and query params matching so that genuine store UUID is resolved.
- Call `useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) })`.
- Derive `displayRating` and `displayReviewCount` accurately from backend data, with fallback to product props if available.
- Display under the store name in the exact format: `★ 5.0 (1 ulasan)` or `★ 4.8 (12 ulasan)` when reviews exist, `(Memuat...)` during initial loading, or `★ - (Belum ada ulasan)` if 0 reviews.
- Ensure clicking the rating/review count navigates to `#toko?name=...&id=...&section=ulasan-pelanggan` and passes the resolved store ID.
- Update `handleStoreClick` and `activeBoxItem` to use `resolvedStoreId` and updated ratings.

2. R2: Order History Actions (#pesanan-saya)
In `src/pages/customer/CustomerOrderHistory.tsx`:
- Remove the "Beri Ulasan" button from all order cards.
- Always provide a functional "Lihat Detail" button on all order cards across all order statuses (including "selesai" / completed) so the user can navigate to the order detail page (`#detail-pesanan`).
- Retain the "Beli Lagi" button alongside "Lihat Detail" on completed orders.
- Remove dead review modal states, handlers (`handleOpenReview`, `handleSubmitReview`), unused `Star` icon import, and the review modal dialog JSX.
- Ensure fallback navigation in `handleOpenOrderDetail` when `onNavigateOrderDetail` is not provided (`window.location.hash = '#detail-pesanan?id=...'`).

3. R3: Notification and Toast Cleanup
- In `src/pages/customer/CustomerContact.tsx`: Remove the noisy toast `'Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.'` after `window.open`.
- In `src/pages/customer/CustomerHome.tsx`: Remove `handleContactSupport` fake live-chat toast and do not pass `onContactSupport` to `CustomerFooter`, allowing `CustomerFooter`'s native help modal to open.
- In `src/context/ToastContext.tsx`: Implement deduplication and debouncing (using ref with timestamp cooldown and active toasts check) so identical toasts within 2.5 seconds or already visible are not stacked. Cap max concurrent toasts.
- In `src/App.tsx`: Prevent dual toast rendering by delegating to `toastContextShow` without activating the duplicate local `<Toast />` component.
- In `src/pages/customer/CustomerMarketplace.tsx`: Add in-flight concurrency lock (`if (isLoadingLoc) return;`) and a ref cooldown on location error warnings so duplicate/stacked location permission error toasts are prevented.
- Preserve all standard user feedback toasts (cart, checkout, orders, auth, seller operations).

4. R4: Marketplace Default Filter/Sort
- In `src/pages/customer/CustomerMarketplace.tsx`: Change initial `sortField` state to `'lokasi'` (with `sortOrder = 'asc'`).
- In `src/features/customer/marketplace/model.ts`: Reorder `SORT_OPTIONS` so `'lokasi'` is listed first.

Verification:
- Run `npm run typecheck` and ensure 0 errors.
- Run `npm run build` and ensure 0 errors.
- Follow Antislop rules: no AI comments, no dummy code, clean readable implementation.

Deliverable:
Write your completion report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_worker_r1_1\handoff.md` with:
- Files modified
- Exact changes made for R1, R2, R3, R4
- Verification commands executed (`npm run typecheck`, `npm run build`) and their verbatim output
- Antislop compliance notes

Send a message back to the parent orchestrator when complete.
