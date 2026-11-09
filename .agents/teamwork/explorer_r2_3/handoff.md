# Challenger Test Suite (R1 - R6) Audit & Verification Report

**Agent**: Explorer 3 (`explorer_r2_3` — Challenger Test Suite Audit Specialist)  
**Parent Conversation ID**: `38968871-17e4-4323-bc74-f1f1c77fe5bd`  
**Milestone**: Iteration 2 Challenger Test Suite Audit  
**Status**: Investigation Complete — Ready for Implementer / Bug Fixer  

---

## 1. Observation

### 1.1 Direct Test Suite Execution
Direct execution of the Challenger 1 verification suite was performed in the workspace via:
```powershell
node scripts/test_challenger_r1_r6.mjs
```
**Exit Code**: `1`  
**Summary**: Total: 31 | Passed: 30 | Failed: 1  
**Verbatim Failure Output**:
```
  ✗ FAIL: R4.4 [Empirical Adversarial Finding]: Stock parsing in MysteryBoxCard line 74 falsely marks 10, 20, 50, 100 Box as out-of-stock
    -> BUG DETECTED in MysteryBoxCard.tsx:74 -> includes('0 box') matches '10 Box', '20 Box', '100 Box' as substrings! eval10: true, eval20: true, eval100: true. Products with multiple-of-10 stock are falsely disabled with 'Habis' button.

======================================================================
TOTAL TESTS: 31
PASSED: 30
FAILED: 1
======================================================================

VERIFICATION FAILED: Found regressions or unsatisfied requirements.
- R4.4 [Empirical Adversarial Finding]: Stock parsing in MysteryBoxCard line 74 falsely marks 10, 20, 50, 100 Box as out-of-stock: BUG DETECTED in MysteryBoxCard.tsx:74 -> includes('0 box') matches '10 Box', '20 Box', '100 Box' as substrings! eval10: true, eval20: true, eval100: true. Products with multiple-of-10 stock are falsely disabled with 'Habis' button.
```

---

### 1.2 Inspection of Source Code: `src/components/customer/MysteryBoxCard.tsx`
Lines 71-75 in `src/components/customer/MysteryBoxCard.tsx` contain:
```tsx
  // Check stock quantity for out-of-stock disabled button state
  const stockMatch = item.remainingBoxesText.match(/\d+/);
  const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
  const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
```
Lines 235-245 render:
```tsx
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full bg-[#e2e6df] text-[#8e958f] font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors duration-200 cursor-not-allowed flex items-center justify-center gap-1.5 shadow-none"
            aria-label={`${item.name || 'Mystery box'} habis`}
          >
            <span>Habis</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOrderClick(item);
            }}
            className="w-full bg-[#1b1c1c] hover:bg-[#2c302e] active:scale-[0.98] text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(27,28,28,0.12)] hover:shadow-[0_4px_12px_rgba(27,28,28,0.2)]"
            aria-label={`Pesan ${item.name || 'Mystery box'} sekarang`}
          >
            <span>Pesan Sekarang</span>
          </button>
        )}
```

---

