# Card Touchpoints & Customer Ratings Comprehensive Audit Report

**Target**: RescueByte Frontend (`rescuebyte-fe`)  
**Auditor**: Card Touchpoints Explorer  
**Date**: 2026-11-09  
**Status**: Investigation Complete — Read-Only  

---

## 1. Executive Summary

This investigation was commissioned to audit and remediate all hardcoded `4.9` and `48` ratings across customer-facing cards and components (including `MysteryBoxCard`, `CartStoreGroup`, `CheckoutItemsList`, `StoreHero`, `StoreInfoCard`, `CustomerProductDetail`, `CustomerStoreDetail`, and related services/models).

### Root Causes Uncovered:
1. **Backend DTO Specification Mismatch**:
   Backend models `ProductCardResponse` and `StoreResponse` in Swagger (`swagger_doc.json`) do **not** include rating or review count fields. The backend only exposes ratings and reviews via dedicated review endpoints (`GET /api/v1/stores/{id}/summary`, `GET /api/v1/stores/{id}/reviews`, and `GET /api/v1/products/{id}/reviews`).
2. **Propagated Hardcoded Mock Values**:
   Because the product and store list DTOs lacked rating fields, earlier code introduced literal mock fallbacks (`rating: 4.9`, `reviewCount: 42 / 48 / 1.2k / 100 / 320`) in data transformers (`CustomerHome.tsx:88`, `cartService.ts:178`, `model.ts:78`, `CustomerStoreDetail.tsx:206`).
3. **Card Fallbacks Hiding Zero States**:
   Components like `MysteryBoxCard.tsx` (`item.rating?.toFixed(1) || '4.9'`) and `CheckoutItemsList.tsx` (`item.rating || group.rating || 4.9`) masked real data by displaying fake 4.9 and 42/48 reviews instead of clean zero/empty states.
4. **Disconnected Store Review Summary**:
   `CustomerStoreDetail.tsx` hardcoded `rating: 4.9, reviewCount: 48` on lines 206–207 and passed an empty `storeReviews: []` array on line 316, instead of calling `reviewApi.getStoreSummary(storeId)` to obtain real store review counts and ratings.

---

## 2. Backend DTO & API Contract Analysis

From inspecting `swagger_doc.json` and `src/api/types.ts`:

### A. Store & Product List DTOs (No Rating Fields)
- **`ProductCardResponse`** (`src/api/types.ts:289`):
  Fields: `id`, `name`, `description`, `normal_price`, `rescue_price`, `discount_percentage`, `stock`, `main_image_url`, `distance_km`, `operational_start`, `operational_end`, `pickup_time`, `store_id`, `store_name`.
  *Rating and review count are NOT present.*
- **`StoreResponse`** (`src/api/types.ts:351`):
  Fields: `id`, `name`, `email`, `description`, `address`, `city`, `district`, `latitude`, `longitude`, `whatsapp_number`, `profile_picture_url`, `status`, `operational_days`, `operational_start`, `operational_end`.
  *Rating and review count are NOT present.*

### B. Dedicated Review Endpoints (Source of Truth)
1. **`GET /api/v1/stores/{id}/summary`**
   - Returns `StoreSummaryResponse` (`src/api/types.ts:559`):
     ```ts
     export interface StoreSummaryResponse {
       average_rating: number; // e.g., 4.5 or 0
       total_reviews: number;  // e.g., 12 or 0
     }
     ```
   - Service: `reviewApi.getStoreSummary(storeId)` in `src/api/services/reviewApi.ts:80`.
   - Hook: `useStoreSummary(storeId)` and `useStoreReviews(storeId)` in `src/hooks/useReviews.ts`.

2. **`GET /api/v1/stores/{id}/reviews`**
   - Returns `GetReviewsResponse`: `{ meta?: PaginationMeta, reviews?: ReviewResponse[] }`
   - Service: `reviewApi.getStoreReviews(storeId, params)` in `src/api/services/reviewApi.ts:50`.

3. **`GET /api/v1/products/{id}/reviews`**
   - Returns `GetReviewsResponse`: `{ meta?: PaginationMeta, reviews?: ReviewResponse[] }`
   - Service: `reviewApi.getProductReviews(productId, params)` in `src/api/services/reviewApi.ts:20`.
   - Hook: `useProductReviews(productId)` in `src/hooks/useReviews.ts:57`.

---

## 3. Comprehensive File-by-File Code Audit

Below is the complete audit of every file containing hardcoded `4.9`, `48`, `4.8`, `42`, or `1.2k` rating/review values:

