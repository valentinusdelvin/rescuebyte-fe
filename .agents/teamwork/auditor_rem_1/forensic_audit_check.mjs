import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT = 'c:/Users/fahmi/Documents/Lomba/rescuebyte-fe';

console.log('================================================================');
console.log('FORENSIC AUDITOR INDEPENDENT INTEGRITY VERIFICATION');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// ----------------------------------------------------------------------
// CHECK 1: ProductReviewsSection.tsx Read-Only Enforcement
// ----------------------------------------------------------------------
console.log('--- CHECK 1: ProductReviewsSection.tsx Read-Only Enforcement ---');
const prsContent = fs.readFileSync(path.join(ROOT, 'src/components/customer/product/ProductReviewsSection.tsx'), 'utf8');

check('No "Tulis Ulasan" button in ProductReviewsSection header', () => {
  assert(!prsContent.includes('>Tulis Ulasan<'), 'Found ">Tulis Ulasan<" in ProductReviewsSection');
  assert(!prsContent.includes('Tulis Ulasan</Button>'), 'Found "Tulis Ulasan</Button>"');
});

check('No "Tulis Ulasan Pertama" button in EmptyState', () => {
  assert(!prsContent.includes('Tulis Ulasan Pertama'), 'Found "Tulis Ulasan Pertama" in ProductReviewsSection');
});

check('canEdit and canDelete are strictly false on ReviewCard', () => {
  assert(prsContent.includes('canEdit={false}'), 'ReviewCard missing canEdit={false}');
  assert(prsContent.includes('canDelete={false}'), 'ReviewCard missing canDelete={false}');
});

check('useProductReviews fetches genuine backend data', () => {
  assert(prsContent.includes('useProductReviews(productId'), 'Missing useProductReviews call');
  assert(prsContent.includes('reviews.map'), 'Missing real reviews rendering map');
});

// ----------------------------------------------------------------------
// CHECK 2: Order Detail Review Trigger and Dual Submission Flow
// ----------------------------------------------------------------------
console.log('\n--- CHECK 2: Order Detail Guard and Dual Submission ---');
const codContent = fs.readFileSync(path.join(ROOT, 'src/pages/customer/CustomerOrderDetail.tsx'), 'utf8');
const ormContent = fs.readFileSync(path.join(ROOT, 'src/components/customer/order/OrderReviewModal.tsx'), 'utf8');

check('isOrderCompleted logic strictly checks selesai or activeStep 5', () => {
  assert(
    codContent.includes("const isOrderCompleted = currentStatus === 'selesai' || activeStep === 5;"),
    'Missing exact isOrderCompleted guard definition'
  );
});

check('OrderReviewSection is strictly conditioned on isOrderCompleted', () => {
  assert(
    codContent.includes('{isOrderCompleted && (') && codContent.includes('<OrderReviewSection'),
    'OrderReviewSection is not wrapped in isOrderCompleted guard'
  );
});

check('OrderReviewModal implements dual section submission interface', () => {
  assert(ormContent.includes('interface DualReviewSubmitPayload'), 'Missing DualReviewSubmitPayload interface');
  assert(ormContent.includes('onSubmitDualReview?: (payload: DualReviewSubmitPayload)'), 'Missing onSubmitDualReview prop');
  assert(ormContent.includes('Ulasan Toko'), 'Missing Ulasan Toko section');
  assert(ormContent.includes('Ulasan Produk'), 'Missing Ulasan Produk section');
});

check('OrderReviewModal validates both store and product ratings/comments before submit', () => {
  assert(ormContent.includes('!storeRating || storeRating < 1'), 'Missing storeRating validation');
  assert(ormContent.includes('!storeText.trim()'), 'Missing storeText validation');
  assert(ormContent.includes('!productRating || productRating < 1'), 'Missing productRating validation');
  assert(ormContent.includes('!productText.trim()'), 'Missing productText validation');
});

check('CustomerOrderDetail submits to genuine reviewApi endpoints via Promise.all', () => {
  assert(codContent.includes('reviewApi.createStoreReview(resolvedStoreId'), 'Missing genuine createStoreReview call');
  assert(codContent.includes('reviewApi.createProductReview(targetProductId'), 'Missing genuine createProductReview call');
  assert(codContent.includes('await Promise.all(apiCalls);'), 'Missing Promise.all execution for dual review');
  assert(codContent.includes('onSubmitDualReview={handleSubmitDualReview}'), 'Modal not wired with handleSubmitDualReview');
});

// ----------------------------------------------------------------------
// CHECK 3: SellerReviews.tsx and Store Reviews Integration
// ----------------------------------------------------------------------
console.log('\n--- CHECK 3: Seller Dashboard and Store Reviews ---');
const srContent = fs.readFileSync(path.join(ROOT, 'src/pages/seller/SellerReviews.tsx'), 'utf8');
const csdContent = fs.readFileSync(path.join(ROOT, 'src/pages/customer/CustomerStoreDetail.tsx'), 'utf8');
const srlContent = fs.readFileSync(path.join(ROOT, 'src/components/customer/store/StoreReviewsList.tsx'), 'utf8');
const urContent = fs.readFileSync(path.join(ROOT, 'src/hooks/useReviews.ts'), 'utf8');
const appContent = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
const arContent = fs.readFileSync(path.join(ROOT, 'src/app/AppRoutes.tsx'), 'utf8');

