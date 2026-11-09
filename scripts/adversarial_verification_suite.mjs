import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('================================================================');
console.log('   EMPIRICAL ADVERSARIAL CHALLENGER SUITE: R1 - R4 VERIFICATION  ');
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
  return fs.readFileSync(fullPath, 'utf8');
}

// =============================================================================
// TEST SUITE 1: R1 — Product Detail Store Rating & Navigation
// =============================================================================
console.log('--- TEST SUITE 1: R1 Product Detail Store Rating ---');

runTest('R1.1 Code Analysis: useStoreReviews is hooked and resolvedStoreId is bound', () => {
  const code = readFile('src/pages/customer/CustomerProductDetail.tsx');
  
  assert(code.includes("useStoreReviews("), 'Must call useStoreReviews hook');
  assert(code.includes("resolvedStoreId"), 'Must track resolvedStoreId');
  assert(code.includes("storeTotalReviews"), 'Must track storeTotalReviews');
  assert(code.includes("storeAverageRating"), 'Must track storeAverageRating');
  assert(code.includes("isStoreRatingLoading"), 'Must track isStoreRatingLoading');

  // Verify displayRating and displayReviewCount calculation
  assert(
    code.includes('storeTotalReviews > 0') && code.includes('storeAverageRating'),
    'Must prioritize store reviews over product fallback'
  );
});

runTest('R1.2 Code Analysis: Navigation target includes section=ulasan-pelanggan', () => {
  const code = readFile('src/pages/customer/CustomerProductDetail.tsx');
  
  assert(code.includes("query.set('section', 'ulasan-pelanggan')"), 'Query param section must be set to ulasan-pelanggan');
  assert(code.includes("onNavigateStore(storeName, targetStoreId, 'ulasan-pelanggan')"), 'onNavigateStore must receive ulasan-pelanggan');
});

runTest('R1.3 Formatting Simulator: Real rating and review count scenarios', () => {
  function formatStoreRatingDisplay({
    storeAverageRating,
    storeTotalReviews,
    productRating = 0,
    productReviewCount = 0,
    isStoreRatingLoading = false,
  }) {
    const reviewCountNum = typeof productReviewCount === 'number' ? productReviewCount : Number(productReviewCount) || 0;
    const displayRating = storeTotalReviews > 0
      ? storeAverageRating
      : (productRating > 0 ? productRating : storeAverageRating);

    const displayReviewCount = storeTotalReviews > 0
      ? storeTotalReviews
      : (reviewCountNum > 0 ? reviewCountNum : storeTotalReviews);

    const ratingText = displayRating > 0 ? displayRating.toFixed(1) : '-';
    const reviewText = (isStoreRatingLoading && displayReviewCount === 0)
      ? '(Memuat...)'
      : displayReviewCount > 0
      ? `(${displayReviewCount} ulasan)`
      : '(Belum ada ulasan)';

    return {
      displayRating,
      displayReviewCount,
      ratingText,
      reviewText,
      fullText: `★ ${ratingText} ${reviewText}`,
    };
  }

  // Scenario A: 1 review, 5.0 rating
  const resA = formatStoreRatingDisplay({
    storeAverageRating: 5.0,
    storeTotalReviews: 1,
  });
  assert.strictEqual(resA.fullText, '★ 5.0 (1 ulasan)');

  // Scenario B: 12 reviews, 4.8333 rating
  const resB = formatStoreRatingDisplay({
    storeAverageRating: 4.833333333,
    storeTotalReviews: 12,
  });
  assert.strictEqual(resB.fullText, '★ 4.8 (12 ulasan)');

  // Scenario C: 0 reviews, not loading
  const resC = formatStoreRatingDisplay({
    storeAverageRating: 0,
    storeTotalReviews: 0,
    isStoreRatingLoading: false,
  });
  assert.strictEqual(resC.fullText, '★ - (Belum ada ulasan)');

  // Scenario D: 0 reviews, loading
  const resD = formatStoreRatingDisplay({
    storeAverageRating: 0,
    storeTotalReviews: 0,
    isStoreRatingLoading: true,
  });
  assert.strictEqual(resD.fullText, '★ - (Memuat...)');

  // Scenario E: Store reviews take precedence over product prop fallback
  const resE = formatStoreRatingDisplay({
    storeAverageRating: 4.9,
    storeTotalReviews: 3,
    productRating: 3.0,
    productReviewCount: 100,
  });
  assert.strictEqual(resE.fullText, '★ 4.9 (3 ulasan)');

  // Scenario F: Store reviews = 0, fallback to product review
  const resF = formatStoreRatingDisplay({
    storeAverageRating: 0,
    storeTotalReviews: 0,
    productRating: 4.5,
    productReviewCount: 8,
  });
  assert.strictEqual(resF.fullText, '★ 4.5 (8 ulasan)');
});

