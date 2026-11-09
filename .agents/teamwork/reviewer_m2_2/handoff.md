# Milestone 2 Review & Adversarial Challenge Report

**Reviewer Archetype**: Reviewer & Adversarial Critic (`teamwork_reviewer`)  
**Instance**: 2 of 2  
**Date**: 2026-11-09T04:17:00Z  
**State Folder**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\reviewer_m2_2\`  
**Target Recipient**: Orchestrator (`7d36458f-41bc-4fd3-8cbd-85997fb68e2b`)  

---

## Review Summary

**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### Observation 1: Critical Hash Parameter Clobbering in `handleNavigateStore` (`src/App.tsx`)
In `src/App.tsx`, lines 510–528:
```typescript
510:   const handleNavigateStore = useCallback(
511:     (targetStoreName?: string, targetStoreId?: string, section?: string) => {
512:       const cleanName = targetStoreName && targetStoreName.trim() && targetStoreName.trim() !== 'TerasRasa Bakery' ? targetStoreName.trim() : 'Toko Rejak';
513:       setSelectedStoreName(cleanName);
514:       try {
515:         localStorage.setItem('rescuebyte_selected_store', cleanName);
516:       } catch { }
517:       setSelectedStoreId(targetStoreId);
518: 
519:       const query = new URLSearchParams();
520:       if (cleanName) query.set('name', cleanName);
521:       if (targetStoreId) query.set('id', targetStoreId);
522:       if (section) query.set('section', section);
523:       window.location.hash = `#toko?${query.toString()}`;
524: 
525:       handleNavigate('view-customer-store', 'Detail Toko');
526:     },
527:     [handleNavigate]
528:   );
```
At line 523, `window.location.hash` is set to `#toko?name=...&id=...&section=ulasan-pelanggan`.
However, immediately on line 525, `handleNavigate('view-customer-store', 'Detail Toko')` is invoked.
Looking at `handleNavigate` in `src/App.tsx` (lines 410 and 428–429):
```typescript
410:       window.scrollTo({ top: 0, behavior: 'instant' });
...
428:       } else if (viewId === 'view-customer-store') {
429:         window.history.replaceState(null, '', selectedStoreName ? `#toko?name=${encodeURIComponent(selectedStoreName)}` : '#toko');
430:       }
```
`window.history.replaceState` runs synchronously in the same turn, replacing the browser URL and destroying the `section=ulasan-pelanggan` and `id` parameters before `CustomerStoreDetail` mounts! Furthermore, line 410 forces `window.scrollTo({ top: 0, behavior: 'instant' })`.

### Observation 2: Product Detail Rating Click Execution Trace
In `src/pages/customer/CustomerProductDetail.tsx` (lines 448–459):
```typescript
448:                         onClick={(e) => {
449:                           e.stopPropagation();
450:                           if (onNavigateStore) {
451:                             onNavigateStore(storeName, product?.storeId, 'ulasan-pelanggan');
452:                           } else {
...
457:                             window.location.hash = `#toko?${query.toString()}`;
458:                           }
459:                         }}
```
In `src/app/AppRoutes.tsx` line 113, `CustomerProductDetail` receives `onNavigateStore={handleNavigateStore}`.
When user clicks `★ {rating.toFixed(1)} ({reviewCount} ulasan)`, it calls `handleNavigateStore(storeName, product?.storeId, 'ulasan-pelanggan')`.
Due to Observation 1, `window.history.replaceState` executes and the resulting URL is `#toko?name=...`, completely dropping `section=ulasan-pelanggan`.

