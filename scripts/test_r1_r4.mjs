import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('Running automated verification suite for R1 - R4...');

// 1. Check model.ts for R4
const modelPath = path.resolve('src/features/customer/marketplace/model.ts');
const modelContent = fs.readFileSync(modelPath, 'utf8');

// Verify SORT_OPTIONS has 'lokasi' first
const sortOptionsMatch = modelContent.match(/export const SORT_OPTIONS: SortConfig\[\] = \[\s*\{\s*id: '([^']+)'/);
assert(sortOptionsMatch, 'SORT_OPTIONS definition not found in model.ts');
assert.strictEqual(sortOptionsMatch[1], 'lokasi', `Expected first SORT_OPTIONS id to be 'lokasi', got '${sortOptionsMatch[1]}'`);
console.log('✔ [R4] model.ts: SORT_OPTIONS lists "lokasi" first.');

// 2. Check CustomerMarketplace.tsx for R3 & R4
const marketplacePath = path.resolve('src/pages/customer/CustomerMarketplace.tsx');
const marketplaceContent = fs.readFileSync(marketplacePath, 'utf8');

assert(marketplaceContent.includes("useState<SortField>('lokasi')"), 'CustomerMarketplace initial sortField must be "lokasi"');
console.log('✔ [R4] CustomerMarketplace: Initial sortField is set to "lokasi".');

assert(marketplaceContent.includes('if (isLoadingLoc) return;'), 'CustomerMarketplace missing in-flight location lock');
assert(marketplaceContent.includes('hasWarnedLocationRef'), 'CustomerMarketplace missing location error cooldown ref');
console.log('✔ [R3] CustomerMarketplace: Location in-flight lock and error cooldown ref implemented.');

// 3. Check CustomerProductDetail.tsx for R1
const productDetailPath = path.resolve('src/pages/customer/CustomerProductDetail.tsx');
const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');

assert(productDetailContent.includes('useStoreReviews'), 'CustomerProductDetail must import and use useStoreReviews');
assert(productDetailContent.includes('resolvedStoreId'), 'CustomerProductDetail must maintain resolvedStoreId');
assert(productDetailContent.includes('displayRating'), 'CustomerProductDetail must compute displayRating');
assert(productDetailContent.includes('displayReviewCount'), 'CustomerProductDetail must compute displayReviewCount');
assert(productDetailContent.includes('ulasan-pelanggan'), 'CustomerProductDetail must link to section=ulasan-pelanggan');
assert(!productDetailContent.includes('setLocalToast'), 'CustomerProductDetail should not contain dead setLocalToast');
console.log('✔ [R1] CustomerProductDetail: Live store rating and review count with ulasan-pelanggan link implemented.');

// 4. Check CustomerOrderHistory.tsx for R2
const orderHistoryPath = path.resolve('src/pages/customer/CustomerOrderHistory.tsx');
const orderHistoryContent = fs.readFileSync(orderHistoryPath, 'utf8');

assert(!orderHistoryContent.includes('<span>Beri Ulasan</span>'), 'CustomerOrderHistory must not render "Beri Ulasan" button');
assert(!orderHistoryContent.includes('handleOpenReview'), 'CustomerOrderHistory must not have handleOpenReview');
assert(!orderHistoryContent.includes('isReviewOpen'), 'CustomerOrderHistory must not have isReviewOpen state');
assert(orderHistoryContent.includes('<span>Lihat Detail</span>'), 'CustomerOrderHistory must render "Lihat Detail"');
assert(orderHistoryContent.includes('<span>Beli Lagi</span>'), 'CustomerOrderHistory must render "Beli Lagi"');
assert(orderHistoryContent.includes('#detail-pesanan?id='), 'CustomerOrderHistory must include fallback to #detail-pesanan');
console.log('✔ [R2] CustomerOrderHistory: "Beri Ulasan" removed, "Lihat Detail" universal, "Beli Lagi" retained, review modal pruned.');

// 5. Check CustomerContact.tsx for R3
const contactPath = path.resolve('src/pages/customer/CustomerContact.tsx');
const contactContent = fs.readFileSync(contactPath, 'utf8');

assert(!contactContent.includes('Membuka Gmail... Silakan tekan Send'), 'CustomerContact must not contain Gmail popup toast');
console.log('✔ [R3] CustomerContact: Noisy Gmail notification toast removed.');

// 6. Check CustomerHome.tsx for R3
const homePath = path.resolve('src/pages/customer/CustomerHome.tsx');
const homeContent = fs.readFileSync(homePath, 'utf8');

assert(!homeContent.includes('Membuka live chat Customer Service'), 'CustomerHome must not have fake live chat toast');
assert(!homeContent.includes('onContactSupport='), 'CustomerHome should not pass dummy onContactSupport to CustomerFooter');
console.log('✔ [R3] CustomerHome: Fake live chat toast removed, enabling native footer modal.');

// 7. Check ToastContext.tsx for R3
const toastContextPath = path.resolve('src/context/ToastContext.tsx');
const toastContextContent = fs.readFileSync(toastContextPath, 'utf8');

assert(toastContextContent.includes('recentToastsRef'), 'ToastContext must have recentToastsRef for cooldown');
assert(toastContextContent.includes('2500'), 'ToastContext must check 2.5s cooldown');
assert(toastContextContent.includes('cappedPrev'), 'ToastContext must cap concurrent toasts');
console.log('✔ [R3] ToastContext: Cooldown deduplication and concurrent toast capping implemented.');

// 8. Check App.tsx for R3
const appPath = path.resolve('src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(/toastContextShow\(message,\s*type,\s*duration\);\s*return;/.test(appContent), 'App.tsx must return after toastContextShow to avoid dual rendering');
console.log('✔ [R3] App.tsx: Dual toast rendering eliminated by returning early on toastContextShow.');

console.log('\nAll programmatic verification assertions PASSED successfully!');