### 1.3 Inspection of Test Suite: `scripts/test_challenger_r1_r6.mjs`
#### A. Test R4.4 (Lines 637–662)
```javascript
test('R4.4 [Empirical Adversarial Finding]: Stock parsing in MysteryBoxCard line 74 falsely marks 10, 20, 50, 100 Box as out-of-stock', () => {
  // Mirroring exact logic from src/components/customer/MysteryBoxCard.tsx line 72-74:
  // const stockMatch = item.remainingBoxesText.match(/\d+/);
  // const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
  // const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');

  function evaluateMysteryBoxOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || remainingBoxesText.toLowerCase().includes('0 box');
    return { stockCount, isOutOfStock };
  }

  // Stock 10, 20, 50, 100 should be in-stock (isOutOfStock === false)
  const eval10 = evaluateMysteryBoxOutOfStock('Sisa 10 Box');
  const eval20 = evaluateMysteryBoxOutOfStock('Sisa 20 Box');
  const eval100 = evaluateMysteryBoxOutOfStock('Sisa 100 Box');

  // Demonstrate empirical failure:
  // Because 'Sisa 10 Box' contains '0 Box', item.remainingBoxesText.toLowerCase().includes('0 box') is true!
  if (eval10.isOutOfStock || eval20.isOutOfStock || eval100.isOutOfStock) {
    throw new Error(
      `BUG DETECTED in MysteryBoxCard.tsx:74 -> includes('0 box') matches '10 Box', '20 Box', '100 Box' as substrings! eval10: ${eval10.isOutOfStock}, eval20: ${eval20.isOutOfStock}, eval100: ${eval100.isOutOfStock}. Products with multiple-of-10 stock are falsely disabled with 'Habis' button.`
    );
  }
});
```
Notice:
1. Test R4.4 does **not** import or read `src/components/customer/MysteryBoxCard.tsx`.
2. It hardcodes a local copy of the defective evaluation function `evaluateMysteryBoxOutOfStock`.
3. If an engineer fixes `MysteryBoxCard.tsx` alone, test R4.4 will **still fail** because `evaluateMysteryBoxOutOfStock` inside `scripts/test_challenger_r1_r6.mjs` will still evaluate `remainingBoxesText.toLowerCase().includes('0 box')`.

#### B. Test R4.3 (Lines 581–589)
```javascript
test('R4.3: Empirical verification of isOutOfStock logic and "Habis" disabled button', () => {
  function evaluateOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || remainingBoxesText.toLowerCase().includes('0 box');
    const buttonText = isOutOfStock ? 'Habis' : 'Pesan Sekarang';
    const isDisabled = isOutOfStock;
    return { stockCount, isOutOfStock, buttonText, isDisabled };
  }
...
```
Line 585 also repeats the raw substring match `remainingBoxesText.toLowerCase().includes('0 box')`. Although R4.3 currently passes because its inputs happen to be `['Sisa 0 Box', '0 Box', 'Tersedia 0 Box', 'Sisa 1 Box', 'Sisa 97 Box', 'Tersedia']` (none ending in 0 other than 0 itself), it carries the same defective logic.

---

### 1.4 Complete Catalog of All 31 Tests in `scripts/test_challenger_r1_r6.mjs`

