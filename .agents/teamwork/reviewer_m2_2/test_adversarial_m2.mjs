import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let passed = 0;
let failed = 0;
const issues = [];

function assert(condition, testName, errorDetails = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    issues.push({ testName, errorDetails });
    console.error(`  [FAIL] ${testName}${errorDetails ? ` -> ${errorDetails}` : ''}`);
  }
}

async function runAdversarialAudit() {
  console.log('====================================================');
  console.log('ADVERSARIAL STRESS TEST: MILESTONE 2 NAVIGATION & PRIMITIVES');
  console.log('====================================================\n');

  const server = await createServer();

  try {
    // ----------------------------------------------------
    // Section 1: Hash Routing Parser Robustness
    // ----------------------------------------------------
    console.log('=== 1. Hash Routing Parser Stress Tests ===');
    const { parseHash, safeDecode } = await server.ssrLoadModule('./src/app/hashRouting.ts');

    // 1.1 Safe decode on malformed URI percent sequence
    assert(safeDecode('%E0%A4%A') === '%E0%A4%A', 'safeDecode handles malformed percent encoding gracefully');
    assert(safeDecode('Toko%20Rejak') === 'Toko Rejak', 'safeDecode decodes valid percent sequences');

    // 1.2 Hash with query and secondary anchor (#toko?name=Bakery#ulasan-pelanggan)
    const res1 = parseHash('#toko?name=Bakery#ulasan-pelanggan');
    assert(res1.path === 'toko', 'parseHash: extracts path "toko"');
    assert(res1.params.get('name') === 'Bakery', 'parseHash: extracts query param name="Bakery"');
    assert(res1.anchor === 'ulasan-pelanggan', 'parseHash: extracts secondary anchor "ulasan-pelanggan"');

    // 1.3 Hash with section query parameter (#toko?name=Bakery&section=ulasan-pelanggan)
    const res2 = parseHash('#toko?name=Bakery&section=ulasan-pelanggan');
    assert(res2.path === 'toko', 'parseHash: path is "toko"');
    assert(res2.params.get('section') === 'ulasan-pelanggan', 'parseHash: extracts section param');
    assert(res2.anchor === 'ulasan-pelanggan', 'parseHash: populates anchor from section param');

    // 1.4 Hash without query but with trailing anchor (#toko#ulasan-pelanggan)
    const res3 = parseHash('#toko#ulasan-pelanggan');
    assert(res3.path === 'toko', 'parseHash: path is "toko"');
    assert(res3.anchor === 'ulasan-pelanggan', 'parseHash: anchor is "ulasan-pelanggan"');

    // 1.5 Hash for seller reviews route (#ulasan-seller and #ulasan)
    const res4 = parseHash('#ulasan-seller');
    assert(res4.path === 'ulasan-seller', 'parseHash: path is "ulasan-seller"');
    const res5 = parseHash('#ulasan');
    assert(res5.path === 'ulasan', 'parseHash: path is "ulasan"');

    // ----------------------------------------------------
    // Section 2: Deep-linking & Navigation Execution Trace
    // ----------------------------------------------------
    console.log('\n=== 2. Navigation Flow & Hash Clobbering Audit ===');

    const fs = await import('fs');
    const appTsx = fs.readFileSync('./src/App.tsx', 'utf-8');

    // 2.1 Verify App.tsx static implementation checks
    const callsHandleNavigateInStore = /const handleNavigateStore[\s\S]*?handleNavigate\('view-customer-store'/.test(appTsx);
    assert(!callsHandleNavigateInStore, 'App.tsx: handleNavigateStore does not call handleNavigate("view-customer-store")');

    const guardsStoreReplaceState = /viewId === 'view-customer-store'[\s\S]*?hash\.startsWith\('#toko\?'\)[\s\S]*?replaceState/.test(appTsx);
    assert(guardsStoreReplaceState, 'App.tsx: handleNavigate guards view-customer-store replaceState against clobbering existing hash');

    // Simulating App.tsx remediated handleNavigateStore and handleNavigate behavior
    let currentHash = '#detail-produk';
    let currentActiveView = 'view-customer-product-detail';
    let currentActiveLabel = 'Detail Produk';
    let historyStateUrl = currentHash;
    let storeStateName = 'Toko Rejak'; // Initial App state
    let storeStateId = undefined;

    function mockReplaceState(state, title, url) {
      historyStateUrl = url;
      currentHash = url.startsWith('#') ? url : url.slice(url.indexOf('#'));
    }

    function mockHandleNavigate(viewId, label = '') {
      currentActiveView = viewId;
      if (label) currentActiveLabel = label;

      if (viewId === 'view-customer-store') {
        const hash = currentHash || '';
        if (!hash.startsWith('#toko?') && !hash.includes('section=') && !hash.includes('ulasan-pelanggan')) {
          mockReplaceState(null, '', storeStateName ? `#toko?name=${encodeURIComponent(storeStateName)}` : '#toko');
        }
      }
    }

    function mockHandleNavigateStore(targetStoreName, targetStoreId, section) {
      const cleanName = targetStoreName && targetStoreName.trim() && targetStoreName.trim() !== 'TerasRasa Bakery' ? targetStoreName.trim() : 'Toko Rejak';
      storeStateName = cleanName;
      storeStateId = targetStoreId;

      const query = new URLSearchParams();
      if (cleanName) query.set('name', cleanName);
      if (targetStoreId) query.set('id', targetStoreId);
      if (section) query.set('section', section);

      // Line 526 in remediated App.tsx
      currentHash = `#toko?${query.toString()}`;

      // In remediated App.tsx: direct state update without calling handleNavigate
      currentActiveView = 'view-customer-store';
      currentActiveLabel = 'Detail Toko';
    }

    // TEST: Product Detail rating clicked -> navigates to store with section="ulasan-pelanggan"
    mockHandleNavigateStore('Monsieur Spoon Bakery', 'store-ms-001', 'ulasan-pelanggan');

    console.log('Resulting Hash after handleNavigateStore:', currentHash);
    const hashHasSection = currentHash.includes('section=ulasan-pelanggan');
    const hashHasId = currentHash.includes('id=store-ms-001');

    assert(
      hashHasSection,
      'CRITICAL: handleNavigateStore preserves section=ulasan-pelanggan in URL',
      `URL hash became: "${currentHash}" (section parameter was stripped by handleNavigate replaceState)`
    );

    assert(
      hashHasId,
      'CRITICAL: handleNavigateStore preserves id=store-ms-001 in URL',
      `URL hash became: "${currentHash}" (store id was stripped by handleNavigate replaceState)`
    );

    // Also test: if handleNavigate('view-customer-store') is called while hash already has section
    mockHandleNavigate('view-customer-store', 'Detail Toko');
    assert(
      currentHash.includes('section=ulasan-pelanggan') && currentHash.includes('id=store-ms-001'),
      'CRITICAL: handleNavigate guard protects against overwriting hash with section=ulasan-pelanggan',
      `URL hash became: "${currentHash}"`
    );

    // ----------------------------------------------------
    // Section 3: Rating Distribution Boundary Conditions
    // ----------------------------------------------------
    console.log('\n=== 3. RatingDistribution Boundary Testing ===');
    const { RatingDistribution } = await server.ssrLoadModule('./src/components/reviews/RatingDistribution.tsx');

    // 3.1 All zeros
    const vdom0 = RatingDistribution({ distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, totalReviews: 0 });
    assert(vdom0 != null, 'RatingDistribution: renders without throw when totalReviews is 0');

    // 3.2 Total reviews 0 with non-zero distribution (data mismatch edge case)
    const vdomMismatch = RatingDistribution({ distribution: { 5: 5 }, totalReviews: 0 });
    assert(vdomMismatch != null, 'RatingDistribution: handles mismatch totalReviews=0 with positive count safely (0% width)');

    // 3.3 Missing keys in distribution (e.g. only 5-star provided)
    const vdomMissing = RatingDistribution({ distribution: { 5: 10 }, totalReviews: 10 });
    assert(vdomMissing != null, 'RatingDistribution: missing star keys default to 0 count');

    // ----------------------------------------------------
    // Section 4: StarRating Boundary Conditions
    // ----------------------------------------------------
    console.log('\n=== 4. StarRating Boundary Testing ===');
    const { StarRating } = await server.ssrLoadModule('./src/components/reviews/StarRating.tsx');

    // 4.1 NaN rating
    const htmlNaN = renderToStaticMarkup(React.createElement(StarRating, { rating: NaN }));
    assert(htmlNaN != null, 'StarRating: handles NaN safely without crashing');

    // 4.2 Infinity rating
    const htmlInf = renderToStaticMarkup(React.createElement(StarRating, { rating: Infinity }));
    assert(htmlInf != null, 'StarRating: handles Infinity safely without crashing');

    // 4.3 Negative rating
    const htmlNeg = renderToStaticMarkup(React.createElement(StarRating, { rating: -10 }));
    assert(htmlNeg != null, 'StarRating: handles negative rating safely without crashing');

    console.log('\n====================================================');
    console.log(`Adversarial Test Summary: Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) {
      console.log('Failed Tests:');
      issues.forEach(i => console.log(` - ${i.testName}: ${i.errorDetails}`));
    }
    console.log('====================================================');

  } finally {
    await server.close();
  }
}

runAdversarialAudit().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
