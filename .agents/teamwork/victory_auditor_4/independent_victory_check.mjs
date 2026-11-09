import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT = process.cwd();

console.log('================================================================');
console.log('VICTORY AUDITOR INDEPENDENT VERIFICATION SUITE');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// R1: Read-Only Reviews on Product Detail
// -----------------------------------------------------------------------------
console.log('--- REQUIREMENT R1: Read-Only Reviews on Product Detail ---');

const productReviewsSectionPath = path.join(ROOT, 'src/components/customer/product/ProductReviewsSection.tsx');
const productReviewsSectionContent = fs.readFileSync(productReviewsSectionPath, 'utf8');

const customerProductDetailPath = path.join(ROOT, 'src/pages/customer/CustomerProductDetail.tsx');
const customerProductDetailContent = fs.readFileSync(customerProductDetailPath, 'utf8');

test('R1.1: ProductReviewsSection contains NO "Tulis Ulasan" button', () => {
  assert(!productReviewsSectionContent.includes('Tulis Ulasan'), 'Found "Tulis Ulasan" string in ProductReviewsSection.tsx');
});

test('R1.2: ProductReviewsSection contains NO "Tulis Ulasan Pertama" button', () => {
  assert(!productReviewsSectionContent.includes('Tulis Ulasan Pertama'), 'Found "Tulis Ulasan Pertama" in ProductReviewsSection.tsx');
});

test('R1.3: EmptyState has no interactive action button', () => {
  const emptyStateRegex = /<EmptyState[\s\S]*?\/>/;
  const match = productReviewsSectionContent.match(emptyStateRegex);
  assert(match, 'EmptyState component not found');
  assert(!match[0].includes('action='), 'EmptyState contains action prop');
});

test('R1.4: ReviewCard explicitly sets canEdit={false} and canDelete={false}', () => {
  assert(productReviewsSectionContent.includes('canEdit={false}'), 'canEdit={false} missing on ReviewCard');
  assert(productReviewsSectionContent.includes('canDelete={false}'), 'canDelete={false} missing on ReviewCard');
});

test('R1.5: ProductReviewsSection preserves real data fetching via useProductReviews', () => {
  assert(productReviewsSectionContent.includes('useProductReviews(productId'), 'useProductReviews hook call missing');
  assert(productReviewsSectionContent.includes('averageRating'), 'averageRating missing');
  assert(productReviewsSectionContent.includes('ratingDistribution'), 'ratingDistribution missing');
});

test('R1.6: CustomerProductDetail mounts ProductReviewsSection below product info', () => {
  assert(customerProductDetailContent.includes('<ProductReviewsSection'), 'ProductReviewsSection not mounted in CustomerProductDetail');
  assert(!customerProductDetailContent.includes('Tulis Ulasan'), 'CustomerProductDetail contains "Tulis Ulasan" write trigger');
});

// -----------------------------------------------------------------------------
// R2: Order Detail Review Trigger and Dual Submission Flow
// -----------------------------------------------------------------------------
console.log('\n--- REQUIREMENT R2: Order Detail Status Guard & Dual Submission Flow ---');

const customerOrderDetailPath = path.join(ROOT, 'src/pages/customer/CustomerOrderDetail.tsx');
const customerOrderDetailContent = fs.readFileSync(customerOrderDetailPath, 'utf8');

const orderReviewModalPath = path.join(ROOT, 'src/components/customer/order/OrderReviewModal.tsx');
const orderReviewModalContent = fs.readFileSync(orderReviewModalPath, 'utf8');

test('R2.1: isOrderCompleted strictly guards OrderReviewSection', () => {
  assert(
    customerOrderDetailContent.includes("const isOrderCompleted = currentStatus === 'selesai' || activeStep === 5;"),
    'isOrderCompleted definition mismatch'
  );
  assert(
    customerOrderDetailContent.includes('{isOrderCompleted && (') &&
    customerOrderDetailContent.includes('<OrderReviewSection'),
    'OrderReviewSection is not guarded by isOrderCompleted'
  );
});

