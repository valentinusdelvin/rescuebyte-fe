# UI/UX & Design System Survey Report: Review Feature & Seller Dashboard

**Date**: 2026-11-09  
**Explorer**: UI/UX & Design System Specialist (`teamwork_explorer`)  
**Mission**: Visual and UI/UX analysis of the Seller Dashboard Review page reference screenshot, design system tokens, reusable UI primitives, Product Detail review section architecture, and interactive review navigation.

---

## 1. Observation

### 1.1 Reference Screenshot Visual Analysis
Direct inspection of `C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794193326013_1e8c58c4.jpg`:

1. **Overall Page Architecture & Canvas**:
   - **Header**: Persistent top navigation bar with white background (`#ffffff`), subtle bottom border. Left: RescueBite brand logo (green leaf icon + wordmark). Right: Store profile pill with user circle icon and merchant name `"Toko Reza"`.
   - **Sidebar**: Fixed left navigation panel with white background (`#ffffff`), right vertical border, and elevation shadow (`shadow-[6px_0_24px_-4px_rgba(0,0,0,0.08)]`).
     - Store profile at top: CircleUser icon + `"Toko Reza"`, followed by a `#4b5563` horizontal divider line.
     - Section 1: `"Tokoku"` (Store icon) with sub-links: `"Beranda"`, `"Profil Toko"`.
     - Section 2: `"Pesanan"` (ShoppingBag icon) with sub-links: `"Riwayat Pesanan"`, `"Ulasan Pembeli"` (**Active item**: bold black text `#111827`, font-extrabold).
     - Section 3: `"Dagangan"` (Package icon) with sub-links: `"Buat Dagangan"`, `"Daganganku"`, `"Pengiriman"`.
   - **Main Content Area**:
     - Background: Warm linen/off-white tone (`#f7f7f5`, corresponding exactly to `--color-surface-app`).
     - Padding: Desktop `p-[32px_36px]`, mobile `max-md:p-[24px_20px]`.
     - Layout: Fluid column with clean vertical cadence.

2. **Page Title**:
   - Text: `"Ulasan Pembeli"`.
   - Typography: Font Plus Jakarta Sans / heading, 26px–28px, font-bold / extrabold, color `#1b1c1c` (`text-on-surface`).
   - Clean spacing (`mb-6`) directly above the summary cards.

3. **Three Review Summary Cards** (`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6`):
   - All cards: White background (`bg-white`), `rounded-2xl` (16px), subtle border (`border border-[#e2e6df]` / `border-outline-variant`), soft shadow (`shadow-level-1`).
   - **Card 1: Rating Toko**:
     - Top label: `"RATING TOKO"` (`text-xs font-semibold text-gray-500 uppercase tracking-wider`).
     - Big numeric score: `"4.8"` (`text-4xl font-extrabold text-gray-900`) followed immediately by `"/ 5.0"` (`text-sm font-medium text-gray-400 ml-1`).
     - Star visual: 5 gold stars horizontally aligned (`text-amber-400 fill-amber-400`, ~20px each).
     - Subtext / footer: `"Berdasarkan ulasan pembeli"` (`text-xs text-gray-500 mt-2`).
   - **Card 2: Total Ulasan**:
     - Top label: `"TOTAL ULASAN"` (`text-xs font-semibold text-gray-500 uppercase tracking-wider`).
     - Big numeric count: `"128"` (`text-4xl font-extrabold text-gray-900`).
     - Spacer row: Vertical alignment height matching the star icons row in Card 1 to guarantee uniform card heights.
     - Subtext / footer: `"Ulasan dari pesanan yang telah selesai"` (`text-xs text-gray-500 mt-2 max-w-[200px] leading-tight`).
   - **Card 3: Distribusi Penilaian**:
     - Top label: `"DISTRIBUSI PENILAIAN"` (`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5`).
     - 5 horizontal progress rows stacked vertically (5 Bintang down to 1 Bintang):
       - Star level label: `"5 Bintang"`, `"4 Bintang"`, `"3 Bintang"`, `"2 Bintang"`, `"1 Bintang"` (`text-xs text-gray-600 w-16 shrink-0`).
       - Progress track: `bg-gray-100 h-2 rounded-full flex-1 mx-3 overflow-hidden`.
       - Progress fill bar: RescueByte botanical leaf green (`bg-[#4C9A2A]` or `bg-[#558B2F]` / `bg-brand-leaf` or `bg-secondary`, rounded-full h-full).
       - Review count: Right-aligned number (`"104"`, `"16"`, `"6"`, `"2"`, `"0"`) in `text-xs text-gray-500 w-6 text-right`.