| Test # | Requirement & Test Name | Target File(s) / Tested Artifact | Assertions & Edge Cases Verified | Current Status |
|---|---|---|---|---|
| 1 | **R1.1**: ToastContext provider clean mount | `src/context/ToastContext.tsx` | Asserts provider only wraps `{children}`; asserts no `fixed bottom-` or `fixed top-` classes. | **PASS** |
| 2 | **R1.2**: Toast component suppression | `src/components/common/Toast.tsx` | Asserts `Toast` unconditionally returns `null`. | **PASS** |
| 3 | **R1.3**: App.tsx toast mount check | `src/App.tsx` | Asserts `<Toast />` is not mounted; asserts no `fixed bottom-\d+.*toast` containers. | **PASS** |
| 4 | **R1.4**: Global floating toast scan | All `.tsx` in `src/components`, `src/pages`, `src/context`, `src/app` | Asserts 0 occurrences of `fixed bottom-4 right-4` combined with `/toast/i`. | **PASS** |
| 5 | **R1.5**: Auth forms accessible alerts | `CustomerLoginForm.tsx`, `CustomerRegisterForm.tsx` | Asserts presence of `errorMessage && ... role="alert" ... errorMessage`. | **PASS** |
| 6 | **R1.6**: Auth role guard & validation | `src/pages/auth/CustomerAuth.tsx` | Asserts inline error setters for role mismatch (customer in seller portal and vice versa), password < 8 chars, password mismatch, unchecked terms. | **PASS** |
| 7 | **R1.7**: BuatDagangan inline alerts | `src/pages/seller/BuatDagangan.tsx` | Asserts inline alert banner (`role="alert"`) validating short name (< 2 chars), inverted pricing, and 0 stock. | **PASS** |
| 8 | **R1.8**: ToastContext queue spam stress | In-memory queue simulator | Asserts 50 duplicate messages in 100ms debounce to 1 item (2500ms cooldown); queue size capped at max 3. | **PASS** |
| 9 | **R2.1**: CustomerHome testimonials | `src/pages/customer/CustomerHome.tsx` | Asserts `#testimoni-section` does NOT render `{testi.role}`; retains `{testi.name}` and `{testi.quote}`. | **PASS** |
| 10 | **R2.2**: StoreReviewsList clean names | `src/components/customer/store/StoreReviewsList.tsx` | Asserts review items do NOT render `{rev.role}`; retains `{rev.name}`. | **PASS** |
| 11 | **R2.3**: ReviewCard role omission | `src/components/reviews/ReviewCard.tsx` | Asserts no `role` props or subtitles rendered; retains `{reviewerName}` and `StarRating`. | **PASS** |
| 12 | **R2.4**: Global review role badge scan | `StoreReviewsList.tsx`, `ProductReviewsSection.tsx`, `ReviewCard.tsx`, `SellerReviews.tsx` | Asserts 0 occurrences of `<span...>(Penyelamat Makanan|Mitra Toko|Pelanggan|Seller)</span>`. | **PASS** |
| 13 | **R3.1**: Batch rating fetch & caching | `src/services/productRatingService.ts` simulator | Asserts deduplication of product IDs, in-memory caching (uncached query count = 1), and calculation. | **PASS** |
| 14 | **R3.2**: Rating oracle & 1-decimal rounding | Math oracle | Tests `[5,4,4]->4.3`, `[5,5,4,4]->4.5`, `[1,2,3]->2.0`, `[]->0.0`, and `metaTotal` precedence. | **PASS** |
| 15 | **R3.3**: MysteryBoxCard unconditional rating | `src/components/customer/MysteryBoxCard.tsx` | Asserts no `!isPopular &&` filter, formats rating as `r.toFixed(1) : '-'`, count as `${numReviews} ulasan : 'Belum ada ulasan'`, links to `#toko?...&section=ulasan-pelanggan`. | **PASS** |
| 16 | **R3.4**: Batch rating enrichment in pages | `CustomerHome.tsx`, `CustomerMarketplace.tsx` | Asserts both call `batchFetchProductRatings(...)` before rendering cards to prevent N+1 queries. | **PASS** |
| 17 | **R3.5**: Malformed review data resilience | Math oracle | Tests resilience against `null`, string ratings `'5'`, `'4.5'`, `undefined`, `null` array elements without `NaN`. | **PASS** |
| 18 | **R3.6**: 10,000 reviews benchmark | Benchmark oracle | Computes 10,000 reviews in < 20ms (empirical runtime ~0.5ms). | **PASS** |
| 19 | **R4.1**: MysteryBoxCard stock badge removal | `src/components/customer/MysteryBoxCard.tsx` | Asserts Top Badges Overlay does NOT render `remainingBoxesText` or `Sisa \d+`; retains distance & discount. | **PASS** |
| 20 | **R4.2**: StoreDaganganGrid & OrderDetail badges | `StoreDaganganGrid.tsx`, `CustomerOrderDetail.tsx` | Asserts neither renders `Sisa \{...\} Box`. | **PASS** |
| 21 | **R4.3**: Out-of-stock evaluation & button | Out-of-stock logic simulator | Tests `'Sisa 0 Box'`, `'0 Box'`, `'Tersedia 0 Box'` -> Habis / disabled; `'Sisa 1 Box'`, `'Sisa 97 Box'`, `'Tersedia'` -> Pesan Sekarang / enabled. | **PASS** |
| 22 | **R4.4**: Stock parsing 10, 20, 50, 100 Box | `MysteryBoxCard.tsx:74` logic | Tests `'Sisa 10 Box'`, `'Sisa 20 Box'`, `'Sisa 100 Box'`. Substring match triggers defect. | **FAIL** |
| 23 | **R5.1**: CustomerHome 6-product slice | `src/pages/customer/CustomerHome.tsx` | Asserts `.slice(0, 6)` on both `sortedByDistance` and `sortedByPopularity`. | **PASS** |
| 24 | **R5.2**: Clamping pipeline stress | Array clamping | Tests payload sizes 0, 3, 6, 20, 100 correctly clamp to max 6. | **PASS** |
| 25 | **R5.3**: CustomerHome 3x2 desktop grid | `src/pages/customer/CustomerHome.tsx` | Asserts `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` in both nearby and popular sections. | **PASS** |
| 26 | **R5.4**: Skeletons match 6 cards | `src/pages/customer/CustomerHome.tsx` | Asserts at least 2 instances of `Array.from({ length: 6 })`. | **PASS** |
| 27 | **R6.1**: Marketplace default sort state | `src/pages/customer/CustomerMarketplace.tsx` | Asserts `useState<SortField>('lokasi')` and `useState<SortOrder>('asc')`. | **PASS** |
| 28 | **R6.2**: Model numeric distance mapping | `src/features/customer/marketplace/model.ts` | Asserts `distanceKm: typeof p.distance_km === 'number' ? p.distance_km : 9999`. | **PASS** |
| 29 | **R6.3**: Comparator asc/desc with edge cases | Sort comparator | Tests sorting across 0.0km, 0.1km, string fallback 1.2km, 3.8km, 12.5km, NaN fallback 9999. | **PASS** |
| 30 | **R6.4**: Comparator stability | Sort comparator | Asserts identical distances return 0. | **PASS** |
| 31 | **R6.5**: Floating point & localized distance | Sort comparator | Tests micro-distances (`0.00001 < 0.00002`), huge distances (`50000 < 99999`), and comma decimal strings (`"0,5 km" < "0.8 km"`). | **PASS** |

