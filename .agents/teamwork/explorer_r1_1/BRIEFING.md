# BRIEFING — 2026-11-09T11:48:00Z

## Mission
Investigate and produce comprehensive architecture & UI/UX analysis for R1 (remove floating toast notifications), R2 (remove irrelevant role labels in reviews), R4 (remove stock quantity badges), and R5 (Homepage 3x2 grid layout).

## 🔒 My Identity
- Archetype: explorer
- Roles: Lead Architect & UI/UX Specialist (Explorer 1)
- Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
- State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_1\
- Original parent: 38968871-17e4-4323-bc74-f1f1c77fe5bd
- Milestone: M1 — RescueByte Frontend Polish & Consistency

## 🔒 Key Constraints
- Read-only investigation — do NOT implement code changes in src/
- Follow RescueByte design guidelines and AGENTS.md rules
- Provide exact file paths, line numbers, current behavior vs required behavior, and concrete fix recommendations
- Maintain liveness heartbeat in progress.md

## Current Parent
- Conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd
- Updated: 2026-11-09T11:48:00Z

## Investigation State
- **Explored paths**:
  - `src/context/ToastContext.tsx`
  - `src/components/common/Toast.tsx`
  - `src/App.tsx`
  - `src/main.tsx`
  - `src/app/AppRoutes.tsx`
  - `src/app/useHashNavigation.ts`
  - `src/pages/auth/CustomerAuth.tsx`
  - `src/pages/customer/CustomerContact.tsx`
  - `src/pages/customer/CustomerHome.tsx`
  - `src/pages/customer/CustomerMarketplace.tsx`
  - `src/pages/customer/CustomerProductDetail.tsx`
  - `src/pages/customer/CustomerCart.tsx`
  - `src/pages/customer/CustomerCheckout.tsx`
  - `src/components/customer/MysteryBoxCard.tsx`
  - `src/components/customer/store/StoreDaganganGrid.tsx`
  - `src/components/customer/store/StoreReviewsList.tsx`
  - `src/components/customer/store/types.ts`
  - `src/components/reviews/ReviewCard.tsx`
  - `src/pages/seller/SellerReviews.tsx`
  - `src/pages/seller/BuatDagangan.tsx`
  - `src/pages/seller/Daganganku.tsx`
  - `src/pages/seller/OrderHistory.tsx`
  - `src/pages/seller/StoreProfile.tsx`
  - `src/components/seller/StoreInfoForm.tsx`
  - `src/components/seller/OperationalCard.tsx`
  - `src/components/seller/StoreLocationMap.tsx`
  - `src/components/seller/SellerOrderDetailModal.tsx`
  - `src/hooks/useCustomerCart.ts`
  - `src/hooks/useReviews.ts`
  - `src/services/productService.ts`
- **Key findings**:
  - R1: Two concurrent toast implementations (`ToastContext.tsx` floating bottom-6 right-6, and `Toast.tsx` + `App.tsx` floating bottom-24 right-4 sm:right-6). Both render bottom-right floating popups. Toasts are triggered in ~22 files. In forms (`CustomerAuth`, `BuatDagangan`), error toasts must be replaced with inline error banners. In `CustomerContact`, inline field errors already exist, making the toast completely redundant. In `ProductReviewsSection`, double notifications occur due to `useReviewMutations` + `onShowToast`. Obsolete components: `Toast.tsx`, `ToastContext.tsx` floating container markup, and `<Toast>` in `App.tsx`.
  - R2: Review role labels were located in two major places: (1) `src/pages/customer/CustomerHome.tsx` lines 628-630 where `{testi.role}` ("Seller", "Pelanggan") is rendered underneath user names in the "Apa Kata Mereka" section; (2) `src/components/customer/store/StoreReviewsList.tsx` lines 305-307 where `{rev.role}` (mapped from `r.author?.role || 'Penyelamat Makanan'`) is rendered under reviewer names. `ReviewCard.tsx` does not render a role subtitle.
  - R4: Stock quantity badges located in `src/components/customer/MysteryBoxCard.tsx` lines 122-194 ("Sisa 0 Box", "Sisa {cleanStockText} Box") and `src/components/customer/store/StoreDaganganGrid.tsx` lines 193-217 ("Sisa 0 Box", "Sisa {stockVal} Box") and `src/pages/customer/CustomerOrderDetail.tsx` line 868 ("Sisa {rec.stock} Box"). Out-of-stock logic (`isOutOfStock` checking stock = 0 and rendering disabled "Habis" button) must be strictly preserved while removing the visual badge overlays.
  - R5: `CustomerHome.tsx` has `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` which correctly represents 3 columns x 2 rows on desktop (`lg:`), 2 cols on tablet (`md:`), 1 col on mobile. However, `loadBoxes` in `CustomerHome.tsx` (lines 268-278) currently loads all fetched products without slicing to 6, while skeleton state only has 3 cards instead of 6.
- **Unexplored areas**: None for R1, R2, R4, R5 UI layout.

## Key Decisions Made
- Structure handoff into 5 formal sections per Teamwork Handoff Protocol.
- Provide comprehensive tables, exact file paths, line numbers, current behavior vs required behavior, and drop-in code snippets for each requirement.

## Artifact Index
- DISPATCH.md — Task assignments and history
- progress.md — Heartbeat and task checklist
- BRIEFING.md — Working state and findings index
- handoff.md — Comprehensive investigation report