4. **Search and Filter Bar** (`flex flex-wrap items-center gap-3 mb-6`):
   - **Search Input Field**:
     - Position: Left-aligned, flexible width (`w-64 sm:w-72`).
     - Appearance: White background, 1px border (`border-gray-200`), rounded-xl (`rounded-xl`), text-sm.
     - Left icon: Magnifying glass / search icon in slate gray (`text-gray-400`).
     - Placeholder: `"Cari produk atau ulasan..."`.
   - **Rating Filter Dropdown**:
     - Label: `"Semua Rating ⌄"` with options: Semua Rating, 5 Bintang, 4 Bintang, 3 Bintang, 2 Bintang, 1 Bintang.
     - Styling: White bg, `rounded-xl`, border `border-gray-200`, text-xs/sm font-medium text-gray-700, px-3.5 py-2, flex items-center gap-2.
   - **Sort Filter Dropdown**:
     - Label: `"Terbaru ⌄"` with options: Terbaru, Terlama, Rating Tertinggi, Rating Terendah.
     - Styling: White bg, `rounded-xl`, border `border-gray-200`, text-xs/sm font-medium text-gray-700, px-3.5 py-2, flex items-center gap-2.

5. **Review List Cards** (`space-y-4`):
   - Card container: `bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-level-1`.
   - Header Row:
     - Left:
       - User Avatar: Circular badge (`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs`) displaying initials (e.g., `"AP"`, `"NP"`, `"RM"`) with pastel tints (`bg-emerald-100 text-emerald-800`, `bg-orange-100 text-orange-800`, `bg-slate-100 text-slate-800`) or avatar image.
       - Next to avatar:
         - Reviewer name: `"Andi Pratama"`, `"Nadia Putri"`, `"Rizky Maulana"` (`font-bold text-gray-900 text-sm sm:text-base`).
         - Star rating: 5 star icons in gold/amber (`text-amber-400 fill-amber-400`, ~16px) placed directly under the reviewer's name.
     - Right:
       - Date: `"28 Oktober 2026"`, `"27 Oktober 2026"`, `"25 Oktober 2026"` (`text-xs text-gray-400 font-normal`).
   - Related Product Badge / Tag:
     - Positioned below reviewer header, above comment.
     - Styling: `inline-flex items-center gap-2 px-3 py-1.5 bg-[#fafaf8] border border-gray-150 rounded-lg mt-3`.
     - Thumbnail: Small square product thumbnail (`w-7 h-7 sm:w-8 sm:h-8 rounded object-cover`).
     - Product title: `"Mystery Bakery Box"`, `"Mystery Meal Box"`, `"Mystery Pastry Box"` (`text-xs font-semibold text-gray-800`).
   - Review Comment:
     - Positioned below the product badge.
     - Formatted enclosed in quotes: `"Rotinya masih fresh dan rasanya enak. Proses pengambilannya juga cepat. Worth it banget!"`.
     - Styling: `text-sm text-gray-600 leading-relaxed font-normal mt-3`.

6. **Pagination Controls** (`flex items-center justify-center gap-2 mt-8`):
   - `"Sebelumnya"` button: White background, `border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40`.
   - Numbered buttons:
     - Active `"1"`: `bg-gray-900 text-white rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold`.
     - Inactive `"2"`, `"3"`: `text-gray-600 hover:bg-gray-100 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium`.
   - `"Selanjutnya"` button: White background, `border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40`.

