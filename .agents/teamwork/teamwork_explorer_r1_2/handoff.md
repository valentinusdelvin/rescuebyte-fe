# Handoff Report: Investigation for Requirements R2 and R4

- **Task**: Investigation for Requirement R2 (Order History Actions) and Requirement R4 (Marketplace Default Filter/Sort)
- **Investigator**: Teamwork Explorer (Agent teamwork_explorer_r1_2)
- **Status**: Completed (Hard Handoff)
- **Date**: 2026-11-09T10:42:00Z

---

## 1. Observation

### 1.1 Requirement R2: Order History Actions (`#pesanan-saya`)
**Target File**: `src/pages/customer/CustomerOrderHistory.tsx`

1. **Action Buttons Container (Lines 647-677)**:
```tsx
{/* Actions */}
<div className="flex items-center gap-2 w-full lg:w-auto justify-end">
  {order.status === 'selesai' ? (
    <>
      <button
        type="button"
        onClick={() => (onNavigateStore ? onNavigateStore(order.storeName) : onNavigateMarketplace?.())}
        className="bg-[#1b1c1c] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>Beli Lagi</span>
      </button>
      <button
        type="button"
        onClick={() => handleOpenReview(order)}
        className="border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
      >
        <Star className="w-3.5 h-3.5 text-amber-500" />
        <span>Beri Ulasan</span>
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={() => handleOpenOrderDetail(order)}
      className="border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
    >
      <span>Lihat Detail</span>
      <ExternalLink className="w-3 h-3 text-slate-400" />
    </button>
  )}
</div>
```
- **Observed Behavior**:
  - When `order.status === 'selesai'`: The component renders a "Beli Lagi" button and a "Beri Ulasan" button. The "Lihat Detail" button is placed strictly in the `else` branch, meaning **"Lihat Detail" is completely hidden for completed orders**.
  - When `order.status !== 'selesai'`: Only "Lihat Detail" is rendered.
  - Clicking "Beri Ulasan" opens an isolated local modal (`isReviewOpen = true`) that mocks review submission via `setTimeout` (lines 275-279) and does not call any backend API endpoints.

2. **Order Detail Navigation (`handleOpenOrderDetail`, Lines 156-215)**:
  - Invokes `onNavigateOrderDetail(order.orderData)` if present, or synthesizes a `PaymentOrderData` preserving `status: order.status`, `backendOrderId: order.id`, and `orderId: order.orderNumber`.
  - In `src/app/AppRoutes.tsx` (lines 194-197), `onNavigateOrderDetail` sets `paymentOrderData` and transitions to `view-customer-order-detail` (`#detail-pesanan`).
  - In `src/pages/customer/CustomerOrderDetail.tsx`, when `orderData.status === 'selesai'`, the real backend-connected review card ("Bagaimana Pengalamanmu? Beri Ulasan Sekarang") is rendered, submitting dual reviews to `/api/v1/stores/{store_id}/reviews` and `/api/v1/products/{product_id}/reviews`.

3. **Dead Review Code in `CustomerOrderHistory.tsx`**:
  - Line 8: `Star` import from `lucide-react` (only used in the "Beri Ulasan" button and the local review modal).
  - Lines 123-129: Unused review state hooks (`isReviewOpen`, `reviewOrder`, `reviewRating`, `reviewText`, `isSubmittingReview`).
  - Lines 265-280: Unused review handlers (`handleOpenReview`, `handleSubmitReview`).
  - Lines 726-818: Review modal dialog JSX (`{isReviewOpen && reviewOrder && (...)}`).

---

### 1.2 Requirement R4: Marketplace Default Filter/Sort (`#marketplace`)
**Target Files**:
- `src/pages/customer/CustomerMarketplace.tsx`
- `src/features/customer/marketplace/model.ts`

1. **Sort State Initialization (`CustomerMarketplace.tsx`, Lines 93-94)**:
```tsx
const [sortField, setSortField] = useState<SortField>('jam_ambil');
const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
```
- **Observed Behavior**: Currently initialized to `'jam_ambil'` (`asc`), which causes the page to default to "Jam Ambil Paling Awal".

2. **Sort Options Definition (`src/features/customer/marketplace/model.ts`, Lines 119-141)**:
```ts
export const SORT_OPTIONS: SortConfig[] = [
  {
    id: 'jam_ambil',
    label: 'Jam Ambil',
    defaultOrder: 'asc',
    ascLabel: 'Paling Awal Pagi / Sore',
    descLabel: 'Paling Akhir Malam',
  },
  {
    id: 'lokasi',
    label: 'Lokasi',
    defaultOrder: 'asc',
    ascLabel: 'Jarak Terdekat mulai 0 km',
    descLabel: 'Jarak Terjauh',
  },
  {
    id: 'ulasan',
    label: 'Ulasan',
    defaultOrder: 'desc',
    ascLabel: 'Rating Terendah',
    descLabel: 'Rating Tertinggi 5.0',
  },
];
```
- Option `id: 'lokasi'` with `asc` corresponds to "Lokasi Terdekat" (`ascLabel: 'Jarak Terdekat mulai 0 km'`).