---

## 2. Logic Chain

1. **Defect in `MysteryBoxCard.tsx` (Observation 1.2)**:
   - Line 72 extracts digits: `const stockMatch = item.remainingBoxesText.match(/\d+/);`
   - Line 73 parses integer: `const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;`
   - Line 74 performs: `const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');`
   - When an item has 10 units in stock, `item.remainingBoxesText` is `"Sisa 10 Box"`.
   - `stockMatch[0]` is `"10"`, so `stockCount` is `10`. `stockCount === 0` is `false`.
   - However, the second operand evaluates `"sisa 10 box".includes('0 box')`.
   - Because the characters `'0'` and `' '` and `'b'` and `'o'` and `'x'` appear consecutively within `"10 box"`, JavaScript string `.includes()` evaluates to `true`.
   - Therefore, `isOutOfStock` evaluates to `true`.
   - Lines 235-245 render the disabled `<button disabled>Habis</button>`.
   - The same false positive occurs for 20 Box, 30 Box, 40 Box, 50 Box, 100 Box, 1000 Box, preventing customers from ordering in-stock products.
   - This directly breaks Requirement R4 ("Preserve actual stock data, inventory logic, out-of-stock handling, and order validation").

2. **Decoupling Defect in Test Suite `scripts/test_challenger_r1_r6.mjs` (Observation 1.3)**:
   - In test R4.4, Challenger 1 created an adversarial finding rather than an inspection test.
   - The test function defines a local closure `evaluateMysteryBoxOutOfStock` containing the exact defective code:
     `const isOutOfStock = stockCount === 0 || remainingBoxesText.toLowerCase().includes('0 box');`
   - It does not read `src/components/customer/MysteryBoxCard.tsx`.
   - Consequently, if an engineer fixes `MysteryBoxCard.tsx`, running `node scripts/test_challenger_r1_r6.mjs` will still fail with the exact same error message because the test function itself evaluates its own local defective closure.
   - Additionally, line 585 in test R4.3 repeats the same defective line in its local helper `evaluateOutOfStock`.

3. **Conclusion Supported by Evidence**:
   - To achieve 100% pass rate (31/31 passed) and permanently resolve the defect:
     - Worker 1 / Bug Fixer must patch `src/components/customer/MysteryBoxCard.tsx` line 74.
     - The verification test suite `scripts/test_challenger_r1_r6.mjs` must be synchronized: test R4.4 must read `MysteryBoxCard.tsx` to verify absence of `includes('0 box')` and test the corrected stock evaluator across both zero and non-zero multiples of 10. Test R4.3 must also use the corrected stock evaluator.

