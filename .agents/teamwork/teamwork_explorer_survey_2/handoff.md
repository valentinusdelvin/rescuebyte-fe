# UI/UX, Design System, Responsive & Accessibility Audit Report

**Author**: Survey Explorer 2 (UI/UX, Design System, Responsive & Accessibility Audit Specialist)  
**Target File**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`  
**Date**: 2026-11-04  
**Project**: RescueByte Frontend Competition Showcase  
**Status**: Ready for Phase 3 Implementation  

---

## 1. Observation

### 1.1 Design Tokens & Tailwind Configuration Disconnect
- **Design Specifications in `Design.md`**:
  `Design.md` lines 3-52 define the complete "Botanical Rescue & Nourishment" design system tokens:
  - Surface hierarchy: `surface: #fcf9f8`, `surface-container-lowest: #ffffff`, `surface-container-low: #f6f3f2`, `surface-container: #f0eded`, `surface-container-high: #eae7e7`, `surface-container-highest: #e4e2e1`.
  - Brand Palette: Primary Evergreen `#1F2A24` (or `#0b1510`), Fresh Leaf Green `#7BAE45` (Secondary `#3c6a00`, Container `#b8f07e`), Warm Marigold `#F2B84B` (Tertiary `#1c1100`), Urgent Vermilion `#D94A38` (Error `#ba1a1a`), Outline `#737874` / `#E2E6DF`.
  - Typography: Primary UI & Headings: `Plus Jakarta Sans` (weights 400, 500, 600, 700, 800), Display Hero: `Sora` (weights 600, 700, 800).
  - Elevation & Depth:
    - Level 0: Flat canvas `#F8F7F2`
    - Level 1 (Cards): `0 4px 16px -2px rgba(31, 42, 36, 0.05)` with 1px border `#E2E6DF`
    - Level 2 (Hover): `0 8px 24px -4px rgba(31, 42, 36, 0.08)`
    - Level 3 (Sticky Bars): `0 -4px 20px 0 rgba(31, 42, 36, 0.07)`
  - Radii: 8px-12px buttons/inputs, 16px-20px cards/sheets, 9999px pills.
- **Actual Implementation in `src/index.css` (lines 5-21)**:
  ```css
  @theme {
    --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-heading: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-display: 'Sora', sans-serif;
    --font-sora: 'Sora', sans-serif;
    --font-jakarta: 'Plus Jakarta Sans', sans-serif;

    --color-primary: #15803d;
    --color-primary-dark: #166534;
    --color-primary-light: #22c55e;
    --color-brand-green: #3c6a00;
    --color-brand-lime: #bef264;
    --color-brand-gold: #eab308;
    --color-brand-red: #ef4444;
    --color-surface-app: #f7f7f5;
    --color-surface-card: #ffffff;
  }
  ```
  - `--color-primary` is configured as `#15803d` (Tailwind standard green-700), contradicting the `#1F2A24` deep evergreen brand token.
  - The entire token taxonomy from `Design.md` (surfaces, containers, outlines, error/tertiary shades, elevation shadows) is absent from `@theme`.
- **Rampant Inline Hex Class Duplication**:
  Because standard utility tokens were never registered, component files resort to disparate, arbitrary hex classes:
  - Dark green containers: `bg-[#18201b]` (`MysteryBoxCard.tsx:307`), `bg-[#1f2620]` (`CustomerCart.tsx:807`, `CustomerCheckout.tsx:1003`), `bg-[#1e2420]` (`CustomerCart.tsx:830`), `bg-[#162E1A]` (`CustomerLoginForm.tsx:132`), `bg-[#0E2012]` (`CustomerLoginForm.tsx:132`), `bg-[#1F4D36]` (`CustomerHeader.tsx:319`, `Daganganku.tsx:399`), `bg-[#0b1510]` (`CustomerHome.tsx:688`).
  - Borders & Outlines: `border-[#e2e6df]`, `border-[#E6EBE0]`, `border-[#DCE4D8]`, `border-black/10`, `border-gray-200/80`, `border-slate-200/80`.
  - Shadows: Every file writes arbitrary multi-stop box shadows such as `shadow-[0_4px_16px_-2px_rgba(31,42,36,0.05)]` instead of standard elevation utilities.