---

### 1.2 Design System Tokens & Existing Codebase State

1. **Tokens (`src/index.css` & `design.md`)**:
   - Canvas surface: `--color-surface-app: #f7f7f5;` and `--color-background: #fcf9f8;`.
   - Card surface: `--color-surface-card: #ffffff;`.
   - Border / outlines: `--color-outline-variant: #e2e6df;`.
   - Primary Evergreen: `--color-primary: #1f2a24;` and `--color-primary-dark: #141e18;`.
   - Botanical Greens: `--color-secondary: #3c6a00;`, `--color-brand-leaf: #7bae45;`, `--color-brand-green: #3c6a00;`.
   - Star Golds: `--color-brand-gold: #eab308;`, `--color-tertiary-accent: #f2b84b;`, or `text-amber-400`.
   - Text colors: `--color-on-surface: #1b1c1c;`, `--color-on-surface-variant: #434844;`, muted slate `#737874`.
   - Shadows: `--shadow-level-1: 0 4px 16px -2px rgba(31, 42, 36, 0.05);`, `--shadow-level-2: 0 8px 24px -4px rgba(31, 42, 36, 0.08);`.
   - Radii: `--radius-button: 0.75rem;` (12px), `--radius-card: 1rem;` (16px), pill `9999px`.

2. **Existing UI Primitives (`src/components/ui/`)**:
   - `Card.tsx`: Provides `variant="default" | "flat" | "elevated" | "interactive"`. Has `bg-white border border-outline-variant rounded-2xl overflow-hidden font-sans shadow-level-1`. **100% reusable directly**.
   - `Button.tsx`: Provides `variant="primary" | "secondary" | "outline" | "urgent" | "ghost"`, sizes `"sm" | "md" | "lg"`, `isLoading`, `leftIcon`, `rightIcon`. **100% reusable directly**.
   - `Input.tsx`: Provides `label`, `error`, `hint`, `leftIcon`, `rightIcon`. **Reusable directly for search and inputs**.
   - `Modal.tsx`: Complete accessible modal with keyboard trap, Escape handling, title, description, max-width options. **100% reusable for Review Submission Form and Delete Confirmation**.
   - `EmptyState.tsx`: Reusable empty state with custom icon, title, description, and action button. **Reusable for zero review state**.
   - `Skeleton.tsx`: Reusable skeleton with `'text' | 'circular' | 'rectangular' | 'card'`. **Reusable for review loading states**.
   - `Badge.tsx`: Reusable pill badges.

3. **Current Sidebar & Seller Router Status**:
   - In `src/components/layout/Sidebar.tsx` (lines 166-175), `"Ulasan Pembeli"` is ALREADY declared with:
     ```tsx
     onClick={() => handleItemClick('view-ulasan', 'Ulasan Pembeli')}
     ```
   - In `src/types/index.ts` (line 57), `'view-ulasan'` is ALREADY part of `ActiveViewId`.
   - In `src/app/AppRoutes.tsx`, lines 342-351 currently route unmatched views to `<PlaceholderPage>`.
   - In `src/app/useHashNavigation.ts` and `src/App.tsx`, hash routing for `#ulasan-seller` or `#ulasan` is currently missing and needs to be mapped to `'view-ulasan'`.

4. **Product Detail & Store Detail Status**:
   - In `src/pages/customer/CustomerProductDetail.tsx`:
     - Lines 442-452 render store rating: `★ rating.toFixed(1) (reviewCount ulasan)`. Currently non-interactive text.
     - Section for customer reviews (`Ulasan Pengguna`) does not exist yet.
   - In `src/pages/customer/CustomerStoreDetail.tsx`:
     - Lines 364-369 render `<StoreReviewsList reviews={storeReviews} reviewCount={storeData.reviewCount} />` when `activeTab === 'tentang' || activeTab === 'ulasan'`.
     - In `src/components/customer/store/StoreReviewsList.tsx`, line 48 does NOT yet have `id="ulasan-pelanggan"`.
   - In `src/components/customer/order/OrderReviewModal.tsx`:
     - Already has interactive star rating (1-5), satisfaction label ("Sangat Puas!", etc.), textarea, and submit button. Provides a proven pattern to standardize upon.

