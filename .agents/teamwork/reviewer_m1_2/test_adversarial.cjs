const assert = require('assert');

// Logic under test from src/hooks/useReviews.ts
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

console.log('--- Adversarial Challenge Suite: Review Math & Edge Cases ---');

// Case 1: Null & Undefined handling
assert.strictEqual(calculateAverageRating(null), 0);
assert.strictEqual(calculateAverageRating(undefined), 0);
assert.deepStrictEqual(calculateRatingDistribution(null), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
assert.deepStrictEqual(calculateRatingDistribution(undefined), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
console.log('✓ Null and undefined handled gracefully without throwing');

// Case 2: Empty Array
assert.strictEqual(calculateAverageRating([]), 0);
assert.deepStrictEqual(calculateRatingDistribution([]), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
console.log('✓ Empty arrays return 0 and zeroed distribution');

// Case 3: Degenerate items (all NaN, non-numeric, or missing rating)
const degenerate = [
  { content: 'No rating' },
  { rating: NaN, content: 'NaN rating' },
  { rating: 'not-a-number', content: 'String rating' },
];
assert.strictEqual(calculateAverageRating(degenerate), 0);
assert.deepStrictEqual(calculateRatingDistribution(degenerate), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
console.log('✓ Degenerate items filtered out without NaN/divide-by-zero');

// Case 4: Fractional and boundary ratings
const edgeRatings = [
  { rating: 4.67 }, // round -> 5
  { rating: 2.34 }, // round -> 2
  { rating: 0.2 },  // round -> 0 -> clamped to 1
  { rating: 5.8 },  // round -> 6 -> clamped to 5
];
// Average: (4.67 + 2.34 + 0.2 + 5.8) / 4 = 13.01 / 4 = 3.2525 -> 3.3
assert.strictEqual(calculateAverageRating(edgeRatings), 3.3);
const dist = calculateRatingDistribution(edgeRatings);
assert.deepStrictEqual(dist, { 1: 1, 2: 1, 3: 0, 4: 0, 5: 2 });
console.log('✓ Fractional ratings and clamping verified');

// Case 5: Large datasets (10,000 reviews performance test)
const largeReviews = [];
for (let i = 0; i < 10000; i++) {
  largeReviews.push({ rating: (i % 5) + 1, content: `Review ${i}` });
}
const start = performance.now();
const avgLarge = calculateAverageRating(largeReviews);
const distLarge = calculateRatingDistribution(largeReviews);
const elapsed = performance.now() - start;
assert.strictEqual(avgLarge, 3);
assert.deepStrictEqual(distLarge, { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000 });
console.log(`✓ 10,000 reviews computed in ${elapsed.toFixed(2)}ms (average = 3, distribution = 2000 each)`);

console.log('\n--- ALL ADVERSARIAL STRESS TESTS PASSED ---');
