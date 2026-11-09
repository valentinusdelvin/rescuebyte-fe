# Handoff Report: Explorer M5.1 — Homepage UI & Navigation Investigation

## 1. Observation

### 1.1 Homepage Sections & Card Rendering Locations
- File: `src/pages/customer/CustomerHome.tsx`
  - **Section 3: "Mystery Box di Sekitar"** (Lines 447–486):
    - Container: `<section className="px-6 py-10 lg:py-12" id="marketplace-section">`
    - Heading: `<h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">Mystery Box di Sekitar</h2>`
    - Grid: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
    - Skeleton rendering: `Array.from({ length: 6 }).map((_, idx) => <BoxCardSkeleton key={idx} />)` (Line 468)
    - Empty state: `<BoxEmptyState message="Belum ada Mystery Box di sekitarmu saat ini." />` (Line 472)
    - Card mapping: `nearbyBoxes.map((box) => <MysteryBoxCard key={box.id} item={box} variant="popular" onOrderClick={handleOpenOrder} onStoreClick={onNavigateStore} />)` (Lines 474–482)
    - **Currently lacks** any "Lihat Selengkapnya" link below the card grid.
  - **Section 4: "Mystery Box Terlaris"** (Lines 488–517):
    - Container: `<section className="px-6 pt-4 pb-12">`
    - Heading: `<h2 className="font-display text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight">Mystery Box Terlaris</h2>`
    - Grid: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
    - Skeleton rendering: `Array.from({ length: 6 }).map((_, idx) => <BoxCardSkeleton key={idx} />)` (Line 499)
    - Empty state: `<BoxEmptyState message="Belum ada Mystery Box terlaris saat ini." />` (Line 503)
    - Card mapping: `bestSellerBoxes.map((box) => <MysteryBoxCard key={box.id} item={box} variant="radius" onOrderClick={handleOpenOrder} onStoreClick={onNavigateStore} />)` (Lines 505–514)
    - **Currently lacks** any "Lihat Selengkapnya" link below the card grid.

### 1.2 Current Query & Slicing Behavior
- In `src/pages/customer/CustomerHome.tsx`:
  - Cache initial state (`getCachedBoxes()`, Lines 123–145):
    ```typescript
    const mappedNearby = parsed.slice(0, 6).map((item) => ({ ...item, isRadiusItem: false }));
    const mappedBestSeller = [...parsed]
      .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
      .slice(0, 6)
      .map((item) => ({ ...item, isRadiusItem: true }));
    ```
    Observed: Currently slices **6** items, causing up to 6 cards to be rendered on initial load from localStorage cache.
  - Coupled data fetching (`loadBoxes()`, Lines 252–314):
    - Both sections are coupled into a single `useEffect` calling:
      ```typescript
      const products = await getPublicProducts({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        limit: 20,
      });
      ```
    - Lines 281–285: `sortedByDistance` slices `0, 6`.
    - Lines 288–295: `sortedByPopularity` slices `0, 6`.
    - `setNearbyBoxes(sortedByDistance)` and `setBestSellerBoxes(sortedByPopularity)` both hold 6 cards.
    - Skeletons also render 6 items (`Array.from({ length: 6 })`).

### 1.3 Routing & Navigation Contract
- In `src/app/AppRoutes.tsx` (Lines 65–71):
  - `CustomerHome` is instantiated with:
    ```tsx
    onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
    ```
- In `src/App.tsx` (Lines 396–431):
  - `handleNavigate` handles `'view-customer-marketplace'`:
    - Checks authentication via `getCurrentUser()` / `user`.
    - If unauthenticated, displays warning toast `"Silakan masuk terlebih dahulu untuk mengakses Marketplace."`, sets `activeView = 'view-auth-role-selection'`, and updates hash to `#auth`.
    - If authenticated, updates `activeView = 'view-customer-marketplace'`, sets `activeLabel = 'Marketplace'`, scrolls instantly to top (`window.scrollTo({ top: 0, behavior: 'instant' })`), and calls `window.history.replaceState(null, '', '#marketplace')`.
    - Does NOT reload the page or pollute browser history with duplicate forward/back entries.