---

## 2. Logic Chain

1. **Alignment with Reference Screenshot**:
   - The reference screenshot represents the canonical visual target for `view-ulasan` (Seller Dashboard — Buyer Reviews page).
   - Building a dedicated page component `src/pages/seller/SellerReviews.tsx` (or `UlasanPembeli.tsx`) using the existing `Header` and `Sidebar` in `AppRoutes.tsx` preserves 100% structural consistency with other seller pages (`Dashboard.tsx`, `OrderHistory.tsx`, `Daganganku.tsx`).
   - The page must be registered in `AppRoutes.tsx` under `{activeView === 'view-ulasan' && <SellerReviews ... />}` and in `useHashNavigation.ts` for `#ulasan-seller` and `#ulasan`.

2. **Data-Driven Architecture (No Hardcoded Numbers)**:
   - The screenshot shows "4.8", "128", and distribution counts ("104", "16", "6", "2", "0").
   - Requirement 2.B explicitly mandates: *All displayed statistics must come from actual backend data or calculations based on actual reviews. Do not hardcode.*
   - If the backend returns an array of reviews:
     - `averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0`
     - `totalReviews = reviews.length`
     - `distribution[stars] = reviews.filter(r => Math.round(r.rating) === stars).length`
     - `percentage[stars] = (distribution[stars] / totalReviews) * 100`

3. **Reusable Review UI Primitives**:
   - To prevent code duplication between the Seller Dashboard review page, Product Detail review section, and Store Detail review list, we should define reusable components:
     1. `StarRating`: Handles rendering 1-5 stars with fractional fill support for display, and interactive hover/click/keyboard selection for input.
     2. `RatingDistribution`: Renders the 5-row progress bar distribution.
     3. `ReviewCard`: Standardized card representing a review item (avatar/initials, customer name, date, rating stars, optional product badge with thumbnail, quoted comment, optional edit/delete actions).
     4. `ReviewFilterBar`: Search input + rating filter dropdown + sort dropdown.
     5. `ReviewPagination`: Previous, numbered pages, Next button with full accessibility.
     6. `ReviewSubmissionModal`: Accessible modal wrapping `Modal` with rating selection, textarea, validation, and submission states.

4. **Product Detail "Ulasan Pengguna" Architecture**:
   - Must appear directly below existing product information in `CustomerProductDetail.tsx`.
   - Has ID `id="ulasan-produk"`.
   - Includes:
     - Rating summary (average rating, total count, distribution).
     - "Tulis Ulasan" action button (visible if user is authenticated).
     - List of reviews for this specific product (`GET /api/v1/products/{product_id}/reviews`).
     - Edit & Delete buttons on reviews created by the authenticated user (`user.id === review.user_id`).
     - Empty state with `EmptyState` component when product has no reviews yet.

5. **Navigation to Store "Ulasan Pelanggan"**:
   - Clicking star rating icons or review count on Product Detail must navigate to `#toko` and scroll to `#ulasan-pelanggan`.
   - Mechanism:
     - Call `onNavigateStore(storeName, storeId)` with URL hash `#toko?name=...&id=...&tab=ulasan#ulasan-pelanggan`.
     - In `CustomerStoreDetail.tsx`, ensure `activeTab` switches to `'ulasan'` so that `<StoreReviewsList>` is rendered.
     - Add `id="ulasan-pelanggan"` to `<section>` in `StoreReviewsList.tsx`.
     - In `CustomerStoreDetail.tsx` (or a custom hook `useScrollToAnchor`), execute:
       ```ts
       const el = document.getElementById('ulasan-pelanggan');
       if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
       ```
     - For asynchronous store data loading, use a `setTimeout` or `MutationObserver` / `useEffect` watching `activeTab` and loading state to guarantee the section exists before scrolling.

