# HANDOFF REPORT: RescueByte Codebase Architecture, Review Feature & Navigation Survey

**Explorer Archetype**: Codebase & Navigation Explorer (`teamwork_explorer`)  
**Timestamp**: 2026-11-09T03:35:00Z  
**State Folder**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_survey_codebase\`  
**Target Recipient**: Orchestrator (`7d36458f-41bc-4fd3-8cbd-85997fb68e2b`)  

---

## 1. Observation

### A. Routing & Shell Navigation Mechanism
1. **Hash Routing System (`src/App.tsx`, lines 31-84)**:
   Routing is entirely hash-driven using a custom parser and state variable `activeView: ActiveViewId`.
   ```ts
   // src/App.tsx lines 31-38
   const [activeView, setActiveView] = useState<ActiveViewId>(() => {
     const { path, params } = parseHash();
     if (path.startsWith('beranda-seller') || path === 'beranda') return 'view-beranda';
     if (path.startsWith('profil-seller') || path === 'profil') return 'view-profil';
     if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) return 'view-riwayat';
     if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) return 'view-buat-dagangan';
     if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) return 'view-daganganku';
   ...
   ```
2. **Hash Parsing Helper (`src/app/hashRouting.ts`, lines 10-23)**:
   ```ts
   export function parseHash(
     hashStr: string = typeof window !== 'undefined' ? window.location.hash : '',
   ): { path: string; params: URLSearchParams } {
     const clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
     const queryIndex = clean.indexOf('?');
     if (queryIndex === -1) {
       return { path: clean.toLowerCase(), params: new URLSearchParams() };
     }

     return {
       path: clean.slice(0, queryIndex).toLowerCase(),
       params: new URLSearchParams(clean.slice(queryIndex + 1)),
     };
   }
   ```
3. **Hash Navigation Listener (`src/app/useHashNavigation.ts`, lines 31-52)**:
   Synchronizes `window.addEventListener('hashchange', handleHashChange)`. Currently handles:
   `beranda-seller`, `profil-seller`, `riwayat-seller`, `buat-dagangan-seller`, `daganganku-seller`, `detail-pesanan`, `detail-produk`, `keranjang`, `checkout`, `pesanan-saya`, `toko`, `kontak`, `marketplace`, `akun`, `masuk-mitra`, `masuk-customer`, `masuk`.
   *Critical observation*: Neither `App.tsx` (initial state) nor `useHashNavigation.ts` has a case for `ulasan-seller` or `ulasan`. When navigating to `#ulasan-seller`, it falls through to `'view-customer-home'`.
4. **Type Definition (`src/types/index.ts`, lines 37-59)**:
   ```ts
   export type ActiveViewId =
     | 'view-customer-home'
     ...
     | 'view-beranda'
     | 'view-profil'
     | 'view-riwayat'
     | 'view-buat-dagangan'
     | 'view-daganganku'
     | 'view-ulasan'
     | string;
   ```
   Notice that `'view-ulasan'` is **already present** in `ActiveViewId`.
5. **View Transition Handler (`src/App.tsx`, lines 380-454)**:
   `handleNavigate(viewId, label, tab)` updates `activeView`, scrolls window to `(0, 0)`, and sets `window.history.replaceState(...)`.
   Currently does not have a branch for `viewId === 'view-ulasan'`.

---

### B. Seller Dashboard Layout & Navigation
1. **Sidebar Navigation Menu (`src/components/layout/Sidebar.tsx`, lines 162-176)**:
   ```tsx
   <li>
     <button
       type="button"
       className={`group inline-flex items-center w-full text-left text-base py-1.25 bg-transparent border-0 cursor-pointer relative transition-all duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
         activeView === 'view-ulasan'
           ? 'font-extrabold text-[#111827]'
           : 'font-medium text-[#4b5563]'
       }`}
       id="nav-ulasan"
       onClick={() => handleItemClick('view-ulasan', 'Ulasan Pembeli')}
     >
       <StaggeredLinkText text="Ulasan Pembeli" active={activeView === 'view-ulasan'} />
     </button>
   </li>
   ```
   *Observation*: The button `#nav-ulasan` with label `'Ulasan Pembeli'` is already rendered in `Sidebar.tsx` under group `Pesanan`.