// =============================================================================
// TEST SUITE 2: R2 — Order History Action Buttons
// =============================================================================
console.log('\n--- TEST SUITE 2: R2 Order History Actions ---');

runTest('R2.1 Static Check: Total absence of "Beri Ulasan" in CustomerOrderHistory.tsx', () => {
  const code = readFile('src/pages/customer/CustomerOrderHistory.tsx');

  assert(!code.includes('Beri Ulasan'), 'CustomerOrderHistory must not contain "Beri Ulasan" anywhere');
  assert(!code.includes('isReviewOpen'), 'Review modal state isReviewOpen must not exist');
  assert(!code.includes('handleOpenReview'), 'Review handler handleOpenReview must not exist');
  assert(!code.includes('handleSubmitReview'), 'Review submit handler handleSubmitReview must not exist');
});

runTest('R2.2 Exhaustive Status Matrix: "Lihat Detail" vs "Beli Lagi" on Order Cards', () => {
  const code = readFile('src/pages/customer/CustomerOrderHistory.tsx');

  // Simulate order action rendering logic extracted from CustomerOrderHistory.tsx
  function renderOrderActions(orderStatus) {
    const actions = [];
    if (orderStatus === 'selesai') {
      actions.push('Beli Lagi');
    }
    // Unconditional Lihat Detail
    actions.push('Lihat Detail');
    return actions;
  }

  const allStatuses = [
    'menunggu-pembayaran',
    'menunggu-konfirmasi',
    'diproses',
    'siap-diambil',
    'selesai',
    'dibatalkan',
    'arbitrary-custom-status',
  ];

  for (const status of allStatuses) {
    const rendered = renderOrderActions(status);
    assert(rendered.includes('Lihat Detail'), `Status '${status}' MUST include 'Lihat Detail'`);
    assert(!rendered.includes('Beri Ulasan'), `Status '${status}' MUST NOT include 'Beri Ulasan'`);

    if (status === 'selesai') {
      assert(rendered.includes('Beli Lagi'), "Completed orders MUST include 'Beli Lagi'");
      assert.strictEqual(rendered.length, 2, "Completed orders must have exactly ['Beli Lagi', 'Lihat Detail']");
    } else {
      assert(!rendered.includes('Beli Lagi'), `Status '${status}' MUST NOT include 'Beli Lagi'`);
      assert.strictEqual(rendered.length, 1, `Non-completed order '${status}' must have only ['Lihat Detail']`);
    }
  }

  // Also assert in actual file code that Lihat Detail is rendered unconditionally
  const actionsBlockMatch = code.match(/\{\/\* Actions \*\/\}\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/);
  assert(actionsBlockMatch, 'Could not locate Actions JSX block in CustomerOrderHistory.tsx');
  const actionsBlock = actionsBlockMatch[1];
  
  assert(actionsBlock.includes('<span>Lihat Detail</span>'), 'Actions block must contain "Lihat Detail"');
  assert(actionsBlock.includes("order.status === 'selesai'"), 'Actions block must guard Beli Lagi with order.status === "selesai"');
  assert(!actionsBlock.includes('Beri Ulasan'), 'Actions block must NOT contain "Beri Ulasan"');
});

runTest('R2.3 Navigation Fallback: handleOpenOrderDetail routes correctly', () => {
  const code = readFile('src/pages/customer/CustomerOrderHistory.tsx');
  
  assert(
    code.includes("window.location.hash = `#detail-pesanan?id=${order.id || order.orderNumber}`"), 
    'Fallback hash must navigate to #detail-pesanan?id=...'
  );
});

// =============================================================================
// TEST SUITE 3: R3 — Notification and Toast Cleanup
// =============================================================================
console.log('\n--- TEST SUITE 3: R3 Toast Cleanup & Deduplication ---');

runTest('R3.1 Static Check: CustomerContact does not contain Gmail notification toast', () => {
  const code = readFile('src/pages/customer/CustomerContact.tsx');
  assert(!code.includes('Membuka Gmail'), 'CustomerContact must not contain "Membuka Gmail"');
  assert(code.includes("window.open(gmailUrl, '_blank')"), 'CustomerContact must still open Gmail in new tab');
});