3. **Sorting Algorithm (`CustomerMarketplace.tsx`, Lines 238-255)**:
```tsx
.sort((a, b) => {
  if (sortField === 'jam_ambil') {
    const timeA = parsePickupMinutes(a.pickupTime);
    const timeB = parsePickupMinutes(b.pickupTime);
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  }
  if (sortField === 'lokasi') {
    const distA = parseFloat(a.distanceText) || 0;
    const distB = parseFloat(b.distanceText) || 0;
    return sortOrder === 'asc' ? distA - distB : distB - distA;
  }
  if (sortField === 'ulasan') {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
  }
  return 0;
});
```

4. **Coordinates & Distance Calculation Prerequisites**:
  - `userCoords` is initialized synchronously:
    ```tsx
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(() => {
      try {
        const saved = localStorage.getItem('rescuebyte_user_coords');
        if (saved) return JSON.parse(saved);
      } catch { }
      return DEFAULT_COORDS;
    });
    ```
  - `DEFAULT_COORDS` is defined in `model.ts` as `{ lat: -7.9526, lng: 112.6146 }` (Malang coordinates). Coordinates are never null or undefined.
  - On mount, `fetchMarketplaceProducts(userCoords)` fetches products via `GET /api/v1/products?latitude=...&longitude=...`.
  - Backend calculates `distance_km`, mapped to `a.distanceText` via `formatDistanceKm` in `src/services/locationService.ts` (returns `0.0 km` if distance is invalid or not provided).
  - `parseFloat(a.distanceText) || 0` is robust against non-numeric or missing distances.
  - If the user denies or delays location permission, `handleRequestLiveLocation` defaults to Malang coordinates, ensuring distances are always available without runtime errors.

---

## 2. Logic Chain

### 2.1 Requirement R2 (Order History Actions)
1. **Separation of Concerns**: Review submission is properly implemented on `#detail-pesanan` (`CustomerOrderDetail.tsx`) where backend endpoints for both store and product reviews are wired up. Having a mock review popup in `#pesanan-saya` creates confusion and bypasses the dual submission pipeline.
2. **Action Availability**: Users must be able to inspect order receipts, verification codes, pickup windows, and access review submission for completed orders. Therefore, the "Lihat Detail" button must be unconditionally rendered on every order card across all statuses.
3. **Repeat Orders ("Beli Lagi")**: Retaining the "Beli Lagi" button alongside "Lihat Detail" on completed orders provides quick convenience to re-visit the store or marketplace while fulfilling the requirement that "Lihat Detail" is always available.
4. **Code Cleanliness**: Removing the "Beri Ulasan" button makes the local review modal and its state hooks entirely unreferenced. Pruning these states, handlers, and the modal JSX eliminates dead code, reduces bundle size, and complies with antislop rules.

### 2.2 Requirement R4 (Marketplace Default Filter/Sort)
1. **Core Sorting State**: The active sort criterion is determined by `sortField`. Changing the initial state in `CustomerMarketplace.tsx` from `useState<SortField>('jam_ambil')` to `useState<SortField>('lokasi')` immediately makes "Lokasi Terdekat" (closest distance first) the default.
2. **Sort Direction**: `sortOrder` is initialized to `'asc'`, which corresponds to `distA - distB` (distance ascending from 0 km upwards).
3. **Graceful Fallback**: Because `userCoords` defaults to `DEFAULT_COORDS` (or cached coords) and `parseFloat(a.distanceText) || 0` returns `0` on any fallback, distance sorting operates deterministically even before live geolocation resolves or when geolocation permission is withheld.
4. **Visual Order in Dropdown**: Reordering `SORT_OPTIONS` in `model.ts` so that `lokasi` is the first element aligns the visual dropdown list order with the default active selection.

---

## 3. Caveats & Edge Cases

1. **R2 - Fallback Navigation**:
   If `CustomerOrderHistory` is rendered without the `onNavigateOrderDetail` prop (e.g. during standalone testing or direct hash access), `handleOpenOrderDetail` should set `window.location.hash = '#detail-pesanan?id=' + (order.id || order.orderNumber)`.
2. **R2 - Mobile Button Stacking**:
   On mobile viewports (< 640px), cards with both "Beli Lagi" and "Lihat Detail" must maintain `flex-wrap` and tap target spacing (`gap-2`) to avoid button overflow.
3. **R4 - Equal Distance Sorting**:
   When multiple products have identical distance (e.g. `0.0 km`), `distA - distB` returns `0`, preserving stable array order.
4. **R4 - Mobile Button Label**:
   The filter row uses a 3-column grid (`grid grid-cols-3`). Keeping the button label as `Lokasi ↑` (derived from `opt.label`) prevents text clipping on narrow mobile viewports (< 360px), while the dropdown description clearly explains `Jarak Terdekat mulai 0 km`.

---

## 4. Conclusion & Implementation Strategy

### Proposed Code Changes