2. **Current View Dispatch in `src/app/AppRoutes.tsx` (lines 304-353)**:
   When `activeView === 'view-ulasan'`, it falls into the fallback condition:
   ```tsx
   {activeView !== 'view-beranda' &&
     activeView !== 'view-profil' &&
     activeView !== 'view-riwayat' &&
     activeView !== 'view-buat-dagangan' &&
     activeView !== 'view-daganganku' && (
       <PlaceholderPage
         title={activeLabel}
         onBackToBeranda={() => handleNavigate('view-beranda', 'Beranda Toko')}
       />
     )}
   ```
   *Observation*: It currently renders `<PlaceholderPage>` with title `"Ulasan Pembeli"`.
3. **Seller Layout Wrapper (`AppRoutes.tsx`, lines 288-304)**:
   Composed of `<Header storeName={storeName} />`, `<Sidebar activeView={activeView} />`, and `<main id="main-content">`.
4. **Reference Design (`media_1794193326013_1e8c58c4.jpg`) Analysis**:
   - Header: RescueBite logo (top-left), store name profile button (top-right).
   - Sidebar: Active navigation highlighted on "Ulasan Pembeli".
   - Page Heading: `Ulasan Pembeli` (`text-2xl font-bold text-gray-900`).
   - Summary Cards (3 cards in grid `grid-cols-1 md:grid-cols-3 gap-6`):
     - Card 1: **RATING TOKO**: Big numerical score `4.8` `/ 5.0`, 5 star icons (amber-400), subtext "Berdasarkan ulasan pembeli".
     - Card 2: **TOTAL ULASAN**: Big count `128`, subtext "Ulasan dari pesanan yang telah selesai".
     - Card 3: **DISTRIBUSI PENILAIAN**: 5 star rows (5 Bintang down to 1 Bintang) with horizontal progress bars (`bg-primary` / `bg-[#10b981]`), trailing review count numbers (`104`, `16`, `6`, `2`, `0`).
   - Search & Filter Bar:
     - Search input: `Cari produk atau ulasan...` with magnifying glass icon.
     - Rating dropdown: `Semua Rating` (options: Semua, 5, 4, 3, 2, 1).
     - Sort dropdown: `Terbaru` (options: Terbaru, Terlama, Rating Tertinggi, Rating Terendah).
   - Review List Cards (`bg-white rounded-2xl border border-gray-100 shadow-sm p-6`):
     - Author Avatar / Initials in colored circle badge (e.g., green, orange, gray).
     - Name (e.g. `Andi Pratama`), Date right-aligned (e.g. `28 Oktober 2026`).
     - Star Rating (5 stars, amber-400).
     - Product pill with thumbnail and name (`Mystery Bakery Box`).
     - Review text block (quoted / italicized or clean text).
   - Pagination Bar:
     - Buttons: `Sebelumnya`, `1` (active), `2`, `3`, `Selanjutnya`.

---

### C. Product Detail Page
1. **Component Location & Structure (`src/pages/customer/CustomerProductDetail.tsx`)**:
   - Lines 408-453: Store header row and rating:
     ```tsx
     <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
       <span className="flex items-center text-amber-500">
         ★ <span className="text-gray-700 font-bold ml-1">{rating.toFixed(1)}</span>
         <span className="text-gray-400 font-normal ml-0.5">({reviewCount} ulasan)</span>
       </span>
       <span className="text-gray-300">•</span>
       <span className="flex items-center text-gray-500">{distanceText}</span>
     </div>
     ```
     *Observation*: Currently, clicking this rating area only triggers `handleStoreClick` which navigates to `#toko` top level (or toast if not provided). It lacks explicit keyboard accessibility, cursor styling on the rating group, and does NOT target `#ulasan-pelanggan`.
   - Lines 612-620: "Tentang Produk" full-width article:
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
     ```
   - Lines 621: Closing `</main>`.
   - *Observation*: The designated insertion point for the new section `"Ulasan Pengguna"` is immediately after the "Tentang Produk" article (line 620), before `</main>` (line 621).

---

### D. Store Detail Page & Review Section
1. **Component Location (`src/pages/customer/CustomerStoreDetail.tsx`)**:
   - Manages tabs via state `const [activeTab, setActiveTab] = useState<StoreDetailTab>('tentang');` (line 44).
   - Tabs defined in `src/components/customer/store/types.ts`: `'tentang' | 'produk' | 'ulasan'`.
   - Tab rendering in `CustomerStoreDetail.tsx` (lines 346-370):
     - `activeTab === 'tentang'`: Renders `<StoreInfoCard>` AND `<StoreReviewsList>`.
     - `activeTab === 'produk'`: Renders `<StoreDaganganGrid>`. `<StoreReviewsList>` is **omitted**.
     - `activeTab === 'ulasan'`: Renders `<StoreReviewsList>`.
2. **Store Reviews List Component (`src/components/customer/store/StoreReviewsList.tsx`, line 48)**:
   ```tsx
   <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
   ```
   *Critical observation*: The element currently has **no `id` attribute**. It does not have `id="ulasan-pelanggan"`.
3. **Header Offset & Scroll Margin**:
   The store page features the fixed floating pill `<CustomerHeader>` (`fixed top-5 left-1/2 -translate-x-1/2 z-50`). Calling native `scrollIntoView()` without scroll margin causes the top of the target element to be partially hidden under the floating header. Adding `scroll-mt-28` to `id="ulasan-pelanggan"` resolves this.
4. **Asynchronous Store Data Loading**:
   In `CustomerStoreDetail.tsx` lines 90-271, `loadStoreAndProducts()` is an asynchronous `useEffect` that queries backend stores and products. If the user navigates directly to `#toko?section=ulasan-pelanggan` or refreshes the page, the DOM element may not be immediately painted when the URL hash is evaluated. A resilient polling / RAF observer is required.

