import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const BASE_URL = 'https://dolpin-fourthree.bccdev.id';
const VALID_PRODUCT_ID = '01a18db1-3ef4-7844-9da6-4a4612d30834';
const VALID_STORE_ID = '01a18db0-c24a-736f-8087-3ec00263311a';
const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000';
const INVALID_UUID = 'not-a-valid-uuid';

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failCount++;
  }
}

async function runIndependentAudit() {
  console.log('====================================================');
  console.log('   INDEPENDENT VICTORY AUDITOR EMPIRICAL SUITE      ');
  console.log('====================================================\n');

  // ------------------------------------------------------------------------
  // PART 1: LIVE BACKEND API AUDIT (All 6 endpoints + summary)
  // ------------------------------------------------------------------------
  console.log('--- PART 1: LIVE BACKEND API ENDPOINTS PROBE ---');

  // 1. GET /api/v1/products/{product_id}/reviews (Valid UUID)
  try {
    const res1 = await fetch(`${BASE_URL}/api/v1/products/${VALID_PRODUCT_ID}/reviews`);
    assert(res1.status === 200, 'Endpoint 1: GET /api/v1/products/{id}/reviews returns 200 OK');
    const data1 = await res1.json();
    assert(Array.isArray(data1.payload?.reviews), 'Endpoint 1 payload contains reviews array');
    assert(typeof data1.payload?.meta?.total_data === 'number', 'Endpoint 1 payload contains meta.total_data');
  } catch (err) {
    assert(false, 'Endpoint 1: GET /api/v1/products/{id}/reviews', err.message);
  }

  // 1b. GET with pagination params
  try {
    const res1b = await fetch(`${BASE_URL}/api/v1/products/${VALID_PRODUCT_ID}/reviews?page=2&limit=5`);
    assert(res1b.status === 200, 'Endpoint 1b: GET with query params ?page=2&limit=5 returns 200');
    const data1b = await res1b.json();
    assert(data1b.payload?.meta?.page === 2, 'Endpoint 1b reflects page=2 in meta');
    assert(data1b.payload?.meta?.limit === 5, 'Endpoint 1b reflects limit=5 in meta');
  } catch (err) {
    assert(false, 'Endpoint 1b: GET with pagination params', err.message);
  }

  // 1c. Invalid UUID returns 400
  try {
    const res1c = await fetch(`${BASE_URL}/api/v1/products/${INVALID_UUID}/reviews`);
    assert(res1c.status === 400, 'Endpoint 1c: GET with invalid UUID returns 400 Bad Request');
  } catch (err) {
    assert(false, 'Endpoint 1c: GET with invalid UUID', err.message);
  }

  // 1d. Non-existent UUID returns 404
  try {
    const res1d = await fetch(`${BASE_URL}/api/v1/products/${NON_EXISTENT_UUID}/reviews`);
    assert(res1d.status === 404, 'Endpoint 1d: GET with non-existent UUID returns 404 Not Found');
  } catch (err) {
    assert(false, 'Endpoint 1d: GET with non-existent UUID', err.message);
  }

  // 2. POST /api/v1/products/{product_id}/reviews (Unauthenticated guard check)
  try {
    const res2 = await fetch(`${BASE_URL}/api/v1/products/${VALID_PRODUCT_ID}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, content: 'Independent audit test review' }),
    });
    assert(res2.status === 401, 'Endpoint 2: POST /api/v1/products/{id}/reviews enforces Bearer authentication (401)');
    const data2 = await res2.json();
    assert(data2.payload?.error?.error_code === 'no_bearer_token', 'Endpoint 2 error_code is "no_bearer_token"');
  } catch (err) {
    assert(false, 'Endpoint 2: POST /api/v1/products/{id}/reviews', err.message);
  }

  // 3. GET /api/v1/stores/{store_id}/reviews (Valid UUID)
  try {
    const res3 = await fetch(`${BASE_URL}/api/v1/stores/${VALID_STORE_ID}/reviews`);
    assert(res3.status === 200, 'Endpoint 3: GET /api/v1/stores/{id}/reviews returns 200 OK');
    const data3 = await res3.json();
    assert(Array.isArray(data3.payload?.reviews), 'Endpoint 3 payload contains reviews array');
    assert(typeof data3.payload?.meta?.total_data === 'number', 'Endpoint 3 payload contains meta.total_data');
  } catch (err) {
    assert(false, 'Endpoint 3: GET /api/v1/stores/{id}/reviews', err.message);
  }

  // 4. POST /api/v1/stores/{store_id}/reviews (Unauthenticated guard check)
  try {
    const res4 = await fetch(`${BASE_URL}/api/v1/stores/${VALID_STORE_ID}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, content: 'Store review test' }),
    });
    assert(res4.status === 401, 'Endpoint 4: POST /api/v1/stores/{id}/reviews enforces Bearer authentication (401)');
    const data4 = await res4.json();
    assert(data4.payload?.error?.error_code === 'no_bearer_token', 'Endpoint 4 error_code is "no_bearer_token"');
  } catch (err) {
    assert(false, 'Endpoint 4: POST /api/v1/stores/{id}/reviews', err.message);
  }

  // 5. PATCH /api/v1/reviews/{id} (Unauthenticated guard check)
  try {
    const res5 = await fetch(`${BASE_URL}/api/v1/reviews/${NON_EXISTENT_UUID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4, content: 'Updated content test' }),
    });
    assert(res5.status === 401, 'Endpoint 5: PATCH /api/v1/reviews/{id} enforces Bearer authentication (401)');
    const data5 = await res5.json();
    assert(data5.payload?.error?.error_code === 'no_bearer_token', 'Endpoint 5 error_code is "no_bearer_token"');
  } catch (err) {
    assert(false, 'Endpoint 5: PATCH /api/v1/reviews/{id}', err.message);
  }

  // 6. DELETE /api/v1/reviews/{id} (Unauthenticated guard check)
  try {
    const res6 = await fetch(`${BASE_URL}/api/v1/reviews/${NON_EXISTENT_UUID}`, {
      method: 'DELETE',
    });
    assert(res6.status === 401, 'Endpoint 6: DELETE /api/v1/reviews/{id} enforces Bearer authentication (401)');
    const data6 = await res6.json();
    assert(data6.payload?.error?.error_code === 'no_bearer_token', 'Endpoint 6 error_code is "no_bearer_token"');
  } catch (err) {
    assert(false, 'Endpoint 6: DELETE /api/v1/reviews/{id}', err.message);
  }

  // Auxiliary: GET /api/v1/stores/{store_id}/summary
  try {
    const resSum = await fetch(`${BASE_URL}/api/v1/stores/${VALID_STORE_ID}/summary`);
    assert(resSum.status === 200, 'Auxiliary Endpoint: GET /api/v1/stores/{id}/summary returns 200 OK');
    const dataSum = await resSum.json();
    assert(typeof dataSum.payload?.average_rating === 'number', 'Summary contains numeric average_rating');
    assert(typeof dataSum.payload?.total_reviews === 'number', 'Summary contains numeric total_reviews');
  } catch (err) {
    assert(false, 'Auxiliary Endpoint: GET /api/v1/stores/{id}/summary', err.message);
  }

  // ------------------------------------------------------------------------
  // PART 2: CALCULATION ENGINE & HOOK LOGIC INDEPENDENT TESTING
  // ------------------------------------------------------------------------
  console.log('\n--- PART 2: CALCULATION & MATH ENGINE INTEGRITY ---');

  const viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const useReviewsModule = await viteServer.ssrLoadModule('./src/hooks/useReviews.ts');
  const { calculateAverageRating, calculateRatingDistribution } = useReviewsModule;

  // Test 2.1: Empty review array
  const emptyAvg = calculateAverageRating([]);
  assert(emptyAvg === 0, 'calculateAverageRating([]) returns 0 without NaN');

  const emptyDist = calculateRatingDistribution([]);
  assert(
    JSON.stringify(emptyDist) === JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    'calculateRatingDistribution([]) returns clean zeroed star mapping'
  );

  // Test 2.2: Null / undefined reviews
  const nullAvg = calculateAverageRating(null);
  assert(nullAvg === 0, 'calculateAverageRating(null) returns 0 safely');

  const undefDist = calculateRatingDistribution(undefined);
  assert(
    JSON.stringify(undefDist) === JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    'calculateRatingDistribution(undefined) returns clean zeroed star mapping'
  );

  // Test 2.3: Accurate Average calculation
  const testReviews = [
    { id: '1', rating: 5, content: 'Great', created_at: '2026-11-01' },
    { id: '2', rating: 4, content: 'Good', created_at: '2026-11-02' },
    { id: '3', rating: 5, content: 'Awesome', created_at: '2026-11-03' },
  ];
  const testAvg = calculateAverageRating(testReviews);
  assert(testAvg === 4.7, `calculateAverageRating rounds 14/3 to 4.7 correctly (got: ${testAvg})`);

  // Test 2.4: Rating distribution calculation
  const testDist = calculateRatingDistribution(testReviews);
  assert(
    testDist[5] === 2 && testDist[4] === 1 && testDist[3] === 0 && testDist[2] === 0 && testDist[1] === 0,
    'calculateRatingDistribution counts 5-star and 4-star items accurately'
  );

  // Test 2.5: Boundary, negative, excessive, and NaN ratings stress-test
  const boundaryReviews = [
    { id: 'b1', rating: 0, content: 'Zero rating' },
    { id: 'b2', rating: 6, content: 'Over rating' },
    { id: 'b3', rating: -3, content: 'Negative rating' },
    { id: 'b4', rating: NaN, content: 'NaN rating' },
    { id: 'b5', rating: 'invalid', content: 'String rating' },
  ];
  const boundaryDist = calculateRatingDistribution(boundaryReviews);
  assert(
    boundaryDist[1] === 2 && boundaryDist[5] === 1,
    'calculateRatingDistribution clamps out-of-range ratings (0,-3 -> 1; 6 -> 5) and ignores NaN/invalid'
  );

  // Test 2.6: Performance stress test (10,000 synthetic reviews)
  const syntheticReviews = Array.from({ length: 10000 }, (_, i) => ({
    id: `syn-${i}`,
    rating: (i % 5) + 1,
    content: `Review ${i}`,
    created_at: new Date().toISOString(),
  }));
  const startPerf = performance.now();
  const perfAvg = calculateAverageRating(syntheticReviews);
  const perfDist = calculateRatingDistribution(syntheticReviews);
  const duration = performance.now() - startPerf;

  assert(perfAvg === 3.0, `Synthetic 10k reviews average is precisely 3.0 (got: ${perfAvg})`);
  assert(
    perfDist[1] === 2000 && perfDist[2] === 2000 && perfDist[3] === 2000 && perfDist[4] === 2000 && perfDist[5] === 2000,
    'Synthetic 10k reviews distribution has exactly 2,000 for each star rating'
  );
  assert(duration < 50, `10k calculation execution completes in <50ms (took ${duration.toFixed(2)}ms)`);

  await viteServer.close();

  // ------------------------------------------------------------------------
  // PART 3: DOM IDENTIFIERS, ROUTING & ACCESSIBILITY AUDIT
  // ------------------------------------------------------------------------
  console.log('\n--- PART 3: DOM IDENTIFIERS & ROUTING AUDIT ---');

  const rootDir = process.cwd();

  // Check StoreReviewsList has id="ulasan-pelanggan"
  const storeReviewsPath = path.join(rootDir, 'src/components/customer/store/StoreReviewsList.tsx');
  const storeReviewsContent = fs.readFileSync(storeReviewsPath, 'utf8');
  assert(
    storeReviewsContent.includes('id="ulasan-pelanggan"'),
    'StoreReviewsList.tsx defines stable id="ulasan-pelanggan"'
  );
  assert(
    storeReviewsContent.includes('scroll-mt-28'),
    'StoreReviewsList.tsx defines scroll-mt-28 header clearance'
  );

  // Check CustomerProductDetail has rating click navigation with ulasan-pelanggan
  const productDetailPath = path.join(rootDir, 'src/pages/customer/CustomerProductDetail.tsx');
  const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');
  assert(
    productDetailContent.includes('ulasan-pelanggan'),
    'CustomerProductDetail.tsx navigates to ulasan-pelanggan section'
  );
  assert(
    productDetailContent.includes('<ProductReviewsSection'),
    'CustomerProductDetail.tsx renders <ProductReviewsSection />'
  );

  // Check ProductReviewsSection has id="ulasan-produk"
  const productSectionPath = path.join(rootDir, 'src/components/customer/product/ProductReviewsSection.tsx');
  const productSectionContent = fs.readFileSync(productSectionPath, 'utf8');
  assert(
    productSectionContent.includes('id="ulasan-produk"'),
    'ProductReviewsSection.tsx defines id="ulasan-produk"'
  );
  assert(
    productSectionContent.includes('handleOpenCreateModal'),
    'ProductReviewsSection.tsx implements review submission modal trigger'
  );
  assert(
    productSectionContent.includes('handleConfirmDelete'),
    'ProductReviewsSection.tsx implements review deletion with confirmation dialog'
  );

  // Check SellerReviews has Ulasan Pembeli and view-ulasan
  const sellerReviewsPath = path.join(rootDir, 'src/pages/seller/SellerReviews.tsx');
  const sellerReviewsContent = fs.readFileSync(sellerReviewsPath, 'utf8');
  assert(
    sellerReviewsContent.includes('id="view-ulasan"'),
    'SellerReviews.tsx defines id="view-ulasan"'
  );
  assert(
    sellerReviewsContent.includes('Ulasan Pembeli'),
    'SellerReviews.tsx has title "Ulasan Pembeli"'
  );
  assert(
    sellerReviewsContent.includes('ReviewFilterBar'),
    'SellerReviews.tsx includes ReviewFilterBar search and rating filter'
  );
  assert(
    sellerReviewsContent.includes('ReviewPagination'),
    'SellerReviews.tsx includes ReviewPagination'
  );

  // Check Sidebar has Ulasan Pembeli
  const sidebarPath = path.join(rootDir, 'src/components/layout/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  assert(
    sidebarContent.includes('id="nav-ulasan"'),
    'Sidebar.tsx has id="nav-ulasan"'
  );
  assert(
    sidebarContent.includes('Ulasan Pembeli'),
    'Sidebar.tsx has menu item "Ulasan Pembeli"'
  );

  // Check Hash routing
  const hashRoutingPath = path.join(rootDir, 'src/app/hashRouting.ts');
  const hashRoutingContent = fs.readFileSync(hashRoutingPath, 'utf8');
  assert(
    hashRoutingContent.includes('section'),
    'hashRouting.ts parses section query parameter'
  );

  const useHashNavPath = path.join(rootDir, 'src/app/useHashNavigation.ts');
  const useHashNavContent = fs.readFileSync(useHashNavPath, 'utf8');
  assert(
    useHashNavContent.includes('ulasan-seller'),
    'useHashNavigation.ts handles #ulasan-seller hash route'
  );

  // Check CustomerStoreDetail resilient scrolling
  const storeDetailPath = path.join(rootDir, 'src/pages/customer/CustomerStoreDetail.tsx');
  const storeDetailContent = fs.readFileSync(storeDetailPath, 'utf8');
  assert(
    storeDetailContent.includes('scrollToReviews'),
    'CustomerStoreDetail.tsx implements scrollToReviews RAF polling'
  );
  assert(
    storeDetailContent.includes("setActiveTab('ulasan')"),
    'CustomerStoreDetail.tsx activates ulasan tab on scroll'
  );

  // ------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log(` AUDIT TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runIndependentAudit().catch((err) => {
  console.error('Fatal audit execution failure:', err);
  process.exit(1);
});