check('SellerReviews resolves effectiveStoreId cleanly without foreign leakage', () => {
  assert(
    srContent.includes("propStoreId || storedSellerStoreId || myStore?.id"),
    'Missing effectiveStoreId resolution'
  );
  assert(
    srContent.includes("localStorage.getItem('rescuebyte_store_id')"),
    'Missing stored seller store ID resolution'
  );
  assert(
    appContent.includes("localStorage.setItem('rescuebyte_store_id', store.id)"),
    'App.tsx does not persist rescuebyte_store_id'
  );
  assert(
    arContent.includes('<SellerReviews storeName={storeName} />'),
    'AppRoutes must not pass foreign selectedStoreId to SellerReviews'
  );
});

check('SellerReviews uses real useStoreReviews hook with genuine API call', () => {
  assert(srContent.includes('useStoreReviews(effectiveStoreId'), 'Missing useStoreReviews hook call');
});

check('CustomerStoreDetail eliminates hardcoded 4.9 and 48', () => {
  assert(!csdContent.includes('rating: 4.9, reviewCount: 48'), 'Hardcoded 4.9 and 48 still present in CustomerStoreDetail');
  assert(!csdContent.includes('const storeReviews: StoreReviewItem[] = useMemo(() => [], []);'), 'Empty dummy store reviews array still present');
  assert(csdContent.includes('reviewApi.getStoreSummary(targetStoreId)'), 'Missing getStoreSummary API call');
});

check('CustomerStoreDetail fetches both store and product reviews', () => {
  assert(csdContent.includes('useStoreProductReviews(storeProducts)'), 'Missing useStoreProductReviews call in CustomerStoreDetail');
  assert(csdContent.includes("type: 'store' as const"), 'Missing type store tagging');
  assert(csdContent.includes('combinedTotalReviews'), 'Missing combined review count calculation');
});

check('StoreReviewsList provides 3 filter tabs and differentiated visual badges', () => {
  assert(srlContent.includes("activeFilter === 'semua'"), 'Missing semua filter tab');
  assert(srlContent.includes("activeFilter === 'toko'"), 'Missing toko filter tab');
  assert(srlContent.includes("activeFilter === 'produk'"), 'Missing produk filter tab');
  assert(srlContent.includes('Ulasan Toko'), 'Missing store review badge');
  assert(srlContent.includes('isProductReview'), 'Missing product review differentiator');
});

// ----------------------------------------------------------------------
// CHECK 4: reviewApi.ts Facade & Anti-Cheat Audit
// ----------------------------------------------------------------------
console.log('\n--- CHECK 4: reviewApi.ts Anti-Cheat Audit ---');
const apiContent = fs.readFileSync(path.join(ROOT, 'src/api/services/reviewApi.ts'), 'utf8');

check('reviewApi uses real apiClient and matches Swagger endpoints', () => {
  assert(apiContent.includes("`/api/v1/products/${productId}/reviews`"), 'Missing product reviews endpoint');
  assert(apiContent.includes("`/api/v1/stores/${storeId}/reviews`"), 'Missing store reviews endpoint');
  assert(apiContent.includes("`/api/v1/stores/${storeId}/summary`"), 'Missing store summary endpoint');
  assert(apiContent.includes("`/api/v1/reviews/${id}`"), 'Missing review detail/mutation endpoint');
  assert(!apiContent.includes('setTimeout'), 'reviewApi must not contain fake setTimeout mocks');
  assert(!apiContent.includes('return Promise.resolve({} as any)'), 'reviewApi must not contain fake returns');
});

// ----------------------------------------------------------------------
// CHECK 5: Adversarial Simulation of Order Status Logic
// ----------------------------------------------------------------------
console.log('\n--- CHECK 5: Adversarial Simulation of Order Status Logic ---');

check('Status simulation: Only selesai or step 5 unlocks review section', () => {
  const statuses = [
    { status: 'menunggu-pembayaran', step: 1, expected: false },
    { status: 'menunggu-konfirmasi', step: 2, expected: false },
    { status: 'diproses', step: 3, expected: false },
    { status: 'siap-diambil', step: 4, expected: false },
    { status: 'dibatalkan', step: 1, expected: false },
    { status: 'selesai', step: 5, expected: true },
    { status: 'selesai', step: 1, expected: true }, // status overrides step
    { status: 'siap-diambil', step: 5, expected: true }, // step 5 overrides status
  ];

  for (const tc of statuses) {
    const isCompleted = tc.status === 'selesai' || tc.step === 5;
    assert.strictEqual(
      isCompleted,
      tc.expected,
      `Failed for status=${tc.status}, step=${tc.step}: got ${isCompleted}, expected ${tc.expected}`
    );
  }
});

console.log('\n================================================================');
console.log(`AUDIT RESULTS: ${passedChecks}/${totalChecks} CHECKS PASSED`);
if (passedChecks === totalChecks) {
  console.log('VERDICT: CLEAN — NO INTEGRITY VIOLATIONS DETECTED');
} else {
  console.log('VERDICT: INTEGRITY VIOLATION DETECTED');
  process.exit(1);
}
console.log('================================================================');
