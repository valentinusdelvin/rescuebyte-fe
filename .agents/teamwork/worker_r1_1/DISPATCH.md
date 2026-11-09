# Implementation Blueprint: RescueByte Polish & Consistency (R1 - R8)

## Overview
Implement all 8 requirements (R1 - R8) across the RescueByte frontend codebase based on verified findings from Explorers 1, 2, and 3.

---

## 1. R1: Remove Floating Toast Notifications Globally
1. **`src/context/ToastContext.tsx`**:
   - In `ToastProvider`, remove the floating bottom-right container JSX (`<div role="region" aria-label="Notifikasi" className="fixed bottom-6 right-6 ...">...</div>`).
   - Keep `ToastContext.Provider` and functions (`showToast`, `removeToast`, `clearToasts`) as safe no-ops or internal state so existing callers do not fail.
2. **`src/components/common/Toast.tsx` & `src/App.tsx`**:
   - In `src/App.tsx`, remove the `<Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />` mount (line 574).
   - In `src/components/common/Toast.tsx`, export a harmless empty component `() => null` or mark obsolete so unused imports do not break build.
3. **Form-level & Inline Feedback Replacements**:
   - In `src/pages/auth/CustomerAuth.tsx`: Add an inline error banner (`<div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">...</div>`) inside `CustomerLoginForm` and `CustomerRegisterForm` for form validation errors and role mismatch ("Akun ini terdaftar sebagai Mitra Toko...").
   - In `src/pages/seller/BuatDagangan.tsx`: Add an inline error alert banner above the submit button if form fields are incomplete or invalid instead of relying on a floating toast.
   - In `src/pages/customer/CustomerContact.tsx`: Remove the redundant toast at line 76; rely entirely on the existing inline per-field error messages.
   - In `src/hooks/useReviews.ts`: Remove `toastContext.showToast` calls on review mutations.
   - Ensure NO intrusive floating toast appears anywhere on screen.

---

## 2. R2: Remove Irrelevant Role Labels from Review Identity
1. **`src/pages/customer/CustomerHome.tsx`**:
   - In lines 628-630, remove `<span className="text-xs text-gray-500 font-medium">{testi.role}</span>`.
   - In `TESTIMONIALS`, keep data intact or remove role subtitle rendering; display ONLY user name, star rating, and quote.
2. **`src/components/customer/store/StoreReviewsList.tsx`**:
   - In line 306, remove `<span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>`.
   - Render only the reviewer name and avatar.
3. **`src/pages/customer/CustomerStoreDetail.tsx`**:
   - Remove `role: r.author?.role` mapping.

---

## 3. R3: Fix Product Rating Data Consistency
1. **New Centralized Service: `src/services/productRatingService.ts`**:
   - Implement `batchFetchProductRatings(productIds: string[])`:
     - Collect unique IDs, filter out already cached IDs in in-memory `Map<string, { rating: number; reviewCount: number }>`.
     - Fetch `reviewApi.getProductReviews(id, { limit: 100 })` concurrently with `Promise.allSettled`.
     - Calculate `rating` (average rounded to 1 decimal place) and `reviewCount` (`meta.total_data ?? reviews.length`).
     - Cache and return.
   - Implement `getCachedProductRating(productId: string)`.
2. **`src/components/customer/MysteryBoxCard.tsx`**:
   - Remove the `{!isPopular && (` condition wrapping the rating block (lines 233-275).
   - Render star rating and review count across ALL card variants:
     - If `item.reviewCount > 0` and `item.rating > 0`: `★ {item.rating.toFixed(1)} ({item.reviewCount} ulasan)`.
     - If `item.reviewCount === 0`: `★ - (Belum ada ulasan)`.
     - Never incorrectly show "Belum ada ulasan" when reviews exist!
3. **Enrich Products Before Rendering**:
   - In `CustomerHome.tsx`: In `loadBoxes()`, call `batchFetchProductRatings(products.map(p => p.id))` and map items with their actual `rating` and `reviewCount`.
   - In `CustomerMarketplace.tsx`: In `fetchMarketplaceProducts()`, call `batchFetchProductRatings(publicItems.map(p => p.id))` and attach real `rating` and `reviewCount`.

---

## 4. R4: Remove Stock Quantity Badges
1. **`src/components/customer/MysteryBoxCard.tsx`**:
   - Remove lines 122-194 (the visual stock badge overlays "Sisa 0 Box", "Sisa 97 Box", etc.).
   - Keep only the distance pill and discount pill in the top header.
   - Strictly preserve `isOutOfStock` logic and the disabled "Habis" button at lines 323-332.
2. **`src/components/customer/store/StoreDaganganGrid.tsx`**:
   - Remove lines 193-217 (visual stock badges "Sisa X Box"). Keep out-of-stock "Habis" button logic.
3. **`src/pages/customer/CustomerOrderDetail.tsx`**:
   - Remove `Sisa {rec.stock} Box` text in surplus recommendations (line 868).

---

