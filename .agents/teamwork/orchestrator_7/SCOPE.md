# Scope: RescueByte Frontend Polish & Consistency (R1 - R8)

## Architecture
- React 18 + Vite + TypeScript + Tailwind CSS.
- Centralized services under `src/services/` and `src/hooks/`.
- Customer feature modules under `src/pages/customer/` and `src/features/customer/`.
- Shared UI components under `src/components/common/` and `src/components/customer/`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1: Remove Floating Toasts Globally | Remove bottom-right toast container, obsolete toast components/providers, replace with inline/form feedback | M1 | DISPATCH §R1 |
| 2 | R2: Review Identity Clean Role Labels | Remove role subtitles ("seller", etc.) from reviewer identity cards; show name/avatar only | M1 | DISPATCH §R2 |
| 3 | R3: Product Rating Consistency | Consistent average rating and review counts on Homepage cards, Marketplace, reusable cards without N+1 | M1 | DISPATCH §R3 |
| 4 | R4: Remove Stock Quantity Badges | Remove visual badges ("Sisa 97 Box") from product cards while preserving underlying stock logic | M1 | DISPATCH §R4 |
| 5 | R5: Homepage 6-Product Displays | Exactly 6 cards (3x2 grid) for nearby & best-selling queries using supported Swagger params | M1 | DISPATCH §R5 |
| 6 | R6: Marketplace Default Nearest Sorting | Default to "Lokasi Terdekat" (asc distance), preserving actual coordinates, pagination, and filters | M1 | DISPATCH §R6 |
| 7 | R7: Automatic Customer Geolocation | Prompt geolocation on startup; centralized hook/service; automatic nearby load; manual fallback | M1 | DISPATCH §R7 |
| 8 | R8: Automatic Session Logout | Logout on Bearer token expiration or 24h duration limit; centralized 401 interceptor; route protection | M1 | DISPATCH §R8 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | R1-R8 Complete Implementation | Unified implementation across UI, API consistency, geolocation, auth, and stock parsing fix | none | DONE |

## Code Layout & Boundaries
- Stock parsing & MysteryBox Card: `src/components/customer/MysteryBoxCard.tsx`
- Challenger test suite 1: `scripts/test_challenger_r1_r6.mjs`
- Challenger test suite 2: `scripts/test_challenger_r7_r8.mjs`
- Toasts / Notifications: `src/context/ToastContext.tsx`, `src/App.tsx`, `src/components/common/Toast.tsx`
- Review Identity: `src/components/customer/store/StoreReviewsList.tsx`, `src/components/reviews/ReviewCard.tsx`, `src/pages/customer/CustomerHome.tsx`
- Product Ratings & Badges: `src/services/productRatingService.ts`, `src/components/customer/MysteryBoxCard.tsx`, `src/components/customer/store/StoreDaganganGrid.tsx`
- Homepage Display: `src/pages/customer/CustomerHome.tsx`
- Marketplace Sorting: `src/pages/customer/CustomerMarketplace.tsx`, `src/features/customer/marketplace/model.ts`
- Geolocation Hook & Context: `src/context/LocationContext.tsx`
- Auth / Session Expiry: `src/context/AuthContext.tsx`, `src/api/client.ts`, `src/app/useHashNavigation.ts`