---

## 3. Caveats

1. **Backend Aggregation vs Client-Side Computation**:
   - If `GET /api/v1/stores/{store_id}/reviews` or `GET /api/v1/products/{product_id}/reviews` does not return pre-calculated rating distribution percentages, the frontend must safely compute them client-side. Edge case: when total reviews is 0, progress percentages must render as 0% without divide-by-zero errors.
2. **Review Ownership & Authentication**:
   - Only the creator of a review can edit (`PATCH /api/v1/reviews/{id}`) or delete (`DELETE /api/v1/reviews/{id}`) their review. The UI must only render Edit/Delete buttons when `currentUser.id === review.user_id`.
   - Anonymous/unauthenticated visitors clicking "Tulis Ulasan" must receive a gentle toast notification and be redirected to login (`#auth` / `view-auth-role-selection`).
3. **Product Information in Store Reviews**:
   - In the reference screenshot, each review card has a product tag (`Mystery Bakery Box` with thumbnail). If backend review response does not include product metadata or if the review was given directly to the store without a specific product, the product tag must gracefully hide without breaking card layout.
4. **Pagination Contract**:
   - If backend supports query parameters `?page=1&limit=10`, use server-side pagination. If the backend returns an unpaginated array, implement transparent client-side pagination (e.g. 5 or 10 items per page).

---

## 4. Conclusion & Component Design Specifications

### 4.1 Component Blueprint

```
src/
├── components/
│   ├── reviews/
│   │   ├── StarRating.tsx            <-- Displays stars (fractional fill) or interactive rating input
│   │   ├── RatingDistribution.tsx    <-- 5 horizontal bars with green fill & count
│   │   ├── ReviewSummaryCards.tsx    <-- 3 cards matching screenshot (Rating Toko, Total, Distribusi)
│   │   ├── ReviewCard.tsx            <-- Review item with avatar, rating, date, product pill, comment, actions
│   │   ├── ReviewFilterBar.tsx       <-- Search input + Rating filter + Sort dropdown
│   │   ├── ReviewPagination.tsx      <-- Sebelumnya, 1, 2, 3, Selanjutnya
│   │   ├── ReviewSubmissionModal.tsx <-- Modal form for create / edit product review
│   │   └── index.ts
│   ├── customer/
│   │   └── product/
│   │       └── ProductReviewsSection.tsx <-- "Ulasan Pengguna" section for CustomerProductDetail
│   └── customer/
│       └── store/
│           └── StoreReviewsList.tsx  <-- Add id="ulasan-pelanggan", integrate StarRating and live data
├── pages/
│   └── seller/
│       └── SellerReviews.tsx         <-- Page view for "view-ulasan" matching reference screenshot
```

### 4.2 Exact Visual Specifications & Props

#### A. `StarRating`
- **Props**:
  ```ts
  export interface StarRatingProps {
    rating: number; // 0 to 5, can be fractional (e.g. 4.8)
    maxRating?: number; // default 5
    size?: 'sm' | 'md' | 'lg' | 'xl'; // sm: 14px, md: 18px, lg: 22px, xl: 28px
    interactive?: boolean; // false for display, true for input
    onChange?: (rating: number) => void;
    showScoreText?: boolean; // renders "4.8" or "4.8 / 5.0"
    scoreTextClassName?: string;
    className?: string;
  }
  ```
- **Styling**:
  - Filled stars: `text-amber-400 fill-amber-400`.
  - Empty stars: `text-gray-200 fill-gray-200`.
  - Accessible: `aria-label={`${rating} dari ${maxRating} bintang`}`.

#### B. `RatingDistribution`
- **Props**:
  ```ts
  export interface RatingDistributionProps {
    distribution: Record<number, number>; // { 5: 104, 4: 16, 3: 6, 2: 2, 1: 0 }
    totalReviews: number;
    className?: string;
  }
  ```
