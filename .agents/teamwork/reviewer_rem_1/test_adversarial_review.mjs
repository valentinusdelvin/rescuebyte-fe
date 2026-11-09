import fs from 'fs';
import path from 'path';
import assert from 'assert';

const projectRoot = process.cwd();

console.log('================================================================');
console.log('ADVERSARIAL CRITIC & INDEPENDENT REVIEW SUITE (R1 & R2)');
console.log('================================================================');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// 1. R1 SOURCE CODE & COMPONENT INTEGRITY AUDIT
runTest('R1: ProductReviewsSection has NO "Tulis Ulasan" button in header', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/product/ProductReviewsSection.tsx'), 'utf-8');
  assert(!file.includes('Tulis Ulasan'), 'Found "Tulis Ulasan" in ProductReviewsSection.tsx');
});

runTest('R1: ProductReviewsSection has NO "Tulis Ulasan Pertama" button in EmptyState', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/product/ProductReviewsSection.tsx'), 'utf-8');
  assert(!file.includes('Tulis Ulasan Pertama'), 'Found "Tulis Ulasan Pertama" in ProductReviewsSection.tsx');
});

runTest('R1: ProductReviewsSection sets canEdit={false} and canDelete={false} on all ReviewCard instances', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/product/ProductReviewsSection.tsx'), 'utf-8');
  assert(file.includes('canEdit={false}'), 'canEdit={false} missing in ProductReviewsSection.tsx');
  assert(file.includes('canDelete={false}'), 'canDelete={false} missing in ProductReviewsSection.tsx');
  // Check no dynamic canEdit computation
  assert(!file.includes('canEdit={canEdit}'), 'Dynamic canEdit binding found');
});

runTest('R1: CustomerProductDetail mounts ProductReviewsSection and contains no write triggers', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/pages/customer/CustomerProductDetail.tsx'), 'utf-8');
  assert(file.includes('<ProductReviewsSection'), 'ProductReviewsSection is not mounted in CustomerProductDetail.tsx');
  assert(!file.includes('Tulis Ulasan'), 'Found "Tulis Ulasan" in CustomerProductDetail.tsx');
  assert(!file.includes('Beri Ulasan'), 'Found "Beri Ulasan" in CustomerProductDetail.tsx');
});

runTest('R1: ReviewCard suppresses all edit/delete buttons when canEdit and canDelete are false', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/reviews/ReviewCard.tsx'), 'utf-8');
  assert(file.includes('(canEdit || canDelete)'), 'Action button guard (canEdit || canDelete) missing in ReviewCard.tsx');
});

// 2. R2 STATUS CONDITION STRESS TEST
runTest('R2: Order completion logic is strictly tied to "selesai"', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/pages/customer/CustomerOrderDetail.tsx'), 'utf-8');
  assert(file.includes("isOrderCompleted = currentStatus === 'selesai' || activeStep === 5"), 'isOrderCompleted definition not found or incorrect');
  assert(file.includes('{isOrderCompleted && ('), 'OrderReviewSection is not guarded by {isOrderCompleted && (');
  assert(file.includes('<OrderReviewSection'), 'OrderReviewSection not found inside guard');
});

// Simulate status transitions for activeStep and isOrderCompleted
const evaluateOrderCompletion = (currentStatus) => {
  let activeStep = 2;
  if (currentStatus === 'menunggu-pembayaran') activeStep = 1;
  else if (currentStatus === 'menunggu-konfirmasi') activeStep = 2;
  else if (currentStatus === 'diproses') activeStep = 3;
  else if (currentStatus === 'siap-diambil') activeStep = 4;
  else if (currentStatus === 'selesai') activeStep = 5;
  else if (currentStatus === 'dibatalkan') activeStep = 1;

  const isOrderCompleted = currentStatus === 'selesai' || activeStep === 5;
  return { activeStep, isOrderCompleted };
};

const statusesToTest = [
  { status: 'menunggu-pembayaran', expected: false },
  { status: 'menunggu-konfirmasi', expected: false },
  { status: 'diproses', expected: false },
  { status: 'siap-diambil', expected: false },
  { status: 'dibatalkan', expected: false },
  { status: 'unknown_status', expected: false },
  { status: null, expected: false },
  { status: undefined, expected: false },
  { status: 'selesai', expected: true },
];

for (const { status, expected } of statusesToTest) {
  runTest(`R2 Stress-Test: Order status "${status}" evaluates isOrderCompleted to ${expected}`, () => {
    const { isOrderCompleted } = evaluateOrderCompletion(status);
    assert.strictEqual(isOrderCompleted, expected, `Expected status "${status}" to yield ${expected}, got ${isOrderCompleted}`);
  });
}

// 3. R2 MODAL & TRIGGER VERIFICATION
runTest('R2: OrderReviewSection renders trigger buttons that open review modal', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/order/OrderReviewModal.tsx'), 'utf-8');
  assert(file.includes('Bagaimana Pengalamanmu?'), 'Section title "Bagaimana Pengalamanmu?" missing');
  assert(file.includes('Beri Ulasan Sekarang'), 'Button "Beri Ulasan Sekarang" missing');
  assert(file.includes('setIsReviewModalOpen(true)'), 'Trigger does not call setIsReviewModalOpen(true)');
});