- In `src/app/useHashNavigation.ts` (Lines 142–152):
  - Global `hashchange` listener handles `#marketplace` with the same auth protection and view activation as a robust fallback.

### 1.4 Handling of Empty or < 3 Cards
- When an array has fewer than 3 items (1 or 2 items):
  - `[...enriched].slice(0, 3)` returns an array of length 1 or 2.
  - Mapping over this array renders exactly 1 or 2 `<MysteryBoxCard>` components in the Tailwind CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - There is **no card duplication** or artificial padding logic in the card rendering code.
- When an array has 0 items:
  - Renders `<BoxEmptyState message="..." />` which features `col-span-full` to neatly span the entire grid.

### 1.5 Design System Tokens & Icons
- File `src/index.css` & `design.md`:
  - Primary color: `#1f2a24` / `#0b1510`
  - Emerald / Secondary color: `#3c6a00`, `emerald-700` (`#047857`), `hover:text-emerald-800` (`#065f46`)
  - Typography: `font-sans` (`Plus Jakarta Sans`), `font-display` (`Sora`)
  - Focus ring: `focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:outline-none rounded-lg`
  - Icons: `lucide-react` is already used in `CustomerHome.tsx` (Line 2 imports `User`); `ChevronRight` can be imported directly.

---

## 2. Logic Chain

1. **Card Cap to 3**:
   - Observations in 1.1 and 1.2 demonstrate that `getCachedBoxes()` slices 6, `loadBoxes()` slices 6, and skeletons render 6.
   - Therefore, changing `.slice(0, 6)` to `.slice(0, 3)` in both `getCachedBoxes()` and the product loaders, together with changing skeleton length from 6 to 3 (`Array.from({ length: 3 })`), guarantees that at most 3 cards are displayed at all times (during cache preview, loading, and dynamic data state).

2. **Independent Backend Queries**:
   - Observation 1.2 shows that both sections currently share a single `useEffect` calling `getPublicProducts` with location coordinates.
   - To satisfy the acceptance criterion `"Both sections use their respective backend queries independently"`:
     - Section 1 ("Mystery Box di Sekitar") depends on customer spatial coordinates (`coordinates.lat`, `coordinates.lng`), calling `getPublicProducts({ latitude, longitude, limit: 10 })`, sorting by `distance_km` ascending, and taking `.slice(0, 3)`.
     - Section 2 ("Mystery Box Terlaris") queries best-selling/popular products independently, calling `getPublicProducts({ limit: 10 })`, sorting by review count / popularity / discount, and taking `.slice(0, 3)`.
     - Separating their state into `isLoadingNearby` / `isLoadingBestSeller` ensures that location detection or coordinate changes only re-fetch Section 1 without needlessly refetching or resetting Section 2.

3. **No Card Duplication for < 3 Products**:
   - Observation 1.4 confirms that rendering is performed by `.map((box) => <MysteryBoxCard ... />)` directly over the sliced array.
   - If 1 product is returned, 1 card is rendered. If 2 products are returned, 2 cards are rendered. No duplication or mock padding occurs.
   - Empty state renders `<BoxEmptyState />` with `col-span-full`.

4. **"Lihat Selengkapnya" Navigation Link**:
   - Observation 1.3 shows that `onNavigateMarketplace` is provided via props to `CustomerHome` and backed by `App.tsx`'s `handleNavigate`.
   - Wrapping the link as:
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
   - Meets all criteria:
     - Uses a semantic `<a>` tag with valid `href="#marketplace"` (accessible, middle-click capable, SEO-compliant).
     - `e.preventDefault()` prevents default page jump and executes `onNavigateMarketplace()`.
     - Auth guard in `App.tsx` redirects unauthenticated users to `#auth` with warning toast; authenticated users are transitioned immediately to Marketplace view with `#marketplace` in URL and instant scroll to top.
     - Hover state: text changes to darker green (`hover:text-emerald-800`), underlines with offset (`group-hover:underline underline-offset-4`), and chevron translates 4px right (`group-hover:translate-x-1`).
     - Pointer state: `cursor-pointer`.
     - Keyboard accessible: `focus-visible:ring-2 focus-visible:ring-emerald-700/40`.
     - Placed below the 3-card grid in both Section 3 and Section 4.

