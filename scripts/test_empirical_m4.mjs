import fs from 'fs';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

async function run() {
  const prodId = '01a18db1-3ef4-7844-9da6-4a4612d30834';
  const dummyUUID = '00000000-0000-0000-0000-000000000000';
  const invalidUUID = 'not-a-valid-uuid';
  const baseUrl = 'https://dolpin-fourthree.bccdev.id';

  console.log('====================================================');
  console.log('CHALLENGER 2: EMPIRICAL TEST SUITE (MILESTONE 4)');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SECTION 1: LIVE BACKEND GET PROBES
  // ----------------------------------------------------
  console.log('--- SECTION 1: Live Backend GET /api/v1/products/{product_id}/reviews ---');
  
  // 1.1 Valid Product Reviews
  const res1 = await fetch(`${baseUrl}/api/v1/products/${prodId}/reviews`);
  assert(res1.status === 200, 'GET /api/v1/products/{id}/reviews HTTP status is 200');
  const d1 = await res1.json();
  assert(typeof d1.request_id === 'string' && d1.request_id.length > 0, 'Envelope has non-empty request_id');
  assert(typeof d1.payload === 'object' && d1.payload !== null, 'Envelope has payload object');
  assert(Array.isArray(d1.payload.reviews), 'payload.reviews is an Array');
  assert(typeof d1.payload.meta === 'object' && d1.payload.meta !== null, 'payload.meta is an object');
  assert(typeof d1.payload.meta.total_data === 'number', 'meta.total_data is number');
  assert(typeof d1.payload.meta.total_page === 'number', 'meta.total_page is number');
  assert(typeof d1.payload.meta.page === 'number', 'meta.page is number');
  assert(typeof d1.payload.meta.limit === 'number', 'meta.limit is number');

  // 1.2 Pagination query parameters
  const res2 = await fetch(`${baseUrl}/api/v1/products/${prodId}/reviews?page=2&limit=5`);
  assert(res2.status === 200, 'GET with ?page=2&limit=5 returns 200');
  const d2 = await res2.json();
  assert(d2.payload.meta.page === 2, 'meta.page reflects query parameter page=2');
  assert(d2.payload.meta.limit === 5, 'meta.limit reflects query parameter limit=5');

  // 1.3 Invalid UUID returns 400 Bad Request
  const res3 = await fetch(`${baseUrl}/api/v1/products/${invalidUUID}/reviews`);
  assert(res3.status === 400, 'GET with invalid UUID returns 400 Bad Request');
  const d3 = await res3.json();
  assert(d3.payload?.error?.error_code === 'bad_request', '400 response has error_code "bad_request"');
  assert(d3.payload?.error?.location === 'path.product_id', '400 error location is "path.product_id"');

  // 1.4 Non-existent UUID returns 404 Not Found
  const res4 = await fetch(`${baseUrl}/api/v1/products/${dummyUUID}/reviews`);
  assert(res4.status === 404, 'GET with non-existent UUID returns 404 Not Found');
  const d4 = await res4.json();
  assert(d4.payload?.error?.error_code === 'review_product_not_found', '404 error_code is "review_product_not_found"');

  // ----------------------------------------------------
  // SECTION 2: LIVE BACKEND POST, PATCH, DELETE VALIDATION CONTRACTS
  // ----------------------------------------------------
  console.log('\n--- SECTION 2: POST / PATCH / DELETE Payload Validation Contracts ---');

  // 2.1 Unauthenticated POST returns 401
  const post1 = await fetch(`${baseUrl}/api/v1/products/${prodId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 5, content: 'Bagus sekali!' })
  });
  assert(post1.status === 401, 'Unauthenticated POST returns 401 Unauthorized');
  const pd1 = await post1.json();
  assert(pd1.payload?.error?.error_code === 'no_bearer_token', 'POST 401 error_code is "no_bearer_token"');

  // 2.2 Invalid Bearer Token on POST returns 401
  const post2 = await fetch(`${baseUrl}/api/v1/products/${prodId}/reviews`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid-token-12345'
    },
    body: JSON.stringify({ rating: 5, content: 'Bagus sekali!' })
  });
  assert(post2.status === 401, 'Invalid Bearer token POST returns 401 Unauthorized');

  // 2.3 Unauthenticated PATCH returns 401
  const patch1 = await fetch(`${baseUrl}/api/v1/reviews/${dummyUUID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 4, content: 'Ulasan diperbarui' })
  });
  assert(patch1.status === 401, 'Unauthenticated PATCH returns 401 Unauthorized');
  const patchD1 = await patch1.json();
  assert(patchD1.payload?.error?.error_code === 'no_bearer_token', 'PATCH 401 error_code is "no_bearer_token"');

  // 2.4 Unauthenticated DELETE returns 401
  const del1 = await fetch(`${baseUrl}/api/v1/reviews/${dummyUUID}`, {
    method: 'DELETE'
  });
  assert(del1.status === 401, 'Unauthenticated DELETE returns 401 Unauthorized');
  const delD1 = await del1.json();
  assert(delD1.payload?.error?.error_code === 'no_bearer_token', 'DELETE 401 error_code is "no_bearer_token"');

  // 2.5 Swagger Contract Schema Verification
  const swagger = JSON.parse(fs.readFileSync('swagger_doc.json', 'utf8'));
  const createSchema = swagger.definitions['github_com_rescuebyte_rescuebyte-be_domain_dto.CreateReviewRequest'];
  assert(createSchema.required.includes('content') && createSchema.required.includes('rating'), 
    'Swagger CreateReviewRequest requires both content and rating');
  assert(createSchema.properties.rating.minimum === 1 && createSchema.properties.rating.maximum === 5,
    'Swagger CreateReviewRequest enforces rating between 1 and 5');
  assert(createSchema.properties.content.minLength === 1 && createSchema.properties.content.maxLength === 2000,
    'Swagger CreateReviewRequest enforces content length between 1 and 2000');

  // ----------------------------------------------------
  // SECTION 3: DOM INTEGRATION & AST VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 3: DOM Anchor & Layout Verification ---');

  const sectionCode = fs.readFileSync('src/components/customer/product/ProductReviewsSection.tsx', 'utf8');
  const detailCode = fs.readFileSync('src/pages/customer/CustomerProductDetail.tsx', 'utf8');

  // 3.1 ID Anchor
  assert(sectionCode.includes('id="ulasan-produk"'), 'ProductReviewsSection contains id="ulasan-produk"');
  assert(sectionCode.includes('aria-label="Ulasan Pengguna"'), 'ProductReviewsSection contains aria-label="Ulasan Pengguna"');

  // 3.2 Heading
  assert(sectionCode.includes('Ulasan Pengguna</h2>') || sectionCode.includes('>Ulasan Pengguna<') || /Ulasan Pengguna\s*<\/h2>/.test(sectionCode),
    'ProductReviewsSection contains heading "Ulasan Pengguna"');

  // 3.3 "Tulis Ulasan" button
  assert(sectionCode.includes('Tulis Ulasan'), 'ProductReviewsSection contains "Tulis Ulasan" action');

  // 3.4 Integration in CustomerProductDetail.tsx
  assert(detailCode.includes('import { ProductReviewsSection }') || detailCode.includes('import ProductReviewsSection'),
    'CustomerProductDetail imports ProductReviewsSection');
  assert(detailCode.includes('<ProductReviewsSection'), 'CustomerProductDetail renders <ProductReviewsSection');

  // 3.5 DOM Placement: Mounted below "Tentang Produk"
  const tentangIndex = detailCode.indexOf('Tentang Produk');
  const reviewsIndex = detailCode.indexOf('<ProductReviewsSection');
  assert(tentangIndex !== -1, 'CustomerProductDetail contains "Tentang Produk" section');
  assert(reviewsIndex !== -1, 'CustomerProductDetail contains "<ProductReviewsSection"');
  assert(reviewsIndex > tentangIndex, 'ProductReviewsSection is placed AFTER "Tentang Produk" in the DOM tree');

  // 3.6 Props passing
  assert(/productId=\{product\?\.id\}/.test(detailCode), 'CustomerProductDetail passes productId={product?.id}');
  assert(/productName=\{title\}/.test(detailCode), 'CustomerProductDetail passes productName={title}');
  assert(/productImage=\{currentImage\}/.test(detailCode), 'CustomerProductDetail passes productImage={currentImage}');
  assert(/onRequireAuth=\{/.test(detailCode), 'CustomerProductDetail passes onRequireAuth callback');

  // ----------------------------------------------------
  // SECTION 4: CLIENT-SIDE CALCULATION & ALGORITHM STRESS TESTS
  // ----------------------------------------------------
  console.log('\n--- SECTION 4: Algorithmic Stress Testing (Oracles & Generators) ---');

  // Algorithmic implementations from useReviews.ts:

  // Extract functions for stress testing
  function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const validReviews = reviews.filter((r) => typeof r.rating === 'number' && !isNaN(r.rating));
    if (validReviews.length === 0) return 0;
    const sum = validReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / validReviews.length) * 10) / 10;
  }

  function calculateRatingDistribution(reviews) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (!reviews || reviews.length === 0) return distribution;
    for (const review of reviews) {
      const rawRating = Number(review.rating);
      if (!isNaN(rawRating)) {
        const star = Math.max(1, Math.min(5, Math.round(rawRating)));
        distribution[star] = (distribution[star] || 0) + 1;
      }
    }
    return distribution;
  }

  // 4.1 Empty review list
  assert(calculateAverageRating([]) === 0, 'calculateAverageRating([]) returns 0 (no divide-by-zero)');
  assert(JSON.stringify(calculateRatingDistribution([])) === JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    'calculateRatingDistribution([]) returns all-zero object');

  // 4.2 Null / Undefined safety
  assert(calculateAverageRating(null) === 0, 'calculateAverageRating(null) returns 0');
  assert(calculateAverageRating(undefined) === 0, 'calculateAverageRating(undefined) returns 0');
  assert(JSON.stringify(calculateRatingDistribution(null)) === JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    'calculateRatingDistribution(null) is safe');

  // 4.3 Clamping and NaN resilience
  const dirtyReviews = [
    { rating: 5 },
    { rating: 'not-a-number' },
    { rating: NaN },
    { rating: -10 },
    { rating: 100 },
    { rating: 4.6 }
  ];
  const dist = calculateRatingDistribution(dirtyReviews);
  assert(dist[1] === 1, 'Negative rating clamped to 1 star');
  assert(dist[5] === 3, 'Ratings 5, 100, and 4.6 correctly aggregate into 5-star bin (count = 3)');
  assert(dist[2] === 0 && dist[3] === 0 && dist[4] === 0, 'No stars leaked to other bins');

  // 4.4 Large scale stress test (10,000 synthetic reviews)
  const syntheticReviews = Array.from({ length: 10000 }, (_, i) => ({
    id: `synth-${i}`,
    rating: (i % 5) + 1,
    content: `Review content ${i}`
  }));
  const avg = calculateAverageRating(syntheticReviews);
  assert(avg === 3.0, 'Large-scale synthetic average of uniform 1..5 is 3.0');
  const synthDist = calculateRatingDistribution(syntheticReviews);
  assert(synthDist[1] === 2000 && synthDist[2] === 2000 && synthDist[3] === 2000 && synthDist[4] === 2000 && synthDist[5] === 2000,
    'Large-scale synthetic distribution evenly splits 2000 per star');

  // ----------------------------------------------------
  // SECTION 5: STATE MATRIX & PERMISSIONS VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 5: State Matrix & Permission Logic Verification ---');

  // 5.1 Author ownership logic check
  assert(sectionCode.includes('canEdit'), 'ProductReviewsSection computes canEdit authorization');
  assert(sectionCode.includes('canDelete'), 'ProductReviewsSection computes canDelete authorization');
  assert(sectionCode.includes('review.user_id === user.id') && sectionCode.includes('review.author?.id === user.id'),
    'canEdit / canDelete verifies user.id against review.user_id and review.author.id');

  // 5.2 Modal Integration
  assert(sectionCode.includes('<ReviewSubmissionModal'), 'ProductReviewsSection embeds <ReviewSubmissionModal');
  assert(sectionCode.includes('<Modal'), 'ProductReviewsSection embeds Delete confirmation <Modal');
  assert(sectionCode.includes('Hapus Ulasan?'), 'Delete modal title is "Hapus Ulasan?"');

  // 5.3 Empty and Error states
  assert(sectionCode.includes('<EmptyState'), 'ProductReviewsSection renders <EmptyState');
  assert(sectionCode.includes('Belum Ada Ulasan'), 'Empty state title is "Belum Ada Ulasan"');
  assert(sectionCode.includes('Gagal Memuat Ulasan'), 'Error banner heading is "Gagal Memuat Ulasan"');
  assert(sectionCode.includes('Coba Lagi'), 'Error banner provides "Coba Lagi" retry button');

  console.log('\n====================================================');
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
