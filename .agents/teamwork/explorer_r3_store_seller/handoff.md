# Handoff Report: Requirement R3 Investigation (Seller Dashboard & Store Page Review Display)

## 1. Observation

### 1.1 Seller Dashboard Reviews Routing & Rendering (`#ulasan-seller`)
- **Route Resolution**:
  - In `src/app/useHashNavigation.ts` lines 52-54:
    ```typescript
    } else if (path.startsWith('ulasan-seller') || path === 'ulasan') {
      setActiveView('view-ulasan');
      setActiveLabel('Ulasan Pembeli');
    ```
  - In `src/app/AppRoutes.tsx` line 29:
    ```typescript
    const SellerReviews = React.lazy(() => import('../pages/seller/SellerReviews').then((m) => ({ default: m.SellerReviews })));
    ```
  - In `src/app/AppRoutes.tsx` lines 345-347:
    ```typescript
    {activeView === 'view-ulasan' && (
      <SellerReviews storeName={storeName} storeId={storeId} />
    )}
    ```
  - In `src/app/AppRoutes.tsx` lines 60-61:
    ```typescript
    export function AppRoutes({
      ...
      selectedStoreId,
      ...
    }: AppRoutesProps) {
      const storeId = selectedStoreId;
    ```
  - In `src/App.tsx` lines 110-112 and 322-324:
    ```typescript
    const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(() => {
      const { params } = parseHash();
      return params.get('id') || undefined;
    });
    ...
    if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
      if (params.get('id')) {
        setSelectedStoreId(params.get('id')!);
      }
    }
    ```
- **Seller Identity & Profile Sync**:
  - In `src/App.tsx` lines 365-378:
    ```typescript
    useEffect(() => {
      const currentUser = getCurrentUser();
      const isCustomer = currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2 || currentUser.role?.toLowerCase() === 'user' || currentUser.role?.toLowerCase() === 'customer');
      if (currentUser && !isCustomer && (currentUser.role_id === 3 || currentUser.role === 'Seller' || localStorage.getItem('rescuebyte_user_role') === 'seller')) {
        getStoreProfile()
          .then((store) => {
            if (store?.name) {
              setStoreName(store.name);
              localStorage.setItem('rescuebyte_store_name', store.name);
            }
          })
          .catch(() => {});
      }
    }, []);
    ```
    *Observation*: `getStoreProfile()` returns `{ id, name, ... }`. However, `store.id` is never saved into `localStorage` (only `rescuebyte_store_name` is saved).
- **SellerReviews Component**:
  - In `src/pages/seller/SellerReviews.tsx` lines 46-65:
    ```typescript
    export function SellerReviews({ storeName, storeId: propStoreId }: SellerReviewsProps) {
      // Resolve merchant store profile if storeId is not explicitly provided
      const { store: myStore, isLoading: isProfileLoading } = useStoreProfile({
        autoFetch: !propStoreId,
      });
      const effectiveStoreId = propStoreId || myStore?.id;

      // Real store review data and rating summary from backend API
      const {
        reviews,
        averageRating,
        totalReviews,
        ratingDistribution,
        isLoading: isReviewsLoading,
        isError,
        error,
        refetch,
      } = useStoreReviews(effectiveStoreId, undefined, {
        autoFetch: Boolean(effectiveStoreId),
      });
    ```
  - In `src/pages/seller/SellerReviews.tsx` lines 67-81:
    Fetches merchant products via `getMerchantProducts()` from `src/services/productService.ts` (`GET /api/v1/products/me/list`) to map product names and thumbnails to review items.
  - In `src/pages/seller/SellerReviews.tsx` lines 182-319:
    Renders `ReviewSummaryCards` (Average Rating, Total Reviews, Rating Distribution bars for 5, 4, 3, 2, 1 stars), `ReviewFilterBar` (Search, star filter, sort options), and a list of `ReviewCard` components with pagination (`REVIEWS_PER_PAGE = 5`).
  - *Critical Vulnerability Observed*: In `AppRoutes.tsx`, `storeId` is aliased to `selectedStoreId`. When a user navigates from a customer store page (e.g. `#toko?id=abc`) to the seller portal (`#ulasan-seller`), `selectedStoreId` remains `"abc"`, causing `SellerReviews` to query reviews for store `"abc"` instead of the seller's own store.