---

## 3. Caveats

1. **Source Code Write Permission**: As an Explorer agent, I am bound by the read-only constraint and cannot modify `src/components/customer/MysteryBoxCard.tsx` or `scripts/test_challenger_r1_r6.mjs`. The exact code changes are specified below for the assigned implementer.
2. **Backend Stock Representation**: The backend does not always return a separate integer `stock` property on public mystery box items; it commonly provides `remainingBoxesText` formatted as `"Sisa X Box"`. Therefore, parsing `remainingBoxesText` with integer regex and fallback is necessary and must remain robust.
3. **Other Test Suites**: `scripts/test_challenger_r7_r8.mjs` is completely independent and already passes 42/42 tests (100%).

---

## 4. Conclusion & Proposed Code Rectification

### 4.1 Target 1: `src/components/customer/MysteryBoxCard.tsx`
**File**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\src\components\customer\MysteryBoxCard.tsx`  
**Line Range**: 71–75  

#### Before:
```tsx
  // Check stock quantity for out-of-stock disabled button state
  const stockMatch = item.remainingBoxesText.match(/\d+/);
  const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
  const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
```

#### After (Proposed):
```tsx
  // Check stock quantity for out-of-stock disabled button state
  const stockMatch = item.remainingBoxesText.match(/\d+/);
  const stockCount = typeof item.stock === 'number'
    ? item.stock
    : (stockMatch ? parseInt(stockMatch[0], 10) : 1);
  const isOutOfStock = stockCount === 0 || /\b0\s*box\b/i.test(item.remainingBoxesText);
```
*(Alternatively, simply `const isOutOfStock = stockCount === 0;` since `stockMatch[0]` parsed with `parseInt` is 0 if and only if the digits are 0)*.

---

### 4.2 Target 2: `scripts/test_challenger_r1_r6.mjs`
**File**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\scripts\test_challenger_r1_r6.mjs`  

#### A. Lines 582–588 in Test R4.3:
##### Before:
```javascript
  function evaluateOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || remainingBoxesText.toLowerCase().includes('0 box');
    const buttonText = isOutOfStock ? 'Habis' : 'Pesan Sekarang';
    const isDisabled = isOutOfStock;
    return { stockCount, isOutOfStock, buttonText, isDisabled };
  }
```
##### After:
```javascript
  function evaluateOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || /\b0\s*box\b/i.test(remainingBoxesText);
    const buttonText = isOutOfStock ? 'Habis' : 'Pesan Sekarang';
    const isDisabled = isOutOfStock;
    return { stockCount, isOutOfStock, buttonText, isDisabled };
  }
```

#### B. Lines 637–662 in Test R4.4:
##### Before:
```javascript
test('R4.4 [Empirical Adversarial Finding]: Stock parsing in MysteryBoxCard line 74 falsely marks 10, 20, 50, 100 Box as out-of-stock', () => {
  // Mirroring exact logic from src/components/customer/MysteryBoxCard.tsx line 72-74:
  // const stockMatch = item.remainingBoxesText.match(/\d+/);
  // const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
  // const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');

  function evaluateMysteryBoxOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || remainingBoxesText.toLowerCase().includes('0 box');
    return { stockCount, isOutOfStock };
  }

  // Stock 10, 20, 50, 100 should be in-stock (isOutOfStock === false)
  const eval10 = evaluateMysteryBoxOutOfStock('Sisa 10 Box');
  const eval20 = evaluateMysteryBoxOutOfStock('Sisa 20 Box');
  const eval100 = evaluateMysteryBoxOutOfStock('Sisa 100 Box');

  // Demonstrate empirical failure:
  // Because 'Sisa 10 Box' contains '0 Box', item.remainingBoxesText.toLowerCase().includes('0 box') is true!
  if (eval10.isOutOfStock || eval20.isOutOfStock || eval100.isOutOfStock) {
    throw new Error(
      `BUG DETECTED in MysteryBoxCard.tsx:74 -> includes('0 box') matches '10 Box', '20 Box', '100 Box' as substrings! eval10: ${eval10.isOutOfStock}, eval20: ${eval20.isOutOfStock}, eval100: ${eval100.isOutOfStock}. Products with multiple-of-10 stock are falsely disabled with 'Habis' button.`
    );
  }
});
```

