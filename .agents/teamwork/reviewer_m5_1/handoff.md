# Handoff Report — Reviewer M5.1: Homepage UI & Navigation Review

**Verdict**: APPROVE  
**Reviewer Role**: reviewer, critic  
**Review Date**: 2026-11-09T15:03:00Z  
**State Folder**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\reviewer_m5_1`

---

## 1. Observation

### 1.1 "Mystery Box di Sekitar" 3-Card Display & Independent Query
- **File**: `src/pages/customer/CustomerHome.tsx`
- **Cache Slicing (lines 129-132)**:
  ```typescript
  const mappedNearby = parsed.slice(0, 3).map((item) => ({
    ...item,
    isRadiusItem: false,
  }));
  ```
  `parsed.slice(0, 3)` restricts cached items to a maximum of 3 cards.
- **Dynamic Query & Slicing (lines 253-290)**:
  `loadNearbyBoxes()` runs inside a dedicated `useEffect` with dependency array `[coordinates.lat, coordinates.lng]`.
  It queries `getPublicProducts({ latitude: coordinates.lat, longitude: coordinates.lng, limit: 10 })`.
  Deduplicates by product id via `new Map(products.map(p => [p.id, p])).values()`.
  Enriches with batch product ratings via `batchFetchProductRatings`.
  Sorts nearest-first `(a.distance_km ?? 999) - (b.distance_km ?? 999)`.
  Caps to 3 items via `.slice(0, 3)`.
- **Skeleton Loader (lines 520-523)**:
  Renders exactly 3 skeletons using `Array.from({ length: 3 }).map((_, idx) => <BoxCardSkeleton key={idx} />)`.
- **Empty & Partial State Handling (lines 524-536)**:
  If `nearbyBoxes.length === 0`, renders `<BoxEmptyState message="Belum ada Mystery Box di sekitarmu saat ini." />` with `col-span-full`.
  If fewer than 3 products exist (1 or 2 items), `.slice(0, 3)` preserves exactly those 1 or 2 items without synthetic duplicates.
- **"Lihat Selengkapnya" Navigation Link (lines 540-557)**:
  ```tsx
  <div className="mt-8 flex justify-center">
    <a
      href="#marketplace"
      onClick={(e) => {
        e.preventDefault();
        if (onNavigateMarketplace) {
          onNavigateMarketplace();
        } else {
          window.location.hash = '#marketplace';
        }
      }}
      className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40 rounded-lg px-3 py-1.5"
      aria-label="Lihat selengkapnya Mystery Box di Sekitar di Marketplace"
    >
      <span className="group-hover:underline underline-offset-4">Lihat Selengkapnya</span>
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </a>
  </div>
  ```

### 1.2 "Mystery Box Terlaris" 3-Card Display & Independent Query
- **Cache Slicing (lines 133-139)**:
  ```typescript
  const mappedBestSeller = [...parsed]
    .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
    .slice(0, 3)
    .map((item) => ({
      ...item,
      isRadiusItem: true,
    }));
  ```
  `slice(0, 3)` restricts cached best-seller items to a maximum of 3 cards.
- **Dynamic Query & Slicing (lines 310-349)**:
  `loadBestSellerBoxes()` runs in its own `useEffect` with dependency array `[]` (mount only).
  Queries `getPublicProducts({ limit: 10 })`.
  Deduplicates by product id.
  Sorts by popularity: `(b.reviewCount || 0) - (a.reviewCount || 0) || (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0)`.
  Caps to 3 items via `.slice(0, 3)`.
- **Skeleton Loader (lines 571-574)**:
  Renders exactly 3 skeletons using `Array.from({ length: 3 }).map((_, idx) => <BoxCardSkeleton key={idx} />)`.
- **Empty & Partial State Handling (lines 575-587)**:
  If `bestSellerBoxes.length === 0`, renders `<BoxEmptyState message="Belum ada Mystery Box terlaris saat ini." />`.
  If fewer than 3 products exist (1 or 2 items), renders exactly those items without artificial duplicates.
- **"Lihat Selengkapnya" Navigation Link (lines 590-608)**:
  Features matching hover, pointer, focus-visible states, and navigates to `#marketplace` via `onNavigateMarketplace`.