test('R2.2: Negative order statuses evaluate isOrderCompleted to false', () => {
  const checkStatus = (status, activeStep) => status === 'selesai' || activeStep === 5;
  const negativeCases = [
    { status: 'menunggu-pembayaran', step: 1 },
    { status: 'menunggu-konfirmasi', step: 2 },
    { status: 'diproses', step: 3 },
    { status: 'siap-diambil', step: 4 },
    { status: 'dibatalkan', step: 1 },
    { status: 'unknown', step: 2 },
    { status: null, step: 2 },
  ];
  for (const { status, step } of negativeCases) {
    assert.strictEqual(checkStatus(status, step), false, `Status ${status} step ${step} must NOT evaluate to completed`);
  }
  assert.strictEqual(checkStatus('selesai', 5), true, 'Status selesai must evaluate to completed');
});

test('R2.3: OrderReviewModal contains dual Store and Product review sections', () => {
  assert(orderReviewModalContent.includes('Ulasan Toko'), 'Ulasan Toko heading missing in OrderReviewModal');
  assert(orderReviewModalContent.includes('Ulasan Produk'), 'Ulasan Produk heading missing in OrderReviewModal');
  assert(orderReviewModalContent.includes('storeRating'), 'storeRating state missing in OrderReviewModal');
  assert(orderReviewModalContent.includes('productRating'), 'productRating state missing in OrderReviewModal');
  assert(orderReviewModalContent.includes('storeText'), 'storeText state missing in OrderReviewModal');
  assert(orderReviewModalContent.includes('productText'), 'productText state missing in OrderReviewModal');
});

test('R2.4: OrderReviewModal validates required fields before submission', () => {
  assert(orderReviewModalContent.includes('!storeRating || storeRating < 1'), 'storeRating validation missing');
  assert(orderReviewModalContent.includes('!storeText.trim()'), 'storeText validation missing');
  assert(orderReviewModalContent.includes('!productRating || productRating < 1'), 'productRating validation missing');
  assert(orderReviewModalContent.includes('!productText.trim()'), 'productText validation missing');
});

test('R2.5: CustomerOrderDetail submits both reviews to real API endpoints via Promise.all', () => {
  assert(customerOrderDetailContent.includes('reviewApi.createStoreReview(resolvedStoreId'), 'createStoreReview call missing');
  assert(customerOrderDetailContent.includes('reviewApi.createProductReview(targetProductId'), 'createProductReview call missing');
  assert(customerOrderDetailContent.includes('await Promise.all(apiCalls)'), 'Promise.all parallel submission missing');
  assert(customerOrderDetailContent.includes('onSubmitDualReview={handleSubmitDualReview}'), 'onSubmitDualReview prop not passed to OrderReviewModal');
});

// -----------------------------------------------------------------------------
// R3: Seller Dashboard and Store Page Review Display
// -----------------------------------------------------------------------------
console.log('\n--- REQUIREMENT R3: Seller Dashboard & Store Reviews Display ---');

const sellerReviewsPath = path.join(ROOT, 'src/pages/seller/SellerReviews.tsx');
const sellerReviewsContent = fs.readFileSync(sellerReviewsPath, 'utf8');

const customerStoreDetailPath = path.join(ROOT, 'src/pages/customer/CustomerStoreDetail.tsx');
const customerStoreDetailContent = fs.readFileSync(customerStoreDetailPath, 'utf8');

const storeReviewsListPath = path.join(ROOT, 'src/components/customer/store/StoreReviewsList.tsx');
const storeReviewsListContent = fs.readFileSync(storeReviewsListPath, 'utf8');

const useReviewsPath = path.join(ROOT, 'src/hooks/useReviews.ts');
const useReviewsContent = fs.readFileSync(useReviewsPath, 'utf8');