### Observation 3: Failure of Smooth Scroll & Tab Switch on Mount in `CustomerStoreDetail.tsx`
In `src/pages/customer/CustomerStoreDetail.tsx` (lines 67–73):
```typescript
67:   // Detect section=ulasan-pelanggan or #ulasan-pelanggan on mount
68:   useEffect(() => {
69:     const { params, anchor } = parseHash();
70:     const section = params.get('section') || anchor;
71:     if (section === 'ulasan-pelanggan' || window.location.hash.includes('ulasan-pelanggan')) {
72:       scrollToReviews();
73:     }
74:   }, [scrollToReviews]);
```
Because `window.location.hash` was clobbered by `handleNavigate`'s `replaceState`, when `CustomerStoreDetail` mounts, `params.get('section')` is `null` and `window.location.hash.includes('ulasan-pelanggan')` is `false`.
As a result, `scrollToReviews()` is NEVER called on navigation from `CustomerProductDetail`. The page remains stuck at `activeTab = 'tentang'` at top scroll position (0, 0).

### Observation 4: Verified Functionality Across Other Touchpoints
- In `src/components/customer/store/StoreHero.tsx` (lines 84–95): The rating badge is a semantic `<button>` with `onScrollToReviews={scrollToReviews}`, `aria-label`, and keyboard accessibility.
- In `src/components/customer/store/StoreInfoCard.tsx` (lines 141–195): Rating Toko, Total Ulasan, and "Lihat Semua Ulasan →" are `<button>` elements calling `onNavigateToReviews` (`scrollToReviews`).
- In `src/components/customer/cart/CartStoreGroup.tsx` (lines 90–114), `src/components/customer/checkout/CheckoutItemsList.tsx` (lines 85–108), and `src/components/customer/MysteryBoxCard.tsx` (lines 234–259): Touchpoints directly set `window.location.hash = '#toko?' + query.toString()` without invoking `handleNavigate`, meaning they preserve `section=ulasan-pelanggan` and successfully trigger `CustomerStoreDetail`'s smooth scroll.
- In `src/components/customer/store/StoreReviewsList.tsx` (line 94): `<section id="ulasan-pelanggan" className="... scroll-mt-28">` provides the necessary 112px offset beneath the floating header (`CustomerHeader`).
- In `src/components/reviews/RatingDistribution.tsx` (lines 26–27): Percentage calculation `totalReviews > 0 ? Math.min(100, Math.max(0, (count / totalReviews) * 100)) : 0` safely handles `totalReviews = 0` without `NaN` or divide-by-zero.
- In `src/components/reviews/`: All 7 primitives + `index.ts` pass TypeScript compilation, `npm run build` (exit code 0, 1.39s), and `oxlint` (0 errors, 0 warnings).

---

## 2. Logic Chain

```
[Observation 1] `handleNavigateStore` sets `window.location.hash = '#toko?name=...&id=...&section=ulasan-pelanggan'` (line 523), but immediately calls `handleNavigate('view-customer-store')` (line 525).
       ↓
[Observation 1 & 2] `handleNavigate` runs `window.history.replaceState(null, '', '#toko?name=...')` (line 429) and `window.scrollTo(0,0)` (line 410). This destroys `&id=...&section=ulasan-pelanggan` in `window.location.hash`.
       ↓
[Observation 3] `CustomerStoreDetail` mounts. Its `useEffect` inspects `parseHash()`. Because the hash was overwritten, `section` is null.
       ↓
[Inference] `scrollToReviews()` is NEVER called when navigating from `CustomerProductDetail`. The page fails to switch to `'ulasan'` tab and fails to scroll to `<section id="ulasan-pelanggan">`.
       ↓
[Acceptance Criteria Check] PRD Section 4 explicitly requires:
"Every interactive rating and review-count element on the Product Detail page must navigate to the Store page's Ulasan Pelanggan section... The target destination is specifically the Ulasan Pelanggan section, not the top of the Store page."
       ↓
[Conclusion] This violates a core requirement of Milestone 2. Verdict must be REQUEST_CHANGES.
```

---

## 3. Findings

### [Critical] Finding 1: `handleNavigateStore` Clobbers `section=ulasan-pelanggan` via `handleNavigate`'s `replaceState`