### 1.2 Customer Store Detail Page Review Display (`CustomerStoreDetail.tsx` & `StoreReviewsList.tsx`)
- **Store Detail Page Review Fetching**:
  - In `src/pages/customer/CustomerStoreDetail.tsx` lines 147-160:
    ```typescript
    const [resolvedStoreId, setResolvedStoreId] = useState<string | undefined>(storeId);
    ...
    // Live reviews & rating summary from backend API
    const {
      reviews: rawReviews,
      averageRating,
      totalReviews,
    } = useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) });
    ```
  - In `src/pages/customer/CustomerStoreDetail.tsx` lines 378-388:
    ```typescript
    // Reviews list mapped from live backend reviews
    const storeReviews: StoreReviewItem[] = useMemo(() => {
      return (rawReviews || []).map((r) => ({
        id: r.id,
        name: r.author?.name || 'Pelanggan',
        role: r.author?.role || 'Penyelamat Makanan',
        avatar: r.author?.avatar_url || '',
        rating: r.rating,
        date: formatReviewDate(r.created_at),
        comment: r.content,
      }));
    }, [rawReviews]);
    ```
  - In `src/pages/customer/CustomerStoreDetail.tsx` lines 482-488:
    ```typescript
    {(activeTab === 'tentang' || activeTab === 'ulasan') && (
      <StoreReviewsList
        reviews={storeReviews}
        reviewCount={storeData.reviewCount}
        storeId={resolvedStoreId || storeId}
      />
    )}
    ```
- **Store Products Availability**:
  - In `src/pages/customer/CustomerStoreDetail.tsx` lines 289-364:
    Store products are fetched via `getPublicProducts({ store_id: targetStoreId })` and stored in `storeProducts: StoreProductItem[]`.
- **StoreReviewsList Component**:
  - In `src/components/customer/store/StoreReviewsList.tsx` lines 43-66:
    ```typescript
    // Live reviews hook when storeId is provided
    const { reviews: liveReviews, totalReviews: liveTotalReviews } = useStoreReviews(storeId, undefined, {
      autoFetch: Boolean(storeId),
    });
    ```
  - In `src/components/customer/store/StoreReviewsList.tsx` lines 168-220:
    Renders a 2-column grid of store reviews.
  - *Critical Gap Observed*: `StoreReviewsList.tsx` and `CustomerStoreDetail.tsx` ONLY fetch and display store reviews (from `GET /api/v1/stores/{store_id}/reviews`). They DO NOT fetch or display reviews for the products belonging to that store (`GET /api/v1/products/{product_id}/reviews`). Requirement R3 explicitly mandates displaying store reviews **alongside product reviews for products belonging to that store**.

### 1.3 Review API Endpoints & Hooks
- In `src/api/services/reviewApi.ts`:
  - `getStoreReviews(storeId, params)` -> `GET /api/v1/stores/${storeId}/reviews` (Returns `GetReviewsResponse`).
  - `getStoreSummary(storeId)` -> `GET /api/v1/stores/${storeId}/summary` (Returns `StoreSummaryResponse`).
  - `getProductReviews(productId, params)` -> `GET /api/v1/products/${productId}/reviews` (Returns `GetReviewsResponse`).
  - `createStoreReview(storeId, data)` -> `POST /api/v1/stores/${storeId}/reviews`.
  - `createProductReview(productId, data)` -> `POST /api/v1/products/${productId}/reviews`.
  - `updateReview(id, data)` -> `PATCH /api/v1/reviews/${id}`.
  - `deleteReview(id)` -> `DELETE /api/v1/reviews/${id}`.
- In `src/hooks/useReviews.ts`:
  - `useProductReviews(productId, params, options)`: fetches single product reviews.
  - `useStoreReviews(storeId, params, options)`: fetches store reviews and store summary in parallel via `Promise.allSettled`.
  - `useStoreSummary(storeId, options)`: fetches store summary.
  - `useReviewMutations(options)`: mutation operations for reviews.
  - *Observation*: There is currently no hook to fetch product reviews across multiple products belonging to a store.

### 1.4 Static Analysis & Build Verification
- Command: `npm run typecheck` (`tsc -b`)
  - Result: Exit code 0, 0 errors.
- Command: `npm run build` (`tsc -b && vite build`)
  - Result: Exit code 0, 0 errors, built in 1.49s.

---

## 2. Logic Chain

1. **Seller Dashboard Requirement**:
   - Requirement: "In the Seller Dashboard (`#ulasan-seller`), display store reviews fetched via `GET /api/v1/stores/{store_id}/reviews`."
   - Observation 1.1 reveals that `SellerReviews.tsx` already uses `useStoreReviews(effectiveStoreId)`, which calls `reviewApi.getStoreReviews(storeId)`.
   - However, Observation 1.1 also reveals a routing bug: `AppRoutes.tsx` sets `storeId = selectedStoreId`. If a seller previously navigated to a store as a customer, `selectedStoreId` retains that external store's ID and passes it to `SellerReviews`.
   - Therefore, to reliably fetch and display reviews from `GET /api/v1/stores/{store_id}/reviews` for the seller:
     a. `App.tsx` must persist `store.id` as `rescuebyte_store_id` in `localStorage` when `getStoreProfile()` succeeds.
     b. `AppRoutes.tsx` must not pass `selectedStoreId` to `SellerReviews`.
     c. `SellerReviews.tsx` must resolve `effectiveStoreId` using `propStoreId || localStorage.getItem('rescuebyte_store_id') || myStore?.id`.

