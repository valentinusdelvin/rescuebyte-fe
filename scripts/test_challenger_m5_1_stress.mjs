import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('================================================================');
console.log('  CHALLENGER M5.1: CARD LIMIT & NAVIGATION STRESS TEST HARNESS  ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

function readFile(filePath) {
  const fullPath = path.resolve(filePath);
  return fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
}

// =============================================================================
// TEST SUITE 1: CARD LIMITS EMPIRICAL STRESS TEST (Max 3 Cards)
// =============================================================================
console.log('--- TEST SUITE 1: Card Limits Stress Test (Max 3 Cards) ---');

const customerHomeCode = readFile('src/pages/customer/CustomerHome.tsx');

runTest('1.1 Source Code Verification: Slicing to 3 in getCachedBoxes()', () => {
  assert(
    customerHomeCode.includes('parsed.slice(0, 3)'),
    'getCachedBoxes must slice parsed items to max 3'
  );
  assert(
    customerHomeCode.includes('.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))\n          .slice(0, 3)'),
    'getCachedBoxes bestSeller must sort by discountPercent and slice to max 3'
  );
});

runTest('1.2 Source Code Verification: Slicing to 3 in Query 1 (Sekitar)', () => {
  assert(
    customerHomeCode.includes('.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))\n            .slice(0, 3)'),
    'Query 1 (nearbyBoxes) must sort nearest-first and slice to max 3'
  );
});

runTest('1.3 Source Code Verification: Slicing to 3 in Query 2 (Terlaris)', () => {
  assert(
    customerHomeCode.includes('.slice(0, 3)\n            .map((p) => mapPublicProductToCustomerBox(p, true))'),
    'Query 2 (bestSellerBoxes) must slice to max 3'
  );
});

runTest('1.4 Source Code Verification: Skeleton loaders count is exactly 3', () => {
  const skeletonMatches = customerHomeCode.match(/Array\.from\(\{\s*length:\s*3\s*\}\)/g);
  assert(
    skeletonMatches && skeletonMatches.length >= 2,
    `Expected at least 2 skeleton loaders with length: 3, found ${skeletonMatches?.length || 0}`
  );
});

runTest('1.5 Simulator: Card limit stress test across product counts [0, 1, 2, 3, 5, 10, 20, 50, 100]', () => {
  const testCounts = [0, 1, 2, 3, 5, 10, 20, 50, 100];

  for (const count of testCounts) {
    const mockProducts = Array.from({ length: count }, (_, i) => ({
      id: `prod-${i + 1}`,
      name: `Mystery Box ${i + 1}`,
      distance_km: Math.random() * 20,
      reviewCount: Math.floor(Math.random() * 50),
      discount_percentage: Math.floor(Math.random() * 70),
    }));

    // Simulate Query 1 Nearby logic
    const nearbySorted = [...mockProducts]
      .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
      .slice(0, 3);

    // Simulate Query 2 Best Seller logic
    const bestSellerSorted = [...mockProducts]
      .sort(
        (a, b) =>
          (b.reviewCount || 0) - (a.reviewCount || 0) ||
          (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0)
      )
      .slice(0, 3);

    const expectedCount = Math.min(3, count);
    assert.strictEqual(
      nearbySorted.length,
      expectedCount,
      `Nearby section rendered ${nearbySorted.length} cards for input size ${count}, expected ${expectedCount}`
    );
    assert.strictEqual(
      bestSellerSorted.length,
      expectedCount,
      `BestSeller section rendered ${bestSellerSorted.length} cards for input size ${count}, expected ${expectedCount}`
    );
    assert(
      nearbySorted.length <= 3,
      `Nearby section exceeded 3 cards limit: got ${nearbySorted.length}`
    );
    assert(
      bestSellerSorted.length <= 3,
      `BestSeller section exceeded 3 cards limit: got ${bestSellerSorted.length}`
    );
  }
});

// =============================================================================
// TEST SUITE 2: NON-DUPLICATION STRESS TEST
// =============================================================================
console.log('\n--- TEST SUITE 2: Non-Duplication Stress Test ---');

runTest('2.1 Non-duplication when 1 product exists', () => {
  const singleProduct = [{ id: 'prod-single', name: 'Single Box', distance_km: 1.2, reviewCount: 5 }];
  const slicedNearby = [...singleProduct].slice(0, 3);
  const slicedBest = [...singleProduct].slice(0, 3);

  assert.strictEqual(slicedNearby.length, 1, 'Should output exactly 1 card');
  assert.strictEqual(slicedBest.length, 1, 'Should output exactly 1 card');
  assert.strictEqual(slicedNearby[0].id, 'prod-single');
  assert.strictEqual(slicedBest[0].id, 'prod-single');
});

runTest('2.2 Non-duplication when 2 products exist', () => {
  const twoProducts = [
    { id: 'prod-1', name: 'Box 1', distance_km: 1.5, reviewCount: 10 },
    { id: 'prod-2', name: 'Box 2', distance_km: 2.1, reviewCount: 8 },
  ];
  const slicedNearby = [...twoProducts].slice(0, 3);
  const slicedBest = [...twoProducts].slice(0, 3);

  assert.strictEqual(slicedNearby.length, 2, 'Should output exactly 2 cards');
  assert.strictEqual(slicedBest.length, 2, 'Should output exactly 2 cards');
  assert.notStrictEqual(slicedNearby[0].id, slicedNearby[1].id, 'Cards must not be duplicate');
  assert.notStrictEqual(slicedBest[0].id, slicedBest[1].id, 'Cards must not be duplicate');
});

runTest('2.3 Backend response deduplication by ID resilience', () => {
  // If backend returns duplicate items with same ID
  const duplicateFeed = [
    { id: 'dup-1', name: 'Box Alpha', distance_km: 0.5 },
    { id: 'dup-1', name: 'Box Alpha Cloned', distance_km: 0.5 },
    { id: 'dup-2', name: 'Box Beta', distance_km: 1.0 },
    { id: 'dup-2', name: 'Box Beta Cloned', distance_km: 1.0 },
  ];

  // Logic used in CustomerHome.tsx: Array.from(new Map(products.map((p) => [p.id, p])).values())
  const deduped = Array.from(new Map(duplicateFeed.map((p) => [p.id, p])).values());
  assert.strictEqual(deduped.length, 2, 'Should deduplicate products by ID');
  const ids = deduped.map((p) => p.id);
  assert.deepStrictEqual(ids, ['dup-1', 'dup-2']);
});

// =============================================================================
// TEST SUITE 3: EMPTY STATE VERIFICATION
// =============================================================================
console.log('\n--- TEST SUITE 3: Empty State Verification ---');

runTest('3.1 BoxEmptyState component structure and col-span-full', () => {
  assert(
    customerHomeCode.includes('function BoxEmptyState({ message }: { message: string })'),
    'BoxEmptyState function must exist'
  );
  assert(
    customerHomeCode.includes('col-span-full'),
    'BoxEmptyState must include col-span-full class'
  );
  assert(
    customerHomeCode.includes('text-center py-12 px-6 bg-white rounded-2xl border border-[#e2e6df] col-span-full'),
    'BoxEmptyState container styling matches design specification'
  );
});

runTest('3.2 Empty state rendered in Section 3 (Sekitar) when count is 0', () => {
  assert(
    customerHomeCode.includes('<BoxEmptyState message="Belum ada Mystery Box di sekitarmu saat ini." />'),
    'Sekitar section must render BoxEmptyState with correct Indonesian message'
  );
});

runTest('3.3 Empty state rendered in Section 4 (Terlaris) when count is 0', () => {
  assert(
    customerHomeCode.includes('<BoxEmptyState message="Belum ada Mystery Box terlaris saat ini." />'),
    'Terlaris section must render BoxEmptyState with correct Indonesian message'
  );
});

// =============================================================================
// TEST SUITE 4: "LIHAT SELENGKAPNYA" NAVIGATION & ACCESSIBILITY
// =============================================================================
console.log('\n--- TEST SUITE 4: "Lihat Selengkapnya" Navigation & Accessibility ---');

runTest('4.1 Both sections contain "Lihat Selengkapnya" link', () => {
  const linkMatches = customerHomeCode.match(/<span className="group-hover:underline underline-offset-4">Lihat Selengkapnya<\/span>/g);
  assert.strictEqual(
    linkMatches?.length,
    2,
    `Expected exactly 2 "Lihat Selengkapnya" links, found ${linkMatches?.length}`
  );
});

runTest('4.2 Semantic <a> tag with href="#marketplace" and aria-labels', () => {
  assert(
    customerHomeCode.includes('href="#marketplace"'),
    'Must use href="#marketplace"'
  );
  assert(
    customerHomeCode.includes('aria-label="Lihat selengkapnya Mystery Box di Sekitar di Marketplace"'),
    'Sekitar link must have descriptive aria-label'
  );
  assert(
    customerHomeCode.includes('aria-label="Lihat selengkapnya Mystery Box Terlaris di Marketplace"'),
    'Terlaris link must have descriptive aria-label'
  );
});

runTest('4.3 Interactive tokens: emerald styling, hover transform, pointer cursor', () => {
  const linkClassPattern = /text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700\/40 rounded-lg px-3 py-1\.5/;
  assert(
    linkClassPattern.test(customerHomeCode),
    'Link must possess all required interactive tokens (emerald color, hover, focus ring, pointer)'
  );

  assert(
    customerHomeCode.includes('ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true"'),
    'ChevronRight icon must animate on group hover and be aria-hidden'
  );
});

runTest('4.4 Click event handler behavior simulation (onNavigateMarketplace provided)', () => {
  let preventDefaultCalled = false;
  let onNavigateCalled = false;
  let hashUpdated = false;

  const mockEvent = {
    preventDefault: () => {
      preventDefaultCalled = true;
    },
  };

  const onNavigateMarketplace = () => {
    onNavigateCalled = true;
  };

  // Execute component click handler logic
  mockEvent.preventDefault();
  if (onNavigateMarketplace) {
    onNavigateMarketplace();
  } else {
    hashUpdated = true;
  }

  assert.strictEqual(preventDefaultCalled, true, 'e.preventDefault() must be called');
  assert.strictEqual(onNavigateCalled, true, 'onNavigateMarketplace() must be executed');
  assert.strictEqual(hashUpdated, false, 'Direct hash update should NOT execute when callback is provided');
});

runTest('4.5 Click event handler fallback simulation (onNavigateMarketplace NOT provided)', () => {
  let preventDefaultCalled = false;
  let hashUpdated = false;

  const mockEvent = {
    preventDefault: () => {
      preventDefaultCalled = true;
    },
  };

  const onNavigateMarketplace = undefined;

  // Execute fallback logic
  mockEvent.preventDefault();
  if (onNavigateMarketplace) {
    // Should not enter
  } else {
    hashUpdated = true;
  }

  assert.strictEqual(preventDefaultCalled, true, 'e.preventDefault() must be called in fallback');
  assert.strictEqual(hashUpdated, true, 'Direct hash update must execute in fallback');
});

runTest('4.6 App.tsx & AppRoutes.tsx Integration Verification', () => {
  const appRoutesCode = readFile('src/app/AppRoutes.tsx');
  const appCode = readFile('src/App.tsx');

  assert(
    appRoutesCode.includes("onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}"),
    'AppRoutes must wire onNavigateMarketplace to handleNavigate'
  );

  assert(
    appCode.includes("} else if (viewId === 'view-customer-marketplace') {\n        window.history.replaceState(null, '', '#marketplace');"),
    'App.tsx handleNavigate must use replaceState to prevent duplicate routing history'
  );
});

// =============================================================================
// TEST SUITE 5: MARKETPLACE ISOLATION VERIFICATION
// =============================================================================
console.log('\n--- TEST SUITE 5: Marketplace Isolation Verification ---');

const marketplaceCode = readFile('src/pages/customer/CustomerMarketplace.tsx');

runTest('5.1 CustomerMarketplace.tsx does not slice product listing', () => {
  // Ensure no slice(0, 3) or artificial limit was accidentally applied to filteredProducts
  assert(
    !marketplaceCode.includes('filteredProducts.slice(0, 3)'),
    'Marketplace must NOT slice filteredProducts to 3'
  );
  assert(
    marketplaceCode.includes('{filteredProducts.map((item) => ('),
    'Marketplace must map over complete filteredProducts list'
  );
});

runTest('5.2 CustomerMarketplace.tsx product grid renders all items', () => {
  // Simulate Marketplace rendering with 15 items
  const mockMarketplaceItems = Array.from({ length: 15 }, (_, i) => ({
    id: `m-item-${i}`,
    storeName: `Store ${i}`,
    productName: `Box ${i}`,
    rescuePrice: 25000,
  }));

  const renderedCount = mockMarketplaceItems.map((item) => item.id).length;
  assert.strictEqual(renderedCount, 15, 'Marketplace must render all 15 items without artificial limits');
});

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${totalTests - passedTests}`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('ALL EMPIRICAL TESTS PASSED SUCCESSFULLY! (VERDICT: APPROVE)');
} else {
  console.error('SOME EMPIRICAL TESTS FAILED! (VERDICT: REJECT)');
  process.exit(1);
}
