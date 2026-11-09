## 2026-11-09T10:32:52Z

Fix store rating display on Product Detail, update order history action buttons, clean up noisy and redundant toasts, and set default marketplace sorting to closest location in the RescueByte frontend web application. Apply antislop rules during the work.

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
Integrity mode: development

## Requirements

### R1. Store Rating Display on Product Detail (#detail-produk)
In `CustomerProductDetail.tsx`, fetch and display the store's real rating and review count from the backend (via store summary or `useStoreReviews`) under the store name (e.g. `★ 5.0 (1 ulasan)`) instead of falling back to "Belum ada ulasan" when reviews exist.

### R2. Order History Actions (#pesanan-saya)
In `CustomerOrderHistory.tsx`:
- Remove the "Beri Ulasan" button from all order cards.
- Always provide a functional "Lihat Detail" button on all order cards across all order statuses (including "selesai" / completed) so the user can navigate to the order detail page (`#detail-pesanan`).

### R3. Notification and Toast Cleanup
Clean up noisy and redundant toast notifications across the codebase:
- Remove noise toasts that notify about opening external clients (e.g. "Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.").
- Deduplicate or prevent stacked location permission error toasts (e.g. duplicate "Izin lokasi belum diberikan, default: Malang" warnings stacking on top of each other).
- Preserve standard user feedback toasts (such as cart updates, order placements, or explicit critical operations).

### R4. Marketplace Default Filter/Sort
In `CustomerMarketplace.tsx`, change the default sort/filter option to "Lokasi Terdekat" (nearest location/distance) instead of "Jam Ambil Paling Awal".

## Verification Resources
- `npm run typecheck`
- `npm run build`

## Acceptance Criteria

### Product Detail Store Rating
- [ ] On `#detail-produk`, when the store has reviews, the rating and review count under the store name display the actual numerical rating and review count (e.g. `★ 5.0 (1 ulasan)`) rather than "Belum ada ulasan".

### Order History Actions
- [ ] No "Beri Ulasan" button appears on any order cards in `#pesanan-saya`.
- [ ] A "Lihat Detail" button appears on completed ("selesai") order cards and successfully routes to `#detail-pesanan`.
- [ ] "Lihat Detail" remains present and functional across all other order statuses.

### Toast Notifications
- [ ] The "Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu." toast is removed.
- [ ] Location permission error toast is deduplicated and does not display multiple stacked instances when location permission is unavailable.
- [ ] Standard operational feedback toasts (cart, actions) remain intact.

### Marketplace Sorting
- [ ] On `#marketplace` (`CustomerMarketplace.tsx`), the default active sort option is "Lokasi Terdekat".

### Build & Type Verification
- [ ] `npm run typecheck` exits with 0 errors.
- [ ] `npm run build` exits with 0 errors.