---

### E. Interactive Rating & Review Touchpoints in the Codebase
Every occurrence where store rating stars or review counts are displayed was inventoried:
1. `src/pages/customer/CustomerProductDetail.tsx` (lines 443-446): Product detail store info subtitle: `★ 4.8 (128 ulasan)`.
2. `src/components/customer/store/StoreHero.tsx` (lines 83-88): Store hero banner rating pill: `★ {storeData.rating} ({storeData.reviewCount} ulasan)`.
3. `src/components/customer/store/StoreInfoCard.tsx` (lines 140-166): "Ringkasan Toko" card: Rating Toko box, Total Ulasan box, and "Lihat Semua Ulasan →" button.
4. `src/components/customer/MysteryBoxCard.tsx` (lines 234-240): Radius variant card bottom gradient: `★ {item.rating} ({item.reviewCount} ulasan)`.
5. `src/components/customer/cart/CartStoreGroup.tsx` (lines 90-93): Store group header in cart: `★ {store.rating} ({store.reviewCount} ulasan)`.
6. `src/components/customer/checkout/CheckoutItemsList.tsx` (lines 85-86, 187-188): Store group header in checkout items: `★ {item.rating} ({item.reviewCount} ulasan)`.

---

### F. Backend API Contracts (Swagger Inspection)
Direct query to `https://dolpin-fourthree.bccdev.id/swagger/doc.json` verified the 6 Review endpoints and exact schemas:

1. `GET /api/v1/products/{product_id}/reviews`
   - Path param: `product_id` (string, UUID, required)
   - Query params: `page` (integer, default 1), `limit` (integer, default 10)
   - Response 200: `GetReviewsResponse` (`{ payload: { meta: PaginationResponse, reviews: ReviewResponse[] } }`)
2. `POST /api/v1/products/{product_id}/reviews`
   - Path param: `product_id` (string, UUID, required)
   - Auth: Bearer Token required
   - Request Body: `CreateReviewRequest` (`{ content: string, rating: integer }`)
   - Response 201: `Response`
3. `DELETE /api/v1/reviews/{id}`
   - Path param: `id` (string, UUID, required)
   - Auth: Bearer Token required
   - Response 200: `Response`
4. `PATCH /api/v1/reviews/{id}`
   - Path param: `id` (string, UUID, required)
   - Auth: Bearer Token required
   - Request Body: `UpdateReviewRequest` (`{ content: string, rating: integer }`)
   - Response 200: `Response`
5. `GET /api/v1/stores/{store_id}/reviews`
   - Path param: `store_id` (string, UUID, required)
   - Query params: `page` (integer, default 1), `limit` (integer, default 10)
   - Response 200: `GetReviewsResponse` (`{ payload: { meta: PaginationResponse, reviews: ReviewResponse[] } }`)
6. `POST /api/v1/stores/{store_id}/reviews`
   - Path param: `store_id` (string, UUID, required)
   - Auth: Bearer Token required
   - Request Body: `CreateReviewRequest` (`{ content: string, rating: integer }`)
   - Response 201: `Response`

**Review DTO Properties**:
- `ReviewResponse`: `id` (string), `user_id` (string), `store_id` (string), `product_id` (string), `rating` (integer), `content` (string), `created_at` (string), `updated_at` (string), `author` (`ReviewAuthorResponse`).
- `ReviewAuthorResponse`: `id` (string), `name` (string), `role` (string), `avatar_url` (string).

---

## 2. Logic Chain

