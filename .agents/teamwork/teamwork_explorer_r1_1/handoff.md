# Handoff Report: Requirement R1 — Store Rating Display on Product Detail (#detail-produk)

## 1. Observation

### Target File
- File path: `src/pages/customer/CustomerProductDetail.tsx` (853 lines)
- Target section: Store Header and Store Rating within Card 1 (Main Product Info), lines 409–489.

### Current Implementation & Line Analysis
1. **Rating and Review Count Derivation** (`src/pages/customer/CustomerProductDetail.tsx:83-85`):
   ```typescript
   const rating = product?.rating ?? 0;
   const reviewCount = product?.reviewCount ?? 0;
   const reviewCountNum = typeof reviewCount === 'number' ? reviewCount : Number(reviewCount) || 0;
   ```
   The component currently reads `rating` and `reviewCount` strictly from the `product` prop (`CustomerMysteryBox`).

2. **Rendered Store Rating UI** (`src/pages/customer/CustomerProductDetail.tsx:445-482`):
   ```tsx
   <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
     <div
       role="button"
       tabIndex={0}
       aria-label="Lihat ulasan toko"
       className="flex items-center text-amber-500 cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded select-none"
       onClick={(e) => {
         e.stopPropagation();
         if (onNavigateStore) {
           onNavigateStore(storeName, product?.storeId, 'ulasan-pelanggan');
         } else {
           const query = new URLSearchParams();
           if (storeName) query.set('name', storeName);
           if (product?.storeId) query.set('id', product.storeId);
           query.set('section', 'ulasan-pelanggan');
           window.location.hash = `#toko?${query.toString()}`;
         }
       }}
       ...
     >
       ★ <span className="text-gray-700 font-bold ml-1">{rating > 0 ? rating.toFixed(1) : '-'}</span>
       <span className="text-gray-400 font-normal ml-0.5">
         ({reviewCountNum > 0 ? `${reviewCountNum} ulasan` : 'Belum ada ulasan'})
       </span>
     </div>
     <span className="text-gray-300">•</span>
     <span className="flex items-center text-gray-500">
       {distanceText}
     </span>
   </div>
   ```

3. **Store Profile Resolution** (`src/pages/customer/CustomerProductDetail.tsx:59-75`):
   ```typescript
   useEffect(() => {
     let isCancelled = false;
     getAllStores().then((stores) => {
       if (isCancelled || !stores) return;
       const matched = stores.find(
         (s) =>
           (s.id && product?.storeId && (s.id === product.storeId || product.storeId.includes(s.id))) ||
           (s.name && storeName && s.name.toLowerCase() === storeName.toLowerCase())
       );
       if (matched?.profile_picture_url) {
         setStoreAvatarUrl(matched.profile_picture_url);
       }
     }).catch(() => {});
     return () => {
       isCancelled = true;
     };
   }, [product?.storeId, storeName]);
   ```
   Notice that while `getAllStores()` is called to match the store profile picture (`profile_picture_url`), the resolved store backend ID (`matched.id`) is never saved or used to query store reviews or summary.

4. **Product Model Data in Backend**:
   - Backend endpoint `GET /api/v1/products/{id}` and `GET /api/v1/products` return product catalog information (`name`, `price`, `description`, `total_current_stock`, `store_id`), but do NOT include store aggregate rating or review counts.
   - When users open `#detail-produk` via marketplace selection or hash navigation (`src/app/useHashNavigation.ts:131-150`), `product.rating` and `product.reviewCount` are undefined or 0.

5. **Existing Review Services and Hooks in Codebase**:
   - `src/hooks/useReviews.ts:142-252`: `useStoreReviews(storeId, params, options)` calls both `reviewApi.getStoreReviews(storeId)` and `reviewApi.getStoreSummary(storeId)`. It returns:
     - `averageRating: number` (from `summary.average_rating`, or computed from reviews via `calculateAverageRating(reviews)`).
     - `totalReviews: number` (from `summary.total_reviews`, or `meta?.total_data`, or `reviews.length`).
     - `isLoading: boolean`.
     - `isError: boolean`.
   - `src/pages/customer/CustomerStoreDetail.tsx:156-169`: Uses `useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) })` to dynamically display the store's rating and review count.

---

## 2. Logic Chain

1. **Root Cause**:
   - The Store Header in `CustomerProductDetail.tsx` renders a clickable store rating widget (`role="button" aria-label="Lihat ulasan toko"`).
   - The component relies solely on `product?.rating` and `product?.reviewCount`.
   - Backend product models (`GET /api/v1/products`) do not have embedded store reviews or store rating summary.
   - Consequently, `rating` evaluates to `0` and `reviewCountNum` evaluates to `0`.
   - Line 480 condition `reviewCountNum > 0 ? ... : 'Belum ada ulasan'` resolves to `"Belum ada ulasan"`, and line 478 `{rating > 0 ? rating.toFixed(1) : '-'}` resolves to `'-'`.
   - Result: the UI always displays `★ - (Belum ada ulasan)` regardless of whether the store has actual reviews in the database.

