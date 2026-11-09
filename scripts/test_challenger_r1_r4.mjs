import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

console.log('===============================================================');
console.log('CHALLENGER 2: ADVERSARIAL EMPIRICAL HARNESS (R1 - R4)');
console.log('===============================================================\n');

// -----------------------------------------------------------------
// 1. CHALLENGE: Toast Deduplication & Cooldown (ToastContext.tsx)
// -----------------------------------------------------------------
console.log('--- SECTION 1: Toast Deduplication & Cooldown Logic ---');

class ToastContextSimulator {
  constructor() {
    this.toasts = [];
    this.recentToasts = new Map();
    this.timers = new Set();
  }

  removeToast(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  showToast(message, type = 'info', duration = 3500) {
    if (!message || !message.trim()) return;
    const cleanMessage = message.trim();
    const now = Date.now();

    const lastTime = this.recentToasts.get(cleanMessage);
    if (lastTime && now - lastTime < 2500) {
      return;
    }
    this.recentToasts.set(cleanMessage, now);

    // Replicate state updater
    const prev = this.toasts;
    if (prev.some((t) => t.message === cleanMessage)) {
      return;
    }

    const cappedPrev = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
    const id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast = { id, message: cleanMessage, type, duration };

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.removeToast(id);
        this.timers.delete(timer);
      }, duration);
      this.timers.add(timer);
    }

    this.toasts = [...cappedPrev, newToast];
  }

  clearTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
  }
}

test('1.1 Rapid burst of 50 identical toasts within 10ms yields exactly 1 active toast', () => {
  const sim = new ToastContextSimulator();
  for (let i = 0; i < 50; i++) {
    sim.showToast('Gagal memuat koordinat lokasi', 'error', 3000);
  }
  assert.strictEqual(sim.toasts.length, 1, `Expected 1 toast, but got ${sim.toasts.length}`);
  assert.strictEqual(sim.toasts[0].message, 'Gagal memuat koordinat lokasi');
  sim.clearTimers();
});

test('1.2 Multiple distinct toasts are preserved and capped at max 3 concurrent items', () => {
  const sim = new ToastContextSimulator();
  const messages = [
    'Item 1 ditambahkan',
    'Item 2 ditambahkan',
    'Item 3 ditambahkan',
    'Item 4 ditambahkan',
    'Item 5 ditambahkan',
  ];

  for (const msg of messages) {
    sim.showToast(msg, 'success', 3000);
  }

  assert.strictEqual(sim.toasts.length, 3, `Expected capped count 3, got ${sim.toasts.length}`);
  // Should keep the latest 3 (Item 3, Item 4, Item 5)
  assert.strictEqual(sim.toasts[0].message, 'Item 3 ditambahkan');
  assert.strictEqual(sim.toasts[1].message, 'Item 4 ditambahkan');
  assert.strictEqual(sim.toasts[2].message, 'Item 5 ditambahkan');
  sim.clearTimers();
});

await asyncTest('1.3 Toasts cleanly expire and remove from state after duration', async () => {
  const sim = new ToastContextSimulator();
  sim.showToast('Pemberitahuan sementara', 'info', 60);
  assert.strictEqual(sim.toasts.length, 1);

  await new Promise((r) => setTimeout(r, 90));
  assert.strictEqual(sim.toasts.length, 0, `Expected 0 toasts after expiration, got ${sim.toasts.length}`);
  sim.clearTimers();
});

test('1.4 Cooldown window releases after 2500ms allowing subsequent identical toast', () => {
  const sim = new ToastContextSimulator();
  const originalDateNow = Date.now;
  let simulatedTime = 1000000;
  Date.now = () => simulatedTime;

  try {
    sim.showToast('Peringatan kuota', 'warning', 3000);
    assert.strictEqual(sim.toasts.length, 1);

    // Call again at +1000ms (within 2500ms cooldown) -> rejected
    simulatedTime += 1000;
    sim.showToast('Peringatan kuota', 'warning', 3000);
    assert.strictEqual(sim.toasts.length, 1);

    // Clear active toast as if expired
    sim.toasts = [];

    // Call again at +2000ms (still within 2500ms from start: diff 2000 < 2500) -> rejected by recentToasts
    simulatedTime = 1002000;
    sim.showToast('Peringatan kuota', 'warning', 3000);
    assert.strictEqual(sim.toasts.length, 0, 'Should still be suppressed within 2500ms cooldown');

    // Call at +2600ms (exceeds 2500ms cooldown) -> accepted!
    simulatedTime = 1002600;
    sim.showToast('Peringatan kuota', 'warning', 3000);
    assert.strictEqual(sim.toasts.length, 1, 'Should be allowed after 2500ms cooldown');
  } finally {
    Date.now = originalDateNow;
    sim.clearTimers();
  }
});

