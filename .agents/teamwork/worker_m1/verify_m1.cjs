const assert = require('assert');

// 1. Test calculation functions (ported from useReviews logic)
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

console.log('--- Testing calculation logic ---');

// Test 1: Empty reviews
assert.strictEqual(calculateAverageRating([]), 0, 'Empty reviews should yield 0 average rating');
assert.deepStrictEqual(calculateRatingDistribution([]), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 'Empty reviews should yield 0 for all stars');
console.log('✓ Empty reviews test passed');

// Test 2: Single review
const single = [{ rating: 5, content: 'Bagus' }];
assert.strictEqual(calculateAverageRating(single), 5);
assert.deepStrictEqual(calculateRatingDistribution(single), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
console.log('✓ Single review test passed');

// Test 3: Multiple reviews with decimal average
const multiple = [
  { rating: 5, content: 'Sangat baik' },
  { rating: 4, content: 'Baik' },
  { rating: 4, content: 'Cukup baik' },
  { rating: 3, content: 'Biasa saja' },
  { rating: 5, content: 'Luar biasa' },
];
// Sum = 21, count = 5, avg = 4.2
assert.strictEqual(calculateAverageRating(multiple), 4.2);
assert.deepStrictEqual(calculateRatingDistribution(multiple), { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 });
console.log('✓ Multiple reviews test passed (average = 4.2, distribution correct)');

// Test 4: Live backend contract verification using axios
const axios = require('axios');

async function testBackendEndpoints() {
  console.log('\n--- Testing live backend endpoint contracts ---');
  const baseURL = 'https://dolpin-fourthree.bccdev.id';
  const validStoreId = '01a18db0-c24a-736f-8087-3ec00263311a';
  const validProductId = '01a18db1-3ef4-7844-9da6-4a4612d30834';

  // 1. GET /api/v1/products/{id}/reviews
  const prodRes = await axios.get(`${baseURL}/api/v1/products/${validProductId}/reviews`);
  assert.strictEqual(prodRes.status, 200);
  assert.ok(prodRes.data.payload !== undefined, 'Payload must be present');
  assert.ok(Array.isArray(prodRes.data.payload.reviews), 'Reviews must be an array');
  assert.ok(prodRes.data.payload.meta !== undefined, 'Meta must be present');
  console.log('✓ GET /api/v1/products/{id}/reviews contract verified (status 200, payload.reviews array)');

  // 2. GET /api/v1/stores/{id}/reviews
  const storeRes = await axios.get(`${baseURL}/api/v1/stores/${validStoreId}/reviews`);
  assert.strictEqual(storeRes.status, 200);
  assert.ok(Array.isArray(storeRes.data.payload.reviews), 'Reviews must be an array');
  assert.ok(storeRes.data.payload.meta !== undefined, 'Meta must be present');
  console.log('✓ GET /api/v1/stores/{id}/reviews contract verified (status 200, payload.reviews array)');

  // 3. GET /api/v1/stores/{id}/summary
  const summaryRes = await axios.get(`${baseURL}/api/v1/stores/${validStoreId}/summary`);
  assert.strictEqual(summaryRes.status, 200);
  assert.strictEqual(typeof summaryRes.data.payload.average_rating, 'number', 'average_rating must be number');
  assert.strictEqual(typeof summaryRes.data.payload.total_reviews, 'number', 'total_reviews must be number');
  console.log(`✓ GET /api/v1/stores/{id}/summary contract verified (average_rating: ${summaryRes.data.payload.average_rating}, total_reviews: ${summaryRes.data.payload.total_reviews})`);

  // 4. POST /api/v1/products/{id}/reviews without auth -> 401
  try {
    await axios.post(`${baseURL}/api/v1/products/${validProductId}/reviews`, { rating: 5, content: 'Test' });
    assert.fail('Should have thrown 401');
  } catch (err) {
    assert.strictEqual(err.response?.status, 401);
    console.log('✓ POST /api/v1/products/{id}/reviews protected with 401 Bearer check');
  }

  // 5. POST /api/v1/stores/{id}/reviews without auth -> 401
  try {
    await axios.post(`${baseURL}/api/v1/stores/${validStoreId}/reviews`, { rating: 5, content: 'Test' });
    assert.fail('Should have thrown 401');
  } catch (err) {
    assert.strictEqual(err.response?.status, 401);
    console.log('✓ POST /api/v1/stores/{id}/reviews protected with 401 Bearer check');
  }

  // 6. PATCH /api/v1/reviews/{id} without auth -> 401
  try {
    await axios.patch(`${baseURL}/api/v1/reviews/01a18db0-c24a-736f-8087-3ec00263311a`, { rating: 5, content: 'Test' });
    assert.fail('Should have thrown 401');
  } catch (err) {
    assert.strictEqual(err.response?.status, 401);
    console.log('✓ PATCH /api/v1/reviews/{id} protected with 401 Bearer check');
  }

  // 7. DELETE /api/v1/reviews/{id} without auth -> 401
  try {
    await axios.delete(`${baseURL}/api/v1/reviews/01a18db0-c24a-736f-8087-3ec00263311a`);
    assert.fail('Should have thrown 401');
  } catch (err) {
    assert.strictEqual(err.response?.status, 401);
    console.log('✓ DELETE /api/v1/reviews/{id} protected with 401 Bearer check');
  }

  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

testBackendEndpoints().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});