### 1.2 Reusable UI Component Inventory Deficiencies
- Inspection of `src/components/` revealed:
  - Total files with `<button>`: 39 files (`src/pages/*.tsx`, `src/components/**/*.tsx`).
  - Total files with `<input>`: 16 files.
  - **Shared Generic Component Library in `src/components/common` or `src/components/ui`**:
    - **Button**: 0 components. All buttons are hand-coded with inconsistent sizes, hover effects, padding, and focus states.
    - **Input / TextField**: 0 components. Form inputs have differing borders, paddings, and label attachments.
    - **Badge / Pill**: 0 components. Status badges (*Halal MUI*, *Sisa N Box*, *-XX%*, *Urgent*) are individually constructed in 12+ files.
    - **Modal / Dialog**: 0 generic primitives. Only domain-specific modals exist (`ConfirmDeleteModal`, `CustomerOrderModal`, `SellerOrderDetailModal`, `MidtransPaymentModal`, `ProductDescriptionModal`), each reimplementing backdrop, portal/positioning, and escape key handling.
    - **Card**: 0 generic base components.
    - **EmptyState**: 0 generic components.
    - **Skeleton**: 0 generic components (`CustomerHome.tsx` wrote a private `BoxCardSkeleton` that is not reused elsewhere).
- **Extreme Code Duplication**:
  - `src/pages/CustomerMarketplace.tsx` lines 913-1048 duplicates ~140 lines of Mystery Box card presentation (photo aspect ratio, badge stacks, pickup gray box, striated prices, and CTA buttons) instead of importing `<MysteryBoxCard />` from `src/components/customer/MysteryBoxCard.tsx`.
  - Floating cart button animation and badge markup is duplicated between `CustomerMarketplace.tsx` and `CustomerProductDetail.tsx`.
  - Quick login modal markup is duplicated between `CustomerHome.tsx` and `CustomerCart.tsx`.

### 1.3 State Coverage (Loading, Error, Empty, Success)
- **Loading States**:
  - Only 3 page files (`CustomerHome.tsx`, `CustomerMarketplace.tsx`, `StoreProfile.tsx`) track `isLoading`.
  - Pages like `OrderHistory.tsx`, `Daganganku.tsx`, `CustomerOrderHistory.tsx`, and `Dashboard.tsx` execute backend fetch calls (`fetchMerchantOrdersApi`, `getMerchantProducts`) but render cached or empty local state without a loading skeleton or indicator, resulting in layout shift when data arrives.
- **Error States**:
  - API failures in `OrderHistory.tsx:77-81` and `Daganganku.tsx:53-59` catch errors with `console.warn` without surfacing an in-place error state or retry CTA.
- **Empty States**:
  - `CustomerCart.tsx` line 821 renders raw emoji `🛒` inside empty state, violating antislop rule R-04.
  - `OrderHistory.tsx` line 380 renders a single static message ("Belum Ada Pesanan Masuk") even when a search query or category filter returns 0 results, offering no "Reset Filter" button.
- **Success States**:
  - `Toast.tsx` correctly handles toast notifications with spring physics and reduced-motion support.

### 1.4 Responsive Layout & Mobile Usability
- **Missing Mobile Sticky Conversion Bars**:
  - `Design.md` section "Layout & Spacing" mandates:  
    *"Sticky Viewports: On mobile screens, critical conversion items (checkout bar, reserve button, active pickup countdown timer) lock cleanly to the bottom viewport with an 80px clearance allowance over the system safe area."*
  - In `CustomerCart.tsx` (lines 803-814), `CustomerCheckout.tsx` (lines 1104-1114), and `CustomerProductDetail.tsx` (lines 580-613), all conversion buttons are placed inside vertically stacked containers. On mobile devices (< 640px), the user must scroll through multiple viewport heights past all cards or details to reach the primary conversion action.
- **Asymmetrical Header Offset on Mobile**:
  - `CustomerHeader.tsx` line 311: `<header className="fixed top-5 left-[calc(50%+24px)] -translate-x-1/2 ...">` pushes the floating header 24px off-center to the right on all screens. On narrow mobile viewports (360px–390px), this causes off-center visual balance and horizontal edge clipping.