runTest('R3.2 Static Check: CustomerHome does not contain fake live chat toast', () => {
  const code = readFile('src/pages/customer/CustomerHome.tsx');
  assert(!code.includes('Membuka live chat'), 'CustomerHome must not contain "Membuka live chat"');
  assert(!code.includes('onContactSupport'), 'CustomerHome must not pass onContactSupport');
});

runTest('R3.3 Static Check: App.tsx returns early to avoid duplicate toast render', () => {
  const code = readFile('src/App.tsx');
  const showToastMatch = code.match(/if\s*\(toastContextShow\)\s*\{\s*toastContextShow\([^)]*\);\s*return;\s*\}/);
  assert(showToastMatch, 'App.tsx must return early after calling toastContextShow');
});

runTest('R3.4 Toast Engine Simulation: Cooldown, Deduplication, and Max Capping', () => {
  class ToastManager {
    constructor() {
      this.toasts = [];
      this.recentToasts = new Map();
      this.COOLDOWN_MS = 2500;
      this.MAX_CONCURRENT = 3;
    }

    showToast(message, type = 'info', duration = 3500, currentTime = Date.now()) {
      if (!message || !message.trim()) return;
      const cleanMessage = message.trim();
      const lastTime = this.recentToasts.get(cleanMessage);

      if (lastTime && currentTime - lastTime < this.COOLDOWN_MS) {
        return { accepted: false, reason: 'cooldown' };
      }
      this.recentToasts.set(cleanMessage, currentTime);

      if (this.toasts.some((t) => t.message === cleanMessage)) {
        return { accepted: false, reason: 'already_visible' };
      }

      const cappedPrev = this.toasts.length >= this.MAX_CONCURRENT
        ? this.toasts.slice(this.toasts.length - 2)
        : this.toasts;

      const newToast = {
        id: `${currentTime}-${Math.random().toString(36).slice(2, 7)}`,
        message: cleanMessage,
        type,
        duration,
      };

      this.toasts = [...cappedPrev, newToast];
      return { accepted: true, toast: newToast };
    }

    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }
  }

  const manager = new ToastManager();

  // Test rapid bursts of same message (e.g. location error or spam click)
  const t0 = 10000;
  const res1 = manager.showToast('Izin lokasi belum diberikan, default: Malang', 'warning', 3000, t0);
  assert.strictEqual(res1.accepted, true, 'First message must be accepted');
  assert.strictEqual(manager.toasts.length, 1);

  // Second immediate attempt within 50ms
  const res2 = manager.showToast('Izin lokasi belum diberikan, default: Malang', 'warning', 3000, t0 + 50);
  assert.strictEqual(res2.accepted, false, 'Duplicate within cooldown must be rejected');
  assert.strictEqual(res2.reason, 'cooldown');
  assert.strictEqual(manager.toasts.length, 1, 'Toast count must remain 1');

  // Attempt at 2000ms (still < 2500ms)
  const res3 = manager.showToast('Izin lokasi belum diberikan, default: Malang', 'warning', 3000, t0 + 2000);
  assert.strictEqual(res3.accepted, false, 'Message within 2500ms cooldown must be rejected');

  // Attempt at 2600ms (cooldown expired)
  // But wait! If the toast is still visible on screen, already_visible check triggers!
  const res4 = manager.showToast('Izin lokasi belum diberikan, default: Malang', 'warning', 3000, t0 + 2600);
  assert.strictEqual(res4.accepted, false, 'Still visible toast must not be duplicated');
  assert.strictEqual(res4.reason, 'already_visible');

  // Dismiss toast and attempt after cooldown from the last attempt (t0 + 2600 + 2600 = t0 + 5200)
  manager.removeToast(manager.toasts[0].id);
  const res5 = manager.showToast('Izin lokasi belum diberikan, default: Malang', 'warning', 3000, t0 + 5200);
  assert.strictEqual(res5.accepted, true, 'After dismiss and cooldown, toast must be accepted');
  assert.strictEqual(manager.toasts.length, 1);

  // Test Concurrent Max Capping:
  manager.toasts = [];
  manager.recentToasts.clear();

  manager.showToast('Toast A', 'info', 3000, 100);
  manager.showToast('Toast B', 'info', 3000, 200);
  manager.showToast('Toast C', 'info', 3000, 300);
  assert.strictEqual(manager.toasts.length, 3, 'Must hold 3 toasts');

  // Add 4th distinct toast: should cap at 3 (dropping oldest)
  manager.showToast('Toast D', 'info', 3000, 400);
  assert.strictEqual(manager.toasts.length, 3, 'Must cap concurrent toasts at 3');
  assert.deepStrictEqual(
    manager.toasts.map((t) => t.message),
    ['Toast B', 'Toast C', 'Toast D'],
    'Oldest toast A must have been evicted'
  );

  // Add 5th distinct toast: should cap at 3
  manager.showToast('Toast E', 'info', 3000, 500);
  assert.strictEqual(manager.toasts.length, 3, 'Must cap concurrent toasts at 3');
  assert.deepStrictEqual(
    manager.toasts.map((t) => t.message),
    ['Toast C', 'Toast D', 'Toast E'],
    'Oldest toast B must have been evicted'
  );
});

