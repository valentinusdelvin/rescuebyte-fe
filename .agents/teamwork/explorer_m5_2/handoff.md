# Handoff Report — Explorer M5.2: API Integration & Query Data Flow

## 1. Observation

### 1.1 Homepage Product Data Fetching (`src/pages/customer/CustomerHome.tsx`)
- **File path**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\src\pages\customer\CustomerHome.tsx`
- **Lines 123-145 (`getCachedBoxes`)**:
  ```typescript
  const mappedNearby = parsed.slice(0, 6).map((item) => ({
    ...item,
    isRadiusItem: false,
  }));
  const mappedBestSeller = [...parsed]
    .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
    .slice(0, 6)
    .map((item) => ({
      ...item,
      isRadiusItem: true,
    }));
  ```
  *Direct observation*: Cache is hard-coded to `slice(0, 6)` for both sections.
- **Lines 247-251 (Component State)**:
  ```typescript
  const cached = getCachedBoxes();
  const [nearbyBoxes, setNearbyBoxes] = useState<CustomerMysteryBox[]>(cached.nearby);
  const [bestSellerBoxes, setBestSellerBoxes] = useState<CustomerMysteryBox[]>(cached.bestSeller);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState<boolean>(cached.nearby.length === 0);
  ```
  *Direct observation*: A single loading state `isLoadingBoxes` is shared between both sections.
- **Lines 252-314 (`useEffect` & `loadBoxes`)**:
  ```typescript
  const products = await getPublicProducts({
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    limit: 20,
  });
  ...
  // Exactly 6 cards sorted by distance ascending
  const sortedByDistance = [...enriched]
    .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
    .slice(0, 6)
    .map((p) => mapPublicProductToCustomerBox(p, false));

  // Exactly 6 cards sorted by popularity/reviews or discount descending
  const sortedByPopularity = [...enriched]
    .sort(
      (a, b) =>
        (b.reviewCount || 0) - (a.reviewCount || 0) ||
        (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0)
    )
    .slice(0, 6)
    .map((p) => mapPublicProductToCustomerBox(p, true));

  setNearbyBoxes(sortedByDistance);
  setBestSellerBoxes(sortedByPopularity);
  ```
  *Direct observation*: A single request is performed to fetch 20 products, which are then sliced to 6 items each for distance and popularity. The queries are not decoupled into independent fetch cycles.
- **Lines 467-471 & 498-502 (Skeletons)**:
  ```typescript
  {isLoadingBoxes && nearbyBoxes.length === 0 ? (
    Array.from({ length: 6 }).map((_, idx) => (
      <BoxCardSkeleton key={idx} />
    ))
  ) : ...
  ```
  *Direct observation*: Skeletons are hard-coded to 6 items (`Array.from({ length: 6 })`), causing visual layout jump if reduced to 3 cards.
- **Lines 450-485 & 490-517 (Section Markup)**:
  Neither section currently contains the "Lihat Selengkapnya" navigation link.

### 1.2 Backend Swagger Contract & Live Response Behavior
- **Swagger endpoint specification** (`.agents/teamwork/teamwork_explorer_survey_3/detailed_endpoints.json:1018-1115`):
  Endpoint: `GET /api/v1/products`
  Allowed query parameters: `page`, `limit`, `store_id`, `nama`, `name`, `search`, `city`, `latitude`, `longitude`.
  Parameters NOT supported: `sort`, `order`, `popular`.
- **Live backend probe** via node:
  ```
  GET https://dolpin-fourthree.bccdev.id/api/v1/products?latitude=-7.983908&longitude=112.621391&limit=5
  ```
  Result:
  - 1: Rendang (6.3 km)
  - 2: Rendang (6.2 km)
  - 3: Makanan Ringan (6.2 km)
  - 4: SALAD SEGAR (3.6 km)
  - 5: Brownies Signature (3.3 km)
  *Direct observation*: The backend calculates `distance_km` on the fly when `latitude` and `longitude` are passed, but returns products in database insertion order. If `limit: 3` were sent in the HTTP request query, products 4 and 5 (the closest ones at 3.6 km and 3.3 km) would be truncated by SQL LIMIT before client-side sorting could evaluate them!

### 1.3 Routing & Navigation (`src/app/AppRoutes.tsx` & `src/App.tsx`)
- **`src/pages/customer/CustomerHome.tsx:30, 233`**:
  `CustomerHome` accepts `onNavigateMarketplace?: () => void;` in `CustomerHomeProps`.
- **`src/app/AppRoutes.tsx:69`**:
  ```typescript
  <CustomerHome
    ...
    onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
  />
  ```
- **`src/App.tsx:396-430`**:
  `handleNavigate` verifies authentication guards (showing warning toast and prompting login if unauthenticated), sets `activeView = 'view-customer-marketplace'`, changes document title, scrolls to top, and runs `window.history.replaceState(null, '', '#marketplace')`.
  *Direct observation*: `onNavigateMarketplace` is the canonical, existing navigation function. Invoking it avoids duplicate routes, prevents browser history corruption, and preserves application state.

### 1.4 Marketplace Isolation (`src/pages/customer/CustomerMarketplace.tsx`)
- **Lines 98-135**:
  `fetchMarketplaceProducts` executes its own call:
  ```typescript
  const publicItems = await getPublicProducts({
    latitude: coords.lat,
    longitude: coords.lng,
    search: query?.trim() ? query.trim() : undefined,
  });
  ```
- **Lines 194-256**:
  Filters (`searchQuery`, `selectedCity`, `minPrice`, `maxPrice`, `distanceFilter`) and sorts (`sortField`, `sortOrder`) are executed on the client-side state `apiProducts`.
  *Direct observation*: `CustomerMarketplace.tsx` has fully encapsulated state and query logic. Changing homepage card limits or decoupling homepage queries does NOT alter Marketplace listings, filters, or pagination.

---

## 2. Logic Chain

1. **Premise 1 (Backend Query Limits)**: The backend API `GET /api/v1/products` does not sort by distance or popularity in SQL (Swagger parameters omit `sort`). It calculates `distance_km` dynamically based on `latitude` and `longitude`.
2. **Premise 2 (Premature Truncation Risk)**: If the frontend requests `limit: 3` from the API, the backend returns the first 3 matching records in the database, cutting off nearer products (e.g. at 3.3 km) that exist further down the list. Therefore, the query must fetch a candidate pool (e.g. `limit: 10` or `limit: 20`) from which the client sorts nearest-first and popularity-first, and then applies `.slice(0, 3)`.
3. **Premise 3 (Independent Query Architecture)**: Requirement R1, R2, and Acceptance Criteria require that both sections use their respective backend queries independently. Currently, a single `useEffect` queries once for both sections. Decoupling into two independent functions:
   - `fetchNearbyBoxes(coords)`: Queries with customer coordinates `{ latitude, longitude, limit: 10 }`, sorts by `distance_km ASC`, and maintains `isLoadingNearby`.
   - `fetchBestSellerBoxes()`: Queries with `{ limit: 10 }`, sorts by `(reviewCount DESC, discount DESC)`, and maintains `isLoadingBestSeller`.
   This ensures independent lifecycles, independent loading skeletons, and error boundary isolation between the two sections.
4. **Premise 4 (Strict Non-Duplication)**: If fewer than 3 products are returned (0, 1, or 2 items):
   - `.slice(0, 3)` returns the exact array length without padding.
   - Products should be deduplicated by `id` using a Map:
     `Array.from(new Map(products.map(p => [p.id, p])).values())`
   - Mapping over the array produces only the existing cards. When 0 products exist, the clean `BoxEmptyState` is rendered. Zero duplicate cards will be displayed.
5. **Premise 5 (Max 3 Visual Elements)**:
   - `getCachedBoxes`: must be updated from `.slice(0, 6)` to `.slice(0, 3)`.
   - Skeleton loaders: must be updated from `length: 6` to `length: 3`.
   - Processed arrays: sliced with `.slice(0, 3)`.
6. **Premise 6 (Canonical Navigation Link)**:
   - Placing a clickable text link "Lihat Selengkapnya" with an arrow icon directly below each product cards grid.
   - Using `onNavigateMarketplace` with fallback `() => { window.location.hash = '#marketplace'; }`.
   - Adding Tailwind hover and pointer styles (`cursor-pointer group`, `hover:text-emerald-800`, `transition-colors`, `group-hover:translate-x-1`).

---

## 3. Caveats

- **No Caveats**: The codebase was thoroughly investigated across services (`productService.ts`, `productApi.ts`, `productRatingService.ts`), hooks (`useProducts.ts`, `useGeolocation.ts`), pages (`CustomerHome.tsx`, `CustomerMarketplace.tsx`), routes (`AppRoutes.tsx`, `App.tsx`), and the live backend endpoint was probed and verified.

---

## 4. Conclusion & Concrete Recommendations for Worker

The Worker should apply the following targeted modifications strictly to `src/pages/customer/CustomerHome.tsx` without touching `CustomerMarketplace.tsx` or altering backend API schemas:

### Recommendation 1: Update `getCachedBoxes` to Max 3
In `src/pages/customer/CustomerHome.tsx` (lines 129 & 135):
Change `.slice(0, 6)` to `.slice(0, 3)` for both `mappedNearby` and `mappedBestSeller`.

### Recommendation 2: Decouple State & Independent Data Fetching
In `CustomerHome.tsx`:
1. Split state:
   ```typescript
   const [nearbyBoxes, setNearbyBoxes] = useState<CustomerMysteryBox[]>(cached.nearby);
   const [bestSellerBoxes, setBestSellerBoxes] = useState<CustomerMysteryBox[]>(cached.bestSeller);
   const [isLoadingNearby, setIsLoadingNearby] = useState<boolean>(cached.nearby.length === 0);
   const [isLoadingBestSeller, setIsLoadingBestSeller] = useState<boolean>(cached.bestSeller.length === 0);
   ```
2. Implement independent query for **Mystery Box di Sekitar**:
   - Runs when `coordinates.lat` or `coordinates.lng` changes.
   - Calls `getPublicProducts({ latitude: coordinates.lat, longitude: coordinates.lng, limit: 10 })`.
   - Deduplicates by `id`.
   - Enriches with `batchFetchProductRatings`.
   - Sorts nearest-first: `.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))`.
   - Slices to max 3: `.slice(0, 3)`.
   - Sets `nearbyBoxes` and clears `isLoadingNearby`.
3. Implement independent query for **Mystery Box Terlaris**:
   - Runs independently on mount.
   - Calls `getPublicProducts({ limit: 10 })`.
   - Deduplicates by `id`.
   - Enriches with `batchFetchProductRatings`.
   - Sorts popularity-first:
     ```typescript
     .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))
     ```
   - Slices to max 3: `.slice(0, 3)`.
   - Sets `bestSellerBoxes` and clears `isLoadingBestSeller`.

### Recommendation 3: Update Skeleton Loaders to Length 3
Replace `Array.from({ length: 6 })` with `Array.from({ length: 3 })` in both Section 3 and Section 4.

### Recommendation 4: Add "Lihat Selengkapnya" Link in Both Sections
Below each cards grid in Section 3 and Section 4, add the navigation link:
```tsx
{/* Navigasi ke Marketplace */}
<div className="mt-8 text-center">
  <button
    type="button"
    onClick={() => {
      if (onNavigateMarketplace) {
        onNavigateMarketplace();
      } else {
        window.location.hash = '#marketplace';
      }
    }}
    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer group"
  >
    <span>Lihat Selengkapnya</span>
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
  </button>
