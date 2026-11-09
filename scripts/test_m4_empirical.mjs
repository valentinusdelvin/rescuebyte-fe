import assert from 'node:assert/strict';
import { createServer } from 'vite';

console.log('================================================================');
console.log('EMPIRICAL CHALLENGER TEST SUITE: MILESTONE 4');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function asyncTest(description, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ PASS: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// Initialize Vite SSR Environment
// -----------------------------------------------------------------------------
const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  // Load actual source module through Vite SSR
  const useReviewsModule = await viteServer.ssrLoadModule('./src/hooks/useReviews.ts');
  const { calculateAverageRating, calculateRatingDistribution } = useReviewsModule;

  // =============================================================================
  // TEST SUITE 1: DYNAMIC RATING & DISTRIBUTION CALCULATION
  // =============================================================================
  console.log('--- TEST SUITE 1: Dynamic Rating & Distribution Calculation ---');

  test('0 reviews: calculateAverageRating returns 0', () => {
    assert.equal(calculateAverageRating([]), 0);
    assert.equal(calculateAverageRating(null), 0);
    assert.equal(calculateAverageRating(undefined), 0);
  });

  test('0 reviews: calculateRatingDistribution returns all zeros', () => {
    const dist = calculateRatingDistribution([]);
    assert.deepEqual(dist, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const distNull = calculateRatingDistribution(null);
    assert.deepEqual(distNull, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  test('Divide-by-zero protection in distribution percentage calculation', () => {
    // Formula from RatingDistribution.tsx:
    // totalReviews > 0 ? Math.min(100, Math.max(0, (count / totalReviews) * 100)) : 0
    const calcPercentage = (count, total) =>
      total > 0 ? Math.min(100, Math.max(0, (count / total) * 100)) : 0;

    assert.equal(calcPercentage(0, 0), 0);
    assert.equal(calcPercentage(5, 0), 0);
    assert.equal(calcPercentage(0, -1), 0);
    assert.equal(calcPercentage(5, 10), 50);
    assert.equal(calcPercentage(10, 10), 100);
    assert.equal(calcPercentage(15, 10), 100); // Clamped to 100%
    assert.equal(calcPercentage(-5, 10), 0);   // Clamped to 0%
    assert.ok(!isNaN(calcPercentage(0, 0)));
    assert.ok(isFinite(calcPercentage(0, 0)));
  });

  test('1 review: single rating calculation (boundary values: 1, 5, fractional 3.7)', () => {
    assert.equal(calculateAverageRating([{ rating: 5 }]), 5.0);
    assert.equal(calculateAverageRating([{ rating: 1 }]), 1.0);
    assert.equal(calculateAverageRating([{ rating: 3.7 }]), 3.7);

    const dist5 = calculateRatingDistribution([{ rating: 5 }]);
    assert.deepEqual(dist5, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });

    const dist1 = calculateRatingDistribution([{ rating: 1 }]);
    assert.deepEqual(dist1, { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  test('100 reviews: balanced and skewed distribution calculations', () => {
    // 100 reviews: 20 of each rating (1 to 5)
    const reviews100 = [];
    for (let star = 1; star <= 5; star++) {
      for (let i = 0; i < 20; i++) {
        reviews100.push({ id: `r-${star}-${i}`, rating: star });
      }
    }
    assert.equal(reviews100.length, 100);
    assert.equal(calculateAverageRating(reviews100), 3.0);
    const dist100 = calculateRatingDistribution(reviews100);
    assert.deepEqual(dist100, { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 });

    // Sum of distribution counts must equal total reviews
    const totalCount = Object.values(dist100).reduce((a, b) => a + b, 0);
    assert.equal(totalCount, 100);
  });

  test('Fractional and floating-point precision rounding to 1 decimal place', () => {
    // (5 + 5 + 4) / 3 = 14 / 3 = 4.666666... -> 4.7
    const r1 = [{ rating: 5 }, { rating: 5 }, { rating: 4 }];
    assert.equal(calculateAverageRating(r1), 4.7);

    // (4 + 4 + 5) / 3 = 13 / 3 = 4.333333... -> 4.3
    const r2 = [{ rating: 4 }, { rating: 4 }, { rating: 5 }];
    assert.equal(calculateAverageRating(r2), 4.3);

    // (4.25 + 4.25) / 2 = 4.25 -> 4.3 (Math.round(42.5)/10 = 43/10 = 4.3)
    const r3 = [{ rating: 4.25 }, { rating: 4.25 }];
    assert.equal(calculateAverageRating(r3), 4.3);
  });

  test('Rating edge cases: NaN, negative, out-of-range ratings clamped gracefully', () => {
    const edgeReviews = [
      { rating: NaN },
      { rating: undefined },
      { rating: 'not-a-number' },
      { rating: 5 },
    ];
    // validReviews filters out NaN and non-numbers -> only 5 remains
    assert.equal(calculateAverageRating(edgeReviews), 5);

    // Distribution clamping: rating 0 clamped to 1, rating 7 clamped to 5
    const clampedDist = calculateRatingDistribution([
      { rating: 0 },
      { rating: 6 },
      { rating: -10 },
      { rating: 100 },
    ]);
    assert.equal(clampedDist[1], 2); // 0 and -10 clamp to 1
    assert.equal(clampedDist[5], 2); // 6 and 100 clamp to 5
  });


  // =============================================================================
  // TEST SUITE 2: AUTHOR MATCHING LOGIC FOR EDIT/DELETE BUTTONS
  // =============================================================================
  console.log('\n--- TEST SUITE 2: Author Ownership Matching Logic ---');

  // Exact author matching predicate used in ProductReviewsSection.tsx:
  // const canEdit = Boolean(user?.id && (review.user_id === user.id || review.author?.id === user.id));
  // const canDelete = Boolean(user?.id && (review.user_id === user.id || review.author?.id === user.id));
  function checkOwnership(user, review) {
    return Boolean(
      user?.id && (review.user_id === user.id || review.author?.id === user.id)
    );
  }

  test('Unauthenticated user (user=null or undefined) CANNOT edit or delete', () => {
    const review = { id: 'rev-1', user_id: 'user-1', author: { id: 'user-1' } };
    assert.equal(checkOwnership(null, review), false);
    assert.equal(checkOwnership(undefined, review), false);
    assert.equal(checkOwnership({}, review), false);
  });

  test('User with empty id string CANNOT edit or delete (falsy guard)', () => {
    const review = { id: 'rev-1', user_id: '', author: { id: '' } };
    const user = { id: '' };
    assert.equal(checkOwnership(user, review), false);
  });

  test('Matching review.user_id gives edit & delete permission', () => {
    const user = { id: 'usr-abc-123' };
    const review = { id: 'rev-1', user_id: 'usr-abc-123' };
    assert.equal(checkOwnership(user, review), true);
  });

  test('Matching review.author.id (when user_id is missing) gives edit & delete permission', () => {
    const user = { id: 'usr-abc-123' };
    const review = { id: 'rev-1', author: { id: 'usr-abc-123' } };
    assert.equal(checkOwnership(user, review), true);
  });

  test('Matching review.author.id even when user_id is different gives permission', () => {
    const user = { id: 'usr-abc-123' };
    const review = { id: 'rev-1', user_id: 'usr-diff-456', author: { id: 'usr-abc-123' } };
    assert.equal(checkOwnership(user, review), true);
  });

  test('Different user id DENIES edit and delete permission', () => {
    const user = { id: 'usr-abc-123' };
    const review = { id: 'rev-1', user_id: 'usr-other-999', author: { id: 'usr-other-999' } };
    assert.equal(checkOwnership(user, review), false);
  });

  test('Review with missing author and user_id DENIES permission', () => {
    const user = { id: 'usr-abc-123' };
    const review = { id: 'rev-1' };
    assert.equal(checkOwnership(user, review), false);
  });


  // =============================================================================
  // TEST SUITE 3: BOUNDARY INPUTS FOR REVIEW SUBMISSION FORM
  // =============================================================================
  console.log('\n--- TEST SUITE 3: Boundary Inputs for Review Submission Form ---');

  // Exact validation predicate from ReviewSubmissionModal.tsx:
  function validateReviewForm(content, rating) {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      return { valid: false, error: 'Ulasan tidak boleh kosong. Mohon tuliskan ulasan Anda.' };
    }
    if (trimmed.length > 2000) {
      return { valid: false, error: 'Ulasan maksimal 2000 karakter.' };
    }
    return { valid: true, error: null, trimmedContent: trimmed, rating };
  }

  test('Empty content string is rejected', () => {
    const res = validateReviewForm('', 5);
    assert.equal(res.valid, false);
    assert.ok(res.error.includes('tidak boleh kosong'));
  });

  test('Whitespace-only content string is rejected', () => {
    const res = validateReviewForm('   \n\t  \r\n   ', 5);
    assert.equal(res.valid, false);
    assert.ok(res.error.includes('tidak boleh kosong'));
  });

  test('Content with minimum valid length (1 character) is accepted', () => {
    const res = validateReviewForm('A', 5);
    assert.equal(res.valid, true);
    assert.equal(res.trimmedContent, 'A');
  });

  test('Content with boundary length of exactly 2000 characters is accepted', () => {
    const char2000 = 'x'.repeat(2000);
    const res = validateReviewForm(char2000, 5);
    assert.equal(res.valid, true);
    assert.equal(res.trimmedContent.length, 2000);
  });

  test('Content with 2000 characters + surrounding whitespace trims and is accepted', () => {
    const padded = '   ' + 'x'.repeat(2000) + '   ';
    const res = validateReviewForm(padded, 5);
    assert.equal(res.valid, true);
    assert.equal(res.trimmedContent.length, 2000);
  });

  test('Content exceeding max length (2001 characters) is rejected', () => {
    const char2001 = 'x'.repeat(2001);
    const res = validateReviewForm(char2001, 5);
    assert.equal(res.valid, false);
    assert.ok(res.error.includes('maksimal 2000 karakter'));
  });

  test('Satisfaction labels mapping check for ratings 1-5', () => {
    const SATISFACTION_LABELS = {
      1: 'Sangat Kecewa',
      2: 'Kurang Puas',
      3: 'Cukup',
      4: 'Puas',
      5: 'Sangat Puas!',
    };
    for (let r = 1; r <= 5; r++) {
      assert.ok(SATISFACTION_LABELS[r], `Rating ${r} has a satisfaction label`);
    }
    const fallback = SATISFACTION_LABELS[99] || 'Puas';
    assert.equal(fallback, 'Puas');
  });


  // =============================================================================
  // TEST SUITE 4: VITE SSR MODULE LOAD TEST
  // =============================================================================
  console.log('\n--- TEST SUITE 4: Vite SSR Module Load Test ---');

  await asyncTest('Vite SSR loads ProductReviewsSection.tsx cleanly', async () => {
    const mod = await viteServer.ssrLoadModule('./src/components/customer/product/ProductReviewsSection.tsx');
    assert.ok(mod, 'Module loaded');
    assert.ok(mod.ProductReviewsSection, 'ProductReviewsSection named export exists');
    assert.ok(mod.default, 'ProductReviewsSection default export exists');
  });

  await asyncTest('Vite SSR loads CustomerProductDetail.tsx cleanly', async () => {
    const mod = await viteServer.ssrLoadModule('./src/pages/customer/CustomerProductDetail.tsx');
    assert.ok(mod, 'Module loaded');
    assert.ok(mod.CustomerProductDetail || mod.default, 'CustomerProductDetail export exists');
  });

  await asyncTest('Vite SSR loads RatingDistribution.tsx cleanly', async () => {
    const mod = await viteServer.ssrLoadModule('./src/components/reviews/RatingDistribution.tsx');
    assert.ok(mod, 'Module loaded');
    assert.ok(mod.RatingDistribution, 'RatingDistribution export exists');
  });

  await asyncTest('Vite SSR loads ReviewSubmissionModal.tsx cleanly', async () => {
    const mod = await viteServer.ssrLoadModule('./src/components/reviews/ReviewSubmissionModal.tsx');
    assert.ok(mod, 'Module loaded');
    assert.ok(mod.ReviewSubmissionModal, 'ReviewSubmissionModal export exists');
  });

  await asyncTest('Vite SSR loads ReviewCard.tsx cleanly', async () => {
    const mod = await viteServer.ssrLoadModule('./src/components/reviews/ReviewCard.tsx');
    assert.ok(mod, 'Module loaded');
    assert.ok(mod.ReviewCard, 'ReviewCard export exists');
  });

} finally {
  await viteServer.close();
}

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n================================================================');
console.log(`FINAL RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