2. **Customer Store Detail Page Requirement**:
   - Requirement: "On the Customer Store Detail page (`CustomerStoreDetail.tsx`), display store reviews fetched from `GET /api/v1/stores/{store_id}/reviews` alongside product reviews for products belonging to that store."
   - Observation 1.2 reveals that `CustomerStoreDetail.tsx` fetches `storeProducts` for the store, but only fetches and passes `storeReviews` to `StoreReviewsList.tsx`.
   - Observation 1.2 and 1.3 show that `reviewApi.getProductReviews(productId)` exists and can be called for each product in `storeProducts`.
   - Therefore, to display store reviews alongside product reviews:
     a. A new custom hook `useStoreProductReviews(products)` should be added in `src/hooks/useReviews.ts` to fetch reviews for all products in parallel using `Promise.allSettled`.
     b. `StoreReviewItem` in `src/components/customer/store/types.ts` should be expanded to include `productId?: string`, `productName?: string`, `productImage?: string`, and `type?: 'store' | 'product'`.
     c. `CustomerStoreDetail.tsx` will fetch store reviews (via `useStoreReviews`) and product reviews (via `useStoreProductReviews(storeProducts)`), compute the total review count, and pass both collections to `StoreReviewsList.tsx`.
     d. In `StoreReviewsList.tsx`:
        - Provide category filter pills: `Semua (${total})`, `Ulasan Toko (${storeCount})`, `Ulasan Produk (${productCount})`.
        - Review cards will display a visual badge: `🏪 Ulasan Toko` for store reviews, and a product pill with thumbnail image and `productName` for product reviews.
        - The sorting dropdown (`Terbaru`, `Rating Tertinggi`, `Rating Terendah`) will sort whichever filter is active.
        - Clicking a product badge/pill on a product review can trigger navigation to that product's detail (`onSelectProduct`), providing superior user experience.

---

## 3. Caveats

1. **Product Count & Concurrency**:
   Stores typically have between 1 to 10 products in this application. Fetching product reviews in parallel via `Promise.allSettled` is efficient and resilient: if one product has no reviews or fails with 404, other product reviews are still displayed without breaking the page.
2. **Review Aggregation & Ratings**:
   Backend endpoint `GET /api/v1/stores/{store_id}/summary` returns `average_rating` and `total_reviews` for the store entity. Product reviews belong to products (`/api/v1/products/{id}/reviews`). In `StoreTabs` and `StoreReviewsList`, displaying both review types alongside each other with filter counts gives customers complete transparency while preserving official store summary stats in `StoreHero`.
3. **Authentication State**:
   `GET /api/v1/stores/{store_id}/reviews` and `GET /api/v1/products/{product_id}/reviews` are public endpoints requiring no authentication headers for customer reading. Seller dashboard requests include the auth bearer token transparently via `apiClient`.

---

## 4. Conclusion

Requirement R3 is well-structured and can be cleanly implemented without any architectural friction:
1. **Seller Dashboard**:
   - The view at `#ulasan-seller` is implemented in `src/pages/seller/SellerReviews.tsx` and already calls `GET /api/v1/stores/{store_id}/reviews`.
   - Fix the store ID resolution in `src/App.tsx`, `src/app/AppRoutes.tsx`, and `src/pages/seller/SellerReviews.tsx` to prevent foreign store ID contamination.
2. **Customer Store Detail Page**:
   - `CustomerStoreDetail.tsx` and `StoreReviewsList.tsx` currently only display store reviews.
   - Introduce `useStoreProductReviews(products)` in `src/hooks/useReviews.ts` to fetch reviews for all products of the store via `GET /api/v1/products/{product_id}/reviews`.
   - Enhance `StoreReviewsList.tsx` to display store reviews alongside product reviews with filter pills (`Semua`, `Ulasan Toko`, `Ulasan Produk`), clear visual badges (`🏪 Ulasan Toko` vs product pill with thumbnail & name), sorting, and responsive layout.

---

## 5. Verification Method

### 5.1 Step-by-Step Implementation Strategy for Worker

#### Step 1: Types & Hook Definition
1. **Edit `src/components/customer/store/types.ts`**:
   Extend `StoreReviewItem`:
   ```typescript
   export interface StoreReviewItem {
     id: string;
     name: string;
     role: string;
     rating: number;
     avatar: string;
     comment: string;
     date: string;
     productId?: string;
     productName?: string;
     productImage?: string;
     type?: 'store' | 'product';
   }
   ```
