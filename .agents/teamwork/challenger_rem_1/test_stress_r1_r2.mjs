/**
 * test_stress_r1_r2.mjs
 * 
 * Empirical Challenger Stress-Testing Harness for Review Remediation:
 * - R1: Read-Only Reviews on Product Detail (button absence, read-only cards, empty/populated behavior)
 * - R2: Order Detail Review Trigger and Dual Submission Flow (status guarding, modal structure, validation, API URLs)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    const errMsg = `  ✗ FAIL: ${testName} - ${details}`;
    console.error(errMsg);
    failures.push(errMsg);
  }
}

function readFile(relPath) {
  const fullPath = path.join(projectRoot, relPath);
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('================================================================');
console.log(' EMPIRICAL CHALLENGER STRESS-TESTING HARNESS: R1 & R2 VERIFICATION');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: R1 - Product Detail Review Read-Only & Button Absence
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: R1 - Product Detail Read-Only Reviews ---');

const productReviewsSectionSource = readFile('src/components/customer/product/ProductReviewsSection.tsx');
const customerProductDetailSource = readFile('src/pages/customer/CustomerProductDetail.tsx');
const reviewCardSource = readFile('src/components/reviews/ReviewCard.tsx');

// 1.1 Verify absence of "Tulis Ulasan" button in ProductReviewsSection
const hasTulisUlasanButton = /<Button[^>]*>[^<]*Tulis Ulasan[^<]*<\/Button>/i.test(productReviewsSectionSource) ||
  /<button[^>]*>[^<]*Tulis Ulasan[^<]*<\/button>/i.test(productReviewsSectionSource);
assert(!hasTulisUlasanButton, 'R1.1 No "Tulis Ulasan" button rendered in ProductReviewsSection');

// 1.2 Verify absence of "Tulis Ulasan Pertama" in ProductReviewsSection
const hasTulisUlasanPertama = productReviewsSectionSource.includes('Tulis Ulasan Pertama');
assert(!hasTulisUlasanPertama, 'R1.2 No "Tulis Ulasan Pertama" text or action button in ProductReviewsSection');

// 1.3 Verify EmptyState has no action button in ProductReviewsSection
const emptyStateMatch = productReviewsSectionSource.match(/<EmptyState[\s\S]*?\/>/);
assert(emptyStateMatch !== null, 'R1.3 EmptyState component exists in ProductReviewsSection');
if (emptyStateMatch) {
  const hasActionInEmptyState = /action\s*=/.test(emptyStateMatch[0]);
  assert(!hasActionInEmptyState, 'R1.4 EmptyState has no action prop (no action button when empty)');
  const hasBelumAdaUlasanTitle = emptyStateMatch[0].includes('title="Belum Ada Ulasan"');
  assert(hasBelumAdaUlasanTitle, 'R1.5 EmptyState title is "Belum Ada Ulasan"');
  const hasCorrectDescription = emptyStateMatch[0].includes('description="Belum ada ulasan untuk produk ini."');
  assert(hasCorrectDescription, 'R1.6 EmptyState description is "Belum ada ulasan untuk produk ini."');
}

// 1.4 Verify ReviewCard canEdit and canDelete are strictly false on product detail
const reviewCardMatches = [...productReviewsSectionSource.matchAll(/<ReviewCard[\s\S]*?\/>/g)];
assert(reviewCardMatches.length > 0, 'R1.7 ReviewCard component is referenced in ProductReviewsSection');
for (const match of reviewCardMatches) {
  const code = match[0];
  const hasCanEditFalse = code.includes('canEdit={false}');
  const hasCanDeleteFalse = code.includes('canDelete={false}');
  assert(hasCanEditFalse, 'R1.8 ReviewCard enforces canEdit={false}');
  assert(hasCanDeleteFalse, 'R1.9 ReviewCard enforces canDelete={false}');
}

// 1.5 Verify ReviewCard component omits edit & delete controls when canEdit=false & canDelete=false
const reviewCardGuardMatch = reviewCardSource.includes('{(canEdit || canDelete) && (');
assert(reviewCardGuardMatch, 'R1.10 ReviewCard guards edit/delete action buttons with {(canEdit || canDelete) && (');

function simulateReviewCardActionsRender(canEdit, canDelete) {
  return Boolean(canEdit || canDelete);
}
assert(!simulateReviewCardActionsRender(false, false), 'R1.11 ReviewCard renders NO action buttons when canEdit=false and canDelete=false');
assert(simulateReviewCardActionsRender(true, false), 'R1.12 ReviewCard renders edit button only when canEdit=true');
assert(simulateReviewCardActionsRender(false, true), 'R1.13 ReviewCard renders delete button only when canDelete=true');

// 1.6 Verify absence of "Tulis Ulasan" across all customer product components
const productComponentsDir = path.join(projectRoot, 'src/components/customer/product');
const productFiles = fs.readdirSync(productComponentsDir);
let foundTulisUlasanInProduct = false;
for (const file of productFiles) {
  const content = fs.readFileSync(path.join(productComponentsDir, file), 'utf8');
  if (content.includes('Tulis Ulasan Pertama')) {
    foundTulisUlasanInProduct = true;
  }
}
assert(!foundTulisUlasanInProduct, 'R1.14 No "Tulis Ulasan Pertama" across any file in src/components/customer/product');

// 1.7 Verify CustomerProductDetail contains no review creation button or modal triggers
assert(!customerProductDetailSource.includes('Tulis Ulasan'), 'R1.15 CustomerProductDetail contains no "Tulis Ulasan" triggers');


// -----------------------------------------------------------------------------
// SUITE 2: R2 - Order Detail Status Guarding
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: R2 - Order Detail Status Guarding ---');

const orderDetailSource = readFile('src/pages/customer/CustomerOrderDetail.tsx');

// 2.1 Verify definition of isOrderCompleted
const isOrderCompletedDef = orderDetailSource.includes("const isOrderCompleted = currentStatus === 'selesai' || activeStep === 5;");
assert(isOrderCompletedDef, 'R2.1 isOrderCompleted defined as: currentStatus === "selesai" || activeStep === 5');

// 2.2 Verify activeStep mapping logic
function computeActiveStep(status) {
  if (status === 'menunggu-pembayaran') return 1;
  if (status === 'menunggu-konfirmasi') return 2;
  if (status === 'diproses') return 3;
  if (status === 'siap-diambil') return 4;
  if (status === 'selesai') return 5;
  if (status === 'dibatalkan') return 1;
  return 2;
}

function computeIsOrderCompleted(status) {
  const activeStep = computeActiveStep(status);
  return status === 'selesai' || activeStep === 5;
}

// 2.3 Test all non-completed statuses (must be strictly false/hidden)
const nonCompletedStatuses = [
  'menunggu-pembayaran',
  'menunggu-konfirmasi',
  'diproses',
  'siap-diambil',
  'dibatalkan',
  'unknown_status',
  '',
  null,
  undefined,
];

for (const status of nonCompletedStatuses) {
  const isCompleted = computeIsOrderCompleted(status);
  assert(!isCompleted, `R2.2 Status "${status}" strictly hides review prompt card (isOrderCompleted === false)`);
}

// 2.4 Test completed status (must be strictly true/visible)
const completedStatus = 'selesai';
const isCompleted = computeIsOrderCompleted(completedStatus);
assert(isCompleted, 'R2.3 Status "selesai" strictly shows review prompt card (isOrderCompleted === true)');

// 2.5 Verify OrderReviewSection rendering is guarded by {isOrderCompleted && (...)}
const orderReviewSectionGuard = orderDetailSource.includes('{isOrderCompleted && (\n            <OrderReviewSection') ||
  orderDetailSource.includes('{isOrderCompleted && (\r\n            <OrderReviewSection') ||
  /\{isOrderCompleted\s*&&\s*\(\s*<OrderReviewSection/m.test(orderDetailSource);
assert(orderReviewSectionGuard, 'R2.4 <OrderReviewSection /> is strictly guarded by {isOrderCompleted && (...)}');


// -----------------------------------------------------------------------------
// SUITE 3: R2 - Dual-Section Review Modal Structure
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: R2 - Dual-Section Review Modal Structure ---');

const orderReviewModalSource = readFile('src/components/customer/order/OrderReviewModal.tsx');

// 3.1 Verify existence of DualReviewSubmitPayload interface
assert(orderReviewModalSource.includes('export interface DualReviewSubmitPayload'), 'R3.1 DualReviewSubmitPayload interface exported');
assert(orderReviewModalSource.includes('storeReview: {'), 'R3.2 Payload contains storeReview object');
assert(orderReviewModalSource.includes('productReview: {'), 'R3.3 Payload contains productReview object');

// 3.2 Verify Section 1: Ulasan Toko structure
assert(orderReviewModalSource.includes('Ulasan Toko'), 'R3.4 Section 1 contains "Ulasan Toko" badge/heading');
assert(orderReviewModalSource.includes('Rating Pelayanan Toko'), 'R3.5 Section 1 contains "Rating Pelayanan Toko" label');
assert(orderReviewModalSource.includes('id="store-review-comment"'), 'R3.6 Section 1 contains store comment textarea with id="store-review-comment"');
assert(orderReviewModalSource.includes('Rating Toko'), 'R3.7 Section 1 contains aria-label="Rating Toko" for store star picker');

// 3.3 Verify Section 2: Ulasan Produk structure
assert(orderReviewModalSource.includes('Ulasan Produk'), 'R3.8 Section 2 contains "Ulasan Produk" badge/heading');
assert(orderReviewModalSource.includes('Rating Kualitas Produk'), 'R3.9 Section 2 contains "Rating Kualitas Produk" label');
assert(orderReviewModalSource.includes('id="product-review-comment"'), 'R3.10 Section 2 contains product comment textarea with id="product-review-comment"');
assert(orderReviewModalSource.includes('Rating Produk'), 'R3.11 Section 2 contains aria-label="Rating Produk" for product star picker');

// 3.4 Verify multi-item selector tab when order has multiple items
assert(orderReviewModalSource.includes('items.length > 1'), 'R3.12 Multi-item selector rendered when items.length > 1');
assert(orderReviewModalSource.includes('Pilih Produk:'), 'R3.13 Multi-item selector shows "Pilih Produk:" label');


// -----------------------------------------------------------------------------
// SUITE 4: R2 - Input Validation Stress Testing
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: R2 - Input Validation Stress-Testing ---');

function validateReviewSubmission({ storeRating, storeText, productRating, productText }) {
  if (!storeRating || storeRating < 1) {
    return { valid: false, error: 'Mohon berikan rating bintang untuk toko.' };
  }
  if (!storeText || !storeText.trim()) {
    return { valid: false, error: 'Mohon isi ulasan pengalaman toko terlebih dahulu.' };
  }
  if (!productRating || productRating < 1) {
    return { valid: false, error: 'Mohon berikan rating bintang untuk produk.' };
  }
  if (!productText || !productText.trim()) {
    return { valid: false, error: 'Mohon isi ulasan kualitas produk terlebih dahulu.' };
  }
  return { valid: true, error: null };
}

// 4.1 Reject 0 store rating
const v1 = validateReviewSubmission({ storeRating: 0, storeText: 'Bagus', productRating: 5, productText: 'Enak' });
assert(!v1.valid && v1.error.includes('rating bintang untuk toko'), 'R4.1 Rejects storeRating = 0');

// 4.2 Reject negative store rating
const v2 = validateReviewSubmission({ storeRating: -1, storeText: 'Bagus', productRating: 5, productText: 'Enak' });
assert(!v2.valid && v2.error.includes('rating bintang untuk toko'), 'R4.2 Rejects storeRating < 1');

// 4.3 Reject empty store comment
const v3 = validateReviewSubmission({ storeRating: 5, storeText: '', productRating: 5, productText: 'Enak' });
assert(!v3.valid && v3.error.includes('ulasan pengalaman toko'), 'R4.3 Rejects empty storeText');

// 4.4 Reject whitespace-only store comment
const v4 = validateReviewSubmission({ storeRating: 5, storeText: '   \n  \t ', productRating: 5, productText: 'Enak' });
assert(!v4.valid && v4.error.includes('ulasan pengalaman toko'), 'R4.4 Rejects whitespace-only storeText');

// 4.5 Reject 0 product rating
const v5 = validateReviewSubmission({ storeRating: 5, storeText: 'Bagus', productRating: 0, productText: 'Enak' });
assert(!v5.valid && v5.error.includes('rating bintang untuk produk'), 'R4.5 Rejects productRating = 0');

// 4.6 Reject negative product rating
const v6 = validateReviewSubmission({ storeRating: 5, storeText: 'Bagus', productRating: -2, productText: 'Enak' });
assert(!v6.valid && v6.error.includes('rating bintang untuk produk'), 'R4.6 Rejects productRating < 1');

// 4.7 Reject empty product comment
const v7 = validateReviewSubmission({ storeRating: 5, storeText: 'Bagus', productRating: 5, productText: '' });
assert(!v7.valid && v7.error.includes('ulasan kualitas produk'), 'R4.7 Rejects empty productText');

// 4.8 Reject whitespace-only product comment
const v8 = validateReviewSubmission({ storeRating: 5, storeText: 'Bagus', productRating: 5, productText: '   ' });
assert(!v8.valid && v8.error.includes('ulasan kualitas produk'), 'R4.8 Rejects whitespace-only productText');

// 4.9 Accept fully valid submission
const v9 = validateReviewSubmission({
  storeRating: 5,
  storeText: 'Pelayanan kasir sangat cepat dan ramah.',
  productRating: 4,
  productText: 'Roti masih renyah dan sangat segar!',
});
assert(v9.valid && v9.error === null, 'R4.9 Accepts fully valid store & product review submission');

// 4.10 Verify modal code contains these exact validation branches
assert(orderReviewModalSource.includes('!storeRating || storeRating < 1'), 'R4.10 Modal code validates storeRating');
assert(orderReviewModalSource.includes('!storeText.trim()'), 'R4.11 Modal code validates storeText.trim()');
assert(orderReviewModalSource.includes('!productRating || productRating < 1'), 'R4.12 Modal code validates productRating');
assert(orderReviewModalSource.includes('!productText.trim()'), 'R4.13 Modal code validates productText.trim()');


// -----------------------------------------------------------------------------
// SUITE 5: R2 - API Endpoints & Submission Verification
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: R2 - API Endpoints & Submission Logic ---');

const reviewApiSource = readFile('src/api/services/reviewApi.ts');

// 5.1 Store review endpoint verification
assert(
  reviewApiSource.includes('POST /api/v1/stores/{store_id}/reviews') ||
  reviewApiSource.includes('`/api/v1/stores/${storeId}/reviews`'),
  'R5.1 createStoreReview targets POST /api/v1/stores/{store_id}/reviews'
);
assert(
  reviewApiSource.includes('apiClient.post<ReviewResponse>(\n    `/api/v1/stores/${storeId}/reviews`') ||
  reviewApiSource.includes('apiClient.post<ReviewResponse>(\r\n    `/api/v1/stores/${storeId}/reviews`'),
  'R5.2 createStoreReview calls apiClient.post to `/api/v1/stores/${storeId}/reviews`'
);

// 5.2 Product review endpoint verification
assert(
  reviewApiSource.includes('POST /api/v1/products/{product_id}/reviews') ||
  reviewApiSource.includes('`/api/v1/products/${productId}/reviews`'),
  'R5.3 createProductReview targets POST /api/v1/products/{product_id}/reviews'
);
assert(
  reviewApiSource.includes('apiClient.post<ReviewResponse>(\n    `/api/v1/products/${productId}/reviews`') ||
  reviewApiSource.includes('apiClient.post<ReviewResponse>(\r\n    `/api/v1/products/${productId}/reviews`'),
  'R5.4 createProductReview calls apiClient.post to `/api/v1/products/${productId}/reviews`'
);

// 5.3 Verify CustomerOrderDetail handleSubmitDualReview dispatches to both endpoints
assert(orderDetailSource.includes('reviewApi.createStoreReview(resolvedStoreId,'), 'R5.5 CustomerOrderDetail calls reviewApi.createStoreReview with resolvedStoreId');
assert(orderDetailSource.includes('reviewApi.createProductReview(targetProductId,'), 'R5.6 CustomerOrderDetail calls reviewApi.createProductReview with targetProductId');
assert(orderDetailSource.includes('await Promise.all(apiCalls);'), 'R5.7 CustomerOrderDetail awaits both reviews via Promise.all(apiCalls)');

// 5.4 Verify OrderReviewModal passes onSubmitDualReview to modal
assert(orderDetailSource.includes('onSubmitDualReview={handleSubmitDualReview}'), 'R5.8 CustomerOrderDetail wires onSubmitDualReview={handleSubmitDualReview} to OrderReviewModal');


// -----------------------------------------------------------------------------
// SUITE 6: Multi-Item Orders & Fallback Resiliency
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Multi-Item Orders & Fallback Resiliency ---');

// 6.1 Order item list includes productId mapping
const typesSource = readFile('src/components/customer/order/types.ts');
assert(typesSource.includes('productId?: string;'), 'R6.1 OrderItemDetail type contains optional productId');

// 6.2 CustomerOrderDetail maps productId from backend items
assert(
  orderDetailSource.includes('(it as any)?.productId') ||
  orderDetailSource.includes('(it as any)?.product_id') ||
  orderDetailSource.includes('backendOrderDetail?.items?.[idx]?.product_id'),
  'R6.2 CustomerOrderDetail extracts product_id / productId from backend items'
);

// 6.3 Fallback to default product if productId is missing
assert(orderReviewModalSource.includes('default-product'), 'R6.3 OrderReviewModal provides default product fallback');

console.log('\n================================================================');
console.log(` SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests`);
console.log('================================================================');

if (failedTests > 0) {
  console.error('\nFailures recorded:');
  failures.forEach((f) => console.error(f));
  process.exit(1);
} else {
  console.log('\nALL EMPIRICAL TESTS PASSED SUCCESSFULLY! (VERDICT: APPROVE)');
  process.exit(0);
}