## 5. R5: Homepage Product Display
1. **Desktop 3x2 Grid (6 Products)**:
   - In `src/pages/customer/CustomerHome.tsx`:
     - In `loadBoxes()`, limit both lists to exactly 6 items:
       - `setNearbyBoxes(sortedByDistance.slice(0, 6))`
       - `setBestSellerBoxes(sortedByPopularity.slice(0, 6))`
     - In loading skeletons, update skeleton arrays to 6 items (`Array.from({ length: 6 })`).
     - Layout `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` naturally produces 3 columns x 2 rows on desktop.
2. **Query & Sort**:
   - "Mystery Box di Sekitar": Query with customer current coordinates (`latitude`, `longitude`), sort by `distance_km` ascending, take 6.
   - "Mystery Box Terlaris": Sort by `reviewCount` or popularity/discount descending, take 6.

---

## 6. R6: Marketplace Default Sorting by Nearest Location
1. **`src/pages/customer/CustomerMarketplace.tsx`**:
   - Default sort state: `sortField = 'lokasi'`, `sortOrder = 'asc'`.
   - Store numeric distance `distanceKm: p.distance_km ?? 9999` in `MarketplaceProduct`.
   - In `filteredProducts.sort()` for `sortField === 'lokasi'`:
     ```ts
     const distA = typeof a.distanceKm === 'number' ? a.distanceKm : (parseFloat(a.distanceText) || 9999);
     const distB = typeof b.distanceKm === 'number' ? b.distanceKm : (parseFloat(b.distanceText) || 9999);
     return sortOrder === 'asc' ? distA - distB : distB - distA;
     ```
   - Ensure nearest product (e.g. 0 km, 0.2 km) appears first.
   - Ensure pagination and search/city filters continue to work seamlessly.

---

## 7. R7: Automatic Customer Geolocation
1. **New File: `src/context/LocationContext.tsx`**:
   - Creates `LocationContext` and `LocationProvider`.
   - On mount, automatically request customer geolocation using `navigator.geolocation.getCurrentPosition()` with single-execution startup guard (`hasInitializedStartupGeoRef`).
   - If permissions API query returns `'prompt'` or `'granted'`, prompt position.
   - On success: store coordinates in context and `localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords))`.
   - On error / denied / timeout: fallback gracefully to Malang coordinates (`{ lat: -7.9526, lng: 112.6146 }`), set `permissionStatus = 'denied'`. Do NOT spam error toasts.
   - Provide `requestLocation(force?: boolean)` and `setManualLocation(coords, cityName)` methods.
2. **New File: `src/hooks/useGeolocation.ts`** & update `src/hooks/index.ts`:
   - Convenience hook returning `{ coordinates, isLoading, permissionStatus, selectedCity, requestLocation, setManualLocation }`.
3. **Wrap in `src/main.tsx`**:
   - Add `<LocationProvider>` to root tree.
4. **Integrate into `CustomerHome.tsx` & `CustomerMarketplace.tsx`**:
   - Consume `useGeolocation()`. Automatically reload nearby products when coordinates update.
   - In Marketplace, provide a manual retry/change button in the dropdown.

---

## 8. R8: Automatic Session Logout
1. **`src/context/AuthContext.tsx`**:
   - Parse JWT `exp` claim from `access_token` (`parseJwtExp`).
   - Record login timestamp in `localStorage.setItem('rescuebyte_login_at', String(Date.now()))` upon login/session creation.
   - Enforce 24-hour cap: `MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000`.
   - Effective expiry: `Math.min(tokenExp || maxExp, maxExp)`.
   - Manage a single timer (`sessionTimerId`) to trigger `logout()` when expired.
   - Add listeners for `visibilitychange`, `focus`, and `storage` (cross-tab sync):
     - When tab becomes visible/focused, check `calculateSessionExpiresAt() - Date.now()`. If <= 0, trigger immediate logout.
   - On logout (`clearAuthSession`):
     - Wipe ALL sensitive storage: `access_token`, `refresh_token`, `rescuebyte_auth`, `rescuebyte_login_at`, `rescuebyte_user_role`, `rescuebyte_customer_cart`, `rescuebyte_store_*`, `rescuebyte_selected_store`.
2. **`src/api/client.ts`**:
   - Centralize 401 handling: when 401 occurs and refresh token is absent or refresh fails:
     - Clear all sensitive session data.
     - Dispatch `window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'))`.
3. **`src/App.tsx` & `src/app/useHashNavigation.ts`**:
   - When auth session ends or expires, redirect immediately to `#auth` (`'view-auth-role-selection'` / login page), NOT to `#beranda-customer`.
   - Guard seller protected routes (`#beranda-seller`, `#profil-seller`, etc.): if unauthenticated, redirect to `#auth`.

---

## Verification Requirements
Before submitting your handoff, you MUST run:
1. `npm run typecheck`
2. `npm run build`
3. `npm run lint`
All three must pass with 0 errors. Document exact commands and outputs in `handoff.md`.


## 2026-11-09T11:51:31Z
Received dispatch message:
Role: Worker 1 (Fullstack Implementation Specialist)
Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_r1_1\
Parent conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd
Task: Implement all 8 requirements (R1 - R8) as specified in DISPATCH.md and the Explorer reports.
Verification requirements: npm run typecheck, npm run build, npm run lint all pass with 0 errors.