2. **Store ID Resolution Chain**:
   - A product may provide `product.storeId` (which could be a real UUID, e.g. `p.store_id`, or in some mock/demo cases a slug).
   - If accessed directly via URL hash (e.g. `#detail-produk?id=...&storeId=...`), the hash may contain `storeId` or `store_id`.
   - In `CustomerProductDetail`, `getAllStores()` is called on mount. By matching `s.id === storeId` or `s.name.toLowerCase() === storeName.toLowerCase()`, we locate the true backend store entity `matched`.
   - Storing `resolvedStoreId` ensures we have the genuine store UUID.

3. **Data Fetching via `useStoreReviews`**:
   - By invoking `useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) })`, `CustomerProductDetail` initiates a live query to the backend store review endpoints:
     - `GET /api/v1/stores/{store_id}/summary`
     - `GET /api/v1/stores/{store_id}/reviews`
   - If the summary endpoint succeeds, `averageRating` and `totalReviews` come directly from the backend summary.
   - If the summary endpoint returns 0 or is empty, but reviews exist in `getStoreReviews`, `useStoreReviews` calculates `averageRating` from the reviews array and uses `reviews.length`.

4. **Display and Pluralization Logic**:
   - Total reviews count:
     - In Indonesian, the noun "ulasan" is invariant for singular and plural:
       - 1 review: `1 ulasan`
       - >1 reviews: `${count} ulasan`
   - When reviews exist (`displayReviewCount > 0`):
     - Rating: `displayRating.toFixed(1)` (e.g. `5.0`, `4.8`).
     - Count: `(${displayReviewCount} ulasan)`.
     - Full display: `★ 5.0 (1 ulasan)`.
   - When no reviews exist (`displayReviewCount === 0` and not loading):
     - Rating: `-`.
     - Count: `(Belum ada ulasan)`.
     - Full display: `★ - (Belum ada ulasan)`.
   - When loading initially (`isStoreRatingLoading && displayReviewCount === 0`):
     - Rating: `-`.
     - Count: `(Memuat...)`.

5. **Navigation Coordination**:
   - The rating element navigates to `#toko?name=...&id=...&section=ulasan-pelanggan`.
   - Passing `resolvedStoreId || product?.storeId` guarantees that `onNavigateStore` and the fallback hash URL carry the verified store UUID, ensuring `CustomerStoreDetail` matches the correct store and scrolls smoothly to the reviews section.
   - Updating `handleStoreClick` and `activeBoxItem` ensures consistent store ID and rating data across the page and downstream checkout.

---

## 3. Caveats

1. **Initial Mount Timing**:
   - When the page first mounts, `resolvedStoreId` might take a brief tick to resolve if matching via `getAllStores()` by name.
   - During this short window, `isStoreRatingLoading` or fallback ensures the UI does not flicker or break.
2. **Product Review Section Separation**:
   - `CustomerProductDetail.tsx` renders `<ProductReviewsSection productId={product?.id} />` below the product description.
   - This section is for **product-specific reviews** (`GET /api/v1/products/{id}/reviews`).
   - The Store Header under the store name must strictly reflect the **store's rating and reviews** (`GET /api/v1/stores/{storeId}/reviews` / summary). These two are distinct scopes and must not be mixed up.
3. **Antislop Guidelines**:
   - No generic boilerplate AI comments (e.g. `// fetch reviews`, `// update state`).
   - Keep code concise, readable, and consistent with the existing codebase style.

---

## 4. Conclusion & Implementation Strategy

### Concrete Proposed Changes in `src/pages/customer/CustomerProductDetail.tsx`

#### A. Import `useStoreReviews`
At line 11:
```typescript
import { useStoreReviews } from '../../hooks/useReviews';
```

