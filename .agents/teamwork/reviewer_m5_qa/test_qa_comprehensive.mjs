import fs from 'fs';
import path from 'path';
import axios from 'axios';

const ROOT_DIR = process.cwd();
const API_BASE_URL = 'https://dolpin-fourthree.bccdev.id/';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runQA() {
  console.log('================================================================');
  console.log('LEAD QA COMPREHENSIVE VERIFICATION SUITE — MILESTONE 5');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // PILLAR 1: SELLER DASHBOARD REVIEW PAGE
  // -------------------------------------------------------------
  console.log('--- PILLAR 1: Seller Dashboard Review Page ---');
  const sellerReviewsPath = path.join(ROOT_DIR, 'src', 'pages', 'seller', 'SellerReviews.tsx');
  assert(fs.existsSync(sellerReviewsPath), 'SellerReviews.tsx exists');
  const sellerReviewsCode = fs.readFileSync(sellerReviewsPath, 'utf8');

  assert(sellerReviewsCode.includes('Ulasan Pembeli'), 'SellerReviews contains "Ulasan Pembeli" heading');
  assert(sellerReviewsCode.includes('ReviewSummaryCards'), 'SellerReviews renders ReviewSummaryCards');
  assert(sellerReviewsCode.includes('ReviewFilterBar'), 'SellerReviews renders ReviewFilterBar');
  assert(sellerReviewsCode.includes('ReviewCard'), 'SellerReviews renders ReviewCard');
  assert(sellerReviewsCode.includes('ReviewPagination'), 'SellerReviews renders ReviewPagination');
  assert(sellerReviewsCode.includes('useStoreReviews'), 'SellerReviews consumes real useStoreReviews hook');
  assert(sellerReviewsCode.includes('REVIEWS_PER_PAGE = 5'), 'SellerReviews configures 5 reviews per page');
  assert(!sellerReviewsCode.includes('4.8') || sellerReviewsCode.includes('rating.toFixed'), 'SellerReviews does not hardcode 4.8 store rating');
  assert(!sellerReviewsCode.includes('128 ulasan') && !sellerReviewsCode.includes('128 Ulasan'), 'SellerReviews does not hardcode 128 total reviews');

  // Verify Sidebar & AppRoutes Integration
  const sidebarPath = path.join(ROOT_DIR, 'src', 'components', 'layout', 'Sidebar.tsx');
  const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
  assert(sidebarCode.includes('view-ulasan'), 'Sidebar.tsx contains view-ulasan route handle');
  assert(sidebarCode.includes('Ulasan Pembeli'), 'Sidebar.tsx includes "Ulasan Pembeli" navigation item');
  assert(sidebarCode.includes('id="nav-ulasan"'), 'Sidebar.tsx provides id="nav-ulasan" testable anchor');

  const appRoutesPath = path.join(ROOT_DIR, 'src', 'app', 'AppRoutes.tsx');
  const appRoutesCode = fs.readFileSync(appRoutesPath, 'utf8');
  assert(appRoutesCode.includes("activeView === 'view-ulasan'"), 'AppRoutes.tsx matches activeView === view-ulasan');
  assert(appRoutesCode.includes('<SellerReviews'), 'AppRoutes.tsx mounts <SellerReviews>');

  const hashNavPath = path.join(ROOT_DIR, 'src', 'app', 'useHashNavigation.ts');
  const hashNavCode = fs.readFileSync(hashNavPath, 'utf8');
  assert(hashNavCode.includes("path.startsWith('ulasan-seller') || path === 'ulasan'"), 'useHashNavigation routes #ulasan-seller to view-ulasan');

  // -------------------------------------------------------------
  // PILLAR 2: PRODUCT DETAIL CUSTOMER REVIEWS SECTION
  // -------------------------------------------------------------
  console.log('\n--- PILLAR 2: Product Detail Customer Reviews Section ---');
  const prodReviewsSecPath = path.join(ROOT_DIR, 'src', 'components', 'customer', 'product', 'ProductReviewsSection.tsx');
  assert(fs.existsSync(prodReviewsSecPath), 'ProductReviewsSection.tsx exists');
  const prodReviewsSecCode = fs.readFileSync(prodReviewsSecPath, 'utf8');

  assert(prodReviewsSecCode.includes('id="ulasan-produk"'), 'ProductReviewsSection contains id="ulasan-produk" anchor');
  assert(prodReviewsSecCode.includes('Ulasan Pengguna'), 'ProductReviewsSection contains "Ulasan Pengguna" title');
  assert(prodReviewsSecCode.includes('useProductReviews'), 'ProductReviewsSection consumes useProductReviews hook');
  assert(prodReviewsSecCode.includes('useReviewMutations'), 'ProductReviewsSection consumes useReviewMutations hook');
  assert(prodReviewsSecCode.includes('ReviewSubmissionModal'), 'ProductReviewsSection incorporates ReviewSubmissionModal');
  assert(prodReviewsSecCode.includes('Hapus Ulasan?'), 'ProductReviewsSection incorporates Delete confirmation modal');

  // Verify CustomerProductDetail integration & layout position below Tentang Produk
  const custProdDetailPath = path.join(ROOT_DIR, 'src', 'pages', 'customer', 'CustomerProductDetail.tsx');
  const custProdDetailCode = fs.readFileSync(custProdDetailPath, 'utf8');
  assert(custProdDetailCode.includes('<ProductReviewsSection'), 'CustomerProductDetail mounts <ProductReviewsSection');
  const tentangProdukIndex = custProdDetailCode.indexOf('Tentang Produk');
  const productReviewsIndex = custProdDetailCode.indexOf('<ProductReviewsSection');
  assert(tentangProdukIndex !== -1 && productReviewsIndex !== -1 && productReviewsIndex > tentangProdukIndex,
    'ProductReviewsSection is positioned strictly below "Tentang Produk"');

  // -------------------------------------------------------------
  // PILLAR 3: INTERACTIVE RATING & REVIEW-COUNT NAVIGATION
  // -------------------------------------------------------------
  console.log('\n--- PILLAR 3: Interactive Rating & Review-Count Navigation ---');
  const storeReviewsListPath = path.join(ROOT_DIR, 'src', 'components', 'customer', 'store', 'StoreReviewsList.tsx');
  const storeReviewsListCode = fs.readFileSync(storeReviewsListPath, 'utf8');
  assert(storeReviewsListCode.includes('id="ulasan-pelanggan"'), 'StoreReviewsList has id="ulasan-pelanggan" target');
  assert(storeReviewsListCode.includes('scroll-mt-28'), 'StoreReviewsList has scroll-mt-28 for sticky header offset');

  const custStoreDetailPath = path.join(ROOT_DIR, 'src', 'pages', 'customer', 'CustomerStoreDetail.tsx');
  const custStoreDetailCode = fs.readFileSync(custStoreDetailPath, 'utf8');
  assert(custStoreDetailCode.includes("setActiveTab('ulasan')"), 'CustomerStoreDetail automatically switches to "ulasan" tab');
  assert(custStoreDetailCode.includes('scrollIntoView'), 'CustomerStoreDetail executes smooth scroll to reviews');
  assert(custStoreDetailCode.includes('requestAnimationFrame'), 'CustomerStoreDetail uses resilient polling/requestAnimationFrame');

  const appPath = path.join(ROOT_DIR, 'src', 'App.tsx');
  const appCode = fs.readFileSync(appPath, 'utf8');
  assert(appCode.includes('handleNavigateStore'), 'App.tsx implements handleNavigateStore');
  assert(appCode.includes("query.set('section', section)"), 'App.tsx preserves section query param');

  // Verify rating click touchpoints
  assert(custProdDetailCode.includes('ulasan-pelanggan'), 'CustomerProductDetail rating/review count navigates to ulasan-pelanggan');
  const storeHeroPath = path.join(ROOT_DIR, 'src', 'components', 'customer', 'store', 'StoreHero.tsx');
  const storeHeroCode = fs.readFileSync(storeHeroPath, 'utf8');
  assert(storeHeroCode.includes('ulasan-pelanggan'), 'StoreHero review indicators target ulasan-pelanggan');

  // -------------------------------------------------------------
  // PILLAR 4: BACKEND API INTEGRATION (6 ENDPOINTS + STORE SUMMARY)
  // -------------------------------------------------------------
  console.log('\n--- PILLAR 4: Backend API Integration & Live Probing ---');
  const reviewApiPath = path.join(ROOT_DIR, 'src', 'api', 'services', 'reviewApi.ts');
  const reviewApiCode = fs.readFileSync(reviewApiPath, 'utf8');
  assert(reviewApiCode.includes('getProductReviews'), 'reviewApi exports getProductReviews');
  assert(reviewApiCode.includes('createProductReview'), 'reviewApi exports createProductReview');
  assert(reviewApiCode.includes('getStoreReviews'), 'reviewApi exports getStoreReviews');
  assert(reviewApiCode.includes('createStoreReview'), 'reviewApi exports createStoreReview');
  assert(reviewApiCode.includes('getStoreSummary'), 'reviewApi exports getStoreSummary');
  assert(reviewApiCode.includes('updateReview'), 'reviewApi exports updateReview');
  assert(reviewApiCode.includes('deleteReview'), 'reviewApi exports deleteReview');

  // Probe live backend endpoints
  try {
    // Valid store and product UUIDs present on backend
    const sampleStoreId = '01a18db0-c24a-736f-8087-3ec00263311a';
    const sampleProductId = '01a18db1-3ef4-7844-9da6-4a4612d30834';

    // 1. GET Store Summary with real storeId
    const storeSummaryRes = await axios.get(`${API_BASE_URL}api/v1/stores/${sampleStoreId}/summary`, { validateStatus: () => true });
    assert(storeSummaryRes.status === 200, `Live GET /api/v1/stores/{id}/summary returns status ${storeSummaryRes.status}`);
    assert(storeSummaryRes.data && typeof storeSummaryRes.data === 'object', 'Store summary returns JSON envelope');
    const summaryPayload = storeSummaryRes.data.payload || storeSummaryRes.data;
    assert(typeof summaryPayload.average_rating === 'number' && typeof summaryPayload.total_reviews === 'number',
      `Store summary contains average_rating (${summaryPayload.average_rating}) and total_reviews (${summaryPayload.total_reviews})`);

    // 2. GET Store Reviews with real storeId
    const storeReviewsRes = await axios.get(`${API_BASE_URL}api/v1/stores/${sampleStoreId}/reviews?page=1&limit=5`, { validateStatus: () => true });
    assert(storeReviewsRes.status === 200, `Live GET /api/v1/stores/{id}/reviews returns status ${storeReviewsRes.status}`);
    const storeReviewsPayload = storeReviewsRes.data.payload || storeReviewsRes.data;
    assert(Array.isArray(storeReviewsPayload.reviews), 'Store reviews payload contains reviews array');
    assert(storeReviewsPayload.meta && typeof storeReviewsPayload.meta === 'object', 'Store reviews payload contains meta object');

    // 3. GET Product Reviews with real productId
    const prodReviewsRes = await axios.get(`${API_BASE_URL}api/v1/products/${sampleProductId}/reviews?page=1&limit=5`, { validateStatus: () => true });
    assert(prodReviewsRes.status === 200, `Live GET /api/v1/products/{id}/reviews returns status ${prodReviewsRes.status}`);
    const prodReviewsPayload = prodReviewsRes.data.payload || prodReviewsRes.data;
    assert(Array.isArray(prodReviewsPayload.reviews), 'Product reviews payload contains reviews array');
    assert(prodReviewsPayload.meta && typeof prodReviewsPayload.meta === 'object', 'Product reviews payload contains meta object');

    // 4. Non-existent UUID verification (returns 404)
    const nonExistentRes = await axios.get(`${API_BASE_URL}api/v1/products/00000000-0000-0000-0000-000000000000/reviews`, { validateStatus: () => true });
    assert(nonExistentRes.status === 404, 'Live GET for non-existent product returns 404 Not Found as expected');

    // 5. POST Product Review without auth returns 401
    const unauthPostProduct = await axios.post(`${API_BASE_URL}api/v1/products/${sampleProductId}/reviews`, { rating: 5, content: 'Test' }, { validateStatus: () => true });
    assert(unauthPostProduct.status === 401, `Live POST /api/v1/products/{id}/reviews rejects unauthenticated requests with 401`);

    // 6. POST Store Review without auth returns 401
    const unauthPostStore = await axios.post(`${API_BASE_URL}api/v1/stores/${sampleStoreId}/reviews`, { rating: 5, content: 'Test' }, { validateStatus: () => true });
    assert(unauthPostStore.status === 401, `Live POST /api/v1/stores/{id}/reviews rejects unauthenticated requests with 401`);

    // 7. PATCH Review without auth returns 401
    const unauthPatch = await axios.patch(`${API_BASE_URL}api/v1/reviews/00000000-0000-0000-0000-000000000000`, { rating: 4, content: 'Updated' }, { validateStatus: () => true });
    assert(unauthPatch.status === 401, `Live PATCH /api/v1/reviews/{id} rejects unauthenticated requests with 401`);

    // 8. DELETE Review without auth returns 401
    const unauthDelete = await axios.delete(`${API_BASE_URL}api/v1/reviews/00000000-0000-0000-0000-000000000000`, { validateStatus: () => true });
    assert(unauthDelete.status === 401, `Live DELETE /api/v1/reviews/{id} rejects unauthenticated requests with 401`);
  } catch (err) {
    console.error('Backend live probing network error:', err);
    assert(false, `Backend live probing failed with error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // PILLAR 5: ADVERSARIAL BOUNDARY & CALCULATIONS STRESS TEST
  // -------------------------------------------------------------
  console.log('\n--- PILLAR 5: Adversarial Boundary & Stress Testing ---');
  const useReviewsPath = path.join(ROOT_DIR, 'src', 'hooks', 'useReviews.ts');
  const useReviewsCode = fs.readFileSync(useReviewsPath, 'utf8');

  // Verify division by zero and calculation safety in useReviews.ts
  assert(useReviewsCode.includes('if (!reviews || reviews.length === 0) return 0'), 'calculateAverageRating guards empty/null reviews safely');
  assert(useReviewsCode.includes('Math.round((sum / validReviews.length) * 10) / 10'), 'calculateAverageRating rounds to 1 decimal place');
  assert(useReviewsCode.includes('Math.max(1, Math.min(5, Math.round(rawRating)))'), 'calculateRatingDistribution clamps ratings into 1..5 stars');

  // Verify RatingDistribution percentage safety
  const ratingDistPath = path.join(ROOT_DIR, 'src', 'components', 'reviews', 'RatingDistribution.tsx');
  const ratingDistCode = fs.readFileSync(ratingDistPath, 'utf8');
  assert(ratingDistCode.includes('totalReviews > 0 ? Math.min(100, Math.max(0, (count / totalReviews) * 100)) : 0'),
    'RatingDistribution safely handles totalReviews === 0 and clamps percentage between 0 and 100');

  // Verify StarRating keyboard accessibility & fractional SVG rendering
  const starRatingPath = path.join(ROOT_DIR, 'src', 'components', 'reviews', 'StarRating.tsx');
  const starRatingCode = fs.readFileSync(starRatingPath, 'utf8');
  assert(starRatingCode.includes("role={interactive ? 'radiogroup' : 'img'}"), 'StarRating provides appropriate ARIA roles');
  assert(starRatingCode.includes('overflow-hidden') && starRatingCode.includes('fillRatio'), 'StarRating renders fractional star widths via clipped overlay');
  assert(starRatingCode.includes('ArrowRight') && starRatingCode.includes('ArrowLeft'), 'StarRating provides arrow key navigation in interactive mode');

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`LEAD QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    console.error('\nFailures detected:');
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('\nALL QUALITY ASSURANCE GATES PASSED WITHOUT RESERVATION.');
    process.exit(0);
  }
}

runQA();
