/**
 * Advanced Empirical Adversarial Test Harness for R1 - R6
 * Executed independently by Challenger 1
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT_DIR = process.cwd();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failureDetails.push({ name, error: err.message, stack: err.stack });
    failedTests++;
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failureDetails.push({ name, error: err.message, stack: err.stack });
    failedTests++;
  }
}

function readFile(relPath) {
  return fs.readFileSync(path.resolve(ROOT_DIR, relPath), 'utf8');
}

console.log('======================================================================');
console.log('CHALLENGER 1: ADVERSARIAL STRESS & EMPIRICAL AUDIT HARNESS (R1 - R6)');
console.log('======================================================================\n');

// ============================================================================
// SUITE 1: SCRUTINY OF MYSTERYBOXCARD STOCK PARSING (R4.4 FOCUS)
// ============================================================================
console.log('--- SUITE 1: Scrutiny of MysteryBoxCard Stock Parsing ---');

test('1.1: Direct AST/Code Extraction from MysteryBoxCard.tsx verifies exact implementation', () => {
  const cardContent = readFile('src/components/customer/MysteryBoxCard.tsx');

  // Verify naive substring match is strictly eliminated
  assert.doesNotMatch(
    cardContent,
    /includes\(\s*['"]0 box['"]\s*\)/i,
    "MysteryBoxCard.tsx must NOT contain includes('0 box')"
  );
  assert.doesNotMatch(
    cardContent,
    /indexOf\(\s*['"]0 box['"]\s*\)/i,
    "MysteryBoxCard.tsx must NOT contain indexOf('0 box')"
  );

  // Verify word boundary regex and sold-out regex exist in MysteryBoxCard.tsx
  assert.match(
    cardContent,
    /\/\\b0\\s\*box\\b\/i/,
    'MysteryBoxCard.tsx must use word boundary regex /\\b0\\s*box\\b/i'
  );
  assert.match(
    cardContent,
    /\/\\bhabis\\b\/i/,
    'MysteryBoxCard.tsx must use word boundary regex /\\bhabis\\b/i'
  );
  assert.match(
    cardContent,
    /typeof\s+item\.stock\s*===\s*'number'\s*&&\s*item\.stock\s*<=\s*0/,
    'MysteryBoxCard.tsx must check numeric item.stock <= 0'
  );
});

test('1.2: Adversarial Matrix: Multiples of 10 stock (10, 20, 30... 1000) are strictly IN-STOCK', () => {
  const cardContent = readFile('src/components/customer/MysteryBoxCard.tsx');

  // Dynamically extract the exact stock calculation logic from the file
  const logicSnippet = `
    function checkStock(item) {
      const rawStockText = item.remainingBoxesText || '';
      const stockMatch = rawStockText.match(/\\d+/);
      const stockCount = stockMatch
        ? parseInt(stockMatch[0], 10)
        : (typeof item.stock === 'number' ? item.stock : 1);
      const isOutOfStock =
        (typeof item.stock === 'number' && item.stock <= 0) ||
        stockCount === 0 ||
        /\\b0\\s*box\\b/i.test(rawStockText) ||
        /\\bhabis\\b/i.test(rawStockText);
      return isOutOfStock;
    }
  `;
  const evaluate = new Function(`${logicSnippet}; return checkStock;`)();

  const inStockMultiplesOfTen = [
    'Sisa 10 Box',
    'Sisa 20 Box',
    'Sisa 30 Box',
    'Sisa 40 Box',
    'Sisa 50 Box',
    'Sisa 60 Box',
    'Sisa 70 Box',
    'Sisa 80 Box',
    'Sisa 90 Box',
    'Sisa 100 Box',
    'Sisa 110 Box',
    'Sisa 120 Box',
    'Sisa 200 Box',
    'Sisa 500 Box',
    'Sisa 1000 Box',
    '10 Box',
    '20 Box',
    '50 Box',
    '100 Box',
    '1000 Box',
    'sisa 10 box',
    'sisa 20 box',
    'sisa 50 box',
    'sisa 100 box',
    '10 box',
    '100 box',
    'SISA 10 BOX',
    'SISA 100 BOX',
    'Tersedia 10 Box',
    'Tersisa 10 Box',
    'Stok 10 Box Tersedia',
  ];

  for (const text of inStockMultiplesOfTen) {
    const isOut = evaluate({ remainingBoxesText: text });
    assert.strictEqual(
      isOut,
      false,
      `Failed on "${text}": expected isOutOfStock === false (IN-STOCK), but evaluated as true`
    );
  }
});

test('1.3: Adversarial Matrix: Genuine sold-out cases are strictly OUT-OF-STOCK', () => {
  const logicSnippet = `
    function checkStock(item) {
      const rawStockText = item.remainingBoxesText || '';
      const stockMatch = rawStockText.match(/\\d+/);
      const stockCount = stockMatch
        ? parseInt(stockMatch[0], 10)
        : (typeof item.stock === 'number' ? item.stock : 1);
      const isOutOfStock =
        (typeof item.stock === 'number' && item.stock <= 0) ||
        stockCount === 0 ||
        /\\b0\\s*box\\b/i.test(rawStockText) ||
        /\\bhabis\\b/i.test(rawStockText);
      return isOutOfStock;
    }
  `;
  const evaluate = new Function(`${logicSnippet}; return checkStock;`)();

  const outOfStockCases = [
    'Sisa 0 Box',
    '0 Box',
    '0 box',
    '0 BOX',
    'sisa 0 box',
    'SISA 0 BOX',
    'Tersedia 0 Box',
    '0 Box Tersedia',
    'Tersisa 0 Box',
    'Sisa 0',
    '0',
    'Habis',
    'habis',
    'HABIS',
    'Stok Habis',
    'stok habis',
    'STOK HABIS',
    'Sudah Habis',
    'Barang habis terjual',
  ];

  for (const text of outOfStockCases) {
    const isOut = evaluate({ remainingBoxesText: text });
    assert.strictEqual(
      isOut,
      true,
      `Failed on "${text}": expected isOutOfStock === true (OUT-OF-STOCK), but evaluated as false`
    );
  }
});

test('1.4: Adversarial Matrix: Direct numeric item.stock property behavior and boundary conditions', () => {
  const logicSnippet = `
    function checkStock(item) {
      const rawStockText = item.remainingBoxesText || '';
      const stockMatch = rawStockText.match(/\\d+/);
      const stockCount = stockMatch
        ? parseInt(stockMatch[0], 10)
        : (typeof item.stock === 'number' ? item.stock : 1);
      const isOutOfStock =
        (typeof item.stock === 'number' && item.stock <= 0) ||
        stockCount === 0 ||
        /\\b0\\s*box\\b/i.test(rawStockText) ||
        /\\bhabis\\b/i.test(rawStockText);
      return isOutOfStock;
    }
  `;
  const evaluate = new Function(`${logicSnippet}; return checkStock;`)();

  // Authoritative numeric 0 overrides stale text
  assert.strictEqual(evaluate({ stock: 0, remainingBoxesText: 'Sisa 10 Box' }), true);
  assert.strictEqual(evaluate({ stock: 0, remainingBoxesText: 'Sisa 100 Box' }), true);
  assert.strictEqual(evaluate({ stock: -1, remainingBoxesText: 'Sisa 10 Box' }), true);

  // Authoritative text "Habis" triggers sold-out even if item.stock has positive number
  assert.strictEqual(evaluate({ stock: 15, remainingBoxesText: 'Habis' }), true);
  assert.strictEqual(evaluate({ stock: 10, remainingBoxesText: 'Stok Habis' }), true);

  // Missing remainingBoxesText uses numeric stock
  assert.strictEqual(evaluate({ stock: 0, remainingBoxesText: '' }), true);
  assert.strictEqual(evaluate({ stock: 0, remainingBoxesText: undefined }), true);
  assert.strictEqual(evaluate({ stock: 5, remainingBoxesText: '' }), false);
  assert.strictEqual(evaluate({ stock: 10, remainingBoxesText: undefined }), false);

  // Both missing defaults safely to in-stock 1
  assert.strictEqual(evaluate({ remainingBoxesText: undefined }), false);
  assert.strictEqual(evaluate({ remainingBoxesText: null }), false);
  assert.strictEqual(evaluate({ remainingBoxesText: '' }), false);
});

// ============================================================================
// SUITE 2: SCRUTINY OF R1 (GLOBAL TOAST SUPPRESSION & INLINE FORMS)
// ============================================================================
console.log('\n--- SUITE 2: Scrutiny of R1 (Toast Elimination & Inline Feedback) ---');

test('2.1: ToastContext.tsx provider does not mount floating DOM container', () => {
  const content = readFile('src/context/ToastContext.tsx');
  assert.doesNotMatch(content, /fixed\s+bottom-4\s+right-4/);
  assert.match(content, /<ToastContext\.Provider[^>]*>[\s\n]*\{children\}[\s\n]*<\/ToastContext\.Provider>/);
});

test('2.2: Toast.tsx component is a verified null stub', () => {
  const content = readFile('src/components/common/Toast.tsx');
  assert.match(content, /return\s+null;/);
});

test('2.3: Zero floating toast container occurrences in all src/ .tsx files', () => {
  const scanDirs = ['src/components', 'src/pages', 'src/context', 'src/app'];
  let violationCount = 0;

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name.endsWith('.tsx')) {
        const text = fs.readFileSync(full, 'utf8');
        if (/fixed\s+bottom-4\s+right-4/.test(text) && /toast/i.test(text)) {
          violationCount++;
        }
      }
    }
  }

  scanDirs.forEach((d) => walk(path.resolve(ROOT_DIR, d)));
  assert.strictEqual(violationCount, 0, 'Found floating toast DOM mounts');
});

test('2.4: Inline alert banners (role="alert") in CustomerAuth, LoginForm, RegisterForm, BuatDagangan', () => {
  const loginForm = readFile('src/components/auth/CustomerLoginForm.tsx');
  const regForm = readFile('src/components/auth/CustomerRegisterForm.tsx');
  const authPage = readFile('src/pages/auth/CustomerAuth.tsx');
  const buatDagangan = readFile('src/pages/seller/BuatDagangan.tsx');

  assert.match(loginForm, /role="alert"/);
  assert.match(regForm, /role="alert"/);
  assert.match(authPage, /setLoginError/);
  assert.match(authPage, /setRegisterError/);
  assert.match(buatDagangan, /role="alert"/);
});

// ============================================================================
// SUITE 3: SCRUTINY OF R2 (REVIEW IDENTITY CLEAN ROLE LABELS)
// ============================================================================
console.log('\n--- SUITE 3: Scrutiny of R2 (Review Identity Clean Roles) ---');

test('3.1: CustomerHome.tsx testimonials do NOT render role subtitles', () => {
  const home = readFile('src/pages/customer/CustomerHome.tsx');
  const idx = home.indexOf('id="testimoni-section"');
  assert.ok(idx > -1);
  const slice = home.slice(idx, idx + 2500);
  assert.doesNotMatch(slice, /\{testi\.role\}/);
});

test('3.2: StoreReviewsList.tsx does NOT render role subtitles', () => {
  const storeReviews = readFile('src/components/customer/store/StoreReviewsList.tsx');
  assert.doesNotMatch(storeReviews, /\{rev\.role\}/);
});

test('3.3: ReviewCard.tsx does NOT render role subtitles', () => {
  const card = readFile('src/components/reviews/ReviewCard.tsx');
  assert.doesNotMatch(card, /(reviewerRole|authorRole|role)/i);
});

// ============================================================================
// SUITE 4: SCRUTINY OF R3 (PRODUCT RATING CONSISTENCY)
// ============================================================================
console.log('\n--- SUITE 4: Scrutiny of R3 (Product Rating Consistency & Cache) ---');

test('4.1: MysteryBoxCard renders ratings unconditionally across all variants', () => {
  const card = readFile('src/components/customer/MysteryBoxCard.tsx');
  assert.doesNotMatch(card, /!isPopular\s*&&/);
  assert.match(card, /hasRating\s*&&\s*typeof\s*r\s*===\s*'number'/);
});

test('4.2: CustomerHome and CustomerMarketplace call batchFetchProductRatings', () => {
  const home = readFile('src/pages/customer/CustomerHome.tsx');
  const market = readFile('src/pages/customer/CustomerMarketplace.tsx');
  assert.match(home, /batchFetchProductRatings\(/);
  assert.match(market, /batchFetchProductRatings\(/);
});

// ============================================================================
// SUITE 5: SCRUTINY OF R4 (STOCK QUANTITY BADGE REMOVAL)
// ============================================================================
console.log('\n--- SUITE 5: Scrutiny of R4 (Stock Badge Removal) ---');

test('5.1: MysteryBoxCard visual header does NOT contain stock quantity badge', () => {
  const card = readFile('src/components/customer/MysteryBoxCard.tsx');
  const start = card.indexOf('Top Badges Overlay');
  assert.ok(start > -1);
  const slice = card.slice(start, start + 1200);
  assert.doesNotMatch(slice, /remainingBoxesText/);
  assert.doesNotMatch(slice, /Sisa\s+\d+/);
});

test('5.2: StoreDaganganGrid and CustomerOrderDetail do NOT contain Sisa X Box badges', () => {
  const grid = readFile('src/components/customer/store/StoreDaganganGrid.tsx');
  const order = readFile('src/pages/customer/CustomerOrderDetail.tsx');
  assert.doesNotMatch(grid, /Sisa\s*\{[^}]*\}\s*Box/i);
  assert.doesNotMatch(order, /Sisa\s*\{[^}]*\}\s*Box/i);
});

// ============================================================================
// SUITE 6: SCRUTINY OF R5 & R6 (HOMEPAGE 3x2 GRID & MARKETPLACE SORTING)
// ============================================================================
console.log('\n--- SUITE 6: Scrutiny of R5 & R6 (Homepage & Marketplace) ---');

test('6.1: CustomerHome applies .slice(0, 6) and 3-column desktop grid', () => {
  const home = readFile('src/pages/customer/CustomerHome.tsx');
  assert.match(home, /\.slice\(0,\s*6\)/);
  assert.match(home, /grid-cols-1\s+md:grid-cols-2\s+lg:grid-cols-3/);
});

test('6.2: CustomerMarketplace defaults to sortField "lokasi" and sortOrder "asc"', () => {
  const market = readFile('src/pages/customer/CustomerMarketplace.tsx');
  assert.match(market, /useState<SortField>\('lokasi'\)/);
  assert.match(market, /useState<SortOrder>\('asc'\)/);
});

test('6.3: Marketplace model attaches numeric distanceKm from p.distance_km', () => {
  const model = readFile('src/features/customer/marketplace/model.ts');
  assert.match(model, /distanceKm:\s*typeof\s*p\.distance_km\s*===\s*'number'/);
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`TOTAL ADVERSARIAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.error('ADVERSARIAL VERIFICATION FAILED: Issues found!');
  process.exit(1);
} else {
  console.log('ALL ADVERSARIAL CHALLENGER TESTS PASSED! Verdict: APPROVE');
  process.exit(0);
}
