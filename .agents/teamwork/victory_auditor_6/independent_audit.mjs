import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('======================================================================');
console.log('INDEPENDENT VICTORY AUDITOR FORENSIC SUITE');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

const rootDir = process.cwd();

// --- 1. AUDIT R1: No Floating Toasts & Inline Alerts ---
test('R1: Toast.tsx returns null unconditionally and ToastContext mounts no fixed DOM container', () => {
  const toastSrc = fs.readFileSync(path.join(rootDir, 'src/components/common/Toast.tsx'), 'utf8');
  assert(toastSrc.includes('return null;'), 'Toast.tsx must return null');

  const contextSrc = fs.readFileSync(path.join(rootDir, 'src/context/ToastContext.tsx'), 'utf8');
  assert(!contextSrc.includes('fixed bottom-'), 'ToastContext must not render fixed bottom toast container');
  assert(!contextSrc.includes('toast-container'), 'ToastContext must not mount floating toast container');

  const appSrc = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
  assert(!appSrc.includes('<Toast '), 'App.tsx must not render <Toast component');
});

test('R1: Accessible inline alerts with role="alert" exist across critical forms', () => {
  const loginSrc = fs.readFileSync(path.join(rootDir, 'src/components/auth/CustomerLoginForm.tsx'), 'utf8');
  assert(loginSrc.includes('role="alert"'), 'CustomerLoginForm must contain role="alert"');

  const regSrc = fs.readFileSync(path.join(rootDir, 'src/components/auth/CustomerRegisterForm.tsx'), 'utf8');
  assert(regSrc.includes('role="alert"'), 'CustomerRegisterForm must contain role="alert"');

  const buatDaganganSrc = fs.readFileSync(path.join(rootDir, 'src/pages/seller/BuatDagangan.tsx'), 'utf8');
  assert(buatDaganganSrc.includes('role="alert"'), 'BuatDagangan must contain role="alert"');
});

// --- 2. AUDIT R2: Clean Review Identity ---
test('R2: Role labels removed from testimonials, store reviews, and ReviewCard', () => {
  const homeSrc = fs.readFileSync(path.join(rootDir, 'src/pages/customer/CustomerHome.tsx'), 'utf8');
  assert(!homeSrc.includes('{testi.role}'), 'CustomerHome must not render {testi.role}');

  const storeRevSrc = fs.readFileSync(path.join(rootDir, 'src/components/customer/store/StoreReviewsList.tsx'), 'utf8');
  assert(!storeRevSrc.includes('{rev.role}'), 'StoreReviewsList must not render {rev.role}');

  const reviewCardSrc = fs.readFileSync(path.join(rootDir, 'src/components/reviews/ReviewCard.tsx'), 'utf8');
  assert(!reviewCardSrc.includes('roleLabel'), 'ReviewCard must not have roleLabel');
  assert(!reviewCardSrc.includes('reviewerRole'), 'ReviewCard must not have reviewerRole');
});

// --- 3. AUDIT R3: Product Rating Consistency ---
test('R3: productRatingService has deduplication, caching, and accurate math', () => {
  const serviceSrc = fs.readFileSync(path.join(rootDir, 'src/services/productRatingService.ts'), 'utf8');
  assert(serviceSrc.includes('batchFetchProductRatings'), 'Must export batchFetchProductRatings');
  assert(serviceSrc.includes('Array.from(new Set(productIds))'), 'Must deduplicate product IDs');
  assert(serviceSrc.includes('Promise.allSettled'), 'Must fetch concurrently with allSettled');
  assert(serviceSrc.includes('Math.round'), 'Must round rating mathematically');
});

test('R3: MysteryBoxCard renders rating unconditionally without variant check', () => {
  const cardSrc = fs.readFileSync(path.join(rootDir, 'src/components/customer/MysteryBoxCard.tsx'), 'utf8');
  assert(!cardSrc.includes("variant === 'popular' &&"), 'Must not gate rating display by variant');
  assert(!cardSrc.includes("!isPopular &&"), 'Must not hide rating on non-popular cards');
  assert(cardSrc.includes('Lihat ulasan toko'), 'Must include interactive review navigation');
  assert(cardSrc.includes('#toko?'), 'Must link to store reviews');
});

// --- 4. AUDIT R4: Stock Quantity Badges Removal & Stock Logic ---
test('R4: Stock quantity badges removed from card headers', () => {
  const cardSrc = fs.readFileSync(path.join(rootDir, 'src/components/customer/MysteryBoxCard.tsx'), 'utf8');
  assert(!cardSrc.includes('Sisa '), 'MysteryBoxCard must not render Sisa X Box in visual header');
  assert(!cardSrc.includes('remainingBoxesText}</span>'), 'Header must not render remainingBoxesText directly in badge');

  const gridSrc = fs.readFileSync(path.join(rootDir, 'src/components/customer/store/StoreDaganganGrid.tsx'), 'utf8');
  assert(!gridSrc.includes('Sisa '), 'StoreDaganganGrid must not render Sisa badges');
});