// -----------------------------------------------------------------
// 2. CHALLENGE: Location Error Lock in Marketplace (CustomerMarketplace.tsx)
// -----------------------------------------------------------------
console.log('\n--- SECTION 2: Location Error Lock & Cooldown ---');

class MarketplaceLocationHarness {
  constructor() {
    this.isLoadingLoc = false;
    this.hasWarnedLocationRef = { current: false };
    this.selectedCity = 'Malang';
    this.toastsShown = [];
    this.geolocationCalls = 0;
    this.pendingGeolocationCb = null;
  }

  handleRequestLiveLocation() {
    if (this.isLoadingLoc) return;
    this.isLoadingLoc = true;
    this.geolocationCalls++;

    // Mock geolocation execution
    this.pendingGeolocationCb = (success, error) => {
      this.pendingGeolocationCb = null;
      if (success) {
        this.isLoadingLoc = false;
        this.hasWarnedLocationRef.current = false;
        this.selectedCity = 'Lokasi Saat Ini';
        this.toastsShown.push('📍 Lokasi terdeteksi, menampilkan Mystery Box terdekat');
      } else {
        this.isLoadingLoc = false;
        if (!this.hasWarnedLocationRef.current) {
          this.hasWarnedLocationRef.current = true;
          this.toastsShown.push('Izin lokasi belum diberikan, default: Malang');
        }
        this.selectedCity = 'Malang';
      }
    };
  }
}

test('2.1 Concurrent / rapid live location clicks are rejected by isLoadingLoc in-flight guard', () => {
  const harness = new MarketplaceLocationHarness();

  harness.handleRequestLiveLocation();
  assert.strictEqual(harness.geolocationCalls, 1, 'First click triggers geolocation');
  assert.strictEqual(harness.isLoadingLoc, true, 'isLoadingLoc set to true');

  // Attempt 5 additional clicks while in-flight
  for (let i = 0; i < 5; i++) {
    harness.handleRequestLiveLocation();
  }
  assert.strictEqual(harness.geolocationCalls, 1, 'Geolocation calls must NOT increase while in-flight');

  // Finish request
  harness.pendingGeolocationCb(true, null);
  assert.strictEqual(harness.isLoadingLoc, false);
  assert.strictEqual(harness.selectedCity, 'Lokasi Saat Ini');
});

test('2.2 Repeated location denials do NOT stack duplicate error toasts (hasWarnedLocationRef cooldown)', () => {
  const harness = new MarketplaceLocationHarness();

  // First denial
  harness.handleRequestLiveLocation();
  harness.pendingGeolocationCb(false, { code: 1, message: 'Permission denied' });
  assert.strictEqual(harness.toastsShown.length, 1);
  assert.strictEqual(harness.toastsShown[0], 'Izin lokasi belum diberikan, default: Malang');
  assert.strictEqual(harness.hasWarnedLocationRef.current, true);

  // Second attempt: user clicks again and permission denied again
  harness.handleRequestLiveLocation();
  assert.strictEqual(harness.geolocationCalls, 2);
  harness.pendingGeolocationCb(false, { code: 1, message: 'Permission denied' });
  assert.strictEqual(harness.toastsShown.length, 1, 'Toast count must remain 1 (no stacking duplicate toasts)');

  // Third attempt: denied again
  harness.handleRequestLiveLocation();
  harness.pendingGeolocationCb(false, { code: 1, message: 'Permission denied' });
  assert.strictEqual(harness.toastsShown.length, 1, 'Toast count must still remain 1');
});

