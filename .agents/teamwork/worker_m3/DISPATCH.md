## 2026-11-03T19:48:27Z
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are Agent 3 & Agent 5 — Frontend Developer & Code Refactoring Specialist (Worker M3).
Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m3
Original Request: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
Master Blueprint: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
Parent: da2dba90-b6bf-4c5e-813a-a8fef275193d / Project Orchestrator: 59a4cfaf-061f-42fa-9551-4492d1892343

Read reference reports before starting:
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
- Worker M1 Report (UI Primitives & Tokens): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m1\handoff.md
- Worker M2 Report (API Client, Contexts, Hooks): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m2\handoff.md
- Explorer 1 Report (Architecture & Dead Code): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_1\handoff.md
- Explorer 2 Report (UI/UX & Accessibility): c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_2\handoff.md

Scope & File Ownership (Exclusive write ownership for Milestone M3):
- `src/pages/*`
- `src/components/customer/*`
- `src/components/seller/*`
- `src/components/dashboard/*`
- `src/components/layout/*`
- `src/components/auth/*`
- `src/App.tsx`

Tasks:
1. Decompose the 4 giant pages (>1,000 lines) into modular subcomponents:
   - `CustomerStoreDetail.tsx` (1,240 lines): break into subcomponents (e.g. `StoreHero`, `StoreTabs`, `StoreDaganganGrid`, `StoreInfoCard`, `StoreReviewsList`).
   - `CustomerOrderDetail.tsx` (1,161 lines): break into subcomponents (e.g. `OrderStepper`, `OrderItemsList`, `OrderPickupInfo`, `OrderPaymentAction`).
   - `CustomerCheckout.tsx` (1,128 lines): break into subcomponents (e.g. `CheckoutItemsList`, `CheckoutContactForm`, `CheckoutPaymentMethod`, `CheckoutSummary`). Convert custom payment selection divs to semantic keyboard-accessible `<button type="button" role="radio" aria-checked=...>`.
   - `CustomerMarketplace.tsx` (1,156 lines): eliminate 140 lines of duplicate card markup by importing `<MysteryBoxCard />`.
2. Decouple presentational components from raw service calls by migrating them to custom hooks (`useAuth`, `useCart`, `useProducts`, `useOrders`, `useMerchantOrders`, `useStoreProfile`, `useCheckout`) and Contexts (`useAuthContext`, `useCartContext`).
3. Consolidate currency formatting: eliminate all remaining duplicate inline `formatRupiah` definitions across pages/components, importing from `src/utils/currency.ts`.
4. Modernize `src/App.tsx`:
   - Implement route-level code splitting using `React.lazy()` and `<Suspense fallback={<BrandLoadingOverlay />}>` to eliminate Vite's 1.09 MB chunk warning.
   - Support hash query parameters for deep linking (`#detail-produk?id=...`, `#toko?name=...` or `?id=...`, `#detail-pesanan?id=...`) so refreshing the page preserves state.
   - Eliminate heavy prop drilling by consuming `AuthContext` and `CartContext`.
5. UI/UX & Accessibility Hardening:
   - Add mobile sticky bottom conversion action bars for `CustomerCart.tsx`, `CustomerCheckout.tsx`, and `CustomerProductDetail.tsx`.
   - Fix `CustomerHeader.tsx:311` mobile offset bug (change `left-[calc(50%+24px)]` to `left-1/2`).
   - Fix color contrast in `PerformanceChart.tsx` (change `#eab308` to `#b45309`) and add accessible hidden data table `<table className="sr-only">`.
   - Expand touch targets to >= 44x44px and ensure focus rings use `:focus-visible:ring-primary`.
6. Run verification commands: `npm run typecheck` (`tsc -b`), `npm run build`, and `npm run lint`. Ensure 0 errors!
7. Output your detailed handoff report to:
   `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m3\handoff.md`
8. Send completion message to orchestrator.
