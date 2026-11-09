# Empirical Verification & Adversarial Challenge Report (R1 - R6)

**Agent**: Challenger 1 (`challenger_r1_1` — Empirical Verification Specialist)  
**Parent Conversation ID**: `38968871-17e4-4323-bc74-f1f1c77fe5bd`  
**Milestone**: M2 Verification (R1 - R6)  
**Target Verdict**: **REJECT** (1 Critical Defect Found in R4)

---

## 1. Observation

An automated empirical verification test suite comprising 31 automated tests was authored and executed at `scripts/test_challenger_r1_r6.mjs`:
```powershell
node scripts/test_challenger_r1_r6.mjs
```
The test suite produced 30 PASS and 1 FAIL.

### Summary of Empirical Findings by Requirement:

1. **R1: Floating Toast Removal Globally & Inline Validation** — **PASSED**
   - `src/context/ToastContext.tsx`: `ToastProvider` JSX returns only `{children}` without any floating DOM container.
   - `src/components/common/Toast.tsx`: Component returns `null` unconditionally.
   - `src/App.tsx`: Zero `<Toast />` component mounts remain.
   - Global scan across all `.tsx` components confirms zero `fixed bottom-4 right-4` floating toast containers.
   - `src/components/auth/CustomerLoginForm.tsx` & `CustomerRegisterForm.tsx`: Accessible inline error alerts (`role="alert"`) render `errorMessage`.
   - `src/pages/auth/CustomerAuth.tsx`: Role guard correctly sets inline `loginError` when customer attempts login through seller portal or vice versa, and enforces 8-character password length.
   - `src/pages/seller/BuatDagangan.tsx`: Renders inline alert banner (`role="alert"`) right above the submit button validating empty name, inverted pricing, and zero stock.

2. **R2: Removal of Irrelevant Role Labels from Review Identity** — **PASSED**
   - `src/pages/customer/CustomerHome.tsx`: Apa Kata Mereka testimonial marquee cards do NOT render `{testi.role}`. Name, avatar, star rating, and quote remain visible.
   - `src/components/customer/store/StoreReviewsList.tsx`: Review cards do NOT render `{rev.role}` underneath reviewer names.
   - `src/components/reviews/ReviewCard.tsx`: Renders `reviewerName` and star rating without role subtitles.

3. **R3: Product Rating Consistency & Batch Fetching** — **PASSED**
   - `src/services/productRatingService.ts`: `batchFetchProductRatings` correctly deduplicates input product IDs, queries backend with concurrent `Promise.allSettled`, caches summaries in-memory, and rounds average ratings to 1 decimal place (e.g. 13/3 = 4.3). Handled large-scale mock tests (10,000 reviews computed in < 2ms).
   - `src/components/customer/MysteryBoxCard.tsx`: Removed conditional `!isPopular` wrapping the rating block; ratings render unconditionally (`★ 4.8 (48 ulasan)` when reviews exist, `★ - (Belum ada ulasan)` when 0 reviews). Click targets `#toko?name=...&id=...&section=ulasan-pelanggan`.
   - `CustomerHome.tsx` & `CustomerMarketplace.tsx`: Products are enriched with `batchFetchProductRatings` before rendering.

4. **R4: Removal of Stock Quantity Badges & Out-of-Stock Logic** — **FAILED (CRITICAL DEFECT)**
   - Visual badges ("Sisa 97 Box") were successfully removed from `MysteryBoxCard.tsx`, `StoreDaganganGrid.tsx`, and `CustomerOrderDetail.tsx`.
   - **CRITICAL DEFECT**: In `src/components/customer/MysteryBoxCard.tsx` line 74:
     ```ts
     const stockMatch = item.remainingBoxesText.match(/\d+/);
     const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
     const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
     ```
     Because `.includes('0 box')` is evaluated as a raw substring, ANY stock quantity ending with a zero (`10 Box`, `20 Box`, `30 Box`, `50 Box`, `100 Box`, `1000 Box`) satisfies `.includes('0 box')`!
     **Direct Execution Result**:
     ```js
     const text10 = 'Sisa 10 Box';
     text10.toLowerCase().includes('0 box'); // Returns TRUE!
     ```
     Consequently, products with 10, 20, 50, or 100 boxes in stock are falsely evaluated as `isOutOfStock = true`, disabling their purchase button and rendering the disabled label `"Habis"`.

