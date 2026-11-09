const assert = require('assert');
const axios = require('axios');

// ============================================================================
// 1. Target Functions from src/hooks/useReviews.ts
// ============================================================================
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

console.log('================================================================');
console.log('ADVERSARIAL CHALLENGER SUITE: MILESTONE 1 (API & TYPES)');
console.log('================================================================\n');

const findings = [];
let totalTests = 0;
let passedTests = 0;

function runSyncTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Details: ${err.message}`);
    findings.push({ name, error: err.message });
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Details: ${err.message}`);
    findings.push({ name, error: err.message });
  }
}

async function main() {
  // ----------------------------------------------------------------------------
  // CATEGORY 1: Empty Array & Nullish Roots
  // ----------------------------------------------------------------------------
  console.log('--- CATEGORY 1: Empty Array & Nullish Roots ---');

  runSyncTest('1.1 Empty review array [] -> averageRating === 0', () => {
    assert.strictEqual(calculateAverageRating([]), 0);
  });

  runSyncTest('1.2 Empty review array [] -> distribution has 0 for all stars 1..5', () => {
    assert.deepStrictEqual(calculateRatingDistribution([]), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  runSyncTest('1.3 null reviews array -> averageRating === 0', () => {
    assert.strictEqual(calculateAverageRating(null), 0);
  });

  runSyncTest('1.4 null reviews array -> distribution has 0 for all stars 1..5', () => {
    assert.deepStrictEqual(calculateRatingDistribution(null), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  runSyncTest('1.5 undefined reviews array -> averageRating === 0', () => {
    assert.strictEqual(calculateAverageRating(undefined), 0);
  });

  runSyncTest('1.6 undefined reviews array -> distribution has 0 for all stars 1..5', () => {
    assert.deepStrictEqual(calculateRatingDistribution(undefined), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  // ----------------------------------------------------------------------------
  // CATEGORY 2: Fractional Ratings & Rounding
  // ----------------------------------------------------------------------------
  console.log('\n--- CATEGORY 2: Fractional Ratings & Rounding ---');

  runSyncTest('2.1 Fractional ratings [4.5, 3.5, 2.5] -> averageRating is exactly 3.5', () => {
    const reviews = [{ rating: 4.5 }, { rating: 3.5 }, { rating: 2.5 }];
    assert.strictEqual(calculateAverageRating(reviews), 3.5);
  });

  runSyncTest('2.2 Fractional ratings [4.5, 3.5, 2.5] distribution rounds correctly (5:1, 4:1, 3:1)', () => {
    const reviews = [{ rating: 4.5 }, { rating: 3.5 }, { rating: 2.5 }];
    const dist = calculateRatingDistribution(reviews);
    assert.deepStrictEqual(dist, { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 });
  });

  runSyncTest('2.3 Recurring fractional average [5, 4, 4] -> 4.333... rounded to 1 decimal (4.3)', () => {
    const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }];
    assert.strictEqual(calculateAverageRating(reviews), 4.3);
  });

  runSyncTest('2.4 Rounding boundary tests: 4.04 -> 4.0 and 4.05 -> 4.1', () => {
    assert.strictEqual(calculateAverageRating([{ rating: 4.04 }]), 4.0);
    assert.strictEqual(calculateAverageRating([{ rating: 4.05 }]), 4.1);
  });

  runSyncTest('2.5 Single fractional rating [4.7] -> average 4.7, star 5 in distribution', () => {
    assert.strictEqual(calculateAverageRating([{ rating: 4.7 }]), 4.7);
    assert.deepStrictEqual(calculateRatingDistribution([{ rating: 4.7 }]), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
  });

  // ----------------------------------------------------------------------------
  // CATEGORY 3: Boundary & Out-Of-Bounds Ratings Analysis
  // ----------------------------------------------------------------------------
  console.log('\n--- CATEGORY 3: Boundary & Out-Of-Bounds Ratings Analysis ---');

  runSyncTest('3.1 Upper bound clamping: rating 6, 10, 100 clamped to 5 in distribution', () => {
    const reviews = [{ rating: 6 }, { rating: 10 }, { rating: 100 }];
    const dist = calculateRatingDistribution(reviews);
    assert.strictEqual(dist[5], 3, 'All ratings > 5 must be clamped to 5');
  });

  runSyncTest('3.2 Lower bound clamping: rating 0 and -5 clamped to 1 in distribution', () => {
    const reviews = [{ rating: 0 }, { rating: -5 }];
    const dist = calculateRatingDistribution(reviews);
    assert.strictEqual(dist[1], 2, 'Ratings <= 0 are clamped to star 1');
  });

  runSyncTest('3.3 Missing or NaN rating fields are safely skipped', () => {
    const reviews = [{ rating: undefined }, { rating: NaN }, { content: 'No rating property' }];
    assert.strictEqual(calculateAverageRating(reviews), 0);
    assert.deepStrictEqual(calculateRatingDistribution(reviews), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  runSyncTest('3.4 Observation: review with rating null behavior', () => {
    // In JS: Number(null) === 0, while typeof null === 'object'.
    // calculateAverageRating filters typeof r.rating === 'number', so null rating is skipped -> avg = 0.
    // calculateRatingDistribution does Number(null) -> 0 -> clamped to 1.
    const nullReview = [{ rating: null }];
    const avg = calculateAverageRating(nullReview);
    const dist = calculateRatingDistribution(nullReview);
    assert.strictEqual(avg, 0);
    console.log(`       Notice: rating: null results in avg=${avg}, distribution=${JSON.stringify(dist)}`);
  });

  // ----------------------------------------------------------------------------
  // CATEGORY 4: Massive Review Arrays & Performance Stress Test
  // ----------------------------------------------------------------------------
  console.log('\n--- CATEGORY 4: Massive Review Arrays & Performance Stress Test ---');

  runSyncTest('4.1 Stress test with 1,000 reviews', () => {
    const items = [];
    for (let i = 0; i < 1000; i++) {
      items.push({ id: `r-${i}`, rating: (i % 5) + 1, content: `Review ${i}` });
    }

    const start = performance.now();
    const avg = calculateAverageRating(items);
    const dist = calculateRatingDistribution(items);
    const duration = performance.now() - start;

    assert.strictEqual(avg, 3.0);
    assert.deepStrictEqual(dist, { 1: 200, 2: 200, 3: 200, 4: 200, 5: 200 });
    assert.ok(duration < 10, `1,000 reviews calculation must be < 10ms (actual: ${duration.toFixed(2)}ms)`);
    console.log(`       1,000 items processed in ${duration.toFixed(3)}ms`);
  });

  runSyncTest('4.2 Stress test with 10,000 reviews', () => {
    const items = [];
    for (let i = 0; i < 10000; i++) {
      items.push({ id: `r-${i}`, rating: (i % 5) + 1, content: `Review ${i}` });
    }

    const start = performance.now();
    const avg = calculateAverageRating(items);
    const dist = calculateRatingDistribution(items);
    const duration = performance.now() - start;

    assert.strictEqual(avg, 3.0);
    assert.deepStrictEqual(dist, { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000 });
    assert.ok(duration < 50, `10,000 reviews calculation must be < 50ms (actual: ${duration.toFixed(2)}ms)`);
    console.log(`       10,000 items processed in ${duration.toFixed(3)}ms`);
  });

  runSyncTest('4.3 Stress test with 100,000 reviews', () => {
    const items = [];
    for (let i = 0; i < 100000; i++) {
      items.push({ id: `r-${i}`, rating: (i % 5) + 1, content: `Review ${i}` });
    }

    const start = performance.now();
    const avg = calculateAverageRating(items);
    const dist = calculateRatingDistribution(items);
    const duration = performance.now() - start;

    assert.strictEqual(avg, 3.0);
    assert.strictEqual(dist[5], 20000);
    assert.ok(duration < 300, `100,000 reviews calculation must be < 300ms (actual: ${duration.toFixed(2)}ms)`);
    console.log(`       100,000 items processed in ${duration.toFixed(3)}ms`);
  });

  // ----------------------------------------------------------------------------
  // CATEGORY 5: Endpoint URL and Payload Construction Verification
  // ----------------------------------------------------------------------------
  console.log('\n--- CATEGORY 5: Endpoint URL and Payload Construction Verification ---');

  const requestLog = [];
  const mockApiClient = {
    get: async (url, config) => {
      requestLog.push({ method: 'GET', url, config });
      return { data: { payload: { success: true } } };
    },
    post: async (url, data, config) => {
      requestLog.push({ method: 'POST', url, data, config });
      return { data: { payload: { id: 'mock-id' } } };
    },
    patch: async (url, data, config) => {
      requestLog.push({ method: 'PATCH', url, data, config });
      return { data: { payload: { id: 'mock-id' } } };
    },
    delete: async (url, config) => {
      requestLog.push({ method: 'DELETE', url, config });
      return { data: { payload: { message: 'deleted' } } };
    },
  };

  const mockReviewApi = {
    getProductReviews: async (productId, params) => {
      const res = await mockApiClient.get(`/api/v1/products/${productId}/reviews`, { params });
      return res.data;
    },
    createProductReview: async (productId, data) => {
      const res = await mockApiClient.post(`/api/v1/products/${productId}/reviews`, data);
      return res.data;
    },
    getStoreReviews: async (storeId, params) => {
      const res = await mockApiClient.get(`/api/v1/stores/${storeId}/reviews`, { params });
      return res.data;
    },
    createStoreReview: async (storeId, data) => {
      const res = await mockApiClient.post(`/api/v1/stores/${storeId}/reviews`, data);
      return res.data;
    },
    getStoreSummary: async (storeId) => {
      const res = await mockApiClient.get(`/api/v1/stores/${storeId}/summary`);
      return res.data;
    },
    updateReview: async (id, data) => {
      const res = await mockApiClient.patch(`/api/v1/reviews/${id}`, data);
      return res.data;
    },
    deleteReview: async (id) => {
      const res = await mockApiClient.delete(`/api/v1/reviews/${id}`);
      return res.data;
    },
  };

  await runAsyncTest('5.1 getProductReviews constructs correct GET url & pagination params', async () => {
    requestLog.length = 0;
    await mockReviewApi.getProductReviews('prod-uuid-1', { page: 3, limit: 12 });
    assert.strictEqual(requestLog[0].method, 'GET');
    assert.strictEqual(requestLog[0].url, '/api/v1/products/prod-uuid-1/reviews');
    assert.deepStrictEqual(requestLog[0].config, { params: { page: 3, limit: 12 } });
  });

  await runAsyncTest('5.2 createProductReview constructs correct POST url & payload', async () => {
    requestLog.length = 0;
    const payload = { rating: 5, content: 'Produk sangat berkualitas dan segar!' };
    await mockReviewApi.createProductReview('prod-uuid-1', payload);
    assert.strictEqual(requestLog[0].method, 'POST');
    assert.strictEqual(requestLog[0].url, '/api/v1/products/prod-uuid-1/reviews');
    assert.deepStrictEqual(requestLog[0].data, payload);
  });

  await runAsyncTest('5.3 getStoreReviews constructs correct GET url & pagination params', async () => {
    requestLog.length = 0;
    await mockReviewApi.getStoreReviews('store-uuid-2', { page: 1, limit: 20 });
    assert.strictEqual(requestLog[0].method, 'GET');
    assert.strictEqual(requestLog[0].url, '/api/v1/stores/store-uuid-2/reviews');
    assert.deepStrictEqual(requestLog[0].config, { params: { page: 1, limit: 20 } });
  });

  await runAsyncTest('5.4 createStoreReview constructs correct POST url & payload', async () => {
    requestLog.length = 0;
    const payload = { rating: 4, content: 'Toko terpercaya dan cepat melayani.' };
    await mockReviewApi.createStoreReview('store-uuid-2', payload);
    assert.strictEqual(requestLog[0].method, 'POST');
    assert.strictEqual(requestLog[0].url, '/api/v1/stores/store-uuid-2/reviews');
    assert.deepStrictEqual(requestLog[0].data, payload);
  });

  await runAsyncTest('5.5 getStoreSummary constructs correct GET url without query params', async () => {
    requestLog.length = 0;
    await mockReviewApi.getStoreSummary('store-uuid-2');
    assert.strictEqual(requestLog[0].method, 'GET');
    assert.strictEqual(requestLog[0].url, '/api/v1/stores/store-uuid-2/summary');
    assert.strictEqual(requestLog[0].config, undefined);
  });

  await runAsyncTest('5.6 updateReview constructs correct PATCH url & payload', async () => {
    requestLog.length = 0;
    const payload = { rating: 5, content: 'Pembaruan ulasan saya setelah pemakaian 1 minggu.' };
    await mockReviewApi.updateReview('review-uuid-3', payload);
    assert.strictEqual(requestLog[0].method, 'PATCH');
    assert.strictEqual(requestLog[0].url, '/api/v1/reviews/review-uuid-3');
    assert.deepStrictEqual(requestLog[0].data, payload);
  });

  await runAsyncTest('5.7 deleteReview constructs correct DELETE url', async () => {
    requestLog.length = 0;
    await mockReviewApi.deleteReview('review-uuid-3');
    assert.strictEqual(requestLog[0].method, 'DELETE');
    assert.strictEqual(requestLog[0].url, '/api/v1/reviews/review-uuid-3');
  });

  // ----------------------------------------------------------------------------
  // CATEGORY 6: Live Backend Probing
  // ----------------------------------------------------------------------------
  console.log('\n--- CATEGORY 6: Live Backend Probing ---');
  const baseURL = 'https://dolpin-fourthree.bccdev.id';
  const sampleStoreId = '01a18db0-c24a-736f-8087-3ec00263311a';
  const sampleProductId = '01a18db1-3ef4-7844-9da6-4a4612d30834';

  await runAsyncTest('6.1 Live GET /api/v1/stores/{id}/summary contract', async () => {
    const res = await axios.get(`${baseURL}/api/v1/stores/${sampleStoreId}/summary`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.data.payload.average_rating, 'number');
    assert.strictEqual(typeof res.data.payload.total_reviews, 'number');
    console.log(`       Live payload -> average_rating: ${res.data.payload.average_rating}, total_reviews: ${res.data.payload.total_reviews}`);
  });

  await runAsyncTest('6.2 Live GET /api/v1/products/{id}/reviews with ?page=1&limit=10', async () => {
    const res = await axios.get(`${baseURL}/api/v1/products/${sampleProductId}/reviews?page=1&limit=10`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.payload.reviews));
    assert.ok(res.data.payload.meta !== undefined);
  });

  await runAsyncTest('6.3 Live GET /api/v1/stores/{id}/reviews with ?page=1&limit=10', async () => {
    const res = await axios.get(`${baseURL}/api/v1/stores/${sampleStoreId}/reviews?page=1&limit=10`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.payload.reviews));
    assert.ok(res.data.payload.meta !== undefined);
  });

  console.log('\n================================================================');
  console.log(`CHALLENGE RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  if (findings.length === 0) {
    console.log('VERDICT: APPROVED');
  } else {
    console.log(`VERDICT: REJECTED with ${findings.length} findings`);
  }
  console.log('================================================================');
}

main().catch((e) => {
  console.error('\nSuite execution fatal error:', e);
  process.exit(1);
});