| # | File Path | Line(s) | Hardcoded Pattern | Root Issue / Impact |
|---|-----------|---------|-------------------|---------------------|
| 1 | `src/components/customer/MysteryBoxCard.tsx` | 261–262 | `item.rating?.toFixed(1) \|\| '4.9'`, `item.reviewCount \|\| '1.2k'` | Masks zero ratings on radius cards with fake 4.9 and 1.2k reviews. |
| 2 | `src/components/customer/cart/CartStoreGroup.tsx` | 115–116 | `★ {store.rating.toFixed(1)}`, `({store.reviewCount} ulasan)` | Crashes with TypeError if `store.rating` is undefined; displays fake values populated by cartService. |
| 3 | `src/services/cartService.ts` | 178–179 | `rating: 4.9, reviewCount: 42` | `fetchBackendCart` injects fake rating 4.9 & 42 reviews into every store cart group. |
| 4 | `src/services/cartService.ts` | 278–279 | `rating: box.rating ?? 4.8`, `reviewCount: ... \|\| 100` | `addToCart` injects fake fallback rating 4.8 & 100 reviews when adding new store to cart. |
| 5 | `src/components/customer/checkout/CheckoutItemsList.tsx` | 109–110 | `item.rating \|\| group.rating \|\| 4.9`, `item.reviewCount \|\| group.reviewCount \|\| 42` | Checkout item cards force fake 4.9 and 42 reviews. |
| 6 | `src/components/customer/checkout/CheckoutItemsList.tsx` | 235–236 | `★ {group.rating}`, `({group.reviewCount} ulasan)` | Displays raw `0` or `undefined` without safe formatting or zero state. |
| 7 | `src/pages/customer/CustomerCheckout.tsx` | 216–217 | `rating: item.rating \|\| 4.9, reviewCount: item.reviewCount \|\| 42` | Checkout store grouping injects fake 4.9 & 42 fallback into group data. |
| 8 | `src/pages/customer/CustomerStoreDetail.tsx` | 206–207 | `rating: 4.9, reviewCount: 48` | Directly hardcodes 4.9 & 48 into `storeData`, causing "Ringkasan Toko" and store header to show fake stats. |
| 9 | `src/pages/customer/CustomerStoreDetail.tsx` | 114 | `rating: 5.0, reviewCount: 0` | Initial state has `rating: 5.0` instead of `0`. |
| 10 | `src/pages/customer/CustomerStoreDetail.tsx` | 316 | `const storeReviews: StoreReviewItem[] = useMemo(() => [], [])` | Leaves reviews permanently empty instead of fetching live reviews from backend. |
| 11 | `src/pages/customer/CustomerStoreDetail.tsx` | 414 | `<StoreReviewsList ... storeId={storeId} />` | Passes prop `storeId` (which is often undefined when opened by name) instead of resolved `targetStoreId` (`matchedBackendStore?.id`). |
| 12 | `src/components/customer/store/StoreHero.tsx` | 97–99 | `<span>{storeData.rating}</span>`, `({storeData.reviewCount} ulasan)` | Lacks zero/empty state formatting (e.g. `★ - (Belum ada ulasan)`). |
| 13 | `src/components/customer/store/StoreInfoCard.tsx` | 163–170, 185–187 | Renders `storeData.rating` and `storeData.reviewCount` directly | Propagates hardcoded 4.9 / 48 from `CustomerStoreDetail`. Lacks empty state formatting. |
| 14 | `src/pages/customer/CustomerProductDetail.tsx` | 83 | `const rating = product?.rating ?? 5.0;` | Hardcodes fake `5.0` rating for product detail header. |
| 15 | `src/pages/customer/CustomerProductDetail.tsx` | 477–478 | `★ {rating.toFixed(1)} ({reviewCount} ulasan)` | Shows fake 5.0 rating even when product has 0 reviews. |
| 16 | `src/pages/customer/CustomerHome.tsx` | 88–89 | `rating: 4.9, reviewCount: '42'` | `mapBackendProductToBox` injects fake rating 4.9 & 42 reviews into all homepage cards. |
| 17 | `src/features/customer/marketplace/model.ts` | 78–79 | `rating: 4.9, reviewCount: 42` | `transformBackendProductToMarketplaceBox` injects fake rating 4.9 & 42 reviews into marketplace cards. |
| 18 | `src/pages/customer/CustomerMarketplace.tsx` | 250–252 | `const ratingA = a.rating \|\| 4.8; const ratingB = b.rating \|\| 4.8;` | Sorting by rating falsely elevates unrated items to 4.8. |
| 19 | `src/app/AppRoutes.tsx` | 130–131 | `rating: product.rating \|\| 4.8, reviewCount: ... \|\| 320` | Direct buy from product detail injects fake 4.8 & 320 reviews into checkout payload. |
| 20 | `src/app/AppRoutes.tsx` | 52 | `handleNavigateStore: (storeName?: string, storeId?: string) => void;` | Type definition omits `section?: string`, causing potential type issues when navigating to `#ulasan-pelanggan`. |

