const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'https://dolpin-fourthree.bccdev.id';

// Emulation of extractErrorMessage from src/api/client.ts
function extractErrorMessage(err, fallbackMessage = 'Terjadi kesalahan pada sistem.') {
  const defaultFallback = 'Terjadi kesalahan pada sistem.';
  const isTechnicalMessage = (message) =>
    /request failed with status code \d{3}|status code\s*[:=]?\s*\d{3}|\bhttp\s*\d{3}\b|\baxioserror\b|\berr_[a-z0-9_]+\b|\bnetwork error\b|\bfailed to fetch\b|\bfetch failed\b|\bload failed\b|\btimeout\b|internal server error|sqlstate|stack trace/i.test(message);
  const statusFallback = (status) => {
    switch (status) {
      case 401: return 'Sesi kamu berakhir atau data masuk tidak cocok. Silakan masuk kembali.';
      case 403: return 'Kamu tidak memiliki izin untuk melakukan tindakan ini.';
      case 404: return 'Data yang diminta tidak ditemukan. Muat ulang halaman lalu coba lagi.';
      case 409: return 'Data berubah atau bertentangan dengan permintaan. Muat ulang halaman lalu coba lagi.';
      case 422: return 'Data belum dapat diproses. Periksa kembali isian lalu coba lagi.';
      case 429: return 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.';
      case 408: return 'Permintaan terlalu lama. Silakan coba lagi.';
      default:
        if (status && status >= 500) return 'Layanan sedang bermasalah. Coba lagi beberapa saat.';
        return undefined;
    }
  };
  const usableMessage = (value) => {
    if (typeof value !== 'string') return undefined;
    const message = value.trim();
    if (!message || isTechnicalMessage(message)) return undefined;
    return message;
  };

  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const responseData = data;
      if (responseData.payload && typeof responseData.payload === 'object') {
        const errorObj = responseData.payload.error;
        const details = usableMessage(errorObj?.details);
        if (details) return details;
        const message = usableMessage(errorObj?.message);
        if (message) return message;
        const errorMessage = usableMessage(errorObj?.error);
        if (errorMessage) return errorMessage;
      }
      const message = usableMessage(responseData.message);
      if (message) return message;
      const nestedError = responseData.error;
      if (nestedError && typeof nestedError === 'object') {
        const nestedMessage = usableMessage(nestedError.details) || usableMessage(nestedError.message);
        if (nestedMessage) return nestedMessage;
      }
    }
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message)) {
      return 'Permintaan ke server memakan waktu terlalu lama. Silakan coba lagi.';
    }
    if (!err.response) {
      return 'Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi.';
    }
    const fallback = statusFallback(err.response.status);
    return fallback || fallbackMessage || defaultFallback;
  }
  return fallbackMessage;
}

// Logic functions from src/hooks/useReviews.ts
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

