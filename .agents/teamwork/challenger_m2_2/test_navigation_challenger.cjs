const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Color helpers for terminal output
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const red = (t) => `\x1b[31m${t}\x1b[0m`;
const bold = (t) => `\x1b[1m${t}\x1b[0m`;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${green('✔')} ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ${red('✖')} ${name}`);
    console.error(`    ${red(err.message)}`);
  }
}

async function run() {
  console.log(bold('\n======================================================'));
  console.log(bold('  Milestone 2 Navigation & Hash Routing Challenger Test'));
  console.log(bold('======================================================\n'));

  // 1. Dynamic import of hashRouting.ts
  const hashRoutingPath = path.resolve(__dirname, '../../../src/app/hashRouting.ts');
  const hashRouting = await import('file:///' + hashRoutingPath.replace(/\\/g, '/'));
  const { parseHash, safeDecode } = hashRouting;

  // Helper matching logic as implemented in App.tsx and useHashNavigation.ts
  function resolveActiveView(hash) {
    const { path } = parseHash(hash);
    if (path.startsWith('ulasan-seller') || path === 'ulasan') {
      return 'view-ulasan';
    }
    if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
      return 'view-customer-store';
    }
    return 'other';
  }

  console.log(bold('Suite 1: parseHash & Route Resolution'));

  test('1.1 #ulasan-seller -> path is "ulasan-seller" and resolves to view-ulasan', () => {
    const res = parseHash('#ulasan-seller');
    assert.strictEqual(res.path, 'ulasan-seller');
    assert.strictEqual(resolveActiveView('#ulasan-seller'), 'view-ulasan');
  });

  test('1.2 #ulasan -> path is "ulasan" and resolves to view-ulasan', () => {
    const res = parseHash('#ulasan');
    assert.strictEqual(res.path, 'ulasan');
    assert.strictEqual(resolveActiveView('#ulasan'), 'view-ulasan');
  });

  test('1.3 #toko?name=Toko%20Reza&id=123&section=ulasan-pelanggan -> params extracted and anchor set', () => {
    const res = parseHash('#toko?name=Toko%20Reza&id=123&section=ulasan-pelanggan');
    assert.strictEqual(res.path, 'toko');
    assert.strictEqual(res.params.get('name'), 'Toko Reza');
    assert.strictEqual(res.params.get('id'), '123');
    assert.strictEqual(res.params.get('section'), 'ulasan-pelanggan');
    assert.strictEqual(res.anchor, 'ulasan-pelanggan');
    assert.strictEqual(resolveActiveView('#toko?name=Toko%20Reza&id=123&section=ulasan-pelanggan'), 'view-customer-store');
  });

  test('1.4 #toko#ulasan-pelanggan -> secondary anchor extracted as section', () => {
    const res = parseHash('#toko#ulasan-pelanggan');
    assert.strictEqual(res.path, 'toko');
    assert.strictEqual(res.anchor, 'ulasan-pelanggan');
  });

  test('1.5 Edge Case: Uppercase #ULASAN-SELLER normalizes to lowercase and matches view-ulasan', () => {
    const res = parseHash('#ULASAN-SELLER');
    assert.strictEqual(res.path, 'ulasan-seller');
    assert.strictEqual(resolveActiveView('#ULASAN-SELLER'), 'view-ulasan');
  });

  test('1.6 Edge Case: Query parameters with secondary anchor #toko?name=Toko%20Reza#ulasan-pelanggan', () => {
    const res = parseHash('#toko?name=Toko%20Reza#ulasan-pelanggan');
    assert.strictEqual(res.path, 'toko');
    assert.strictEqual(res.params.get('name'), 'Toko Reza');
    assert.strictEqual(res.anchor, 'ulasan-pelanggan');
  });

  test('1.7 Edge Case: safeDecode decodes properly and survives malformed URI strings', () => {
    assert.strictEqual(safeDecode('Toko%20Reza'), 'Toko Reza');
    assert.strictEqual(safeDecode('%E0%A4%A'), '%E0%A4%A'); // Malformed UTF-8 sequence returns raw string without throwing
  });

  test('1.8 Edge Case: Empty or bare hash inputs', () => {
    const r1 = parseHash('');
    assert.strictEqual(r1.path, '');
    const r2 = parseHash('#');
    assert.strictEqual(r2.path, '');
  });

  console.log(bold('\nSuite 2: Component Code Inspection & Touchpoints'));

  const rootDir = path.resolve(__dirname, '../../../');

  test('2.1 CustomerProductDetail.tsx has clickable rating leading to ulasan-pelanggan', () => {
    const filePath = path.join(rootDir, 'src/pages/customer/CustomerProductDetail.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(content.includes('ulasan-pelanggan'), 'Missing ulasan-pelanggan reference');
    assert(content.includes('aria-label="Lihat ulasan toko"'), 'Missing accessible aria-label');
    assert(content.includes('onNavigateStore(storeName, product?.storeId, \'ulasan-pelanggan\')'), 'Missing onNavigateStore handler with ulasan-pelanggan');
    assert(content.includes('role="button"'), 'Missing role="button"');
    assert(content.includes('tabIndex={0}'), 'Missing tabIndex={0} keyboard accessibility');
  });

  test('2.2 StoreReviewsList.tsx has id="ulasan-pelanggan" and scroll-mt-28', () => {
    const filePath = path.join(rootDir, 'src/components/customer/store/StoreReviewsList.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(content.includes('id="ulasan-pelanggan"'), 'Missing id="ulasan-pelanggan"');
    assert(content.includes('scroll-mt-28'), 'Missing scroll-mt-28 offset class');
  });

  test('2.3 CustomerStoreDetail.tsx sets activeTab="ulasan" and uses requestAnimationFrame polling', () => {
    const filePath = path.join(rootDir, 'src/pages/customer/CustomerStoreDetail.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(content.includes("setActiveTab('ulasan')"), 'Missing setActiveTab("ulasan") call');
    assert(content.includes('requestAnimationFrame(tryScroll)'), 'Missing requestAnimationFrame retry polling');
    assert(content.includes('ulasan-pelanggan'), 'Missing section check for ulasan-pelanggan');
    assert(content.includes("scrollIntoView({ behavior: 'smooth'"), 'Missing smooth scroll invocation');
    assert(content.includes('hashchange'), 'Missing hashchange event listener');
  });

  test('2.4 StoreHero.tsx has interactive rating trigger', () => {
    const filePath = path.join(rootDir, 'src/components/customer/store/StoreHero.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(content.includes('onScrollToReviews'), 'Missing onScrollToReviews handler');
    assert(content.includes('ulasan-pelanggan'), 'Missing ulasan-pelanggan fallback');
  });

  test('2.5 StoreInfoCard.tsx has Rating Toko & Total Ulasan triggers', () => {
    const filePath = path.join(rootDir, 'src/components/customer/store/StoreInfoCard.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(content.includes('onNavigateToReviews'), 'Missing onNavigateToReviews prop');
    assert(content.includes('Lihat Semua Ulasan'), 'Missing Lihat Semua Ulasan button');
  });

  test('2.6 CartStoreGroup, CheckoutItemsList, MysteryBoxCard have store review triggers', () => {
    const cart = fs.readFileSync(path.join(rootDir, 'src/components/customer/cart/CartStoreGroup.tsx'), 'utf-8');
    const checkout = fs.readFileSync(path.join(rootDir, 'src/components/customer/checkout/CheckoutItemsList.tsx'), 'utf-8');
    const mystery = fs.readFileSync(path.join(rootDir, 'src/components/customer/MysteryBoxCard.tsx'), 'utf-8');
    assert(cart.includes('ulasan-pelanggan'), 'CartStoreGroup missing ulasan-pelanggan');
    assert(checkout.includes('ulasan-pelanggan'), 'CheckoutItemsList missing ulasan-pelanggan');
    assert(mystery.includes('ulasan-pelanggan'), 'MysteryBoxCard missing ulasan-pelanggan');
  });

  console.log(bold('\nSuite 3: Review UI Primitives Completeness'));

  test('3.1 All 8 Review UI primitive files exist', () => {
    const primitivesDir = path.join(rootDir, 'src/components/reviews');
    const expectedFiles = [
      'index.ts',
      'StarRating.tsx',
      'RatingDistribution.tsx',
      'ReviewSummaryCards.tsx',
      'ReviewCard.tsx',
      'ReviewFilterBar.tsx',
      'ReviewPagination.tsx',
      'ReviewSubmissionModal.tsx'
    ];
    for (const f of expectedFiles) {
      assert(fs.existsSync(path.join(primitivesDir, f)), `Missing file: ${f}`);
    }
  });

  test('3.2 Barrel export index.ts exports all components', () => {
    const indexContent = fs.readFileSync(path.join(rootDir, 'src/components/reviews/index.ts'), 'utf-8');
    assert(indexContent.includes('StarRating'), 'Missing export StarRating');
    assert(indexContent.includes('RatingDistribution'), 'Missing export RatingDistribution');
    assert(indexContent.includes('ReviewSummaryCards'), 'Missing export ReviewSummaryCards');
    assert(indexContent.includes('ReviewCard'), 'Missing export ReviewCard');
    assert(indexContent.includes('ReviewFilterBar'), 'Missing export ReviewFilterBar');
    assert(indexContent.includes('ReviewPagination'), 'Missing export ReviewPagination');
    assert(indexContent.includes('ReviewSubmissionModal'), 'Missing export ReviewSubmissionModal');
  });

  console.log(bold('\n======================================================'));
  console.log(`Results: ${green(passedTests + ' passed')}, ${failedTests > 0 ? red(failedTests + ' failed') : '0 failed'} (${totalTests} total)`);
  console.log(bold('======================================================\n'));

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(red('Test harness error:'), err);
  process.exit(1);
});