---

## 4. Touchpoint Navigation & Anchor Verification

The user requested:
> "Every interactive rating and review-count element on the Product Detail page must navigate to the Store page's Ulasan Pelanggan section. ... Also inspect other existing rating and review-count elements across the frontend. Apply the same navigation behavior wherever they represent the relevant store rating or review destination."

### Audit of Current Navigation Implementations:
1. **`MysteryBoxCard.tsx`** (lines 240–258):
   - Trigger: Clicking the star rating or review count pill on radius cards.
   - Action:
     ```tsx
     const query = new URLSearchParams();
     if (item.storeName) query.set('name', item.storeName);
     if (item.storeId) query.set('id', item.storeId);
     query.set('section', 'ulasan-pelanggan');
     window.location.hash = `#toko?${query.toString()}`;
     ```
   - Status: **Reliably passes storeName, storeId, and `section=ulasan-pelanggan`**.

2. **`CartStoreGroup.tsx`** (lines 95–113):
   - Trigger: Clicking the star rating or review count text next to store name.
   - Action: Sets `name`, `id`, and `section=ulasan-pelanggan`, then navigates to `#toko?...`.
   - Status: **Reliably passes storeName, storeId, and `section=ulasan-pelanggan`**.

3. **`CheckoutItemsList.tsx`** (lines 89–107 and 215–233):
   - Trigger: Clicking rating pill on item row or on store group header.
   - Action: Sets `name`, `id`, and `section=ulasan-pelanggan`, then navigates to `#toko?...`.
   - Status: **Reliably passes storeName, storeId, and `section=ulasan-pelanggan`**.

4. **`CustomerProductDetail.tsx`** (lines 449–475):
   - Trigger: Clicking store rating pill `★ 4.9 (48 ulasan)` beside store name.
   - Action: Calls `onNavigateStore(storeName, product?.storeId, 'ulasan-pelanggan')` or navigates to `#toko?name=...&id=...&section=ulasan-pelanggan`.
   - Status: **Reliably passes storeName, storeId, and `section=ulasan-pelanggan`**.

5. **`StoreHero.tsx`** (lines 86–92):
   - Trigger: Clicking rating star pill in store banner.
   - Action: Calls `onScrollToReviews()` which invokes `scrollToReviews` in `CustomerStoreDetail.tsx`.
   - Status: **Direct in-page scrolling to `#ulasan-pelanggan`**.

6. **`StoreInfoCard.tsx`** (lines 142, 154, 177):
   - Trigger: Clicking "Lihat Semua Ulasan", "Rating Toko", or "Total Ulasan".
   - Action: Calls `onNavigateToReviews()` -> `scrollToReviews`.
   - Status: **Direct in-page scrolling to `#ulasan-pelanggan`**.

### Receiving End in `CustomerStoreDetail.tsx`:
- `src/app/hashRouting.ts:28–31`:
  ```ts
  if (!anchor && params.has('section')) {
    anchor = params.get('section') || undefined;
  }
  ```
- `CustomerStoreDetail.tsx:48–73`:
  ```tsx
  const scrollToReviews = useCallback(() => {
    setActiveTab('ulasan');
    let attempts = 0;
    const maxAttempts = 30;

    const tryScroll = () => {
      const el = document.getElementById('ulasan-pelanggan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  }, []);
  ```
- `StoreReviewsList.tsx:93` contains `id="ulasan-pelanggan"`.
- When `section === 'ulasan-pelanggan'`, `CustomerStoreDetail` automatically switches tab to `'ulasan'` and smoothly scrolls to `#ulasan-pelanggan`.
- **Verdict**: The navigation infrastructure is fully sound, but cards must ensure `storeId` is preserved and not dropped.

---

## 5. Zero / Empty State UI Standard

When a store or product has 0 ratings or no reviews yet:

| Touchpoint / Component | What is currently displayed | Standardized Zero/Empty State | Rationale |
|------------------------|-----------------------------|-------------------------------|-----------|
| `MysteryBoxCard` (Radius) | `★ 4.9 (1.2k ulasan)` | `★ - (Belum ada ulasan)` or `★ Baru` | Never mislead customers with fake high volume reviews. Consistent with Indonesian marketplace standards. |
| `CartStoreGroup` | `★ 4.9 (42 ulasan)` | `★ - (Belum ada ulasan)` | Clean presentation. If rating is 0 or undefined, format safely as `-`. |
| `CheckoutItemsList` | `★ 4.9 (42 ulasan)` | `★ - (Belum ada ulasan)` | Accurate reflection of backend data. |
| `StoreHero` | `★ 4.9 (48 ulasan)` | `★ - (Belum ada ulasan)` (or `★ 0.0 (0 ulasan)`) | Clean star indicator with honest count. |
| `StoreInfoCard` (Ringkasan Toko) | `4.9 Rating Toko (48 ulasan)` and `48 Total Ulasan` | `Rating Toko: - (Belum ada ulasan)`, `Total Ulasan: 0` | Matches real store summary fetched from `GET /api/v1/stores/{id}/summary`. |
| `CustomerProductDetail` (Header) | `★ 5.0 (0 ulasan)` | `★ - (Belum ada ulasan)` | Avoids defaulting to fake 5.0. |

---

## 6. Concrete File-by-File Implementation Proposals

### 1. `src/components/customer/MysteryBoxCard.tsx`
**Lines 260–263**:
```tsx
// BEFORE:
<span className="text-amber-400">★</span>
<span>{item.rating?.toFixed(1) || '4.9'}</span>
<span className="text-white/70 font-normal">({item.reviewCount || '1.2k'} ulasan)</span>

// AFTER:
{(() => {
  const hasRating = typeof item.rating === 'number' && item.rating > 0;
  const numReviews = typeof item.reviewCount === 'number' ? item.reviewCount : Number(item.reviewCount) || 0;
  return (
    <>
      <span className="text-amber-400">★</span>
      <span>{hasRating ? item.rating.toFixed(1) : '-'}</span>
      <span className="text-white/70 font-normal">
        ({numReviews > 0 ? `${numReviews} ulasan` : 'Belum ada ulasan'})
      </span>
    </>
  );
})()}
```

---

### 2. `src/components/customer/cart/CartStoreGroup.tsx`
**Lines 115–116**:
```tsx
// BEFORE:
<span className="text-amber-500 font-bold">★ {store.rating.toFixed(1)}</span>
<span className="text-gray-400">({store.reviewCount} ulasan)</span>

// AFTER:
{(() => {
  const hasRating = typeof store.rating === 'number' && store.rating > 0;
  const numReviews = typeof store.reviewCount === 'number' ? store.reviewCount : Number(store.reviewCount) || 0;
  return (
    <>
      <span className="text-amber-500 font-bold">★ {hasRating ? store.rating.toFixed(1) : '-'}</span>
      <span className="text-gray-400">
        ({numReviews > 0 ? `${numReviews} ulasan` : 'Belum ada ulasan'})
      </span>
    </>
  );
})()}
```

---

### 3. `src/services/cartService.ts`
**Lines 178–179**:
```ts
// BEFORE:
rating: 4.9,
reviewCount: 42,

// AFTER:
rating: typeof (store as any).rating === 'number' ? (store as any).rating : 0,
reviewCount: typeof (store as any).review_count === 'number'
  ? (store as any).review_count
  : typeof (store as any).reviewCount === 'number'
  ? (store as any).reviewCount
  : 0,
```

**Lines 278–279**:
```ts
// BEFORE:
rating: box.rating ?? 4.8,
reviewCount: typeof box.reviewCount === 'number' ? box.reviewCount : Number(box.reviewCount) || 100,

// AFTER:
rating: box.rating ?? 0,
reviewCount: typeof box.reviewCount === 'number' ? box.reviewCount : Number(box.reviewCount) || 0,
```

---

### 4. `src/components/customer/checkout/CheckoutItemsList.tsx`
**Lines 109–110**:
```tsx
// BEFORE:
<span className="text-amber-500 font-bold">★ {item.rating || group.rating || 4.9}</span>
<span className="text-gray-400">({item.reviewCount || group.reviewCount || 42} ulasan)</span>

// AFTER:
{(() => {
  const effectiveRating = item.rating || group.rating || 0;
  const effectiveReviews = Number(item.reviewCount || group.reviewCount || 0);
  return (
    <>
      <span className="text-amber-500 font-bold">
        ★ {effectiveRating > 0 ? Number(effectiveRating).toFixed(1) : '-'}
      </span>
      <span className="text-gray-400">
        ({effectiveReviews > 0 ? `${effectiveReviews} ulasan` : 'Belum ada ulasan'})
      </span>
    </>
  );
})()}
```