- **Touch Targets Below 44x44px**:
  - Password reveal toggle button in `CustomerLoginForm.tsx:96-103` uses a 16px icon with minimal padding.
  - DatePicker navigation controls in `DatePicker.tsx:84-91` have a hit box of ~28x28px.
  - Inline "Lupa Kata Sandi?" button (`CustomerLoginForm.tsx:119-125`) lacks adequate tap target padding.

### 1.5 Accessibility (a11y) & WCAG AA Compliance
- **Non-Semantic Div Elements as Buttons without Keyboard Support**:
  - `CustomerCheckout.tsx` lines 1000-1019 & 1054-1073: Online Payment and COD options are implemented as `<div onClick=...>` without `role="radio"`, `aria-checked`, `tabIndex={0}`, or Enter/Space keyboard handlers. Keyboard-only users cannot select payment methods.
  - `CustomerOrderHistory.tsx` line 475: Store link is a `<div role="button">` instead of a native `<button>` or `<a>`.
- **Focus Indicator Deficiencies**:
  - `Sidebar.tsx` lines 111, 125, 151, 191: Navigation buttons apply `focus-visible:outline-none` with only a text translation (`focus-visible:translate-x-1.5`), failing WCAG 2.4.11 / 2.4.13 visible focus appearance.
  - `MysteryBoxCard.tsx` line 307: "Pesan Sekarang" button has no `:focus-visible` styles.
  - `CustomerMarketplace.tsx` lines 571, 647, 759, 807: Filter dropdowns use harsh blue rings `border-[#3b82f6] ring-1 ring-[#3b82f6]`, violating the brand design specification.
- **Color Contrast Ratios**:
  - `PerformanceChart.tsx` lines 242, 401, 438: Yellow trend line and data points `#eab308` on white background have a contrast ratio of 1.95:1, failing the WCAG 1.4.11 non-text contrast requirement (3.0:1 minimum).
  - Slate Sage text `#737873` on Linen background `#F8F7F2` provides a ratio of ~4.2:1 (below the 4.5:1 AA requirement for normal body text).
- **Chart Screen Reader Accessibility**:
  - In `PerformanceChart.tsx`, SVG data circles only trigger tooltips on `onMouseEnter` / `onMouseLeave`. They lack `tabIndex`, keyboard focus, ARIA attributes, and an accessible data table (`sr-only`) fallback for screen readers.

---

## 2. Logic Chain

1. **Premise 1 (Tokens)**: Because `src/index.css` only defines 9 arbitrary Tailwind v4 `@theme` properties that do not match `Design.md`, developers had no canonical token classes (e.g. `bg-primary`, `bg-surface-app`, `border-outline`). Consequently, developers copied and altered arbitrary hex values across 39 component and page files, creating 6 different shades of dark green, divergent borders, and inconsistent shadows.
2. **Premise 2 (Components)**: The absence of shared primitives (`Button`, `Input`, `Badge`, `Card`, `Modal`, `EmptyState`, `Skeleton`) led to widespread code duplication. The most egregious instance is `CustomerMarketplace.tsx`, which duplicates 140+ lines of `MysteryBoxCard.tsx` card presentation, increasing the maintenance burden and risking UI divergence.
3. **Premise 3 (Responsiveness)**: Conversion pages (`CustomerCart`, `CustomerCheckout`, `CustomerProductDetail`) were developed primarily on desktop viewports without verifying narrow phone viewports. On mobile screens, the absence of sticky bottom action bars forces users into excessive scrolling, violating the explicit UX requirements in `Design.md`.
4. **Premise 4 (Accessibility)**: Using unstyled `<div>` elements for interactive controls (payment selection, store navigation) without ARIA roles or keyboard event listeners completely locks out keyboard-only and assistive technology users, causing direct WCAG 2.1 AA failures.
5. **Deductive Conclusion**: Standardizing `src/index.css` with the full `Design.md` `@theme` tokens, establishing a core atomic component library in `src/components/ui/`, eliminating markup duplication, adding mobile sticky conversion bars, and applying systematic a11y hardening will bring RescueByte into full compliance with competition showcase standards.

---

## 3. Caveats