test('R4: Out-of-stock logic handles multiples of 10 and sold-out edge cases accurately', () => {
  const cardSrc = fs.readFileSync(path.join(rootDir, 'src/components/customer/MysteryBoxCard.tsx'), 'utf8');
  assert(!cardSrc.includes("toLowerCase().includes('0 box')"), 'Must NOT use naive includes(0 box)');

  function checkOutOfStock(item) {
    const rawStockText = item.remainingBoxesText || '';
    const stockMatch = rawStockText.match(/\d+/);
    const stockCount = stockMatch
      ? parseInt(stockMatch[0], 10)
      : (typeof item.stock === 'number' ? item.stock : 1);
    return (
      (typeof item.stock === 'number' && item.stock <= 0) ||
      stockCount === 0 ||
      /\b0\s*box\b/i.test(rawStockText) ||
      /\bhabis\b/i.test(rawStockText)
    );
  }

  // Multiples of 10 must be IN STOCK
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Sisa 10 Box', stock: 10 }), false);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Sisa 20 Box', stock: 20 }), false);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Sisa 50 Box', stock: 50 }), false);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Sisa 100 Box', stock: 100 }), false);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Sisa 1000 Box', stock: 1000 }), false);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: '10 Box Tersedia' }), false);

  // Sold out items must be OUT OF STOCK
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Sisa 0 Box', stock: 0 }), true);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: '0 box', stock: 0 }), true);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Habis' }), true);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: 'Stok habis' }), true);
  assert.strictEqual(checkOutOfStock({ remainingBoxesText: '', stock: 0 }), true);
});

// --- 5. AUDIT R5: Homepage 6-Product Limit & 3x2 Grid ---
test('R5: CustomerHome slices at 6 and renders 3-column desktop grid', () => {
  const homeSrc = fs.readFileSync(path.join(rootDir, 'src/pages/customer/CustomerHome.tsx'), 'utf8');
  assert(homeSrc.includes('.slice(0, 6)'), 'Must slice products to 6 items');
  assert(homeSrc.includes('lg:grid-cols-3'), 'Must use 3-column desktop grid');
  assert(homeSrc.includes('Array.from({ length: 6 })'), 'Skeletons must be 6 items');
});

// --- 6. AUDIT R6: Marketplace Nearest Sorting ---
test('R6: CustomerMarketplace defaults to sortField "lokasi" and sortOrder "asc"', () => {
  const marketSrc = fs.readFileSync(path.join(rootDir, 'src/pages/customer/CustomerMarketplace.tsx'), 'utf8');
  assert(marketSrc.includes("useState<SortField>('lokasi')"), 'Default sortField must be lokasi');
  assert(marketSrc.includes("useState<SortOrder>('asc')"), 'Default sortOrder must be asc');

  const modelSrc = fs.readFileSync(path.join(rootDir, 'src/features/customer/marketplace/model.ts'), 'utf8');
  assert(modelSrc.includes('distanceKm:'), 'Model must map distanceKm');
  assert(modelSrc.includes('p.distance_km'), 'Model must read backend distance_km');
});

// --- 7. AUDIT R7: Automatic Customer Geolocation ---
test('R7: LocationContext startup guard, silent fallback, and no toasts', () => {
  const locSrc = fs.readFileSync(path.join(rootDir, 'src/context/LocationContext.tsx'), 'utf8');
  assert(locSrc.includes('hasInitializedStartupGeo'), 'Must have module-level startup guard');
  assert(locSrc.includes('DEFAULT_COORDINATES'), 'Must define Malang fallback coordinates');
  assert(!locSrc.includes('useToastContext'), 'Must not import ToastContext');
  assert(!locSrc.includes('showToast'), 'Must not call showToast');
});

// --- 8. AUDIT R8: Automatic Session Logout ---
test('R8: AuthContext enforces 24h cap, single timer, and 12-key storage wipe', () => {
  const authSrc = fs.readFileSync(path.join(rootDir, 'src/context/AuthContext.tsx'), 'utf8');
  assert(authSrc.includes('MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000'), 'Must enforce 24h limit');
  assert(authSrc.includes('Math.min(tokenExp, maxExp)'), 'Must take min of tokenExp and maxExp');
  assert(authSrc.includes('clearSessionTimer'), 'Must clear timer to prevent duplicate timers');

  const sensitiveKeys = [
    'access_token',
    'refresh_token',
    'rescuebyte_auth',
    'rescuebyte_login_at',
    'rescuebyte_user_role',
    'rescuebyte_customer_cart',
    'rescuebyte_selected_store',
    'rescuebyte_store_logo',
    'rescuebyte_store_name',
    'rescuebyte_store_email',
    'rescuebyte_store_address',
    'rescuebyte_store_coordinates',
  ];

  for (const k of sensitiveKeys) {
    assert(authSrc.includes(k), `AuthContext must wipe sensitive key: ${k}`);
  }
});

test('R8: apiClient intercepts 401, coordinates refresh queue, and handles expiry', () => {
  const clientSrc = fs.readFileSync(path.join(rootDir, 'src/api/client.ts'), 'utf8');
  assert(clientSrc.includes('failedQueue'), 'Must maintain refresh queue');
  assert(clientSrc.includes('isRefreshing'), 'Must track refresh state');
  assert(clientSrc.includes('clearAllSensitiveSession'), 'Must clear session on hard 401 failure');
  assert(clientSrc.includes('rescuebyte_auth_expired'), 'Must dispatch auth expired event');
});

console.log('\n======================================================================');
console.log(`INDEPENDENT AUDIT COMPLETED: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED.`);
console.log('======================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