5. **Marketplace Listing Preserved**:
   - Observation 1.1 and the request confirm that `CustomerMarketplace.tsx` product pagination and listing limits must NOT be touched. Changes are confined to `CustomerHome.tsx`.

---

## 3. Caveats

1. **Read-Only Explorer Scope**: Explorer M5.1 is strictly read-only and has not altered any files in `src/`. All implementation steps are prepared for Worker M5.2.
2. **Backend Sorting Parameter Availability**: The backend Swagger document (`swagger_doc.json`) for `GET /api/v1/products` supports `latitude`, `longitude`, `limit`, `page`, `store_id`, `search`, and `city`, but does not provide an explicit server-side `sort` parameter. Therefore, nearest-first sorting (`distance_km`) and popularity sorting (`reviewCount` / `discount_percentage`) are deterministically performed immediately after fetching from `getPublicProducts`, which satisfies both the API contract and the sorting criteria.
3. **User Authentication State**: As verified in `App.tsx`, navigating to Marketplace requires an active customer session. The existing router handles this by redirecting unauthenticated users to `#auth` with a toast. The "Lihat Selengkapnya" link gracefully respects this global behavior.

---

## 4. Conclusion & Concrete Worker Recommendations

To fulfill Milestone 5 (Homepage Adjustments for "Mystery Box di Sekitar" and "Mystery Box Terlaris"), Worker M5.2 should execute the following modifications to `src/pages/customer/CustomerHome.tsx`:

### Recommended Code Changes in `src/pages/customer/CustomerHome.tsx`:

1. **Import `ChevronRight` from `lucide-react`**:
   ```typescript
   // Line 2:
   import { User, ChevronRight } from 'lucide-react';
   ```

2. **Update `getCachedBoxes()` to slice 3**:
   ```typescript
   // Lines 129 & 135:
   const mappedNearby = parsed.slice(0, 3).map((item) => ({
     ...item,
     isRadiusItem: false,
   }));
   const mappedBestSeller = [...parsed]
     .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
     .slice(0, 3)
     .map((item) => ({
       ...item,
       isRadiusItem: true,
     }));
   ```

3. **Separate state & decouple product queries**:
   ```typescript
   // Replace lines 248–314 with independent states & queries:
   const cached = getCachedBoxes();
   const [nearbyBoxes, setNearbyBoxes] = useState<CustomerMysteryBox[]>(cached.nearby);
   const [bestSellerBoxes, setBestSellerBoxes] = useState<CustomerMysteryBox[]>(cached.bestSeller);
   const [isLoadingNearby, setIsLoadingNearby] = useState<boolean>(cached.nearby.length === 0);
   const [isLoadingBestSeller, setIsLoadingBestSeller] = useState<boolean>(cached.bestSeller.length === 0);

   // 1. Independent Query for "Mystery Box di Sekitar" (Location-driven)
   useEffect(() => {
     let isMounted = true;
     async function loadNearbyBoxes() {
       try {
         setIsLoadingNearby(true);
         const products = await getPublicProducts({
           latitude: coordinates.lat,
           longitude: coordinates.lng,
           limit: 10,
         });

         if (!isMounted) return;

         if (products && products.length > 0) {
           const ratingMap = await batchFetchProductRatings(products.map((p) => p.id));
           if (!isMounted) return;

           const enriched = products.map((p) => {
             const summary = ratingMap.get(p.id) || { rating: 0, reviewCount: 0 };
             return { ...p, rating: summary.rating, reviewCount: summary.reviewCount };
           });

           const sortedByDistance = [...enriched]
             .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
             .slice(0, 3)
             .map((p) => mapPublicProductToCustomerBox(p, false));

           setNearbyBoxes(sortedByDistance);
         } else {
           setNearbyBoxes([]);
         }
       } catch (err) {
         console.warn('Failed to load nearby boxes:', err);
       } finally {
         if (isMounted) setIsLoadingNearby(false);
       }
     }

     void loadNearbyBoxes();
     return () => { isMounted = false; };
   }, [coordinates.lat, coordinates.lng]);

   // 2. Independent Query for "Mystery Box Terlaris" (Popularity / Best-Selling)
   useEffect(() => {
     let isMounted = true;
     async function loadBestSellerBoxes() {
       try {
         setIsLoadingBestSeller(true);
         const products = await getPublicProducts({ limit: 10 });

         if (!isMounted) return;

         if (products && products.length > 0) {
           const ratingMap = await batchFetchProductRatings(products.map((p) => p.id));
           if (!isMounted) return;

           const enriched = products.map((p) => {
             const summary = ratingMap.get(p.id) || { rating: 0, reviewCount: 0 };
             return { ...p, rating: summary.rating, reviewCount: summary.reviewCount };
           });

           const sortedByPopularity = [...enriched]
             .sort(
               (a, b) =>
                 (b.reviewCount || 0) - (a.reviewCount || 0) ||
                 (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0)
             )
             .slice(0, 3)
             .map((p) => mapPublicProductToCustomerBox(p, true));

           setBestSellerBoxes(sortedByPopularity);
         } else {
           setBestSellerBoxes([]);
         }
       } catch (err) {
         console.warn('Failed to load best-seller boxes:', err);
       } finally {
         if (isMounted) setIsLoadingBestSeller(false);
       }
     }

     void loadBestSellerBoxes();
     return () => { isMounted = false; };
   }, []);
   ```