- **What**: When a user clicks the rating or review count in `CustomerProductDetail.tsx`, the store review deep-link is stripped from the URL, preventing auto-switching to the `'ulasan'` tab and preventing smooth scrolling to `<section id="ulasan-pelanggan">`.
- **Where**: `src/App.tsx`, lines 428–430 and lines 510–528.
- **Why**: `handleNavigateStore` sets `window.location.hash` with `section=ulasan-pelanggan`, but immediately calls `handleNavigate('view-customer-store')`. In `handleNavigate`, line 429 executes `window.history.replaceState(null, '', selectedStoreName ? `#toko?name=${encodeURIComponent(selectedStoreName)}` : '#toko')`. This replaces the browser's URL, wiping out `id` and `section`, and line 410 resets scroll position to `(0, 0)`.
- **Suggested Fix**:
  In `src/App.tsx`:
  In `handleNavigateStore`, do NOT call `handleNavigate('view-customer-store', 'Detail Toko')`. Instead, simply update active view state directly, e.g.:
  ```typescript
  const handleNavigateStore = useCallback(
    (targetStoreName?: string, targetStoreId?: string, section?: string) => {
      const cleanName = targetStoreName && targetStoreName.trim() && targetStoreName.trim() !== 'TerasRasa Bakery' ? targetStoreName.trim() : 'Toko Rejak';
      setSelectedStoreName(cleanName);
      try {
        localStorage.setItem('rescuebyte_selected_store', cleanName);
      } catch { }
      setSelectedStoreId(targetStoreId);

      const query = new URLSearchParams();
      if (cleanName) query.set('name', cleanName);
      if (targetStoreId) query.set('id', targetStoreId);
      if (section) query.set('section', section);
      window.location.hash = `#toko?${query.toString()}`;

      setActiveView('view-customer-store');
      setActiveLabel('Detail Toko');
      setIsMobileOpen(false);
    },
    []
  );
  ```
  And in `handleNavigate`, guard against overwriting if `window.location.hash` already has `#toko?`:
  ```typescript
  } else if (viewId === 'view-customer-store') {
    if (!window.location.hash.startsWith('#toko?') || !window.location.hash.includes('section=')) {
      window.history.replaceState(null, '', selectedStoreName ? `#toko?name=${encodeURIComponent(selectedStoreName)}` : '#toko');
    }
  }
  ```

---

## 4. Adversarial Challenge Report

### Overall Risk Assessment: HIGH

### Challenges Tested

#### [Critical] Challenge 1: Hash Collision between `window.location.hash` assignment and `handleNavigate`'s `replaceState`
- **Assumption Challenged**: Calling `window.location.hash = ...` followed by `handleNavigate('view-customer-store')` preserves query parameters.
- **Attack Scenario**: Simulated user clicking rating badge on `CustomerProductDetail` for store "Monsieur Spoon Bakery" with `section="ulasan-pelanggan"`.
- **Blast Radius**: URL was rewritten to `#toko?name=Monsieur%20Spoon%20Bakery`, completely stripping `id` and `section=ulasan-pelanggan`. `CustomerStoreDetail` failed to switch tabs or scroll.
- **Stress Test Result**: **FAIL** (Confirmed via `.agents/teamwork/reviewer_m2_2/test_adversarial_m2.mjs`).

#### [Passed] Challenge 2: Rating Distribution with Zero or Empty Data
- **Assumption Challenged**: Division by `totalReviews` could produce `NaN%` or `Infinity%` when a store or product has 0 reviews.
- **Attack Scenario**: Rendered `RatingDistribution` with `{ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }` and `totalReviews = 0`, as well as mismatched data.
- **Actual Behavior**: Percentage rendered as clean `0%`, with `aria-valuenow={0}`. No NaN or errors.
- **Stress Test Result**: **PASS**.