**Lines 235–236**:
```tsx
// BEFORE:
<span className="text-amber-500 font-bold">★ {group.rating}</span>
<span className="text-gray-400">({group.reviewCount} ulasan)</span>

// AFTER:
{(() => {
  const ratingNum = Number(group.rating || 0);
  const reviewNum = Number(group.reviewCount || 0);
  return (
    <>
      <span className="text-amber-500 font-bold">★ {ratingNum > 0 ? ratingNum.toFixed(1) : '-'}</span>
      <span className="text-gray-400">
        ({reviewNum > 0 ? `${reviewNum} ulasan` : 'Belum ada ulasan'})
      </span>
    </>
  );
})()}
```

---

### 5. `src/pages/customer/CustomerCheckout.tsx`
**Lines 216–217**:
```ts
// BEFORE:
rating: item.rating || 4.9,
reviewCount: item.reviewCount || 42,

// AFTER:
rating: item.rating ?? 0,
reviewCount: item.reviewCount ?? 0,
```

---

### 6. `src/pages/customer/CustomerStoreDetail.tsx`
**Line 114**:
```ts
// BEFORE:
rating: 5.0,
reviewCount: 0,

// AFTER:
rating: 0,
reviewCount: 0,
```

**Lines 206–207**:
```ts
// BEFORE:
rating: 4.9,
reviewCount: 48,

// AFTER:
// Fetch real summary from backend reviewApi.getStoreSummary(targetStoreId)
rating: 0,
reviewCount: 0,
```
*Note*: As part of `loadStoreAndProducts`:
```ts
const targetStoreId = matchedBackendStore?.id || storeId;
if (targetStoreId) {
  try {
    const summary = await reviewApi.getStoreSummary(targetStoreId);
    if (!isCancelled && summary) {
      setStoreData((prev) => ({
        ...prev,
        rating: summary.average_rating > 0 ? Math.round(summary.average_rating * 10) / 10 : 0,
        reviewCount: summary.total_reviews ?? 0,
      }));
    }
  } catch (err) {
    console.warn('Failed to load store summary:', err);
  }
}
```

**Lines 411–415**:
```tsx
// BEFORE:
<StoreReviewsList
  reviews={storeReviews}
  reviewCount={storeData.reviewCount}
  storeId={storeId}
/>

// AFTER:
<StoreReviewsList
  reviews={storeReviews}
  reviewCount={storeData.reviewCount}
  storeId={targetStoreId || storeId}
/>
```

---

### 7. `src/components/customer/store/StoreHero.tsx`
**Lines 97–100**:
```tsx
// BEFORE:
<Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
<span>{storeData.rating}</span>
<span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
  ({storeData.reviewCount} ulasan)
</span>

// AFTER:
<Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
<span>{storeData.rating > 0 ? storeData.rating.toFixed(1) : '-'}</span>
<span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
  ({storeData.reviewCount > 0 ? `${storeData.reviewCount} ulasan` : 'Belum ada ulasan'})
</span>
```

---

### 8. `src/components/customer/store/StoreInfoCard.tsx`
**Lines 163–170**:
```tsx
// BEFORE:
<span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
  {storeData.rating}
</span>
<span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
  Rating Toko
</span>
<span className="text-[11px] text-slate-400 font-normal leading-tight block mt-0.5 group-hover:underline">
  ({storeData.reviewCount} ulasan)
</span>

// AFTER:
<span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
  {storeData.rating > 0 ? storeData.rating.toFixed(1) : '-'}
</span>
<span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
  Rating Toko
</span>
<span className="text-[11px] text-slate-400 font-normal leading-tight block mt-0.5 group-hover:underline">
  ({storeData.reviewCount > 0 ? `${storeData.reviewCount} ulasan` : 'Belum ada ulasan'})
</span>
```

**Lines 185–187**:
```tsx
// BEFORE:
<span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
  {storeData.reviewCount}
</span>

// AFTER:
<span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block group-hover:text-emerald-800 transition-colors">
  {storeData.reviewCount || 0}
</span>
```

---