- **Caveat 1**: CartoCDN map raster tiles in `StoreLocationMap.tsx` depend on an external CDN tile provider. While Leaflet container styling is solid, dark mode map tiles or offline fallbacks were not evaluated.
- **Caveat 2**: Midtrans Snap modal integration relies on an external script (`https://app.sandbox.midtrans.com/snap/snap.js`) injected in `index.html`. While the modal wrapper is responsive, iframe styling within Snap popup is controlled by Midtrans.
- **Caveat 3**: Brand name variation (`RescueByte` vs `RescueBite`) appears across documentation and markup. Visual styling remains identical, but brand copy should be synchronized with user guidelines.

---

## 4. Conclusion & Actionable Design System Plan

### 4.1 Tailwind v4 `@theme` Token Architecture Plan
Update `src/index.css` `@theme` block with canonical design tokens matching `Design.md`:

```css
@theme {
  /* Fonts */
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-heading: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-display: 'Sora', sans-serif;

  /* Botanical Rescue & Nourishment Color System */
  --color-surface: #fcf9f8;
  --color-surface-dim: #dcd9d9;
  --color-surface-bright: #fcf9f8;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f6f3f2;
  --color-surface-container: #f0eded;
  --color-surface-container-high: #eae7e7;
  --color-surface-container-highest: #e4e2e1;
  --color-on-surface: #1b1c1c;
  --color-on-surface-variant: #434844;
  --color-inverse-surface: #303030;
  --color-inverse-on-surface: #f3f0ef;

  /* Primary Evergreen */
  --color-primary: #1f2a24;
  --color-primary-dark: #141e18;
  --color-primary-container: #202a24;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #86918a;

  /* Secondary Leaf Green */
  --color-secondary: #3c6a00;
  --color-secondary-container: #bbf381;
  --color-secondary-soft: #e8f1de;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #406e05;

  /* Tertiary Warm Marigold */
  --color-tertiary: #1c1100;
  --color-tertiary-container: #fef3c7;
  --color-tertiary-accent: #f2b84b;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #92400e;

  /* Urgent / Error Vermilion */
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-error-soft: #fdeceb;
  --color-urgent: #d94a38;
  --color-on-error: #ffffff;

  /* Outlines & Borders */
  --color-outline: #737874;
  --color-outline-variant: #e2e6df;

  /* Depth & Elevation Shadows */
  --shadow-level-1: 0 4px 16px -2px rgba(31, 42, 36, 0.05);
  --shadow-level-2: 0 8px 24px -4px rgba(31, 42, 36, 0.08);
  --shadow-level-3: 0 -4px 20px 0 rgba(31, 42, 36, 0.07);

  /* Standard Border Radii */
  --radius-button: 0.75rem; /* 12px */
  --radius-card: 1rem;     /* 16px */
  --radius-sheet: 1.25rem;  /* 20px */
}
```

### 4.2 Shared Reusable Component Blueprint (`src/components/ui/`)
To be constructed in Phase 3 without breaking existing views:
1. `Button.tsx`:
   - Variants: `primary` (evergreen `#1f2a24`), `secondary` (soft sage `#e8f1de`), `outline` (transparent + `#e2e6df`), `urgent` (vermilion `#d94a38`), `ghost`.
   - Sizes: `sm` (h-9, text-xs), `md` (h-11, text-sm), `lg` (h-12 / 48px, text-base).
   - Integrated loading spinner (`isLoading`), icons (left/right), disabled states, and high-contrast `:focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
2. `Input.tsx` / `TextField.tsx`:
   - Floating/standard label, hint, error message (`aria-invalid`, `aria-describedby`), left/right icon slots, focus ring (`border-primary` instead of blue rings).
3. `Badge.tsx`:
   - Variants: `halal` (soft green), `urgent-stock` (light red/flame), `discount` (leaf green), `mystery` (amber sparkle), `neutral` (gray).
   - Geometry: 9999px pill, weight 600, accessible text contrast.
4. `Card.tsx`:
   - Surface `#ffffff`, border `#e2e6df`, radius `rounded-2xl`, shadow `shadow-level-1`, hover elevation.
5. `EmptyState.tsx`:
   - Standardized graphic icon (Lucide, zero emojis), title, description, and primary action button (e.g. "Reset Pencarian", "Jelajahi Marketplace").
6. `Skeleton.tsx`:
   - Fluid pulsing placeholders with matching geometry.