2. **Edit `src/hooks/useReviews.ts`**:
   Add and export `useStoreProductReviews`:
   ```typescript
   export interface StoreProductReviewItem {
     id: string;
     name: string;
     role: string;
     rating: number;
     avatar: string;
     comment: string;
     date: string;
     productId: string;
     productName: string;
     productImage?: string;
     type: 'product';
   }

   export function useStoreProductReviews(
     products: { id: string; name: string; imageSrc?: string }[],
     options: UseReviewsOptions = {}
   ) { ... }
   ```
   - Fetches `reviewApi.getProductReviews(p.id)` for each product in parallel via `Promise.allSettled`.
   - Formats review items with author, rating, content, date, `productId`, `productName`, `productImage`, and `type: 'product'`.

#### Step 2: Customer Store Detail Integration
1. **Edit `src/pages/customer/CustomerStoreDetail.tsx`**:
   - Import `useStoreProductReviews`.
   - Call `const { productReviews, isLoading: isProductReviewsLoading } = useStoreProductReviews(storeProducts);`.
   - In `storeReviews`, ensure each item has `type: 'store'`.
   - Calculate total combined reviews:
     `const combinedTotalReviews = (storeData.reviewCount || storeReviews.length) + productReviews.length;`.
   - Pass `storeReviews`, `productReviews`, `storeProducts`, and `handleSelectProduct` to `StoreReviewsList`.
   - Update `StoreTabs` tab counter: `reviewCount={combinedTotalReviews}`.

#### Step 3: Enhance `StoreReviewsList.tsx`
1. **Edit `src/components/customer/store/StoreReviewsList.tsx`**:
   - Update `StoreReviewsListProps`:
     ```typescript
     export interface StoreReviewsListProps {
       reviews?: StoreReviewItem[];
       reviewCount?: number;
       storeId?: string;
       storeReviews?: StoreReviewItem[];
       productReviews?: StoreReviewItem[];
       storeProducts?: StoreProductItem[];
       onSelectProduct?: (product: StoreProductItem) => void;
       isLoadingProductReviews?: boolean;
     }
     ```
   - Add filter state: `activeFilter: 'semua' | 'toko' | 'produk'`.
   - Merge `storeReviews` and `productReviews` into `allReviews`.
   - Filter reviews based on `activeFilter`, then sort by `sortOrder` (`terbaru`, `rating-tinggi`, `rating-rendah`).
   - Add filter tabs:
     - `Semua Ulasan (${allReviews.length})`
     - `Ulasan Toko (${effectiveStoreReviews.length})`
     - `Ulasan Produk (${effectiveProductReviews.length})`
   - Render review cards:
     - Reviewer avatar / initials, name, role, date, star icons.
     - Review badge:
       - If `type === 'store'`: badge `🏪 Ulasan Toko`.
       - If `type === 'product'`: product pill with thumbnail image and `productName`. If `onSelectProduct` is passed, clicking the pill opens the product.
     - Review comment text.
   - Clean empty states for each tab filter.

#### Step 4: Seller Dashboard (`#ulasan-seller`) Store ID Sanitization
1. **Edit `src/App.tsx`**:
   - In `useEffect` for seller store sync (lines 365-375):
     ```typescript
     if (store?.id) {
       localStorage.setItem('rescuebyte_store_id', store.id);
     }
     ```
2. **Edit `src/app/AppRoutes.tsx`**:
   - In line 346:
     ```typescript
     {activeView === 'view-ulasan' && (
       <SellerReviews storeName={storeName} />
     )}
     ```
     (Remove passing `storeId={storeId}` where `storeId` was `selectedStoreId`).
3. **Edit `src/pages/seller/SellerReviews.tsx`**:
   - Read stored store ID fallback:
     ```typescript
     const storedSellerStoreId = useMemo(() => {
       try {
         return localStorage.getItem('rescuebyte_store_id') || undefined;
       } catch {
         return undefined;
       }
     }, []);
     const effectiveStoreId = propStoreId || storedSellerStoreId || myStore?.id;
     ```

### 5.2 Independent Verification Commands
1. TypeScript compilation check:
   ```powershell
   npm run typecheck
   ```
   *Expected result*: Exit code 0, 0 type errors.
2. Production build check:
   ```powershell
   npm run build
   ```
   *Expected result*: Exit code 0, bundles successfully transformed and rendered.
3. Functional verification conditions:
   - On Seller Dashboard (`#ulasan-seller`):
     - Displays `GET /api/v1/stores/{store_id}/reviews` for the authenticated seller's store.
     - Rating summary cards and distribution bars render real backend data.
   - On Store Detail page (`#toko`):
     - Displays store reviews (`GET /api/v1/stores/{store_id}/reviews`) alongside product reviews (`GET /api/v1/products/{product_id}/reviews`) under `Ulasan Pelanggan`.
     - Filter pills toggle between "Semua Ulasan", "Ulasan Toko", and "Ulasan Produk".
     - Product review cards display product thumbnail and title tags.