- **Styling**:
  - Label: `text-xs text-gray-600 w-16 whitespace-nowrap`.
  - Bar track: `bg-gray-100 h-2 rounded-full flex-1 mx-3 overflow-hidden`.
  - Bar fill: `bg-[#4C9A2A]` or `bg-secondary` rounded-full h-full transition-all duration-300.
  - Count text: `text-xs text-gray-500 w-6 text-right font-medium`.

#### C. `ReviewSummaryCards` (Seller Dashboard Top Cards)
- **Props**:
  ```ts
  export interface ReviewSummaryCardsProps {
    averageRating: number; // e.g. 4.8
    totalReviews: number;   // e.g. 128
    distribution: Record<number, number>;
    isLoading?: boolean;
  }
  ```
- **Layout**: `grid grid-cols-1 md:grid-cols-3 gap-6`.
- **Card 1 (Rating Toko)**:
  - Header: `"RATING TOKO"` (`text-xs font-semibold text-gray-500 uppercase tracking-wider`).
  - Score: `text-4xl font-extrabold text-gray-900` + `text-sm font-medium text-gray-400 / 5.0`.
  - Star row: 5 gold stars.
  - Footer: `"Berdasarkan ulasan pembeli"`.
- **Card 2 (Total Ulasan)**:
  - Header: `"TOTAL ULASAN"` (`text-xs font-semibold text-gray-500 uppercase tracking-wider`).
  - Count: `text-4xl font-extrabold text-gray-900`.
  - Alignment gap: `h-5` to align with stars in Card 1.
  - Footer: `"Ulasan dari pesanan yang telah selesai"`.
- **Card 3 (Distribusi Penilaian)**:
  - Header: `"DISTRIBUSI PENILAIAN"` (`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2`).
  - 5 rows via `RatingDistribution`.

#### D. `ReviewFilterBar`
- **Props**:
  ```ts
  export interface ReviewFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    ratingFilter: number | null; // null = Semua Rating, 1-5 = specific star
    onRatingFilterChange: (rating: number | null) => void;
    sortBy: 'terbaru' | 'terlama' | 'rating-tinggi' | 'rating-rendah';
    onSortChange: (sort: 'terbaru' | 'terlama' | 'rating-tinggi' | 'rating-rendah') => void;
  }
  ```
- **Elements**:
  - Search: White input, `Search` icon on left, placeholder `"Cari produk atau ulasan..."`.
  - Rating Dropdown: `"Semua Rating ⌄"`, with popover/select.
  - Sort Dropdown: `"Terbaru ⌄"`, with popover/select.

#### E. `ReviewCard`
- **Props**:
  ```ts
  export interface ReviewCardProps {
    id: string;
    reviewerName: string;
    reviewerAvatar?: string;
    rating: number;
    createdAt: string; // Formatted date e.g. "28 Oktober 2026"
    comment: string;
    productName?: string;
    productImage?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
  }
  ```
- **Avatar generation**: If `reviewerAvatar` is empty, generate initials badge:
  - Colors: Deterministic hash of name to choose between `bg-emerald-100 text-emerald-800`, `bg-amber-100 text-amber-800`, `bg-blue-100 text-blue-800`, `bg-rose-100 text-rose-800`.
- **Product Pill**:
  - `inline-flex items-center gap-2 px-3 py-1.5 bg-[#fafaf8] border border-gray-150 rounded-lg mt-3`.
  - Thumbnail 32x32 rounded + bold text-xs product name.
- **Comment**:
  - `text-sm text-gray-600 leading-relaxed mt-3`.
  - Wrapped in quotes: `"{comment}"`.

#### F. `ProductReviewsSection` (Product Detail Section)
- **Container**: `id="ulasan-produk"` placed inside `CustomerProductDetail.tsx` right below `lg:col-span-12` or main product block.
- **Header**:
  - Left: `"Ulasan Pengguna"` + badge with total reviews.
  - Right: `"Tulis Ulasan"` button (`variant="primary"`, size `"sm"`, `leftIcon={<Edit3 />}`).