### 1.3 Independent Loading States
- State variables:
  - `isLoadingNearby` (initialized to `cached.nearby.length === 0`)
  - `isLoadingBestSeller` (initialized to `cached.bestSeller.length === 0`)
- `loadNearbyBoxes` toggles `isLoadingNearby` independently on coordinate updates.
- `loadBestSellerBoxes` toggles `isLoadingBestSeller` independently on mount.
- Changes in customer location do not trigger or disturb the best seller query or loading skeleton.

### 1.4 Marketplace Isolation
- **File**: `src/pages/customer/CustomerMarketplace.tsx`
- Inspected lines 189-256 and lines 710-730:
  - `allProducts` and `filteredProducts` do NOT contain any `.slice(0, 3)` or artificial limit.
  - Product listing, search, price filtering, distance filtering, and multi-field sorting remain completely intact.

### 1.5 Static Verification Results
- `npm run build`: Succeeded in 1.65s (`tsc -b && vite build`) with **0 errors**.
- `npx oxlint src/pages/customer/CustomerHome.tsx src/pages/customer/CustomerMarketplace.tsx`: Finished in 40ms with **0 errors** (0 warnings in `CustomerHome.tsx`).
- Full repository `npx oxlint`: Finished with **0 errors** (exit code 0).

---

## 2. Logic Chain

1. **Card Cap Verification**:
   - In cache hydration: `parsed.slice(0, 3)` directly guarantees that initial load never displays more than 3 cards.
   - In skeleton loading: `Array.from({ length: 3 })` directly ensures exactly 3 skeleton placeholders are rendered while awaiting the network response.
   - In live API responses: `[...enriched].sort(...).slice(0, 3)` guarantees that regardless of how many products the API returns, at most 3 items are stored in state and rendered.
   - Thus, exactly 3 cards are displayed across cache, loading, and dynamic query states.

2. **Decoupled Backend Queries**:
   - `loadNearbyBoxes` is parameterized with coordinates and triggers when `coordinates.lat` or `coordinates.lng` changes.
   - `loadBestSellerBoxes` is parameterized with popularity criteria and triggers only on mount (`[]`).
   - Skeletons are bound to `isLoadingNearby` and `isLoadingBestSeller` respectively.
   - Thus, the two queries are completely independent and do not leak loading state into each other.

3. **Non-Duplication for < 3 Products**:
   - Array slicing on arrays with length < 3 (e.g. `[item1].slice(0, 3)` or `[item1, item2].slice(0, 3)`) returns only the existing elements.
   - React maps 1:1 with unique `box.id` keys.
   - If 0 items are available, `<BoxEmptyState />` renders with `col-span-full`.
   - Thus, no duplicated cards or missing slots occur.

4. **"Lihat Selengkapnya" Navigation Link**:
   - Implemented as semantic `<a>` tag with accessible `aria-label`.
   - `onClick` calls `e.preventDefault()` and invokes `onNavigateMarketplace()`.
   - In `AppRoutes.tsx`, `onNavigateMarketplace` delegates to `handleNavigate('view-customer-marketplace', 'Marketplace')`.
   - In `App.tsx`, `handleNavigate` handles auth validation (redirecting unauthenticated users to `#auth` with a toast prompt), scrolls to top (`window.scrollTo({ top: 0, behavior: 'instant' })`), and uses `window.history.replaceState(null, '', '#marketplace')` to avoid creating duplicate navigation history entries.
   - CSS tokens provide clear visual affordances: `cursor-pointer`, `hover:text-emerald-800`, `group-hover:underline`, `group-hover:translate-x-1`, and `focus-visible:ring-2 focus-visible:ring-emerald-700/40`.