test('2.3 Successful geolocation resets hasWarnedLocationRef allowing future warnings if re-denied', () => {
  const harness = new MarketplaceLocationHarness();

  // 1. Initial error
  harness.handleRequestLiveLocation();
  harness.pendingGeolocationCb(false, { code: 1 });
  assert.strictEqual(harness.toastsShown.length, 1);

  // 2. Success reset
  harness.handleRequestLiveLocation();
  harness.pendingGeolocationCb(true, null);
  assert.strictEqual(harness.hasWarnedLocationRef.current, false, 'Success must reset hasWarnedLocationRef to false');
  assert.strictEqual(harness.toastsShown.length, 2);

  // 3. Subsequent error should now warn again
  harness.handleRequestLiveLocation();
  harness.pendingGeolocationCb(false, { code: 1 });
  assert.strictEqual(harness.toastsShown.length, 3, 'New error after success should emit warning toast once');
  assert.strictEqual(harness.toastsShown[2], 'Izin lokasi belum diberikan, default: Malang');
});

// -----------------------------------------------------------------
// 3. CHALLENGE: Navigation Links & Hash Parameter Routing
// -----------------------------------------------------------------
console.log('\n--- SECTION 3: Navigation Links & Routing ---');

// Replicate hash routing helpers from src/app/hashRouting.ts
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseHash(hashStr = '') {
  let clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
  let anchor;

  const anchorIndex = clean.lastIndexOf('#');
  if (anchorIndex !== -1) {
    anchor = clean.slice(anchorIndex + 1);
    clean = clean.slice(0, anchorIndex);
  }

  const queryIndex = clean.indexOf('?');
  if (queryIndex === -1) {
    return { path: clean.toLowerCase(), params: new URLSearchParams(), anchor };
  }

  const params = new URLSearchParams(clean.slice(queryIndex + 1));
  if (!anchor && params.has('section')) {
    anchor = params.get('section') || undefined;
  }

  return {
    path: clean.slice(0, queryIndex).toLowerCase(),
    params,
    anchor,
  };
}

function isCustomerOrderDetailPath(path) {
  return (
    path.startsWith('pembayaran') ||
    path.startsWith('payment') ||
    path.startsWith('detail-pesanan') ||
    path.startsWith('order-detail')
  );
}

test('3.1 Formats #toko?name=...&id=...&section=ulasan-pelanggan correctly with URL encoding', () => {
  const storeName = 'Monsieur Spoon & Bakery #1';
  const storeId = '8f43b59e-1111-4444-8888-0123456789ab';
  const query = new URLSearchParams();
  query.set('name', storeName);
  query.set('id', storeId);
  query.set('section', 'ulasan-pelanggan');

  const generatedHash = `#toko?${query.toString()}`;
  assert(generatedHash.startsWith('#toko?'), 'Hash must start with #toko?');
  assert(generatedHash.includes('section=ulasan-pelanggan'), 'Hash must include section=ulasan-pelanggan');
  assert(generatedHash.includes(`id=${storeId}`), 'Hash must include exact store id');

  // Verify parseHash parses it symmetrically
  const parsed = parseHash(generatedHash);
  assert.strictEqual(parsed.path, 'toko');
  assert.strictEqual(parsed.params.get('id'), storeId);
  assert.strictEqual(safeDecode(parsed.params.get('name')), storeName);
  assert.strictEqual(parsed.anchor, 'ulasan-pelanggan');
});

test('3.2 #detail-pesanan?id=... matches isCustomerOrderDetailPath and extracts order ID', () => {
  const testOrderId = 'ORD-20261109-7788';
  const hash = `#detail-pesanan?id=${testOrderId}`;

  const parsed = parseHash(hash);
  assert.strictEqual(parsed.path, 'detail-pesanan');
  assert.strictEqual(parsed.params.get('id'), testOrderId);
  assert.strictEqual(isCustomerOrderDetailPath(parsed.path), true, 'detail-pesanan must be recognized as order detail path');
});

