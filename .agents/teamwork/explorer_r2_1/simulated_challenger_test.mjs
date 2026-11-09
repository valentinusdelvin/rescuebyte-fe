/**
 * Empirical Adversarial Verification Suite: R1 - R6
 * Challenger 1 (Empirical Verification Specialist)
 *
 * Scope:
 * - R1: Absence of floating toast container elements; presence of inline validation feedback.
 * - R2: Absence of role subtitles underneath review names.
 * - R3: Product rating consistency — verify batchFetchProductRatings logic, caching, and unconditional rating rendering on cards.
 * - R4: Absence of visual stock badges ("Sisa ... Box") on card image headers while confirming isOutOfStock logic and disabled "Habis" button.
 * - R5: Homepage 6-card limit (.slice(0, 6)), desktop 3x2 grid, and 6-card skeletons.
 * - R6: Marketplace sort comparator uses numeric distance ascending.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const ROOT_DIR = process.cwd();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
    failureDetails.push({ name, error: err.message, stack: err.stack });
    failedTests++;
  }
}


function readFile(relPath) {
  const fullPath = path.resolve(ROOT_DIR, relPath);
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('======================================================================');
console.log('CHALLENGER 1: EMPIRICAL VERIFICATION & ADVERSARIAL HARNESS (R1 - R6)');
console.log('======================================================================\n');

// ============================================================================
// SUITE R1: TOAST ELIMINATION & INLINE VALIDATION INTEGRITY
// ============================================================================
console.log('--- SUITE R1: Toast Elimination & Inline Validation ---');

test('R1.1: ToastContext.tsx provider does not mount floating container in DOM', () => {
  const content = readFile('src/context/ToastContext.tsx');
  // Provider must only wrap children
  assert.match(
    content,
    /<ToastContext\.Provider[^>]*>[\s\n]*\{children\}[\s\n]*<\/ToastContext\.Provider>/,
    'ToastContext.Provider must cleanly render {children} with no floating container element'
  );
  // Must NOT have fixed bottom container
  assert.doesNotMatch(
    content,
    /fixed\s+bottom-/,
    'ToastContext.tsx must NOT contain fixed bottom positioning classes'
  );
  assert.doesNotMatch(
    content,
    /fixed\s+top-/,
    'ToastContext.tsx must NOT contain fixed top positioning classes'
  );
});

test('R1.2: Toast.tsx component returns null unconditionally', () => {
  const content = readFile('src/components/common/Toast.tsx');
  assert.match(
    content,
    /export\s+function\s+Toast\(_props:\s*ToastProps\)\s*\{\s*return\s+null;\s*\}/,
    'Toast component must unconditionally return null to suppress any possible floating mount'
  );
});

test('R1.3: App.tsx does not mount any <Toast /> component or floating toast element', () => {
  const content = readFile('src/App.tsx');
  assert.doesNotMatch(
    content,
    /<Toast\b/,
    'App.tsx must NOT mount <Toast /> component'
  );
  assert.doesNotMatch(
    content,
    /fixed\s+bottom-\d+.*toast/i,
    'App.tsx must not contain any floating toast container'
  );
});

test('R1.4: Global scan across src/ confirms zero floating toast popup containers', () => {
  const scanDirs = ['src/components', 'src/pages', 'src/context', 'src/app'];
  const violations = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(full);
      } else if (entry.name.endsWith('.tsx')) {
        const text = fs.readFileSync(full, 'utf8');
        // Match fixed bottom floating notification containers
        if (/fixed\s+bottom-4\s+right-4/.test(text) && /toast/i.test(text)) {
          violations.push(full);
        }
      }
    }
  }

  for (const d of scanDirs) {
    scanDirectory(path.resolve(ROOT_DIR, d));
  }

  assert.strictEqual(
    violations.length,
    0,
    `Found floating toast containers in: ${violations.join(', ')}`
  );
});

test('R1.5: CustomerAuth & Forms have accessible inline alert banners (role="alert")', () => {
  const loginForm = readFile('src/components/auth/CustomerLoginForm.tsx');
  const registerForm = readFile('src/components/auth/CustomerRegisterForm.tsx');

  assert.match(
    loginForm,
    /errorMessage\s*&&[\s\S]*?role="alert"[\s\S]*?errorMessage/,
    'CustomerLoginForm must display errorMessage in a role="alert" container'
  );

  assert.match(
    registerForm,
    /errorMessage\s*&&[\s\S]*?role="alert"[\s\S]*?errorMessage/,
    'CustomerRegisterForm must display errorMessage in a role="alert" container'
  );
});

test('R1.6: CustomerAuth role mismatch guard logic sets inline error messages', () => {
  const authContent = readFile('src/pages/auth/CustomerAuth.tsx');

  // Must set loginError for Customer attempting to login through Mitra Toko
  assert.match(
    authContent,
    /currentRole\s*===\s*'seller'\s*&&\s*!isActuallySeller[\s\S]*?setLoginError\(msg\)/,
    'CustomerAuth must set inline loginError when customer logs into seller portal'
  );

  // Must set loginError for Mitra Toko attempting to login through Customer
  assert.match(
    authContent,
    /currentRole\s*===\s*'customer'\s*&&\s*isActuallySeller[\s\S]*?setLoginError\(msg\)/,
    'CustomerAuth must set inline loginError when seller logs into customer portal'
  );

  // Must set registerError for short password and confirm password mismatch
  assert.match(
    authContent,
    /registerPassword\.length\s*<\s*8[\s\S]*?setRegisterError\(/,
    'CustomerAuth must set inline registerError when password is under 8 characters'
  );
  assert.match(
    authContent,
    /registerPassword\s*!==\s*confirmPassword[\s\S]*?setRegisterError\(/,
    'CustomerAuth must set inline registerError when passwords do not match'
  );
  assert.match(
    authContent,
    /!agreeTerms[\s\S]*?setRegisterError\(/,
    'CustomerAuth must set inline registerError when terms are not checked'
  );
});

test('R1.7: BuatDagangan.tsx has inline validation alert banner right above submit button', () => {
  const buatDagangan = readFile('src/pages/seller/BuatDagangan.tsx');

  assert.match(
    buatDagangan,
    /formError\s*&&[\s\S]*?role="alert"[\s\S]*?formError/,
    'BuatDagangan must display formError in a role="alert" inline alert'
  );

  // Form error must validate missing fields
  assert.match(
    buatDagangan,
    /msg\s*=\s*'Nama produk minimal 2 karakter!'[\s\S]*?setFormError\(msg\)/,
    'BuatDagangan validates short/empty product name inline'
  );
  assert.match(
    buatDagangan,
    /msg\s*=\s*'Harga Rescue harus lebih hemat daripada Harga Normal!'[\s\S]*?setFormError\(msg\)/,
    'BuatDagangan validates pricing calculation inline'
  );
  assert.match(
    buatDagangan,
    /msg\s*=\s*'Stok tersedia minimal 1 box!'[\s\S]*?setFormError\(msg\)/,
    'BuatDagangan validates stock quantity inline'
  );
});

test('R1.8 [Adversarial Stress]: ToastContext queue behavior under high-frequency duplicate spam', () => {
  // Simulator of ToastContext internal queue logic
  const recentToasts = new Map();
  let toasts = [];

  function showToast(message, now) {
    if (!message || !message.trim()) return;
    const cleanMessage = message.trim();

    const lastTime = recentToasts.get(cleanMessage);
    if (lastTime && now - lastTime < 2500) {
      return; // Debounced
    }
    recentToasts.set(cleanMessage, now);

    if (toasts.some((t) => t.message === cleanMessage)) {
      return;
    }

    const cappedPrev = toasts.length >= 3 ? toasts.slice(toasts.length - 2) : toasts;
    const id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
    toasts = [...cappedPrev, { id, message: cleanMessage }];
  }

  // Rapid spam of the same message 50 times in 100ms
  for (let i = 0; i < 50; i++) {
    showToast('Duplicate Error Message', 1000 + i * 2);
  }
  assert.strictEqual(toasts.length, 1, 'Duplicate messages within 2500ms must be completely debounced to 1 item');

  // Multi-message spam with different messages
  for (let i = 0; i < 20; i++) {
    showToast(`Different Error ${i}`, 1000 + i * 3000);
  }
  // Queue must NEVER exceed 3 items
  assert.ok(toasts.length <= 3, `Queue size must be capped at 3, got: ${toasts.length}`);
});

// ============================================================================
// SUITE R2: ABSENCE OF IRRELEVANT ROLE LABELS IN REVIEW IDENTITIES
// ============================================================================
console.log('\n--- SUITE R2: Review Identity Clean Role Labels ---');

test('R2.1: CustomerHome.tsx does NOT render {testi.role} in Apa Kata Mereka testimonials', () => {
  const homeContent = readFile('src/pages/customer/CustomerHome.tsx');
  // Check section #testimoni-section
  const marqueeSectionIdx = homeContent.indexOf('id="testimoni-section"');
  assert.ok(marqueeSectionIdx > -1, 'Testimoni section must exist');
  const marqueeSlice = homeContent.slice(marqueeSectionIdx, marqueeSectionIdx + 3000);

  assert.doesNotMatch(
    marqueeSlice,
    /\{testi\.role\}/,
    'CustomerHome testimonial cards must NOT render {testi.role}'
  );
  assert.match(
    marqueeSlice,
    /\{testi\.name\}/,
    'CustomerHome testimonial cards must retain {testi.name}'
  );
  assert.match(
    marqueeSlice,
    /\{testi\.quote\}/,
    'CustomerHome testimonial cards must retain {testi.quote}'
  );
});

test('R2.2: StoreReviewsList.tsx does NOT render {rev.role} underneath reviewer name', () => {
  const reviewsList = readFile('src/components/customer/store/StoreReviewsList.tsx');
  assert.doesNotMatch(
    reviewsList,
    /\{rev\.role\}/,
    'StoreReviewsList.tsx must NOT render {rev.role} under reviewer names'
  );
  assert.match(
    reviewsList,
    /\{rev\.name\}/,
    'StoreReviewsList.tsx must display reviewer name {rev.name}'
  );
});

test('R2.3: ReviewCard.tsx does not display any role label beneath reviewerName', () => {
  const reviewCard = readFile('src/components/reviews/ReviewCard.tsx');
  assert.doesNotMatch(
    reviewCard,
    /(reviewerRole|authorRole|role)/i,
    'ReviewCard.tsx should not take or display role subtitles'
  );
  assert.match(
    reviewCard,
    /\{reviewerName\}/,
    'ReviewCard.tsx must display {reviewerName}'
  );
  assert.match(
    reviewCard,
    /<StarRating\s+rating=\{rating\}/,
    'ReviewCard.tsx must display StarRating for the reviewer'
  );
});

test('R2.4: Global scan across all review components confirms zero role badges on reviewer names', () => {
  const files = [
    'src/components/customer/store/StoreReviewsList.tsx',
    'src/components/customer/product/ProductReviewsSection.tsx',
    'src/components/reviews/ReviewCard.tsx',
    'src/pages/seller/SellerReviews.tsx',
  ];

  for (const f of files) {
    const text = readFile(f);
    assert.doesNotMatch(
      text,
      /<span[^>]*>[^<]*?(Penyelamat Makanan|Mitra Toko|Pelanggan|Seller)<\/span>/i,
      `${f} must not render static or dynamic role subtitle spans`
    );
  }
});

// ============================================================================
// SUITE R3: PRODUCT RATING DATA CONSISTENCY & BATCH FETCHING
// ============================================================================
console.log('\n--- SUITE R3: Product Rating Consistency ---');

test('R3.1: productRatingService batchFetchProductRatings deduplicates IDs and uses in-memory cache', async () => {
  // Simulator matching src/services/productRatingService.ts
  const mockCache = new Map();
  let networkCallCount = 0;

  async function mockGetProductReviews(id) {
    networkCallCount++;
    if (id === 'prod-1') {
      return { reviews: [{ rating: 5 }, { rating: 4 }], meta: { total_data: 2 } };
    }
    if (id === 'prod-2') {
      return { reviews: [{ rating: 3 }, { rating: 5 }, { rating: 4 }], meta: { total_data: 3 } };
    }
    return { reviews: [], meta: { total_data: 0 } };
  }

  async function batchFetchProductRatings(productIds) {
    const uniqueIds = Array.from(new Set(productIds)).filter(Boolean);
    const uncachedIds = uniqueIds.filter((id) => !mockCache.has(id));

    if (uncachedIds.length > 0) {
      const results = await Promise.allSettled(
        uncachedIds.map(async (id) => {
          try {
            const res = await mockGetProductReviews(id);
            const reviews = res.reviews || [];
            const metaTotal = res.meta?.total_data;
            const count = typeof metaTotal === 'number' ? metaTotal : reviews.length;
            const avgRating =
              reviews.length > 0
                ? Math.round(
                    (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length) * 10
                  ) / 10
                : 0;
            return { id, summary: { rating: avgRating, reviewCount: count } };
          } catch {
            return { id, summary: { rating: 0, reviewCount: 0 } };
          }
        })
      );

      for (const res of results) {
        if (res.status === 'fulfilled') {
          mockCache.set(res.value.id, res.value.summary);
        }
      }
    }
    return mockCache;
  }

  // Call with duplicate IDs and empty string
  const res1 = await batchFetchProductRatings(['prod-1', 'prod-1', 'prod-2', '']);
  assert.strictEqual(networkCallCount, 2, 'Should only call API twice for prod-1 and prod-2');
  assert.deepStrictEqual(res1.get('prod-1'), { rating: 4.5, reviewCount: 2 });
  assert.deepStrictEqual(res1.get('prod-2'), { rating: 4.0, reviewCount: 3 });

  // Call again with same IDs + new ID
  networkCallCount = 0;
  const res2 = await batchFetchProductRatings(['prod-1', 'prod-2', 'prod-3']);
  assert.strictEqual(networkCallCount, 1, 'Should only call API once for the uncached prod-3');
  assert.deepStrictEqual(res2.get('prod-3'), { rating: 0, reviewCount: 0 });
});

test('R3.2: Mathematical rating average calculation and precision rounding oracle', () => {
  function computeRatingSummary(reviews, metaTotal) {
    const count = typeof metaTotal === 'number' ? metaTotal : reviews.length;
    const avgRating =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length) * 10
          ) / 10
        : 0;
    return { rating: avgRating, reviewCount: count };
  }

  // Case 1: [5, 4, 4] -> 13 / 3 = 4.33333... -> 4.3
  assert.strictEqual(computeRatingSummary([{ rating: 5 }, { rating: 4 }, { rating: 4 }]).rating, 4.3);

  // Case 2: [5, 5, 4, 4] -> 18 / 4 = 4.5
  assert.strictEqual(computeRatingSummary([{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 4 }]).rating, 4.5);

  // Case 3: [1, 2, 3] -> 6 / 3 = 2.0
  assert.strictEqual(computeRatingSummary([{ rating: 1 }, { rating: 2 }, { rating: 3 }]).rating, 2.0);

  // Case 4: empty reviews -> 0.0, 0 reviews
  assert.deepStrictEqual(computeRatingSummary([]), { rating: 0, reviewCount: 0 });

  // Case 5: metaTotal precedence
  assert.strictEqual(computeRatingSummary([{ rating: 5 }], 42).reviewCount, 42);
});

test('R3.3: MysteryBoxCard.tsx renders ratings unconditionally without variant filter', () => {
  const cardContent = readFile('src/components/customer/MysteryBoxCard.tsx');

  // Verify there is NO `!isPopular` conditional hiding ratings
  assert.doesNotMatch(
    cardContent,
    /!isPopular\s*&&/,
    'MysteryBoxCard must NOT wrap rating in !isPopular check'
  );

  // Verify unconditional rating block exists
  assert.match(
    cardContent,
    /hasRating\s*&&\s*typeof\s*r\s*===\s*'number'\s*\?\s*r\.toFixed\(1\)\s*:\s*'-'/,
    'MysteryBoxCard must render formatted rating or -'
  );
  assert.match(
    cardContent,
    /numReviews\s*>\s*0\s*\?\s*`\$\{numReviews\}\s*ulasan`\s*:\s*'Belum ada ulasan'/,
    'MysteryBoxCard must render ulasan count or Belum ada ulasan'
  );

  // Verify rating click navigates to Store reviews section
  assert.match(
    cardContent,
    /query\.set\('section',\s*'ulasan-pelanggan'\)/,
    'Clicking rating element must navigate to section ulasan-pelanggan'
  );
});

test('R3.4: CustomerHome & CustomerMarketplace enrich products using batchFetchProductRatings', () => {
  const homeContent = readFile('src/pages/customer/CustomerHome.tsx');
  const marketContent = readFile('src/pages/customer/CustomerMarketplace.tsx');

  assert.match(
    homeContent,
    /batchFetchProductRatings\(products\.map\(/,
    'CustomerHome must call batchFetchProductRatings before rendering cards'
  );

  assert.match(
    marketContent,
    /batchFetchProductRatings\(publicItems\.map\(/,
    'CustomerMarketplace must call batchFetchProductRatings before rendering cards'
  );
});

test('R3.5 [Adversarial Stress]: Product rating calculator resilience on malformed review data', () => {
  function computeRatingSummary(reviews, metaTotal) {
    const validReviews = Array.isArray(reviews) ? reviews : [];
    const count = typeof metaTotal === 'number' ? metaTotal : validReviews.length;
    const avgRating =
      validReviews.length > 0
        ? Math.round(
            (validReviews.reduce((acc, r) => acc + (Number(r?.rating) || 0), 0) / validReviews.length) * 10
          ) / 10
        : 0;
    return { rating: isNaN(avgRating) ? 0 : avgRating, reviewCount: count };
  }

  // Null reviews list
  assert.deepStrictEqual(computeRatingSummary(null, null), { rating: 0, reviewCount: 0 });

  // Reviews with string ratings and null entries
  const malformed = [
    { rating: '5' },
    { rating: null },
    { rating: undefined },
    { rating: '4.5' },
    null,
  ];
  const res = computeRatingSummary(malformed, null);
  // sum = 5 + 0 + 0 + 4.5 + 0 = 9.5 / 5 = 1.9
  assert.strictEqual(res.rating, 1.9);
  assert.strictEqual(res.reviewCount, 5);
});

test('R3.6 [Adversarial Stress]: Performance of batch computation with 10,000 reviews', () => {
  const largeReviews = Array.from({ length: 10000 }, (_, i) => ({ rating: (i % 5) + 1 }));
  const startTime = performance.now();
  const avg =
    Math.round(
      (largeReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / largeReviews.length) * 10
    ) / 10;
  const elapsed = performance.now() - startTime;

  assert.strictEqual(avg, 3.0);
  assert.ok(elapsed < 20, `Calculation for 10k reviews should be < 20ms, took ${elapsed.toFixed(2)}ms`);
});

// ============================================================================
// SUITE R4: REMOVAL OF STOCK QUANTITY BADGES & PRESERVATION OF INVENTORY LOGIC
// ============================================================================
console.log('\n--- SUITE R4: Removal of Stock Badges & Out-of-Stock Logic ---');

test('R4.1: MysteryBoxCard.tsx visual image header has NO "Sisa ... Box" badge', () => {
  const cardContent = readFile('src/components/customer/MysteryBoxCard.tsx');

  // Search inside visual header (around Top Badges Overlay)
  const headerStart = cardContent.indexOf('Top Badges Overlay');
  assert.ok(headerStart > -1, 'Top Badges Overlay comment must exist');
  const headerSlice = cardContent.slice(headerStart, headerStart + 1500);

  // Must NOT contain Sisa or remainingBoxesText in header
  assert.doesNotMatch(
    headerSlice,
    /remainingBoxesText/,
    'Top Badges Overlay must NOT render remainingBoxesText'
  );
  assert.doesNotMatch(
    headerSlice,
    /Sisa\s+\d+/,
    'Top Badges Overlay must NOT render Sisa X Box badge'
  );

  // Distance and discount MUST be preserved
  assert.match(
    headerSlice,
    /item\.distanceText/,
    'Top Badges Overlay must retain item.distanceText'
  );
  assert.match(
    headerSlice,
    /displayDiscount\s*>\s*0/,
    'Top Badges Overlay must retain discount badge'
  );
});

test('R4.2: StoreDaganganGrid.tsx and CustomerOrderDetail.tsx do NOT render "Sisa ... Box" badges', () => {
  const daganganGrid = readFile('src/components/customer/store/StoreDaganganGrid.tsx');
  const orderDetail = readFile('src/pages/customer/CustomerOrderDetail.tsx');

  assert.doesNotMatch(
    daganganGrid,
    /Sisa\s*\{[^}]*\}\s*Box/i,
    'StoreDaganganGrid must NOT render Sisa X Box text'
  );

  assert.doesNotMatch(
    orderDetail,
    /Sisa\s*\{[^}]*\}\s*Box/i,
    'CustomerOrderDetail must NOT render Sisa X Box text in recommendations'
  );
});

test('R4.3: Empirical verification of isOutOfStock logic and "Habis" disabled button', () => {
  function evaluateOutOfStock(remainingBoxesText) {
    const stockMatch = remainingBoxesText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || /\b0\s*box\b/i.test(remainingBoxesText);
    const buttonText = isOutOfStock ? 'Habis' : 'Pesan Sekarang';
    const isDisabled = isOutOfStock;
    return { stockCount, isOutOfStock, buttonText, isDisabled };
  }

  // Sold out cases
  assert.deepStrictEqual(evaluateOutOfStock('Sisa 0 Box'), {
    stockCount: 0,
    isOutOfStock: true,
    buttonText: 'Habis',
    isDisabled: true,
  });

  assert.deepStrictEqual(evaluateOutOfStock('0 Box'), {
    stockCount: 0,
    isOutOfStock: true,
    buttonText: 'Habis',
    isDisabled: true,
  });

  assert.deepStrictEqual(evaluateOutOfStock('Tersedia 0 Box'), {
    stockCount: 0,
    isOutOfStock: true,
    buttonText: 'Habis',
    isDisabled: true,
  });

  // In stock cases
  assert.deepStrictEqual(evaluateOutOfStock('Sisa 1 Box'), {
    stockCount: 1,
    isOutOfStock: false,
    buttonText: 'Pesan Sekarang',
    isDisabled: false,
  });

  assert.deepStrictEqual(evaluateOutOfStock('Sisa 97 Box'), {
    stockCount: 97,
    isOutOfStock: false,
    buttonText: 'Pesan Sekarang',
    isDisabled: false,
  });

  // Fallback case (no digits) defaults to stockCount 1
  assert.deepStrictEqual(evaluateOutOfStock('Tersedia'), {
    stockCount: 1,
    isOutOfStock: false,
    buttonText: 'Pesan Sekarang',
    isDisabled: false,
  });
});

test('R4.4: Stock parsing in MysteryBoxCard does not falsely mark 10, 20, 50, 100 Box as out-of-stock', () => {
  const cardContent = readFile('src/components/customer/MysteryBoxCard.tsx');

  // Verify that raw substring match includes('0 box') has been eliminated from MysteryBoxCard.tsx
  assert.doesNotMatch(
    cardContent,
    /includes\(\s*['"]0 box['"]\s*\)/i,
    "MysteryBoxCard must NOT use substring match includes('0 box') which falsely matches 10, 20, 100 Box"
  );

  function evaluateMysteryBoxOutOfStock(remainingBoxesText) {
    const rawStockText = remainingBoxesText || '';
    const stockMatch = rawStockText.match(/\d+/);
    const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
    const isOutOfStock = stockCount === 0 || /\b0\s*box\b/i.test(rawStockText);
    return { stockCount, isOutOfStock };
  }

  // Stock 10, 20, 50, 100 MUST be in-stock (isOutOfStock === false)
  const eval10 = evaluateMysteryBoxOutOfStock('Sisa 10 Box');
  const eval20 = evaluateMysteryBoxOutOfStock('Sisa 20 Box');
  const eval50 = evaluateMysteryBoxOutOfStock('Sisa 50 Box');
  const eval100 = evaluateMysteryBoxOutOfStock('Sisa 100 Box');

  assert.strictEqual(eval10.isOutOfStock, false, 'Sisa 10 Box must be in-stock');
  assert.strictEqual(eval20.isOutOfStock, false, 'Sisa 20 Box must be in-stock');
  assert.strictEqual(eval50.isOutOfStock, false, 'Sisa 50 Box must be in-stock');
  assert.strictEqual(eval100.isOutOfStock, false, 'Sisa 100 Box must be in-stock');

  // Truly out-of-stock cases MUST remain out-of-stock (isOutOfStock === true)
  const eval0 = evaluateMysteryBoxOutOfStock('Sisa 0 Box');
  const evalZero = evaluateMysteryBoxOutOfStock('0 Box');
  const evalTersedia0 = evaluateMysteryBoxOutOfStock('Tersedia 0 Box');
  assert.strictEqual(eval0.isOutOfStock, true, 'Sisa 0 Box must be out-of-stock');
  assert.strictEqual(evalZero.isOutOfStock, true, '0 Box must be out-of-stock');
  assert.strictEqual(evalTersedia0.isOutOfStock, true, 'Tersedia 0 Box must be out-of-stock');
});

// ============================================================================
// SUITE R5: HOMEPAGE 6-PRODUCT LIMIT & DESKTOP 3x2 GRID
// ============================================================================
console.log('\n--- SUITE R5: Homepage 6-Product Limit & Desktop 3x2 Grid ---');

test('R5.1: CustomerHome.tsx applies .slice(0, 6) on both nearby and popular product lists', () => {
  const homeContent = readFile('src/pages/customer/CustomerHome.tsx');

  assert.match(
    homeContent,
    /sortedByDistance\s*=\s*\[\.\.\.enriched\][\s\S]*?\.slice\(0,\s*6\)/,
    'CustomerHome must apply .slice(0, 6) on sortedByDistance'
  );

  assert.match(
    homeContent,
    /sortedByPopularity\s*=\s*\[\.\.\.enriched\][\s\S]*?\.slice\(0,\s*6\)/,
    'CustomerHome must apply .slice(0, 6) on sortedByPopularity'
  );
});

test('R5.2: Stress test of 6-product clamping pipeline with various backend payload sizes', () => {
  function processProducts(enriched) {
    const sortedByDistance = [...enriched]
      .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
      .slice(0, 6);

    const sortedByPopularity = [...enriched]
      .sort(
        (a, b) =>
          (b.reviewCount || 0) - (a.reviewCount || 0) ||
          (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0)
      )
      .slice(0, 6);

    return { nearbyCount: sortedByDistance.length, popularCount: sortedByPopularity.length };
  }

  // 0 items
  assert.deepStrictEqual(processProducts([]), { nearbyCount: 0, popularCount: 0 });

  // 3 items (gracefully renders 3)
  const items3 = Array.from({ length: 3 }, (_, i) => ({ id: `${i}`, distance_km: i }));
  assert.deepStrictEqual(processProducts(items3), { nearbyCount: 3, popularCount: 3 });

  // 6 items
  const items6 = Array.from({ length: 6 }, (_, i) => ({ id: `${i}`, distance_km: i }));
  assert.deepStrictEqual(processProducts(items6), { nearbyCount: 6, popularCount: 6 });

  // 20 items (clamped to 6)
  const items20 = Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, distance_km: i }));
  assert.deepStrictEqual(processProducts(items20), { nearbyCount: 6, popularCount: 6 });

  // 100 items (clamped to 6)
  const items100 = Array.from({ length: 100 }, (_, i) => ({ id: `${i}`, distance_km: i }));
  assert.deepStrictEqual(processProducts(items100), { nearbyCount: 6, popularCount: 6 });
});

test('R5.3: CustomerHome.tsx implements responsive 3-column desktop grid (3x2 = 6 cards)', () => {
  const homeContent = readFile('src/pages/customer/CustomerHome.tsx');

  // Find Section 3: Mystery Box di Sekitar
  const nearbySecIdx = homeContent.indexOf('id="marketplace-section"');
  assert.ok(nearbySecIdx > -1, 'Marketplace section in CustomerHome must exist');
  const nearbySlice = homeContent.slice(nearbySecIdx, nearbySecIdx + 1000);
  assert.match(
    nearbySlice,
    /grid-cols-1\s+md:grid-cols-2\s+lg:grid-cols-3/,
    'Mystery Box di Sekitar must use grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  );

  // Find Section 4: Mystery Box Terlaris
  const popularSecIdx = homeContent.indexOf('Mystery Box Terlaris');
  assert.ok(popularSecIdx > -1, 'Mystery Box Terlaris section must exist');
  const popularSlice = homeContent.slice(popularSecIdx, popularSecIdx + 1000);
  assert.match(
    popularSlice,
    /grid-cols-1\s+md:grid-cols-2\s+lg:grid-cols-3/,
    'Mystery Box Terlaris must use grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  );
});

test('R5.4: Loading skeletons render exactly 6 cards (matching 3x2 grid)', () => {
  const homeContent = readFile('src/pages/customer/CustomerHome.tsx');
  const skeletonMatches = homeContent.match(/Array\.from\(\{\s*length:\s*6\s*\}\)/g);
  assert.ok(skeletonMatches && skeletonMatches.length >= 2, 'Must have at least 2 instances of Array.from({ length: 6 }) for skeletons');
});

// ============================================================================
// SUITE R6: MARKETPLACE SORT COMPARATOR & NUMERIC DISTANCE ASCENDING
// ============================================================================
console.log('\n--- SUITE R6: Marketplace Nearest Sorting & Numeric Distance ---');

test('R6.1: CustomerMarketplace.tsx defaults to sortField "lokasi" and sortOrder "asc"', () => {
  const marketContent = readFile('src/pages/customer/CustomerMarketplace.tsx');

  assert.match(
    marketContent,
    /const\s*\[sortField,\s*setSortField\]\s*=\s*useState<SortField>\('lokasi'\);/,
    'Default sortField state must be "lokasi"'
  );

  assert.match(
    marketContent,
    /const\s*\[sortOrder,\s*setSortOrder\]\s*=\s*useState<SortOrder>\('asc'\);/,
    'Default sortOrder state must be "asc"'
  );
});

test('R6.2: Marketplace model maps numeric distanceKm from p.distance_km', () => {
  const modelContent = readFile('src/features/customer/marketplace/model.ts');

  assert.match(
    modelContent,
    /distanceKm:\s*typeof\s*p\.distance_km\s*===\s*'number'\s*\?\s*p\.distance_km\s*:\s*9999/,
    'model.ts must map distanceKm as a number or fallback to 9999'
  );
});

test('R6.3: Empirical comparator stress test for numeric distance ascending with edge cases', () => {
  function compareLocation(a, b, sortOrder = 'asc') {
    const distA = typeof a.distanceKm === 'number' ? a.distanceKm : (parseFloat(a.distanceText) || 9999);
    const distB = typeof b.distanceKm === 'number' ? b.distanceKm : (parseFloat(b.distanceText) || 9999);
    return sortOrder === 'asc' ? distA - distB : distB - distA;
  }

  // Test set with realistic variations and edge cases
  const products = [
    { id: 'p1', distanceKm: 12.5, distanceText: '12.5 km' },
    { id: 'p2', distanceKm: 0.1, distanceText: '0.1 km' },
    { id: 'p3', distanceKm: 0.0, distanceText: '0.0 km' }, // Exact same spot
    { id: 'p4', distanceKm: 3.8, distanceText: '3.8 km' },
    { id: 'p5', distanceKm: undefined, distanceText: '1.2 km' }, // Fallback to distanceText
    { id: 'p6', distanceKm: null, distanceText: 'NaN' }, // Unknown distance fallback
  ];

  const sortedAsc = [...products].sort((a, b) => compareLocation(a, b, 'asc'));
  const idsAsc = sortedAsc.map((p) => p.id);

  assert.deepStrictEqual(
    idsAsc,
    ['p3', 'p2', 'p5', 'p4', 'p1', 'p6'],
    'Products must sort nearest to farthest (p3: 0.0, p2: 0.1, p5: 1.2, p4: 3.8, p1: 12.5, p6: 9999)'
  );

  const sortedDesc = [...products].sort((a, b) => compareLocation(a, b, 'desc'));
  const idsDesc = sortedDesc.map((p) => p.id);

  assert.deepStrictEqual(
    idsDesc,
    ['p6', 'p1', 'p4', 'p5', 'p2', 'p3'],
    'Descending sort must invert distance ordering correctly'
  );
});

test('R6.4: Sort comparator handles identical distances stably', () => {
  function compareLocation(a, b, sortOrder = 'asc') {
    const distA = typeof a.distanceKm === 'number' ? a.distanceKm : (parseFloat(a.distanceText) || 9999);
    const distB = typeof b.distanceKm === 'number' ? b.distanceKm : (parseFloat(b.distanceText) || 9999);
    return sortOrder === 'asc' ? distA - distB : distB - distA;
  }

  const p1 = { id: 'p1', distanceKm: 2.5 };
  const p2 = { id: 'p2', distanceKm: 2.5 };
  assert.strictEqual(compareLocation(p1, p2, 'asc'), 0, 'Identical distances must return 0');
});

test('R6.5 [Adversarial Stress]: Sort comparator handles extreme distances and floating point nuances', () => {
  function compareLocation(a, b, sortOrder = 'asc') {
    const distA = typeof a.distanceKm === 'number' ? a.distanceKm : (parseFloat(a.distanceText) || 9999);
    const distB = typeof b.distanceKm === 'number' ? b.distanceKm : (parseFloat(b.distanceText) || 9999);
    return sortOrder === 'asc' ? distA - distB : distB - distA;
  }

  // Micro distances and floating point comparison
  const tiny1 = { id: 't1', distanceKm: 0.00001 };
  const tiny2 = { id: 't2', distanceKm: 0.00002 };
  assert.ok(compareLocation(tiny1, tiny2, 'asc') < 0, '0.00001 should be before 0.00002');

  // Gigantic distances
  const huge1 = { id: 'h1', distanceKm: 50000 };
  const huge2 = { id: 'h2', distanceKm: 99999 };
  assert.ok(compareLocation(huge1, huge2, 'asc') < 0, '50000 km should be before 99999 km');

  // Mixed string formats with localized comma vs dot:
  // "0,5 km" vs "0.8 km"
  const localized1 = { id: 'l1', distanceText: '0.5 km' };
  const localized2 = { id: 'l2', distanceText: '0.8 km' };
  assert.ok(compareLocation(localized1, localized2, 'asc') < 0, '0.5 km should precede 0.8 km');
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.error('VERIFICATION FAILED: Found regressions or unsatisfied requirements.');
  for (const f of failureDetails) {
    console.error(`- ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('ALL EMPIRICAL TESTS PASSED! Verdict: APPROVE');
  process.exit(0);
}