runTest('R2: OrderReviewModal contains dual sections for Store and Product review', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/order/OrderReviewModal.tsx'), 'utf-8');
  assert(file.includes('Ulasan Toko'), 'Section "Ulasan Toko" missing in OrderReviewModal.tsx');
  assert(file.includes('Rating Pelayanan Toko'), 'Label "Rating Pelayanan Toko" missing');
  assert(file.includes('Catatan Pengalaman Toko'), 'Label "Catatan Pengalaman Toko" missing');
  assert(file.includes('store-review-comment'), 'Store textarea ID missing');

  assert(file.includes('Ulasan Produk'), 'Section "Ulasan Produk" missing in OrderReviewModal.tsx');
  assert(file.includes('Rating Kualitas Produk'), 'Label "Rating Kualitas Produk" missing');
  assert(file.includes('Catatan Kualitas Makanan'), 'Label "Catatan Kualitas Makanan" missing');
  assert(file.includes('product-review-comment'), 'Product textarea ID missing');
});

runTest('R2: OrderReviewModal validates required fields before submission', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/order/OrderReviewModal.tsx'), 'utf-8');
  assert(file.includes('!storeRating || storeRating < 1'), 'Store rating validation missing');
  assert(file.includes('!storeText.trim()'), 'Store comment validation missing');
  assert(file.includes('!productRating || productRating < 1'), 'Product rating validation missing');
  assert(file.includes('!productText.trim()'), 'Product comment validation missing');
});

runTest('R2: OrderReviewModal multi-product selector tabs work when items > 1', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/order/OrderReviewModal.tsx'), 'utf-8');
  assert(file.includes('items.length > 1'), 'items.length > 1 check missing for product selector');
  assert(file.includes('setSelectedProductIndex(idx)'), 'Product selector does not switch selectedProductIndex');
});

// 4. R2 API ENDPOINTS CALLS & WIRING AUDIT
runTest('R2: CustomerOrderDetail invokes reviewApi.createStoreReview and reviewApi.createProductReview', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/pages/customer/CustomerOrderDetail.tsx'), 'utf-8');
  assert(file.includes('reviewApi.createStoreReview'), 'reviewApi.createStoreReview call missing in CustomerOrderDetail.tsx');
  assert(file.includes('reviewApi.createProductReview'), 'reviewApi.createProductReview call missing in CustomerOrderDetail.tsx');
  assert(file.includes('Promise.all(apiCalls)'), 'Parallel Promise.all submission missing');
});

runTest('R2: reviewApi.createStoreReview points to POST /api/v1/stores/{storeId}/reviews', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/api/services/reviewApi.ts'), 'utf-8');
  assert(file.includes('/api/v1/stores/${storeId}/reviews'), 'Endpoint path for store review is incorrect in reviewApi.ts');
  assert(file.includes('apiClient.post<ReviewResponse>'), 'HTTP POST method missing for store review');
});

runTest('R2: reviewApi.createProductReview points to POST /api/v1/products/{productId}/reviews', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/api/services/reviewApi.ts'), 'utf-8');
  assert(file.includes('/api/v1/products/${productId}/reviews'), 'Endpoint path for product review is incorrect in reviewApi.ts');
  assert(file.includes('apiClient.post<ReviewResponse>'), 'HTTP POST method missing for product review');
});

// 5. INTEGRITY & ANTI-CHEAT AUDIT
runTest('Integrity Check: No mock bypass in handleSubmitDualReview', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/pages/customer/CustomerOrderDetail.tsx'), 'utf-8');
  const dualReviewIdx = file.indexOf('handleSubmitDualReview');
  assert(dualReviewIdx !== -1, 'handleSubmitDualReview function not found');
  const dualReviewFn = file.slice(dualReviewIdx, dualReviewIdx + 1500);
  assert(!dualReviewFn.includes('setTimeout'), 'Found setTimeout mock inside handleSubmitDualReview!');
  assert(dualReviewFn.includes('await Promise.all(apiCalls)'), 'Real async API call missing in handleSubmitDualReview');
});

runTest('Integrity Check: ProductReviewsSection contains no hardcoded test reviews', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/product/ProductReviewsSection.tsx'), 'utf-8');
  assert(!file.includes('"Reza Akbar"'), 'Found hardcoded reviewer Reza Akbar in ProductReviewsSection');
  assert(!file.includes('"Roti masih sangat lembut"'), 'Found hardcoded review text in ProductReviewsSection');
});

runTest('Integrity Check: OrderReviewModal contains no hardcoded submission responses', () => {
  const file = fs.readFileSync(path.join(projectRoot, 'src/components/customer/order/OrderReviewModal.tsx'), 'utf-8');
  assert(!file.includes('return { status: 200 }'), 'Found fake static return in OrderReviewModal');
});

console.log('================================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('ALL INDEPENDENT ADVERSARIAL REVIEWS & INTEGRITY CHECKS PASSED!');
} else {
  console.log(`FAILED: ${totalTests - passedTests} TESTS`);
  process.exit(1);
}
console.log('================================================================');