```
[Observation A.1-A.5]
Routing is hash-driven via `parseHash` and `ActiveViewId`.
'view-ulasan' is already in `ActiveViewId` and `Sidebar.tsx`.
                 ↓
[Logic Step 1: Routing Configuration]
To activate the Seller "Ulasan Pembeli" page:
1. Add `path.startsWith('ulasan-seller') || path.startsWith('ulasan') => 'view-ulasan'` in `src/App.tsx` and `src/app/useHashNavigation.ts`.
2. Add `viewId === 'view-ulasan' => '#ulasan-seller'` in `handleNavigate()`.
3. Add route guard to redirect unauthenticated access.
                 ↓
[Observation B.1-B.4]
`AppRoutes.tsx` renders `<PlaceholderPage>` when `activeView === 'view-ulasan'`.
Sidebar already has button `nav-ulasan` with label `'Ulasan Pembeli'`.
Design screenshot `media_1794193326013_1e8c58c4.jpg` provides full visual specification.
                 ↓
[Logic Step 2: Seller Dashboard View Insertion]
Create `src/pages/seller/UlasanPembeli.tsx` implementing:
- 3 summary cards (Rating Toko, Total Ulasan, Distribusi Penilaian 5 to 1 with green progress bars).
- Search input and Rating/Sort filters.
- Review cards with initials avatar, star ratings, product pill, date, and review text.
- Pagination controls.
Register `UlasanPembeli` in `AppRoutes.tsx` replacing `PlaceholderPage`.
                 ↓
[Observation C.1 & D.1-D.4]
Product Detail displays rating in store subtitle (lines 443-446) without navigation targeting `#ulasan-pelanggan`.
Store page has `StoreReviewsList`, but it lacks `id="ulasan-pelanggan"`.
                 ↓
[Logic Step 3: Interactive Rating Navigation]
When a user clicks any store rating/review count on Product Detail (or Cart/Checkout):
1. Invoke `handleNavigateStore(storeName, storeId, 'ulasan-pelanggan')`.
2. Set URL hash to `#toko?name=...&id=...&section=ulasan-pelanggan` (or append `#ulasan-pelanggan`).
3. In `CustomerStoreDetail.tsx`:
   - If `section === 'ulasan-pelanggan'` or hash contains `ulasan-pelanggan`, set `activeTab('ulasan')` (or keep 'tentang' and ensure reviews are mounted).
   - In `StoreReviewsList.tsx`, attach `id="ulasan-pelanggan"` and `scroll-mt-28`.
   - Execute smooth scroll to `document.getElementById('ulasan-pelanggan')`, retrying across render cycles until found.
                 ↓
[Observation C.1 lines 612-621 & F.1-F.6]
Product Detail has space below "Tentang Produk" (line 620).
Backend provides `GET /api/v1/products/{product_id}/reviews` and `POST /api/v1/products/{product_id}/reviews`.
                 ↓
[Logic Step 4: Product Detail Review Section]
Create `ProductReviewsSection` inserted at line 621 of `CustomerProductDetail.tsx`:
- Summary of product rating and review count.
- Review submission form (rating stars 1-5, comment textarea, submit button) for logged-in users.
- Review list with edit and delete actions (PATCH / DELETE endpoints) for authorized user's own reviews.
- Handles empty, loading, error, and success states.
```

---

## 3. Caveats
1. **Mock Data vs Live Backend Reviews**: The backend endpoints require valid store UUIDs and product UUIDs. In existing local or fallback scenarios where store name is `"Toko Rejak"` or product ID is non-UUID (e.g. `'detail-teras-rasa'`), the service must gracefully fall back to local reviews or handle empty states without crashing.
2. **Review Ownership Authorization**: Swagger indicates review mutations (`PATCH / DELETE /api/v1/reviews/{id}`) require Bearer authentication. Frontend must check `currentUser?.id === review.user_id` before showing Edit/Delete buttons.
3. **Hash Navigation with Query Parameters**: Because the app uses hash-based routing (`#toko?name=...`), standard browser anchor links (`#ulasan-pelanggan`) will replace the whole hash if used naively via `<a href="#ulasan-pelanggan">`. Deep-linking must be orchestrated through query params (`#toko?name=...&section=ulasan-pelanggan`) or programmatic scrolling to preserve store parameters.

---

## 4. Conclusion & Recommended Plan

### Target Files and Modifications Summary:

| Area | File Path | Action | Description |
|---|---|---|---|
| **Routing** | `src/app/hashRouting.ts` | Modify | Support `section` query param and anchor hash parsing |
| **Routing** | `src/App.tsx` | Modify | Add `view-ulasan` route matching, deep linking, and `handleNavigateStore(name, id, section)` |
| **Routing** | `src/app/useHashNavigation.ts` | Modify | Add `ulasan-seller` / `ulasan` hash listener branch |
| **Types** | `src/api/types.ts` | Modify | Add `CreateReviewRequest`, `UpdateReviewRequest`, `ReviewResponse`, `GetReviewsResponse` |
| **API** | `src/api/services/reviewApi.ts` | Create | 6 endpoints (`productReviews`, `storeReviews`, `deleteReview`, `updateReview`) |
| **Services** | `src/services/reviewService.ts` | Create | Centralized review business logic and error handling |
| **Seller** | `src/pages/seller/UlasanPembeli.tsx` | Create | Seller Dashboard "Ulasan Pembeli" view matching reference design |
| **Seller** | `src/app/AppRoutes.tsx` | Modify | Lazy load and render `UlasanPembeli` when `activeView === 'view-ulasan'` |
| **Store** | `src/components/customer/store/StoreReviewsList.tsx` | Modify | Add `id="ulasan-pelanggan"`, `scroll-mt-28`, and connect live store reviews |
| **Store** | `src/pages/customer/CustomerStoreDetail.tsx` | Modify | Handle `section === 'ulasan-pelanggan'`, activate review tab, smooth scroll retry |
| **Store** | `src/components/customer/store/StoreHero.tsx` | Modify | Make rating pill clickable with smooth scroll to `#ulasan-pelanggan` |
| **Store** | `src/components/customer/store/StoreInfoCard.tsx` | Modify | Make Rating Toko & Total Ulasan clickable to `#ulasan-pelanggan` |
| **Product** | `src/pages/customer/CustomerProductDetail.tsx` | Modify | Make store rating clickable (navigating to Store `#ulasan-pelanggan`), mount `ProductReviewsSection` |
| **Product** | `src/components/customer/product/ProductReviewsSection.tsx` | Create | Section "Ulasan Pengguna" with rating summary, submission form, and review cards |
| **Touchpoints** | `src/components/customer/cart/CartStoreGroup.tsx` | Modify | Make store rating clickable to `#ulasan-pelanggan` |
| **Touchpoints** | `src/components/customer/checkout/CheckoutItemsList.tsx` | Modify | Make store rating clickable to `#ulasan-pelanggan` |
| **Touchpoints** | `src/components/customer/MysteryBoxCard.tsx` | Modify | Make radius variant rating clickable to `#ulasan-pelanggan` |

---

## 5. Verification Method

### How to Independently Verify:
1. **Static Build & Typecheck**:
   ```powershell
   npm run build
   ```
   Must pass with 0 TypeScript and bundling errors.
2. **Seller Dashboard Review Navigation**:
   - Navigate to `#ulasan-seller` or click "Ulasan Pembeli" in the Seller Sidebar.
   - Verify sidebar item is highlighted with bold/active styling.
   - Verify 3 summary cards display average rating, total reviews, and 5-to-1 rating distribution bars.
   - Verify search, rating filter, sort dropdown, and pagination render and operate without errors.
3. **Interactive Navigation from Product Detail to Store Reviews**:
   - Open `#detail-produk`.
   - Hover and click the star rating / review count `★ 4.8 (128 ulasan)` in the store header.
   - Verify the browser navigates to `#toko?name=...&section=ulasan-pelanggan`.
   - Verify the page smoothly scrolls to `<section id="ulasan-pelanggan">` with adequate offset under the floating header.
   - Verify direct reload of `#toko?name=...&section=ulasan-pelanggan` reproduces the smooth scroll once store data resolves.
4. **Product Detail "Ulasan Pengguna" Section**:
   - Open `#detail-produk`.
   - Scroll below "Tentang Produk".
   - Verify "Ulasan Pengguna" section renders average rating, review count, review list, and review submission interface for authenticated customers.
5. **API Endpoint Verification**:
   - Verify all 6 endpoints dispatch requests conforming to Swagger specs:
     - `GET /api/v1/products/{product_id}/reviews`
     - `POST /api/v1/products/{product_id}/reviews`
     - `DELETE /api/v1/reviews/{id}`
     - `PATCH /api/v1/reviews/{id}`
     - `GET /api/v1/stores/{store_id}/reviews`
     - `POST /api/v1/stores/{store_id}/reviews`

### Invalidation Conditions:
- If clicking the rating star on the Product Detail page navigates to `#beranda-customer` or the top of the Store page without scrolling to `#ulasan-pelanggan`.
- If clicking "Ulasan Pembeli" in the Seller Sidebar renders `<PlaceholderPage>` instead of the full review view.
- If the review endpoints send fields not defined in Swagger or fail TypeScript verification.
