# Scope: RescueByte UI & Behavior Fixes (R1-R4)

## Architecture
- Client-side React + TypeScript + Vite + Tailwind CSS.
- RescueByte customer views and shared UI hooks/components.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | R1: Store Rating on Product Detail | In `CustomerProductDetail.tsx`, fetch and display the store's real rating and review count from backend (e.g. `★ 5.0 (1 ulasan)`) instead of "Belum ada ulasan" when reviews exist. | M1 | ORIGINAL_REQUEST § R1 | DONE |
| 2 | R2: Order History Actions | In `CustomerOrderHistory.tsx`, remove "Beri Ulasan" button and always provide a functional "Lihat Detail" button across all order statuses including "selesai". | M1 | ORIGINAL_REQUEST § R2 | DONE |
| 3 | R3: Toast Notification Cleanup | Remove noisy external client toasts (e.g., Gmail opening) and deduplicate/prevent stacked location permission error toasts while preserving normal user feedback toasts. | M1 | ORIGINAL_REQUEST § R3 | DONE |
| 4 | R4: Marketplace Default Sort | In `CustomerMarketplace.tsx`, set default sort/filter option to "Lokasi Terdekat" instead of "Jam Ambil Paling Awal". | M1 | ORIGINAL_REQUEST § R4 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | UI & Notification Fixes (R1-R4) | Implementation of R1, R2, R3, R4 in customer views and toast logic | none | DONE |

## Code Layout
- `src/pages/customer/CustomerProductDetail.tsx` (R1)
- `src/pages/customer/CustomerOrderHistory.tsx` (R2)
- `src/pages/customer/CustomerMarketplace.tsx` (R4, R3)
- `src/features/customer/marketplace/model.ts` (R4)
- `src/pages/customer/CustomerContact.tsx` (R3)
- `src/pages/customer/CustomerHome.tsx` (R3)
- `src/context/ToastContext.tsx` (R3)
- `src/App.tsx` (R3)