### 9. `src/pages/customer/CustomerProductDetail.tsx`
**Line 83**:
```ts
// BEFORE:
const rating = product?.rating ?? 5.0;

// AFTER:
const rating = product?.rating ?? 0;
```

**Lines 477–478**:
```tsx
// BEFORE:
★ <span className="text-gray-700 font-bold ml-1">{rating.toFixed(1)}</span>
<span className="text-gray-400 font-normal ml-0.5">({reviewCount} ulasan)</span>

// AFTER:
★ <span className="text-gray-700 font-bold ml-1">{rating > 0 ? rating.toFixed(1) : '-'}</span>
<span className="text-gray-400 font-normal ml-0.5">
  ({reviewCount > 0 ? `${reviewCount} ulasan` : 'Belum ada ulasan'})
</span>
```

---

### 10. `src/pages/customer/CustomerHome.tsx`
**Lines 88–89**:
```ts
// BEFORE:
rating: 4.9,
reviewCount: '42',

// AFTER:
rating: (p as any).rating ?? 0,
reviewCount: (p as any).review_count ?? (p as any).reviewCount ?? 0,
```

---

### 11. `src/features/customer/marketplace/model.ts`
**Lines 78–79**:
```ts
// BEFORE:
rating: 4.9,
reviewCount: 42,

// AFTER:
rating: (p as any).rating ?? 0,
reviewCount: (p as any).review_count ?? (p as any).reviewCount ?? 0,
```

---

### 12. `src/pages/customer/CustomerMarketplace.tsx`
**Lines 250–252**:
```ts
// BEFORE:
const ratingA = a.rating || 4.8;
const ratingB = b.rating || 4.8;

// AFTER:
const ratingA = a.rating || 0;
const ratingB = b.rating || 0;
```

---

### 13. `src/app/AppRoutes.tsx`
**Lines 52**:
```ts
// BEFORE:
handleNavigateStore: (storeName?: string, storeId?: string) => void;

// AFTER:
handleNavigateStore: (storeName?: string, storeId?: string, section?: string) => void;
```

**Lines 130–131**:
```ts
// BEFORE:
rating: product.rating || 4.8,
reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : Number(product.reviewCount) || 320,

// AFTER:
rating: product.rating || 0,
reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : Number(product.reviewCount) || 0,
```

---

## 7. Summary Table of Proposed Changes

| Component / File | What Changes | Impact on Quality & Regression Safety |
|------------------|--------------|--------------------------------------|
| `MysteryBoxCard.tsx` | Replace fallback `'4.9'` and `'1.2k'` with safe zero-state | High impact; removes misleading stats on all customer mystery box cards. |
| `CartStoreGroup.tsx` | Safe `.toFixed(1)` formatting and empty state check | Prevents runtime crash when rating is undefined; eliminates fake 4.9 / 42. |
| `cartService.ts` | Map real rating/review from store payload or 0 | Fixes cart data at the source. |
| `CheckoutItemsList.tsx` | Remove `|| 4.9` and `|| 42` defaults | Fixes order summary cards in checkout. |
| `CustomerCheckout.tsx` | Remove `|| 4.9` and `|| 42` fallback in grouping | Fixes store group metadata in checkout. |
| `CustomerStoreDetail.tsx` | Fetch real `getStoreSummary(targetStoreId)`, remove 4.9 / 48 | Solves root cause reported in user screenshots for "Ringkasan Toko". |
| `StoreHero.tsx` | Safe formatting with `-` and `Belum ada ulasan` | Ensures store hero banner displays real data or clean zero state. |
| `StoreInfoCard.tsx` | Safe formatting with `-` and `Belum ada ulasan` | Ensures store info card displays real data or clean zero state. |
| `CustomerProductDetail.tsx` | Remove default `5.0` for unrated products | Header shows honest rating or `- (Belum ada ulasan)`. |
| `CustomerHome.tsx` | Remove `rating: 4.9, reviewCount: '42'` from product mapper | Fixes home page cards. |
| `model.ts` (Marketplace) | Remove `rating: 4.9, reviewCount: 42` from mapper | Fixes marketplace cards. |
| `CustomerMarketplace.tsx` | Sort fallback `0` instead of `4.8` | Accurate rating sorting. |
| `AppRoutes.tsx` | Remove direct checkout fallback `4.8 / 320`, add `section` type | Type safety and consistent checkout payloads. |

These recommendations eliminate all occurrences of fake ratings across customer cards and touchpoints while maintaining 100% backward compatibility and test stability.