- **Summary**:
  - Left: Big rating (e.g. 4.9) + Stars + `Berdasarkan X ulasan`.
  - Right: Horizontal distribution bars.
- **Review Items**:
  - Rendered with `ReviewCard`.
  - If current logged-in user is author, show subtle `Edit` (pencil icon) and `Hapus` (trash icon) buttons.
- **Empty State**:
  - `EmptyState` component with MessageSquare icon: `"Belum Ada Ulasan"`, `"Jadilah yang pertama memberikan ulasan untuk produk ini."`, CTA `"Beri Ulasan Sekarang"`.

#### G. Interactive Navigation Implementation
1. In `CustomerProductDetail.tsx`:
   - Store header rating badge (`★ rating.toFixed(1) (reviewCount ulasan)`):
     - Wrap in accessible interactive button/link:
     - `role="button"`, `tabIndex={0}`, `title="Lihat ulasan toko"`
     - `className="cursor-pointer hover:underline hover:text-brand-green transition-colors"`
     - `onClick={handleNavigateStoreReviews}`
   - Navigation handler:
     ```ts
     const handleNavigateStoreReviews = () => {
       if (onNavigateStore) {
         onNavigateStore(storeName, product?.storeId);
       }
       // Also update hash with tab=ulasan and anchor
       window.location.hash = `#toko?name=${encodeURIComponent(storeName)}&id=${product?.storeId || ''}&tab=ulasan#ulasan-pelanggan`;
     };
     ```
2. In `CustomerStoreDetail.tsx`:
   - Add `id="ulasan-pelanggan"` to `StoreReviewsList.tsx` outer `<section>`.
   - In `CustomerStoreDetail.tsx`, read hash params on mount/change:
     ```ts
     useEffect(() => {
       const { params } = parseHash();
       if (params.get('tab') === 'ulasan' || window.location.hash.includes('ulasan-pelanggan')) {
         setActiveTab('ulasan');
         setTimeout(() => {
           const el = document.getElementById('ulasan-pelanggan');
           if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }, 100);
       }
     }, []);
     ```

---

## 5. Verification Method

1. **Visual Match Verification**:
   - Compare rendered `SellerReviews.tsx` at `#ulasan-seller` against reference screenshot `media_1794193326013_1e8c58c4.jpg`.
   - Verify 3 summary cards match: "RATING TOKO" (score + 5 stars), "TOTAL ULASAN", "DISTRIBUSI PENILAIAN" (5 green bars with exact row order 5 to 1).
   - Verify filter bar matches: search placeholder `"Cari produk atau ulasan..."`, `"Semua Rating ⌄"`, `"Terbaru ⌄"`.
   - Verify review card matches: Avatar initials + user name, stars directly underneath, date on right, product tag with thumbnail, quote comment.
   - Verify pagination matches: "Sebelumnya", active dark page button, "Selanjutnya".

2. **TypeScript & Static Verification**:
   - Run `npx tsc --noEmit` — must pass with 0 errors.
   - Run `npm run build` — must build production bundle with 0 errors.

3. **Interactive Navigation Verification**:
   - Open Product Detail page (`#detail-produk`).
   - Click the rating stars / review count next to store name.
   - Confirm application switches to Store page (`view-customer-store` / `#toko`), activates `ulasan` tab, and scrolls directly to `#ulasan-pelanggan`.
   - Refresh browser while on `#toko?...#ulasan-pelanggan` — confirm target section remains visible.

4. **Review Submission & Management Verification**:
   - Open Product Detail as logged-in user.
   - Click "Tulis Ulasan" -> modal opens with star picker and comment area.
   - Select 5 stars, type comment, submit -> verify optimistic UI update or refetch.
   - Verify newly submitted review displays Edit and Delete action buttons for author.