#### File 1: `src/pages/customer/CustomerOrderHistory.tsx`
1. **Remove unused `Star` import (Line 8)**:
```diff
--- a/src/pages/customer/CustomerOrderHistory.tsx
+++ b/src/pages/customer/CustomerOrderHistory.tsx
@@ -5,7 +5,6 @@ import {
   Check,
   CheckCircle2,
   ShoppingBag,
-  Star,
   MapPin,
   ChevronRight,
   ChevronLeft,
```

2. **Add fallback in `handleOpenOrderDetail` (Lines 212-215)**:
```tsx
    if (onNavigateOrderDetail) {
      onNavigateOrderDetail(paymentData);
    } else {
      window.location.hash = `#detail-pesanan?id=${order.id || order.orderNumber}`;
    }
```

3. **Remove dead review modal states and handlers (Lines 123-129 and 265-280)**:
Delete `isReviewOpen`, `reviewOrder`, `reviewRating`, `reviewText`, `isSubmittingReview`, `handleOpenReview`, and `handleSubmitReview`.

4. **Update card actions rendering (Lines 647-677)**:
```tsx
{/* Actions */}
<div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap sm:flex-nowrap">
  {order.status === 'selesai' && (
    <button
      type="button"
      onClick={() => (onNavigateStore ? onNavigateStore(order.storeName) : onNavigateMarketplace?.())}
      className="bg-[#1b1c1c] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
    >
      <ShoppingBag className="w-3.5 h-3.5" />
      <span>Beli Lagi</span>
    </button>
  )}
  <button
    type="button"
    onClick={() => handleOpenOrderDetail(order)}
    className="border border-slate-200 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
  >
    <span>Lihat Detail</span>
    <ExternalLink className="w-3 h-3 text-slate-400" />
  </button>
</div>
```

5. **Remove Review Modal JSX (Lines 726-818)**:
Delete the `{isReviewOpen && reviewOrder && (...)}` block completely.

---

#### File 2: `src/pages/customer/CustomerMarketplace.tsx`
1. **Update default sort state initialization (Line 93)**:
```diff
--- a/src/pages/customer/CustomerMarketplace.tsx
+++ b/src/pages/customer/CustomerMarketplace.tsx
@@ -90,7 +90,7 @@ export function CustomerMarketplace({
   const [minPriceInput, setMinPriceInput] = useState('');
   const [maxPriceInput, setMaxPriceInput] = useState('');
   const [distanceFilter, setDistanceFilter] = useState('semua');
-  const [sortField, setSortField] = useState<SortField>('jam_ambil');
+  const [sortField, setSortField] = useState<SortField>('lokasi');
   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
   const [openDropdown, setOpenDropdown] = useState<'harga' | 'jarak' | 'urutkan' | 'kota' | null>(null);
```

---

#### File 3: `src/features/customer/marketplace/model.ts`
1. **Reorder `SORT_OPTIONS` so 'lokasi' is first (Lines 119-141)**:
```ts
export const SORT_OPTIONS: SortConfig[] = [
  {
    id: 'lokasi',
    label: 'Lokasi',
    defaultOrder: 'asc',
    ascLabel: 'Jarak Terdekat mulai 0 km',
    descLabel: 'Jarak Terjauh',
  },
  {
    id: 'jam_ambil',
    label: 'Jam Ambil',
    defaultOrder: 'asc',
    ascLabel: 'Paling Awal Pagi / Sore',
    descLabel: 'Paling Akhir Malam',
  },
  {
    id: 'ulasan',
    label: 'Ulasan',
    defaultOrder: 'desc',
    ascLabel: 'Rating Terendah',
    descLabel: 'Rating Tertinggi 5.0',
  },
];
```

---

## 5. Verification Method

1. **Static Analysis & Build Verification**:
   - Run `npm run typecheck` to confirm 0 TypeScript compiler errors.
   - Run `npm run build` to verify successful production bundle compilation.

2. **Functional UI Verification — Order History (`#pesanan-saya`)**:
   - Navigate to `#pesanan-saya` (`activeView === 'view-customer-orders'`).
   - Check all status tabs ("Semua Pesanan", "Menunggu Pembayaran", "Menunggu Konfirmasi", "Siap Diambil", "Selesai").
   - Confirm **no "Beri Ulasan" button** appears on any card.
   - Confirm **"Lihat Detail" button is present on cards of all statuses**, including "Selesai".
   - Click "Lihat Detail" on a completed order: confirm it transitions to `#detail-pesanan` with the completed order details, where the user can submit reviews via the dual modal.
   - Click "Beli Lagi" on a completed order: confirm it routes to the store or marketplace.

3. **Functional UI Verification — Marketplace (`#marketplace`)**:
   - Navigate to `#marketplace` (`activeView === 'view-customer-marketplace'`).
   - Confirm the Urutkan button displays "Lokasi ↑" by default upon page load.
   - Open the Urutkan dropdown: confirm "Lokasi" is highlighted with "Jarak Terdekat mulai 0 km".
   - Confirm products are ordered by ascending distance (`0.0 km`, `0.5 km`, `1.2 km`, etc.).
   - Verify that toggling the sort arrow or selecting another option (e.g. "Jam Ambil" or "Ulasan") works properly and can be switched back to "Lokasi".