async function runEmpiricalSuite() {
  console.log('====================================================');
  console.log('CHALLENGER 2: EMPIRICAL LIVE BACKEND CONTRACT SUITE');
  console.log('====================================================\n');

  let results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function record(name, pass, msg = '') {
    results.total++;
    if (pass) {
      results.passed++;
      console.log(`[PASS] ${name} ${msg}`);
      results.details.push({ test: name, status: 'PASS', message: msg });
    } else {
      results.failed++;
      console.error(`[FAIL] ${name} ${msg}`);
      results.details.push({ test: name, status: 'FAIL', message: msg });
    }
  }

  // Step 1: Discover valid live product and store IDs from backend
  let validProductId = null;
  let validStoreId = null;

  try {
    const prodListRes = await axios.get(`${BASE_URL}/api/v1/products?limit=1`);
    if (prodListRes.status === 200 && prodListRes.data?.payload?.products?.length > 0) {
      validProductId = prodListRes.data.payload.products[0].id;
    }
  } catch {
    console.warn('Could not auto-discover product from /api/v1/products, falling back to static ID');
  }
  if (!validProductId) validProductId = '01a18db1-3ef4-7844-9da6-4a4612d30834';

  try {
    const storeListRes = await axios.get(`${BASE_URL}/api/v1/stores?limit=1`);
    if (storeListRes.status === 200 && storeListRes.data?.payload?.stores?.length > 0) {
      validStoreId = storeListRes.data.payload.stores[0].id;
    }
  } catch {
    console.warn('Could not auto-discover store from /api/v1/stores, falling back to static ID');
  }
  if (!validStoreId) validStoreId = '01a18db0-c24a-736f-8087-3ec00263311a';

  console.log(`Discovered Live Target IDs: Product=${validProductId}, Store=${validStoreId}\n`);

  // Section 1: GET /api/v1/products/{valid_id}/reviews
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/products/${validProductId}/reviews`);
    const is200 = res.status === 200;
    const hasPayload = res.data && typeof res.data.payload === 'object';
    const hasReviewsArray = Array.isArray(res.data?.payload?.reviews);
    const hasMeta = res.data?.payload?.meta !== undefined;
    record(
      'GET /api/v1/products/{id}/reviews contract',
      is200 && hasPayload && hasReviewsArray && hasMeta,
      `Status: ${res.status}, reviews count: ${res.data?.payload?.reviews?.length}, meta present: ${hasMeta}`
    );
  } catch (e) {
    record('GET /api/v1/products/{id}/reviews contract', false, e.message);
  }

  // Section 1b: GET /api/v1/products/{valid_id}/reviews with pagination params
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/products/${validProductId}/reviews`, {
      params: { page: 1, limit: 5 }
    });
    record(
      'GET /api/v1/products/{id}/reviews with params (?page=1&limit=5)',
      res.status === 200 && Array.isArray(res.data?.payload?.reviews),
      `Status: ${res.status}`
    );
  } catch (e) {
    record('GET /api/v1/products/{id}/reviews with params', false, e.message);
  }

  // Section 2: GET /api/v1/stores/{valid_id}/reviews
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/stores/${validStoreId}/reviews`);
    const is200 = res.status === 200;
    const hasPayload = res.data && typeof res.data.payload === 'object';
    const hasReviewsArray = Array.isArray(res.data?.payload?.reviews);
    const hasMeta = res.data?.payload?.meta !== undefined;
    record(
      'GET /api/v1/stores/{id}/reviews contract',
      is200 && hasPayload && hasReviewsArray && hasMeta,
      `Status: ${res.status}, reviews count: ${res.data?.payload?.reviews?.length}, meta present: ${hasMeta}`
    );
  } catch (e) {
    record('GET /api/v1/stores/{id}/reviews contract', false, e.message);
  }

  // Section 2b: GET /api/v1/stores/{valid_id}/reviews with pagination params
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/stores/${validStoreId}/reviews`, {
      params: { page: 1, limit: 10 }
    });
    record(
      'GET /api/v1/stores/{id}/reviews with params (?page=1&limit=10)',
      res.status === 200 && Array.isArray(res.data?.payload?.reviews),
      `Status: ${res.status}`
    );
  } catch (e) {
    record('GET /api/v1/stores/{id}/reviews with params', false, e.message);
  }

  // Section 3: GET /api/v1/stores/{valid_id}/summary
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/stores/${validStoreId}/summary`);
    const is200 = res.status === 200;
    const payload = res.data?.payload;
    const hasAvg = payload && typeof payload.average_rating === 'number';
    const hasTotal = payload && typeof payload.total_reviews === 'number';
    record(
      'GET /api/v1/stores/{id}/summary contract',
      is200 && hasAvg && hasTotal,
      `Status: ${res.status}, average_rating: ${payload?.average_rating}, total_reviews: ${payload?.total_reviews}`
    );
  } catch (e) {
    record('GET /api/v1/stores/{id}/summary contract', false, e.message);
  }

  // Section 4: Unauthenticated POST /api/v1/products/{id}/reviews -> verify 401
  try {
    await axios.post(`${BASE_URL}/api/v1/products/${validProductId}/reviews`, {
      rating: 5,
      content: 'Challenger probe test'
    });
    record('Unauthenticated POST /api/v1/products/{id}/reviews returns 401', false, 'Expected 401 but got success');
  } catch (e) {
    const status = e.response?.status;
    const errorMsg = extractErrorMessage(e);
    record(
      'Unauthenticated POST /api/v1/products/{id}/reviews returns 401',
      status === 401,
      `Status: ${status}, normalizedMessage: "${errorMsg}"`
    );
  }

  // Section 5: Unauthenticated POST /api/v1/stores/{id}/reviews -> verify 401
  try {
    await axios.post(`${BASE_URL}/api/v1/stores/${validStoreId}/reviews`, {
      rating: 5,
      content: 'Challenger probe test'
    });
    record('Unauthenticated POST /api/v1/stores/{id}/reviews returns 401', false, 'Expected 401 but got success');
  } catch (e) {
    const status = e.response?.status;
    const errorMsg = extractErrorMessage(e);
    record(
      'Unauthenticated POST /api/v1/stores/{id}/reviews returns 401',
      status === 401,
      `Status: ${status}, normalizedMessage: "${errorMsg}"`
    );
  }

  // Section 6: Unauthenticated PATCH /api/v1/reviews/{id} -> verify 401
  try {
    await axios.patch(`${BASE_URL}/api/v1/reviews/00000000-0000-0000-0000-000000000000`, {
      rating: 4,
      content: 'Challenger probe update test'
    });
    record('Unauthenticated PATCH /api/v1/reviews/{id} returns 401', false, 'Expected 401 but got success');
  } catch (e) {
    const status = e.response?.status;
    const errorMsg = extractErrorMessage(e);
    record(
      'Unauthenticated PATCH /api/v1/reviews/{id} returns 401',
      status === 401,
      `Status: ${status}, normalizedMessage: "${errorMsg}"`
    );
  }

  // Section 7: Unauthenticated DELETE /api/v1/reviews/{id} -> verify 401
  try {
    await axios.delete(`${BASE_URL}/api/v1/reviews/00000000-0000-0000-0000-000000000000`);
    record('Unauthenticated DELETE /api/v1/reviews/{id} returns 401', false, 'Expected 401 but got success');
  } catch (e) {
    const status = e.response?.status;
    const errorMsg = extractErrorMessage(e);
    record(
      'Unauthenticated DELETE /api/v1/reviews/{id} returns 401',
      status === 401,
      `Status: ${status}, normalizedMessage: "${errorMsg}"`
    );
  }

  // Section 8: Invalid Bearer Token probes on write endpoints
  try {
    await axios.post(
      `${BASE_URL}/api/v1/products/${validProductId}/reviews`,
      { rating: 5, content: 'Invalid bearer probe' },
      { headers: { Authorization: 'Bearer invalid_garbage_token' } }
    );
    record('Invalid Bearer Token rejected with 401', false, 'Expected 401');
  } catch (e) {
    record('Invalid Bearer Token rejected with 401', e.response?.status === 401, `Status: ${e.response?.status}`);
  }

  // Section 9: Stress testing calculation algorithms
  try {
    // Null / empty array
    assert.strictEqual(calculateAverageRating([]), 0);
    assert.strictEqual(calculateAverageRating(null), 0);
    assert.strictEqual(calculateAverageRating(undefined), 0);

    // Distribution empty
    assert.deepStrictEqual(calculateRatingDistribution([]), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    assert.deepStrictEqual(calculateRatingDistribution(null), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    // Boundary ratings (clamping tests: 0 -> 1, 6 -> 5, float 3.6 -> 4, float 3.4 -> 3)
    const weirdReviews = [
      { rating: 0 },
      { rating: 6 },
      { rating: 3.6 },
      { rating: 3.4 },
      { rating: 'NaN' },
      { rating: null },
      { rating: -5 }
    ];
    const dist = calculateRatingDistribution(weirdReviews);
    // 0 rounds to 0 -> clamped to 1
    // -5 rounds to -5 -> clamped to 1
    // 6 rounds to 6 -> clamped to 5
    // 3.6 rounds to 4 -> 4
    // 3.4 rounds to 3 -> 3
    // 'NaN' is NaN -> ignored
    // null is 0 -> clamped to 1
    assert.strictEqual(dist[1], 3, 'Ratings <= 1 clamped to 1');
    assert.strictEqual(dist[3], 1, '3.4 rounded to 3');
    assert.strictEqual(dist[4], 1, '3.6 rounded to 4');
    assert.strictEqual(dist[5], 1, 'Ratings >= 5 clamped to 5');

    // Float rounding precision in average
    // [4.333, 4.333] -> 4.3
    const floatReviews = [{ rating: 4.333 }, { rating: 4.333 }];
    assert.strictEqual(calculateAverageRating(floatReviews), 4.3);

    record('Stress test calculation edge cases (NaN, clamping, floats, nulls)', true, 'All assertions passed');
  } catch (e) {
    record('Stress test calculation edge cases', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`SUITE SUMMARY: ${results.passed}/${results.total} PASSED, ${results.failed} FAILED`);
  console.log('====================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runEmpiricalSuite().catch((err) => {
  console.error('Fatal suite runner error:', err);
  process.exit(1);
});