7. `Modal.tsx`:
   - Accessible dialog shell with backdrop blur, focus trap, Escape key dismiss, and ARIA title linkage.

### 4.3 Mobile Responsiveness & Layout Hardening Plan
1. **Mobile Sticky Action Bar**:
   - In `CustomerCart.tsx`, `CustomerCheckout.tsx`, and `CustomerProductDetail.tsx`, add a responsive mobile conversion bar:
     ```tsx
     <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-outline-variant p-4 z-40 shadow-level-3 flex items-center justify-between gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
       <div>
         <span className="text-[11px] text-gray-500 block">Total</span>
         <span className="text-lg font-bold font-display text-primary">Rp {formatRupiah(grandTotal)}</span>
       </div>
       <Button variant="primary" size="md" onClick={handleAction}>
         {actionLabel}
       </Button>
     </div>
     ```
   - Add a bottom clearance padding (`pb-24`) to page main wrappers on mobile to avoid content obscuration.
2. **CustomerHeader Offset Fix**:
   - In `CustomerHeader.tsx:311`, change `left-[calc(50%+24px)]` to `left-1/2` to eliminate the 24px asymmetrical rightward drift on phones.
3. **Tap Target Expansion**:
   - Wrap all clickable controls, toggles, and icon buttons in a minimum 44x44px touch target area (`min-h-[44px] min-w-[44px] flex items-center justify-center`).

### 4.4 Accessibility (a11y) Remediation Plan
1. **Replace Divs with Native Buttons / Inputs**:
   - Refactor payment options in `CustomerCheckout.tsx` to `<button type="button" role="radio" aria-checked=...>` with full keyboard navigation (Arrow keys, Enter, Space).
   - Convert all clickable `div` store/card navigations to semantic buttons or anchor tags.
2. **Focus Visible Standardization**:
   - Remove all bare `outline-none` / `focus:outline-black` / `focus-visible:outline-none`.
   - Apply standard focus ring: `focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1f2a24] focus-visible:ring-offset-2`.
   - Eliminate harsh blue rings (`#3b82f6`) in `CustomerMarketplace.tsx` and `CustomerStoreDetail.tsx`.
3. **Color Contrast Fixes**:
   - Update `PerformanceChart.tsx` yellow series from `#eab308` (1.95:1) to `#b45309` (amber-700, 4.6:1 against white) or `#92400e`.
   - Update secondary body text from `#737873` to `#59605a` on `#F8F7F2` backgrounds to guarantee >= 4.5:1 ratio.
4. **SVG Chart Accessibility**:
   - Provide an accessible hidden data table (`<table className="sr-only">`) in `PerformanceChart.tsx` summarizing monthly order, buyer, and revenue figures for screen readers.

---

## 5. Verification Method

To independently verify all findings and test the future fixes:

1. **Static Build & Lint Verification**:
   ```powershell
   npm run build
   npx oxlint
   ```
2. **Design Tokens Inspection**:
   - Inspect `src/index.css` to verify `@theme` variables are declared.
   - Grep for unauthorized hardcoded arbitrary colors:
     ```powershell
     rg '#18201b|#162E1A|#0E2012|#3b82f6' src/
     ```
3. **Component Deduplication Verification**:
   - Verify that `CustomerMarketplace.tsx` imports and renders `<MysteryBoxCard />` instead of duplicating card JSX.
4. **Mobile Responsiveness Verification**:
   - Set viewport to 360px x 640px (Mobile S) and 390px x 844px (Mobile M).
   - Verify `CustomerHeader` is centered with 0 horizontal overflow (`scrollWidth === clientWidth`).
   - Open `CustomerProductDetail`, `CustomerCart`, and `CustomerCheckout` on mobile viewport; verify the sticky bottom conversion bar is visible, elevated (`shadow-level-3`), respects safe area insets, and does not occlude the bottommost list item.
5. **Keyboard & Accessibility Verification**:
   - Use `Tab` key navigation exclusively from the landing page through to checkout.
   - Verify every interactive button and link displays a visible 2px focus ring.
   - Verify payment methods in Checkout can be selected via keyboard (`Space` or `Enter`).
   - Run contrast check script or compute ratio for yellow/amber chart points against white to confirm >= 3.0:1 ratio.