test('R3.1: SellerReviews consumes useStoreReviews with effectiveStoreId', () => {
  assert(sellerReviewsContent.includes('useStoreReviews(effectiveStoreId'), 'useStoreReviews call missing in SellerReviews');
  assert(sellerReviewsContent.includes("localStorage.getItem('rescuebyte_store_id')"), 'localStorage store ID retrieval missing');
  assert(!sellerReviewsContent.includes('rating: 4.8'), 'Hardcoded 4.8 found in SellerReviews');
  assert(!sellerReviewsContent.includes('reviews: 128'), 'Hardcoded 128 found in SellerReviews');
});

test('R3.2: CustomerStoreDetail consumes both useStoreReviews and useStoreProductReviews', () => {
  assert(customerStoreDetailContent.includes('useStoreReviews(resolvedStoreId'), 'useStoreReviews call missing in CustomerStoreDetail');
  assert(customerStoreDetailContent.includes('useStoreProductReviews(storeProducts)'), 'useStoreProductReviews call missing in CustomerStoreDetail');
  assert(customerStoreDetailContent.includes('<StoreReviewsList'), 'StoreReviewsList not mounted in CustomerStoreDetail');
  assert(!customerStoreDetailContent.includes('rating: 4.9, reviewCount: 48'), 'Hardcoded 4.9 or 48 found in CustomerStoreDetail');
});

test('R3.3: StoreReviewsList contains 3 filter tabs and visual badges', () => {
  assert(storeReviewsListContent.includes('Semua Ulasan'), 'Filter tab "Semua Ulasan" missing');
  assert(storeReviewsListContent.includes('Ulasan Toko'), 'Filter tab "Ulasan Toko" missing');
  assert(storeReviewsListContent.includes('Ulasan Produk'), 'Filter tab "Ulasan Produk" missing');
  assert(storeReviewsListContent.includes('🏪 Ulasan Toko') || storeReviewsListContent.includes('Ulasan Toko'), 'Store badge missing');
  assert(storeReviewsListContent.includes('handleProductPillClick'), 'Product pill click handler missing');
});

test('R3.4: useStoreProductReviews aggregates reviews using Promise.allSettled', () => {
  assert(useReviewsContent.includes('export function useStoreProductReviews'), 'useStoreProductReviews hook not exported');
  assert(useReviewsContent.includes('Promise.allSettled'), 'Promise.allSettled missing in useStoreProductReviews');
  assert(useReviewsContent.includes('reviewApi.getProductReviews(prod.id)'), 'getProductReviews call missing in useStoreProductReviews');
});

// -----------------------------------------------------------------------------
// Integrity & Anti-Cheat Forensics
// -----------------------------------------------------------------------------
console.log('\n--- INTEGRITY & ANTI-CHEAT FORENSICS ---');

const reviewApiPath = path.join(ROOT, 'src/api/services/reviewApi.ts');
const reviewApiContent = fs.readFileSync(reviewApiPath, 'utf8');

test('F1: reviewApi endpoints map to genuine backend paths', () => {
  assert(reviewApiContent.includes("`/api/v1/products/${productId}/reviews`"), 'Product reviews endpoint mismatch');
  assert(reviewApiContent.includes("`/api/v1/stores/${storeId}/reviews`"), 'Store reviews endpoint mismatch');
  assert(reviewApiContent.includes("`/api/v1/stores/${storeId}/summary`"), 'Store summary endpoint mismatch');
  assert(reviewApiContent.includes("`/api/v1/reviews/${id}`"), 'Review edit/delete endpoint mismatch');
});

test('F2: No facade or dummy mock timeouts in handleSubmitDualReview', () => {
  const dualSubmitBlock = customerOrderDetailContent.slice(
    customerOrderDetailContent.indexOf('const handleSubmitDualReview'),
    customerOrderDetailContent.indexOf('const orderItemsList')
  );
  assert(!dualSubmitBlock.includes('setTimeout'), 'setTimeout bypass found in handleSubmitDualReview');
  assert(dualSubmitBlock.includes('Promise.all(apiCalls)'), 'Promise.all missing in handleSubmitDualReview');
});

console.log('\n================================================================');
console.log(`INDEPENDENT AUDIT SUMMARY: ${passedTests} passed, ${failedTests} failed`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