5. **R5: Homepage Product Display (3x2 Desktop Grid = 6 Cards)** — **PASSED**
   - `src/pages/customer/CustomerHome.tsx`:
     - `.slice(0, 6)` is strictly applied to both `sortedByDistance` (Mystery Box di Sekitar) and `sortedByPopularity` (Mystery Box Terlaris).
     - Responsive grid layout classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (3 columns on desktop -> 6 items forms an exact 3x2 grid).
     - Loading skeleton uses `Array.from({ length: 6 })` in both sections.
     - Stress harness confirmed card count invariance across payload sizes 0, 3, 6, 20, 100 items.

6. **R6: Marketplace Default Nearest Sorting & Numeric Distance** — **PASSED**
   - `src/pages/customer/CustomerMarketplace.tsx`: Initial state defaults to `sortField = 'lokasi'` and `sortOrder = 'asc'`.
   - `src/features/customer/marketplace/model.ts`: Maps numeric `distanceKm = typeof p.distance_km === 'number' ? p.distance_km : 9999`.
   - Sort comparator correctly orders numeric distances ascending, handles 0.0 km without fallback corruption, parses string distance fallback (`parseFloat(a.distanceText) || 9999`), and supports descending ordering and stable sorting.

---

## 2. Logic Chain

1. **Observation 4** proves that `MysteryBoxCard.tsx:74` contains:
   `const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');`
2. When a merchant has 10 units of inventory, `remainingBoxesText` is generated as `"Sisa 10 Box"`.
3. `stockMatch` matches `10` -> `stockCount = 10`. `stockCount === 0` is `false`.
4. However, the right-hand side `item.remainingBoxesText.toLowerCase().includes('0 box')` searches for the substring `"0 box"`.
5. In `"sisa 10 box"`, `"10 box"` contains `"0 box"`. Thus the expression evaluates to `true`.
6. `isOutOfStock` becomes `true`.
7. Lines 235-245 of `MysteryBoxCard.tsx` render the disabled button:
   ```tsx
   {isOutOfStock ? (
     <button type="button" disabled className="... bg-gray-200 text-gray-400 ... cursor-not-allowed">
       <span>Habis</span>
     </button>
   ) : ( ... )}
   ```
8. Legitimate in-stock products with inventory quantities such as 10, 20, 30, 50, 100 cannot be purchased by users on the Homepage or Marketplace.
9. This directly violates Requirement R4: *"Preserve actual stock data, inventory logic, out-of-stock handling, and order validation"*.
10. Therefore, the milestone deliverable cannot be approved in its current state.

---

## 3. Caveats

- R1, R2, R3, R5, and R6 passed all unit, integration, and stress tests without defects.
- Build (`npm run build`) and typecheck (`npm run typecheck`) succeed with 0 errors because the bug is logical rather than syntactic.
- The mitigation is straightforward and isolated to a single line in `src/components/customer/MysteryBoxCard.tsx`.

---

## 4. Conclusion & Actionable Recommendation

**Verdict**: **REJECT**

### Required Action for Worker 1 / Bug Fixer:
In `src/components/customer/MysteryBoxCard.tsx` line 74:
**Change**:
```ts
const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
```
**To**:
```ts
const isOutOfStock = stockCount === 0 || /\b0\s*box\b/i.test(item.remainingBoxesText);
```
*(or simply `const isOutOfStock = stockCount === 0;` since `stockCount` is already safely extracted via `parseInt` from `item.remainingBoxesText.match(/\d+/)`)*.

---

## 5. Verification Method

To reproduce this empirical challenge and verify the fix:

1. **Run the Challenger Verification Suite**:
   ```powershell
   node scripts/test_challenger_r1_r6.mjs
   ```
   *Expected Current Output*: Fails at `R4.4 [Empirical Adversarial Finding]`.  
   *Expected Post-Fix Output*: All 31 tests pass with code 0 (`ALL EMPIRICAL TESTS PASSED! Verdict: APPROVE`).

2. **Verify TypeScript & Build**:
   ```powershell
   npm run typecheck
   npm run build
   ```
   Both must continue exiting with code 0.
