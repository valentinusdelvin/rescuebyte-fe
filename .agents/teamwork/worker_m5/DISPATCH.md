# Dispatch for Worker M5 (Milestone 5 Implementation)

## Objective
Implement Milestone 5: Final Homepage Adjustments & Codebase Comments / Documentation Natural Indonesian Localization (antislop-code hygiene).

## Authoritative Inputs to Read
- ORIGINAL_REQUEST: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md` (Including user clarification: DO NOT change user-facing UI copy/text! Localization applies strictly to code comments, JSDoc, and documentation).
- PROJECT.md: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md`
- Explorer M5.1 Report: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_m5_1\handoff.md`
- Explorer M5.2 Report: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_m5_2\handoff.md`
- Explorer M5.3 Report: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_m5_3\handoff.md`
- Antislop Code skill: `C:\Users\fahmi\.gemini\config\skills\antislop-code\SKILL.md`

## Scope & File Ownership
You exclusively own:
1. `src/pages/customer/CustomerHome.tsx` (Homepage adjustments & code comments)
2. `src/api/types.ts`, `src/api/client.ts`, `src/api/services/*.ts` (Code comments hygiene & Indonesian localization)
3. `src/context/` (`AuthContext.tsx`, `CartContext.tsx`, `LocationContext.tsx` comments)
4. `src/hooks/` (`useAuth.ts`, `useCart.ts`, `useReviews.ts`, `useCustomerCart.ts`, `useGeolocation.ts` comments)
5. `src/utils/` (`currency.ts`, `time.ts`, `markdown.ts` comments)
6. `src/services/` (`userService.ts`, `authService.ts`, `productService.ts`, `orderService.ts` comments)
7. `README.md` (Natural Indonesian developer documentation)
DO NOT touch `src/pages/customer/CustomerMarketplace.tsx` pagination or listing limits.
DO NOT change user-facing UI copy / JSX strings in components.

## Implementation Tasks

### 1. Homepage Section: "Mystery Box di Sekitar" (R1)
- In `CustomerHome.tsx`, slice cached boxes to 3 (`.slice(0, 3)`).
- Update loading skeleton count to 3 (`Array.from({ length: 3 })`).
- Decouple data fetching into an independent `useEffect` driven by customer coordinates:
  - Query `getPublicProducts({ latitude, longitude, limit: 10 })`.
  - Deduplicate by product `id`.
  - Enrich with `batchFetchProductRatings`.
  - Sort nearest-first: `.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))`.
  - Slice to max 3: `.slice(0, 3)`.
  - Manage independent `isLoadingNearby` state.
- If fewer than 3 products exist, render available products without duplicating cards. If 0 products, render `<BoxEmptyState />` with `col-span-full`.
- Below the 3 product cards, add the clickable text link "Lihat Selengkapnya":
  - Semantic link/button calling `onNavigateMarketplace` (with `#marketplace` fallback).
  - Hover state: text color `hover:text-emerald-800`, underline offset (`group-hover:underline underline-offset-4`), and chevron/arrow translate (`group-hover:translate-x-1`).
  - Pointer state: `cursor-pointer`.
  - Focus state: `focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:outline-none`.

### 2. Homepage Section: "Mystery Box Terlaris" (R2)
- In `CustomerHome.tsx`, slice cached boxes to 3 (`.slice(0, 3)`).
- Update loading skeleton count to 3 (`Array.from({ length: 3 })`).
- Decouple data fetching into an independent `useEffect` on mount:
  - Query `getPublicProducts({ limit: 10 })`.
  - Deduplicate by product `id`.
  - Enrich with `batchFetchProductRatings`.
  - Sort by popularity/best-selling: `.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))`.
  - Slice to max 3: `.slice(0, 3)`.
  - Manage independent `isLoadingBestSeller` state.
- If fewer than 3 products exist, render available products without duplicating cards. If 0 products, render `<BoxEmptyState />` with `col-span-full`.
- Below the 3 product cards, add the clickable text link "Lihat Selengkapnya":
  - Same design tokens, hover, pointer, and navigation behavior to `#marketplace`.

### 3. Code Comments & Documentation Localization to Natural Indonesian (R3 Clarified)
- Follow `antislop-code` guidelines:
  - Strip decorative box separators (`/* ====== */` or `// ======`) in `src/api/types.ts` and `src/api/client.ts`.
  - Remove workflow numbered narration (`// 1.`, `// Step 2:`), empty category labels (`// Form state`), and trivial restatements.
  - Localize high-value architectural JSDoc and explanatory comments across `src/api/`, `src/context/`, `src/hooks/`, `src/utils/`, `src/services/`, and `src/components/ui/` into natural, professional Indonesian (written like a real Indonesian software engineer or CS student).
  - Strictly preserve English technical terms (`API`, `Backend`, `Frontend`, `Dashboard`, `Marketplace`, `Bearer Token`, `Hooks`, `DTO`, `Endpoint`, `Interceptor`, `LocalStorage`, `Payload`, `Session`, `State`, `Props`, `Context`, `Routing`, `Midtrans`, `Snap`, `Geolocation`, etc.).
  - Update `README.md` with clear, professional Indonesian developer documentation (Architecture, Scripts, Folder Structure, API Configuration) while keeping technical commands and terms in English.

### 4. Verification
- Run `npm run build` (`tsc -b && vite build`) to verify 0 errors.
- Run `npx oxlint` to verify 0 lint errors.
- Document changes and verification outputs in `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m5\handoff.md`.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-09T14:32:06Z
Received dispatch from parent 66869129-f30f-4e5b-9a7d-e1f1c04e57d5.
Role: Worker M5 (Full-Stack Frontend Developer & Code Hygiene Specialist).
Mission:
1. Implement Homepage adjustments in `src/pages/customer/CustomerHome.tsx`.
2. Code comments hygiene & natural Indonesian localization (antislop-code guidelines).
3. Verification: build, oxlint, report, handoff.