##### After (Automated Regression & File Inspection Assertion):
```javascript
test('R4.4: Stock parsing in MysteryBoxCard line 74 does not falsely mark 10, 20, 50, 100 Box as out-of-stock', () => {
  const cardContent = readFile('src/components/customer/MysteryBoxCard.tsx');

  // Verify that raw substring match includes('0 box') has been eliminated from MysteryBoxCard.tsx
  assert.doesNotMatch(
    cardContent,
    /includes\(\s*['"]0 box['"]\s*\)/i,
    "MysteryBoxCard must NOT use substring match includes('0 box') which falsely matches 10, 20, 100 Box"
  );

  function evaluateMysteryBoxOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || /\b0\s*box\b/i.test(remainingBoxesText);
    return { stockCount, isOutOfStock };
  }

  // Stock 10, 20, 50, 100 MUST be in-stock (isOutOfStock === false)
  const eval10 = evaluateMysteryBoxOutOfStock('Sisa 10 Box');
  const eval20 = evaluateMysteryBoxOutOfStock('Sisa 20 Box');
  const eval50 = evaluateMysteryBoxOutOfStock('Sisa 50 Box');
  const eval100 = evaluateMysteryBoxOutOfStock('Sisa 100 Box');

  assert.strictEqual(eval10.isOutOfStock, false, 'Sisa 10 Box must be in-stock');
  assert.strictEqual(eval20.isOutOfStock, false, 'Sisa 20 Box must be in-stock');
  assert.strictEqual(eval50.isOutOfStock, false, 'Sisa 50 Box must be in-stock');
  assert.strictEqual(eval100.isOutOfStock, false, 'Sisa 100 Box must be in-stock');

  // Truly out-of-stock cases MUST remain out-of-stock (isOutOfStock === true)
  const eval0 = evaluateMysteryBoxOutOfStock('Sisa 0 Box');
  const evalZero = evaluateMysteryBoxOutOfStock('0 Box');
  const evalTersedia0 = evaluateMysteryBoxOutOfStock('Tersedia 0 Box');
  assert.strictEqual(eval0.isOutOfStock, true, 'Sisa 0 Box must be out-of-stock');
  assert.strictEqual(evalZero.isOutOfStock, true, '0 Box must be out-of-stock');
  assert.strictEqual(evalTersedia0.isOutOfStock, true, 'Tersedia 0 Box must be out-of-stock');
});
```

---

## 5. Verification Method

Once Worker 1 applies the proposed edits:

1. **Execute Challenger 1 Test Suite**:
   ```powershell
   node scripts/test_challenger_r1_r6.mjs
   ```
   **Expected Result**:
   - Exit Code: `0`
   - Output:
     ```
     ======================================================================
     TOTAL TESTS: 31
     PASSED: 31
     FAILED: 0
     ======================================================================
     ALL EMPIRICAL TESTS PASSED! Verdict: APPROVE
     ```

2. **Execute Challenger 2 Test Suite (R7 - R8)**:
   ```powershell
   node scripts/test_challenger_r7_r8.mjs
   ```
   **Expected Result**:
   - Exit Code: `0`
   - Output: `42 passed, 0 failed out of 42 tests. ALL EMPIRICAL TESTS PASSED WITH 0 DEFECTS (VERDICT: APPROVE)`.

3. **Execute Static Build & Typecheck**:
   ```powershell
   npm run typecheck
   npm run build
   ```
   **Expected Result**:
   - Both commands exit with code `0` and 0 errors.

4. **Invalidation Conditions**:
   - If `node scripts/test_challenger_r1_r6.mjs` fails any test or exits with non-zero.
   - If `src/components/customer/MysteryBoxCard.tsx` contains `includes('0 box')`.
   - If an order card with `"Sisa 10 Box"` renders `"Habis"` or has a disabled order button.
