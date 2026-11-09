const assert = require('assert');

// Port calculation functions directly from useReviews.ts
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

console.log('--- ADVERSARIAL STRESS TESTING ---');

// Stress 1: Null, undefined, empty array, non-array inputs
assert.strictEqual(calculateAverageRating(null), 0);
assert.strictEqual(calculateAverageRating(undefined), 0);
assert.strictEqual(calculateAverageRating([]), 0);
assert.deepStrictEqual(calculateRatingDistribution(null), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
assert.deepStrictEqual(calculateRatingDistribution(undefined), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
assert.deepStrictEqual(calculateRatingDistribution([]), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
console.log('✓ Null/undefined/empty resilience passed');

// Stress 2: Reviews with NaN, null, string, undefined rating properties
const malformedReviews = [
  { rating: NaN, content: 'bad rating' },
  { rating: undefined, content: 'missing' },
  { rating: null, content: 'null rating' },
  { rating: '5', content: 'string rating' }, // in TS this is invalid, but at runtime could happen
  { rating: 4, content: 'valid rating 4' },
  { rating: 2, content: 'valid rating 2' },
];
// validReviews filters typeof r.rating === 'number' && !isNaN.
// Only rating: 4 and rating: 2 are included in average. Sum = 6, count = 2 -> 3.0
const avg = calculateAverageRating(malformedReviews);
assert.strictEqual(avg, 3.0);
console.log('✓ Malformed rating objects resilience passed (avg = 3.0)');

// Stress 3: Boundary clamping for distribution
const outOfBounds = [
  { rating: -10 },
  { rating: 0 },
  { rating: 1.2 },
  { rating: 2.8 },
  { rating: 5.5 },
  { rating: 999 },
];
// Clamped:
// -10 -> 1
// 0 -> 1
// 1.2 -> 1
// 2.8 -> 3
// 5.5 -> 5
// 999 -> 5
// Resulting distribution: 1: 3, 2: 0, 3: 1, 4: 0, 5: 2
const dist = calculateRatingDistribution(outOfBounds);
assert.deepStrictEqual(dist, { 1: 3, 2: 0, 3: 1, 4: 0, 5: 2 });
console.log('✓ Boundary clamping resilience passed');

// Stress 4: Precision and rounding behavior
const precisionTest = [
  { rating: 4.3333333333333 },
  { rating: 4.6666666666667 },
  { rating: 4.1 },
];
// Sum = 13.1, count = 3 -> 13.1 / 3 = 4.36666... -> rounded to 1 decimal place: 4.4
assert.strictEqual(calculateAverageRating(precisionTest), 4.4);
console.log('✓ Precision rounding passed (4.4)');

console.log('\nALL ADVERSARIAL STRESS TESTS PASSED!');