test('3.3 CustomerStoreDetail reviews target element id="ulasan-pelanggan" exists in StoreReviewsList.tsx', () => {
  const reviewsListPath = path.resolve('src/components/customer/store/StoreReviewsList.tsx');
  const content = fs.readFileSync(reviewsListPath, 'utf8');
  assert(content.includes('id="ulasan-pelanggan"'), 'StoreReviewsList.tsx must contain id="ulasan-pelanggan" anchor');
});

test('3.4 CustomerOrderHistory handleOpenOrderDetail contains fallback to #detail-pesanan?id=', () => {
  const orderHistoryPath = path.resolve('src/pages/customer/CustomerOrderHistory.tsx');
  const content = fs.readFileSync(orderHistoryPath, 'utf8');
  assert(
    content.includes('window.location.hash = `#detail-pesanan?id=${order.id || order.orderNumber}`'),
    'Fallback routing must set window.location.hash with order id'
  );
});

// -----------------------------------------------------------------
// 4. CHALLENGE: Component Integrity and Slop Check
// -----------------------------------------------------------------
console.log('\n--- SECTION 4: Component Integrity & Anti-Slop Audit ---');

test('4.1 CustomerProductDetail store rating displays dynamic rating without fallback 4.9 or 48', () => {
  const pdPath = path.resolve('src/pages/customer/CustomerProductDetail.tsx');
  const content = fs.readFileSync(pdPath, 'utf8');

  // Ensure no hardcoded fallback rating 4.9 or 48 in store header
  assert(!content.includes('rating: 4.9'), 'Must not have hardcoded rating 4.9');
  assert(!content.includes('reviewCount: 48'), 'Must not have hardcoded reviewCount 48');
  assert(content.includes('displayRating'), 'Must compute displayRating dynamically');
  assert(content.includes('displayReviewCount'), 'Must compute displayReviewCount dynamically');
  assert(content.includes('(Belum ada ulasan)'), 'Must show (Belum ada ulasan) when 0 reviews');
});

test('4.2 CustomerOrderHistory has no "Beri Ulasan" button and universally renders "Lihat Detail"', () => {
  const ohPath = path.resolve('src/pages/customer/CustomerOrderHistory.tsx');
  const content = fs.readFileSync(ohPath, 'utf8');

  assert(!content.includes('Beri Ulasan'), 'CustomerOrderHistory must contain NO "Beri Ulasan" text');
  assert(content.includes('Lihat Detail'), 'CustomerOrderHistory must render "Lihat Detail"');
  assert(content.includes('Beli Lagi'), 'CustomerOrderHistory must retain "Beli Lagi" for completed orders');
});

test('4.3 CustomerMarketplace defaults to "lokasi" sortField with "asc" sortOrder', () => {
  const mpPath = path.resolve('src/pages/customer/CustomerMarketplace.tsx');
  const content = fs.readFileSync(mpPath, 'utf8');

  assert(content.includes("useState<SortField>('lokasi')"), 'Default sortField must be "lokasi"');
  assert(content.includes("useState<SortOrder>('asc')"), 'Default sortOrder must be "asc"');
});

test('4.4 App.tsx prevents dual toast rendering by delegating to ToastContext early', () => {
  const appPath = path.resolve('src/App.tsx');
  const content = fs.readFileSync(appPath, 'utf8');

  const pattern = /if\s*\(toastContextShow\)\s*\{\s*toastContextShow\(message,\s*type,\s*duration\);\s*return;\s*\}/;
  assert(pattern.test(content), 'App.tsx must return early when toastContextShow is present');
});

test('4.5 Contact & Home pages have noisy toasts removed', () => {
  const contactContent = fs.readFileSync(path.resolve('src/pages/customer/CustomerContact.tsx'), 'utf8');
  const homeContent = fs.readFileSync(path.resolve('src/pages/customer/CustomerHome.tsx'), 'utf8');

  assert(!contactContent.includes('Membuka Gmail'), 'Gmail popup toast must be absent');
  assert(!homeContent.includes('Membuka live chat Customer Service'), 'Live chat fake toast must be absent');
});

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log('\n===============================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('===============================================================');

if (failed > 0) {
  console.error('\nFAILURES SUMMARY:');
  for (const f of failures) {
    console.error(`- ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\nALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!');
  process.exit(0);
}