5. **Marketplace Integrity**:
   - Git diff confirms that no card cap or pagination alterations were introduced into `CustomerMarketplace.tsx`.

---

## 3. Caveats

- **No Caveats**: All tasks and acceptance criteria have been verified against both the codebase and running tools.
- Backend API (`GET /api/v1/products`) returns an unsorted collection; sorting is client-side by `distance_km` (nearest first) for nearby products, and by `reviewCount` / `discount_percentage` for best sellers. This adheres strictly to the existing architectural design.

---

## 4. Conclusion

- **Verdict**: **APPROVE**
- **Quality Assessment**:
  - Implementation is clean, strictly adheres to the RescueByte design system tokens (`text-emerald-700`, `ring-emerald-700/40`), and respects WCAG accessibility standards.
  - Zero regressions detected in `CustomerHome.tsx` or `CustomerMarketplace.tsx`.
  - Zero build or lint errors.

---

## 5. Verification Method

To independently verify this review:

1. **Verify Static Build**:
   ```powershell
   npm run build
   ```
   *Expected output*: `✓ built in ~1.6s` with 0 TypeScript or bundling errors.

2. **Verify Linting**:
   ```powershell
   npx oxlint src/pages/customer/CustomerHome.tsx src/pages/customer/CustomerMarketplace.tsx
   ```
   *Expected output*: 0 errors in both files.

3. **Verify Card Limits in CustomerHome.tsx**:
   - Inspect lines 129, 135: `parsed.slice(0, 3)` in `getCachedBoxes()`.
   - Inspect lines 287, 346: `.slice(0, 3)` in query handlers.
   - Inspect lines 521, 572: `Array.from({ length: 3 })` for skeletons.

4. **Verify Navigation Links in CustomerHome.tsx**:
   - Inspect lines 540-557 and 590-608 for the "Lihat Selengkapnya" link with `onNavigateMarketplace` and `#marketplace` target.

5. **Verify Marketplace Listing Unchanged**:
   - Inspect `src/pages/customer/CustomerMarketplace.tsx` lines 718-728 to confirm `filteredProducts.map` renders without a `.slice()` cap.

---

## 6. Adversarial Review & Integrity Attestation

### 6.1 Integrity Check Attestation
- [x] No hardcoded test results or fake expected outputs embedded in source code.
- [x] No dummy or facade implementations (all queries, sorting, and state transitions are genuine).
- [x] No shortcuts bypassing the core task.
- [x] No fabricated verification outputs (all commands executed and confirmed live).
- [x] Independent verification performed thoroughly.

### 6.2 Adversarial Challenge Stress Test Results

| # | Stress Test Scenario | Expected Behavior | Actual Behavior | Result |
|---|----------------------|-------------------|-----------------|--------|
| 1 | API returns 0 products | Render `<BoxEmptyState />` spanning full grid width | Displays full-width empty state message with clean styling | PASS |
| 2 | API returns 1 product | Render 1 card only without synthetic clones | Maps 1 item directly to `<MysteryBoxCard />` | PASS |
| 3 | API returns 10 products | Render max 3 cards sorted according to section criteria | Slices to 3 after sorting (nearest-first for nearby, popularity for best seller) | PASS |
| 4 | User changes geolocation | Only `isLoadingNearby` triggers; `bestSellerBoxes` stays static | `loadNearbyBoxes` effect fires on coordinate change; `loadBestSellerBoxes` does not re-run | PASS |
| 5 | Unauthenticated user clicks "Lihat Selengkapnya" | Auth guard intercepts, shows warning toast, routes to `#auth` without crashing | Handled gracefully by `App.tsx` auth guard; state preserved | PASS |
| 6 | Broken localStorage cache | `getCachedBoxes()` catches error and returns empty arrays | Handled safely in `try ... catch` block; fallback to `{ nearby: [], bestSeller: [] }` | PASS |
| 7 | Component unmounts during active fetch | No memory leak or React setState warning on unmounted component | Guarded by `isMounted` boolean cancellation flag in both queries | PASS |