#### B. Maintain `resolvedStoreId` and Hash Query Param Support
Around lines 55–75:
```typescript
  const storeName = product?.storeName || 'Toko Mitra';

  const hashStoreId = useMemo(() => {
    try {
      const rawHash = window.location.hash || '';
      const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : '';
      const params = new URLSearchParams(queryPart);
      return params.get('storeId') || params.get('store_id') || undefined;
    } catch {
      return undefined;
    }
  }, []);

  const [resolvedStoreId, setResolvedStoreId] = useState<string | undefined>(
    product?.storeId || hashStoreId
  );

  const [storeAvatarUrl, setStoreAvatarUrl] = useState<string | null>(() => {
    return product?.storeAvatar || null;
  });

  useEffect(() => {
    if (product?.storeId) {
      setResolvedStoreId(product.storeId);
    } else if (hashStoreId) {
      setResolvedStoreId(hashStoreId);
    }
  }, [product?.storeId, hashStoreId]);

  useEffect(() => {
    let isCancelled = false;
    getAllStores().then((stores) => {
      if (isCancelled || !stores) return;
      const currentId = product?.storeId || hashStoreId;
      const matched = stores.find(
        (s) =>
          (s.id && currentId && (s.id === currentId || currentId.includes(s.id))) ||
          (s.name && storeName && s.name.toLowerCase() === storeName.toLowerCase())
      );
      if (matched) {
        if (matched.id && matched.id !== resolvedStoreId) {
          setResolvedStoreId(matched.id);
        }
        if (matched.profile_picture_url) {
          setStoreAvatarUrl(matched.profile_picture_url);
        }
      }
    }).catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, [product?.storeId, hashStoreId, storeName, resolvedStoreId]);
```

#### C. Call `useStoreReviews` and Compute Store Rating & Count
Around lines 83–88:
```typescript
  const {
    averageRating: storeAverageRating,
    totalReviews: storeTotalReviews,
    isLoading: isStoreRatingLoading,
  } = useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) });

  const displayRating = storeTotalReviews > 0
    ? storeAverageRating
    : (product?.rating && product.rating > 0 ? product.rating : storeAverageRating);

  const displayReviewCount = storeTotalReviews > 0
    ? storeTotalReviews
    : (reviewCountNum > 0 ? reviewCountNum : storeTotalReviews);
```

#### D. Update `handleStoreClick` and `activeBoxItem`
In `handleStoreClick` (lines 177–189):
```typescript
  const handleStoreClick = () => {
    if (onNavigateStore) {
      onNavigateStore(storeName, resolvedStoreId || product?.storeId);
    } else {
      ...
```
In `activeBoxItem` (lines 284–290):
```typescript
    rating: displayRating,
    reviewCount: displayReviewCount,
    storeId: resolvedStoreId || product?.storeId,
    storeAvatar: storeAvatarUrl || product?.storeAvatar,
```

#### E. Update Store Header Rating Display and Navigation Link
At lines 445–482:
```tsx
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Lihat ulasan toko"
                        className="flex items-center text-amber-500 cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetStoreId = resolvedStoreId || product?.storeId;
                          if (onNavigateStore) {
                            onNavigateStore(storeName, targetStoreId, 'ulasan-pelanggan');
                          } else {
                            const query = new URLSearchParams();
                            if (storeName) query.set('name', storeName);
                            if (targetStoreId) query.set('id', targetStoreId);
                            query.set('section', 'ulasan-pelanggan');
                            window.location.hash = `#toko?${query.toString()}`;
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            const targetStoreId = resolvedStoreId || product?.storeId;
                            if (onNavigateStore) {
                              onNavigateStore(storeName, targetStoreId, 'ulasan-pelanggan');
                            } else {
                              const query = new URLSearchParams();
                              if (storeName) query.set('name', storeName);
                              if (targetStoreId) query.set('id', targetStoreId);
                              query.set('section', 'ulasan-pelanggan');
                              window.location.hash = `#toko?${query.toString()}`;
                            }
                          }
                        }}
                      >
                        ★ <span className="text-gray-700 font-bold ml-1">
                          {displayRating > 0 ? displayRating.toFixed(1) : '-'}
                        </span>
                        <span className="text-gray-400 font-normal ml-0.5">
                          {isStoreRatingLoading && displayReviewCount === 0
                            ? '(Memuat...)'
                            : displayReviewCount > 0
                            ? `(${displayReviewCount} ulasan)`
                            : '(Belum ada ulasan)'}
                        </span>
                      </div>
```

---

## 5. Verification Method

1. **Type Check**:
   ```bash
   npm run typecheck
   ```
   Must exit with code 0 and no TypeScript diagnostic errors.

2. **Production Build**:
   ```bash
   npm run build
   ```
   Must compile cleanly without errors or bundle warnings.

3. **Runtime Verification**:
   - Navigate to `#marketplace`.
   - Select a product from a store that has reviews (e.g. Toko Rejak).
   - Observe `#detail-produk`:
     - Under the store name, the rating displays the actual average rating (e.g. `★ 5.0`) and review count (e.g. `(1 ulasan)`), rather than falling back to `★ - (Belum ada ulasan)`.
     - Click the rating or review count; verify it navigates to `#toko?name=...&id=...&section=ulasan-pelanggan` and scrolls directly to the store reviews.
   - Select a product from a store without reviews:
     - Under the store name, verify it displays `★ - (Belum ada ulasan)`.
   - Check direct hash navigation: open `#detail-produk?id=<productId>` in the browser URL and verify the store rating loads dynamically.