#### [Passed] Challenge 3: Fractional Star SVG Distortion in Tailwind v4
- **Assumption Challenged**: Lucide SVG with `overflow: hidden` on parent could shrink if `max-w-full` applied.
- **Inspection**: Analyzed generated CSS in `dist/assets/index-*.css`. Tailwind v4 preflight sets `display: block; vertical-align: middle;` on SVG without `max-width: 100%`.
- **Stress Test Result**: **PASS**. Star widths remain fixed at `config.starSize` while container percentage width clips the foreground.

#### [Passed] Challenge 4: Fixed Header Obstruction (`scroll-mt-28`)
- **Assumption Challenged**: Floating header (`CustomerHeader`) at `fixed top-5` could obscure review title upon scroll.
- **Inspection**: `scroll-mt-28` provides `7rem` (112px) of scroll-margin-top, while `CustomerHeader` has top offset `1.25rem` (20px) + height ~50px.
- **Stress Test Result**: **PASS**. Clearance is ~42px below the header.

---

## 5. Verified Claims

| Claim from Worker M2 Handoff | Verification Method | Result | Notes |
|---|---|---|---|
| Reusable primitives in `src/components/reviews/` | Unit testing & SSR static markup render | **PASS** | All 8 files pass type check, linting, and 79 unit assertions |
| `RatingDistribution` safe with 0 reviews | Edge case test with `{}` and `0` total | **PASS** | Renders 0% cleanly without `NaN` |
| `npm run build` succeeds with 0 errors | Executed `npm run build` | **PASS** | Exit code 0, 1.39s build time |
| `oxlint` passes on review components | Executed `npx oxlint src/components/reviews` | **PASS** | 0 errors, 0 warnings |
| Store rating click on `StoreHero` scrolls | Code inspection of lines 84–95 | **PASS** | Semantic button with `onScrollToReviews` |
| Store rating click on `StoreInfoCard` scrolls | Code inspection of lines 141–195 | **PASS** | 3 buttons wired to `onNavigateToReviews` |
| Store rating click on Cart, Checkout, MysteryBox | Code inspection and event handlers | **PASS** | Directly sets `window.location.hash` with `section=ulasan-pelanggan` |
| Store rating click on `CustomerProductDetail` navigates to `section=ulasan-pelanggan` | Empirical execution trace & adversarial test | **FAIL** | Clobbered by `handleNavigate`'s `replaceState` in `src/App.tsx` |

---

## 6. Caveats

- Direct access to `#toko?name=...&section=ulasan-pelanggan` (e.g. entering the URL in browser or browser refresh) works as expected because `handleNavigate` is not called on initial mount.
- Touchpoints in `CartStoreGroup`, `CheckoutItemsList`, and `MysteryBoxCard` work as expected because they modify `window.location.hash` directly without invoking `handleNavigate`.
- The defect is isolated to `handleNavigateStore` in `src/App.tsx` and its interaction with `handleNavigate`.

---

## 7. Conclusion

Milestone 2 implementation is approximately 95% complete and boasts exceptional quality in UI primitives (`src/components/reviews/`), accessibility, build cleanliness, and responsive styling.
However, because of the hash clobbering bug in `handleNavigateStore` (`src/App.tsx`), clicking store ratings on `CustomerProductDetail` fails to preserve `section=ulasan-pelanggan` and fails to scroll to the reviews section on the store page.

Per instructions, because this is a functional failure in a core acceptance criterion:
**Verdict**: **REQUEST_CHANGES**

---

## 8. Verification Method

To reproduce and verify:
1. Run the empirical adversarial test suite:
   ```powershell
   node .agents/teamwork/reviewer_m2_2/test_adversarial_m2.mjs
   ```
   **Expected failure**: `handleNavigateStore preserves section=ulasan-pelanggan in URL -> URL hash became: "#toko?name=..."`.
2. Inspect `src/App.tsx` lines 523–525 and lines 428–429.
3. In browser, navigate to `#detail-produk`, click `★ 4.8 (128 ulasan)`. Observe that the browser hash becomes `#toko?name=...` without `&section=ulasan-pelanggan` and stays at the top of the Store page.