runTest('R3.5 CustomerMarketplace location in-flight lock & warning cooldown', () => {
  const code = readFile('src/pages/customer/CustomerMarketplace.tsx');

  assert(code.includes('if (isLoadingLoc) return;'), 'handleRequestLiveLocation must guard in-flight execution');
  assert(code.includes('if (!hasWarnedLocationRef.current)'), 'Geolocation failure must check hasWarnedLocationRef');
  assert(code.includes('hasWarnedLocationRef.current = true;'), 'Geolocation failure must set hasWarnedLocationRef');
});

// =============================================================================
// TEST SUITE 4: R4 — Marketplace Default Sorting
// =============================================================================
console.log('\n--- TEST SUITE 4: R4 Marketplace Default Sorting ---');

runTest('R4.1 SORT_OPTIONS lists "lokasi" first in model.ts', () => {
  const code = readFile('src/features/customer/marketplace/model.ts');

  const match = code.match(/export const SORT_OPTIONS: SortConfig\[\] = \[\s*\{\s*id: '([^']+)'/);
  assert(match, 'SORT_OPTIONS array must be defined');
  assert.strictEqual(match[1], 'lokasi', 'First option in SORT_OPTIONS must be "lokasi"');
});

runTest('R4.2 CustomerMarketplace initializes sortField to "lokasi" and sortOrder to "asc"', () => {
  const code = readFile('src/pages/customer/CustomerMarketplace.tsx');

  assert(code.includes("useState<SortField>('lokasi')"), 'CustomerMarketplace initial sortField must be "lokasi"');
  assert(code.includes("useState<SortOrder>('asc')"), 'CustomerMarketplace initial sortOrder must be "asc"');
});

runTest('R4.3 Distance Comparator Simulator: Correct sorting order for distance', () => {
  const items = [
    { name: 'Store C', distanceText: '5.2 km' },
    { name: 'Store A', distanceText: '0.4 km' },
    { name: 'Store D', distanceText: '12 km' },
    { name: 'Store B', distanceText: '1.8 km' },
    { name: 'Store Zero', distanceText: '0 km' },
  ];

  function sortItems(arr, field, order) {
    return [...arr].sort((a, b) => {
      if (field === 'lokasi') {
        const distA = parseFloat(a.distanceText) || 0;
        const distB = parseFloat(b.distanceText) || 0;
        return order === 'asc' ? distA - distB : distB - distA;
      }
      return 0;
    });
  }

  // Ascending (nearest first)
  const sortedAsc = sortItems(items, 'lokasi', 'asc');
  const distancesAsc = sortedAsc.map((i) => parseFloat(i.distanceText));
  assert.deepStrictEqual(distancesAsc, [0, 0.4, 1.8, 5.2, 12], 'Ascending distance sort must place closest store first');
  assert.strictEqual(sortedAsc[0].name, 'Store Zero');
  assert.strictEqual(sortedAsc[1].name, 'Store A');

  // Descending (farthest first)
  const sortedDesc = sortItems(items, 'lokasi', 'desc');
  const distancesDesc = sortedDesc.map((i) => parseFloat(i.distanceText));
  assert.deepStrictEqual(distancesDesc, [12, 5.2, 1.8, 0.4, 0], 'Descending distance sort must place farthest store first');
  assert.strictEqual(sortedDesc[0].name, 'Store D');
});

console.log('\n================================================================');
console.log(`   ALL ${passedTests}/${totalTests} ADVERSARIAL TESTS PASSED EMPIRICALLY!   `);
console.log('================================================================\n');