4. **Update Section 3 ("Mystery Box di Sekitar")**:
   - Skeletons: change `Array.from({ length: 6 })` to `Array.from({ length: 3 })`.
   - Use `isLoadingNearby`.
   - Add "Lihat Selengkapnya" link below the card grid:
   ```tsx
   {/* Link: Lihat Selengkapnya ke Marketplace */}
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

5. **Update Section 4 ("Mystery Box Terlaris")**:
   - Skeletons: change `Array.from({ length: 6 })` to `Array.from({ length: 3 })`.
   - Use `isLoadingBestSeller`.
   - Add "Lihat Selengkapnya" link below the card grid:
   ```tsx
   {/* Link: Lihat Selengkapnya ke Marketplace */}
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
       aria-label="Lihat selengkapnya Mystery Box Terlaris di Marketplace"
     >
       <span className="group-hover:underline underline-offset-4">Lihat Selengkapnya</span>
       <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
     </a>
   </div>
   ```

6. **Preserve `CustomerMarketplace.tsx`**: Do not modify pagination or listing limits on `CustomerMarketplace.tsx`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Static Build Verification**:
   ```bash
   npm run build
   ```
   *Expected output*: `tsc -b && vite build` succeeds with 0 errors and generates output in `dist/`.

2. **Linter & Syntax Verification**:
   ```bash
   npx oxlint
   ```
   *Expected output*: 0 errors.

3. **Homepage Card Count & Navigation Verification**:
   - Inspect `CustomerHome.tsx`:
     - Verify that `nearbyBoxes` is sliced to `0, 3`.
     - Verify that `bestSellerBoxes` is sliced to `0, 3`.
     - Verify that `Array.from({ length: 3 })` is used for skeletons in both sections.
     - Verify that both sections have `<a href="#marketplace">` containing text `"Lihat Selengkapnya"` and `<ChevronRight />`.
     - Verify that clicking `"Lihat Selengkapnya"` invokes `onNavigateMarketplace()` with `e.preventDefault()`.
     - Verify that `CustomerMarketplace.tsx` is unmodified.

4. **Invalidation Conditions**:
   - If either homepage section displays more than 3 cards.
   - If cards are duplicated when fewer than 3 products exist in the dataset.
   - If clicking "Lihat Selengkapnya" causes a full browser page refresh or generates duplicate history entries.
   - If either query blocks the other or if `CustomerMarketplace.tsx` listing logic is changed.