</div>
```
*(Import `ArrowRight` from `lucide-react` if not already imported).*

### Recommendation 5: Natural Indonesian Code Comments (Antislop Code Hygiene)
Per the user's explicit clarification, ensure any comments added or updated in `CustomerHome.tsx` use natural, professional Indonesian while retaining English technical terms (e.g. *API*, *Marketplace*, *Hook*, *Query*, *State*, *Component*).

---

## 5. Verification Method

1. **Static Analysis & Build Verification**:
   ```powershell
   npm run build
   ```
   Must pass with 0 TypeScript errors and successfully produce the production bundle.
2. **Homepage Verification**:
   - Inspect Section 3 ("Mystery Box di Sekitar"): Verify at most 3 cards are displayed, sorted nearest-first.
   - Inspect Section 4 ("Mystery Box Terlaris"): Verify at most 3 cards are displayed, sorted by reviews/discount.
   - Verify that loading skeletons display exactly 3 cards.
   - Verify that when fewer than 3 products exist, no duplicate cards are created.
   - Click "Lihat Selengkapnya" under both sections: Verify it seamlessly navigates to `#marketplace` without reloading or corrupting state.
3. **Marketplace Regression Check**:
   - Navigate to `#marketplace`: Verify that the complete product list, search input, city selector, price range filter, distance filter, sorting dropdown, and product cards remain completely functional and unaltered.
