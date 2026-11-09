const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ============================================================================
// ADVERSARIAL CHALLENGER SUITE: MILESTONE 3 (SELLER REVIEWS ALGORITHMS)
// ============================================================================

console.log('================================================================');
console.log('EMPIRICAL CHALLENGER TEST SUITE: MILESTONE 3 (SELLER REVIEWS)');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
const findings = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Details: ${err.message}`);
    findings.push({ name, error: err.message, stack: err.stack });
  }
}

// ----------------------------------------------------------------------------
// Algorithm Mirror extracted directly from src/pages/seller/SellerReviews.tsx
// ----------------------------------------------------------------------------
const REVIEWS_PER_PAGE = 5;

function filterAndSortReviews({ reviews, ratingFilter, searchQuery, sortBy, productsMap }) {
  let result = [...reviews];

  // 1. Rating filter (Semua Rating = null, or 1 - 5)
  if (ratingFilter !== null) {
    result = result.filter((r) => Math.round(r.rating) === ratingFilter);
  }

  // 2. Search query filter (reviewer name, review content, product name)
  const query = (searchQuery || '').trim().toLowerCase();
  if (query) {
    result = result.filter((r) => {
      const authorName = (r.author?.name || '').toLowerCase();
      const content = (r.content || '').toLowerCase();
      const productInfo = r.product_id ? productsMap.get(r.product_id) : undefined;
      const productName = (
        r.product_name ||
        r.product?.name ||
        productInfo?.name ||
        ''
      ).toLowerCase();

      return (
        authorName.includes(query) ||
        content.includes(query) ||
        productName.includes(query)
      );
    });
  }

  // 3. Sorting logic
  result.sort((a, b) => {
    if (sortBy === 'terlama') {
      const timeA = new Date(a.created_at).getTime() || 0;
      const timeB = new Date(b.created_at).getTime() || 0;
      return timeA - timeB;
    }
    if (sortBy === 'rating-tinggi') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'rating-rendah') {
      return (a.rating || 0) - (b.rating || 0);
    }
    // Default: 'terbaru'
    const timeA = new Date(a.created_at).getTime() || 0;
    const timeB = new Date(b.created_at).getTime() || 0;
    return timeB - timeA;
  });

  return result;
}

function paginateReviews(filteredReviews, currentPage, perPage = REVIEWS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / perPage));
  const start = (currentPage - 1) * perPage;
  const paginatedReviews = filteredReviews.slice(start, start + perPage);
  return { totalPages, paginatedReviews };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes('T')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// ----------------------------------------------------------------------------
// Test Mock Fixtures: 12 Standard Reviews
// ----------------------------------------------------------------------------
const mockProductsMap = new Map([
  ['prod-1', { name: 'Mystery Bakery Box', image: 'https://example.com/bakery.jpg' }],
  ['prod-2', { name: 'Fresh Salad Box', image: 'https://example.com/salad.jpg' }],
  ['prod-3', { name: 'Japanese Bento Surprise', image: 'https://example.com/bento.jpg' }],
]);

const mockReviews12 = [
  {
    id: 'rev-01',
    rating: 5,
    content: 'Rotinya masih sangat empuk dan renyah, wangi butter sekali!',
    author: { id: 'u1', name: 'Andi Pratama' },
    product_id: 'prod-1',
    created_at: '2026-10-28T09:00:00Z',
  },
  {
    id: 'rev-02',
    rating: 4,
    content: 'Saladnya segar, sayuran kriuk, cuma dressingnya kurang sedikit.',
    author: { id: 'u2', name: 'Budi Santoso' },
    product_id: 'prod-2',
    created_at: '2026-10-27T10:30:00Z',
  },
  {
    id: 'rev-03',
    rating: 5,
    content: 'Porsi bento banyak sekali dan ayam teriyakinya gurih mantap.',
    author: { id: 'u3', name: 'Citra Dewi' },
    product_id: 'prod-3',
    created_at: '2026-10-26T14:15:00Z',
  },
  {
    id: 'rev-04',
    rating: 3,
    content: 'Roti agak sedikit keras di pinggirnya, tapi selainya enak.',
    author: { id: 'u4', name: 'Doni Kurniawan' },
    product_id: 'prod-1',
    created_at: '2026-10-25T08:00:00Z',
  },
  {
    id: 'rev-05',
    rating: 2,
    content: 'Pengantaran agak terlambat, salad sudah tidak dingin.',
    author: { id: 'u5', name: 'Eka Saputra' },
    product_id: 'prod-2',
    created_at: '2026-10-24T12:00:00Z',
  },
  {
    id: 'rev-06',
    rating: 5,
    content: 'Croissant cokelatnya juara! Sangat memuaskan.',
    author: { id: 'u6', name: 'Fani Rahma' },
    product_id: 'prod-1',
    created_at: '2026-10-23T11:45:00Z',
  },
  {
    id: 'rev-07',
    rating: 1,
    content: 'Kurang cocok dengan rasanya, agak hambar.',
    author: { id: 'u7', name: 'Gilang Ramadhan' },
    product_id: 'prod-3',
    created_at: '2026-10-22T16:20:00Z',
  },
  {
    id: 'rev-08',
    rating: 4,
    content: 'Bento lezat, nasi pulen, kemasan rapi dan bersih.',
    author: { id: 'u8', name: 'Hana Lestari' },
    product_id: 'prod-3',
    created_at: '2026-10-21T18:00:00Z',
  },
  {
    id: 'rev-09',
    rating: 5,
    content: 'Penyelamatan makanan terbaik! Masih sangat fresh.',
    author: { id: 'u9', name: 'Indra Wijaya' },
    product_id: 'prod-1',
    created_at: '2026-10-20T19:10:00Z',
  },
  {
    id: 'rev-10',
    rating: 4,
    content: 'Bagus dan hemat, sayuran segar berkualitas tinggi.',
    author: { id: 'u10', name: 'Joko Susilo' },
    product_id: 'prod-2',
    created_at: '2026-10-19T07:30:00Z',
  },
  {
    id: 'rev-11',
    rating: 5,
    content: 'Sangat suka dengan mystery box ini, isinya melebihi ekspektasi!',
    author: { id: 'u11', name: 'Kartika Sari' },
    product_id: 'prod-3',
    created_at: '2026-10-18T13:40:00Z',
  },
  {
    id: 'rev-12',
    rating: 3,
    content: 'Lumayan untuk harga segini, roti manis cokelat standar.',
    author: { id: 'u12', name: 'Lukman Hakim' },
    product_id: 'prod-1',
    created_at: '2026-10-17T15:00:00Z',
  },
];

// ============================================================================
// SUITE 1: Search Filtering
// ============================================================================
console.log('--- SUITE 1: Search Filtering ---');

test('1.1 Case-insensitive search matching reviewer name ("budi" -> Budi Santoso)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'budi',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].author.name, 'Budi Santoso');
  assert.strictEqual(result[0].id, 'rev-02');
});

test('1.2 Uppercase search matching reviewer name ("ANDI" -> Andi Pratama)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'ANDI',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].author.name, 'Andi Pratama');
});

test('1.3 Mixed-case search matching reviewer name ("kArTiKa" -> Kartika Sari)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'kArTiKa',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].author.name, 'Kartika Sari');
});

test('1.4 Case-insensitive search matching review content ("renyah")', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'renyah',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'rev-01');
  assert.ok(result[0].content.includes('renyah'));
});

test('1.5 Case-insensitive search matching review content ("CROISSANT")', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'CROISSANT',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'rev-06');
  assert.ok(result[0].content.includes('Croissant'));
});

test('1.6 Search matching product name via productsMap ("Bakery" -> 5 bakery reviews)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'Bakery',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // prod-1 is 'Mystery Bakery Box': rev-01, rev-04, rev-06, rev-09, rev-12
  assert.strictEqual(result.length, 5);
  for (const r of result) {
    assert.strictEqual(r.product_id, 'prod-1');
  }
});

test('1.7 Search matching product name via productsMap ("salad" -> 3 salad reviews)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'salad',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // prod-2 is 'Fresh Salad Box': rev-02, rev-05, rev-10
  assert.strictEqual(result.length, 3);
  for (const r of result) {
    assert.strictEqual(r.product_id, 'prod-2');
  }
});

test('1.8 Search matching product name via fallback fields (product_name, product.name)', () => {
  const fallbackReviews = [
    {
      id: 'fb-1',
      rating: 5,
      content: 'Bagus',
      author: { name: 'User 1' },
      product_name: 'Donat Cokelat Lumer',
      created_at: '2026-10-28T09:00:00Z',
    },
    {
      id: 'fb-2',
      rating: 4,
      content: 'Mantap',
      author: { name: 'User 2' },
      product: { name: 'Puding Mangga Manis' },
      created_at: '2026-10-28T09:00:00Z',
    },
  ];

  const matchDonat = filterAndSortReviews({
    reviews: fallbackReviews,
    ratingFilter: null,
    searchQuery: 'donat',
    sortBy: 'terbaru',
    productsMap: new Map(),
  });
  assert.strictEqual(matchDonat.length, 1);
  assert.strictEqual(matchDonat[0].id, 'fb-1');

  const matchPuding = filterAndSortReviews({
    reviews: fallbackReviews,
    ratingFilter: null,
    searchQuery: 'mangga',
    sortBy: 'terbaru',
    productsMap: new Map(),
  });
  assert.strictEqual(matchPuding.length, 1);
  assert.strictEqual(matchPuding[0].id, 'fb-2');
});

test('1.9 Whitespace trimming in search query ("   budi   " matches "Budi")', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '   budi   ',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].author.name, 'Budi Santoso');
});

test('1.10 Empty string or whitespace-only search does not filter any items', () => {
  const resEmpty = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(resEmpty.length, 12);

  const resSpaces = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '     ',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(resSpaces.length, 12);
});

test('1.11 Adversarial search with non-existent query yields empty array', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: 'XYZNonExistentKeyword999',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 0);
  assert.deepStrictEqual(result, []);
});

test('1.12 Adversarial review object with undefined author, content, product_id does not throw', () => {
  const maliciousReviews = [
    { id: 'bad-1', rating: 5, created_at: '2026-10-28T09:00:00Z' },
    { id: 'bad-2', rating: 4, author: null, content: null, created_at: '2026-10-28T09:00:00Z' },
  ];
  const result = filterAndSortReviews({
    reviews: maliciousReviews,
    ratingFilter: null,
    searchQuery: 'test',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 0);
});

// ============================================================================
// SUITE 2: Rating Filtering
// ============================================================================
console.log('\n--- SUITE 2: Rating Filtering ---');

test('2.1 Filter by null (Semua Rating) returns all 12 reviews', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 12);
});

test('2.2 Filter by 5 stars returns only 5-star reviews', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 5,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // 5 stars: rev-01, rev-03, rev-06, rev-09, rev-11 -> 5 items
  assert.strictEqual(result.length, 5);
  for (const r of result) {
    assert.strictEqual(Math.round(r.rating), 5);
  }
});

test('2.3 Filter by 4 stars returns only 4-star reviews', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 4,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // 4 stars: rev-02, rev-08, rev-10 -> 3 items
  assert.strictEqual(result.length, 3);
  for (const r of result) {
    assert.strictEqual(Math.round(r.rating), 4);
  }
});

test('2.4 Filter by 3 stars returns only 3-star reviews', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 3,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // 3 stars: rev-04, rev-12 -> 2 items
  assert.strictEqual(result.length, 2);
  for (const r of result) {
    assert.strictEqual(Math.round(r.rating), 3);
  }
});

test('2.5 Filter by 2 stars returns only 2-star reviews', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 2,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // 2 stars: rev-05 -> 1 item
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'rev-05');
  assert.strictEqual(Math.round(result[0].rating), 2);
});

test('2.6 Filter by 1 star returns only 1-star reviews', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 1,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // 1 star: rev-07 -> 1 item
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'rev-07');
  assert.strictEqual(Math.round(result[0].rating), 1);
});

test('2.7 Sum of all rating filters (5+4+3+2+1) equals total items (12)', () => {
  let sum = 0;
  for (const rating of [1, 2, 3, 4, 5]) {
    const res = filterAndSortReviews({
      reviews: mockReviews12,
      ratingFilter: rating,
      searchQuery: '',
      sortBy: 'terbaru',
      productsMap: mockProductsMap,
    });
    sum += res.length;
  }
  assert.strictEqual(sum, 12);
});

test('2.8 Fractional ratings rounded accurately (4.8 -> 5, 4.2 -> 4, 3.5 -> 4)', () => {
  const fractionalReviews = [
    { id: 'f-1', rating: 4.8, created_at: '2026-10-28T09:00:00Z' },
    { id: 'f-2', rating: 4.2, created_at: '2026-10-28T09:00:00Z' },
    { id: 'f-3', rating: 3.5, created_at: '2026-10-28T09:00:00Z' },
  ];

  const res5 = filterAndSortReviews({
    reviews: fractionalReviews,
    ratingFilter: 5,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: new Map(),
  });
  assert.strictEqual(res5.length, 1);
  assert.strictEqual(res5[0].id, 'f-1');

  const res4 = filterAndSortReviews({
    reviews: fractionalReviews,
    ratingFilter: 4,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: new Map(),
  });
  // 4.2 rounds to 4, 3.5 rounds to 4 in Math.round
  assert.strictEqual(res4.length, 2);
  assert.deepStrictEqual(res4.map((r) => r.id), ['f-2', 'f-3']);
});

// ============================================================================
// SUITE 3: Sorting Algorithms
// ============================================================================
console.log('\n--- SUITE 3: Sorting Algorithms ---');

test('3.1 Sort by "terbaru" (created_at desc)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 12);
  for (let i = 0; i < result.length - 1; i++) {
    const timeCurrent = new Date(result[i].created_at).getTime();
    const timeNext = new Date(result[i + 1].created_at).getTime();
    assert.ok(
      timeCurrent >= timeNext,
      `Order violation at index ${i}: ${result[i].created_at} < ${result[i + 1].created_at}`
    );
  }
  assert.strictEqual(result[0].id, 'rev-01'); // 2026-10-28 (newest)
  assert.strictEqual(result[11].id, 'rev-12'); // 2026-10-17 (oldest)
});

test('3.2 Sort by "terlama" (created_at asc)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'terlama',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 12);
  for (let i = 0; i < result.length - 1; i++) {
    const timeCurrent = new Date(result[i].created_at).getTime();
    const timeNext = new Date(result[i + 1].created_at).getTime();
    assert.ok(
      timeCurrent <= timeNext,
      `Order violation at index ${i}: ${result[i].created_at} > ${result[i + 1].created_at}`
    );
  }
  assert.strictEqual(result[0].id, 'rev-12'); // 2026-10-17 (oldest)
  assert.strictEqual(result[11].id, 'rev-01'); // 2026-10-28 (newest)
});

test('3.3 Sort by "rating-tinggi" (rating desc)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'rating-tinggi',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 12);
  for (let i = 0; i < result.length - 1; i++) {
    assert.ok(
      result[i].rating >= result[i + 1].rating,
      `Rating violation at index ${i}: ${result[i].rating} < ${result[i + 1].rating}`
    );
  }
  assert.strictEqual(result[0].rating, 5);
  assert.strictEqual(result[11].rating, 1);
});

test('3.4 Sort by "rating-rendah" (rating asc)', () => {
  const result = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'rating-rendah',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(result.length, 12);
  for (let i = 0; i < result.length - 1; i++) {
    assert.ok(
      result[i].rating <= result[i + 1].rating,
      `Rating violation at index ${i}: ${result[i].rating} > ${result[i + 1].rating}`
    );
  }
  assert.strictEqual(result[0].rating, 1);
  assert.strictEqual(result[11].rating, 5);
});

test('3.5 Sort resilience against malformed or missing dates', () => {
  const badDateReviews = [
    { id: 'b1', rating: 5, created_at: 'invalid-date' },
    { id: 'b2', rating: 4, created_at: '2026-10-28T09:00:00Z' },
    { id: 'b3', rating: 3, created_at: undefined },
  ];
  const sorted = filterAndSortReviews({
    reviews: badDateReviews,
    ratingFilter: null,
    searchQuery: '',
    sortBy: 'terbaru',
    productsMap: new Map(),
  });
  assert.strictEqual(sorted.length, 3);
  assert.strictEqual(sorted[0].id, 'b2'); // Valid date (epoch > 0) comes first
});

// ============================================================================
// SUITE 4: Pagination & Page Reset Mechanics
// ============================================================================
console.log('\n--- SUITE 4: Pagination & Page Reset Mechanics ---');

test('4.1 12 items -> chunked into 3 pages of 5, 5, 2 items', () => {
  // Page 1
  const p1 = paginateReviews(mockReviews12, 1);
  assert.strictEqual(p1.totalPages, 3);
  assert.strictEqual(p1.paginatedReviews.length, 5);
  assert.deepStrictEqual(p1.paginatedReviews.map((r) => r.id), [
    'rev-01', 'rev-02', 'rev-03', 'rev-04', 'rev-05'
  ]);

  // Page 2
  const p2 = paginateReviews(mockReviews12, 2);
  assert.strictEqual(p2.totalPages, 3);
  assert.strictEqual(p2.paginatedReviews.length, 5);
  assert.deepStrictEqual(p2.paginatedReviews.map((r) => r.id), [
    'rev-06', 'rev-07', 'rev-08', 'rev-09', 'rev-10'
  ]);

  // Page 3
  const p3 = paginateReviews(mockReviews12, 3);
  assert.strictEqual(p3.totalPages, 3);
  assert.strictEqual(p3.paginatedReviews.length, 2);
  assert.deepStrictEqual(p3.paginatedReviews.map((r) => r.id), [
    'rev-11', 'rev-12'
  ]);

  // Sum of items across all pages equals total items
  const allPagedItems = [...p1.paginatedReviews, ...p2.paginatedReviews, ...p3.paginatedReviews];
  assert.strictEqual(allPagedItems.length, 12);
});

test('4.2 Total pages calculation across boundary conditions', () => {
  // 0 items -> totalPages = 1 (empty state)
  assert.strictEqual(paginateReviews([], 1).totalPages, 1);
  assert.strictEqual(paginateReviews([], 1).paginatedReviews.length, 0);

  // 1 item -> totalPages = 1
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 1), 1).totalPages, 1);
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 1), 1).paginatedReviews.length, 1);

  // 5 items -> totalPages = 1
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 5), 1).totalPages, 1);
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 5), 1).paginatedReviews.length, 5);

  // 6 items -> totalPages = 2 (5, 1)
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 6), 1).totalPages, 2);
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 6), 2).paginatedReviews.length, 1);

  // 10 items -> totalPages = 2 (5, 5)
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 10), 1).totalPages, 2);
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 10), 2).paginatedReviews.length, 5);

  // 11 items -> totalPages = 3 (5, 5, 1)
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 11), 1).totalPages, 3);
  assert.strictEqual(paginateReviews(mockReviews12.slice(0, 11), 3).paginatedReviews.length, 1);
});

test('4.3 Out-of-bounds page numbers return empty array without crashing', () => {
  const p4 = paginateReviews(mockReviews12, 4);
  assert.strictEqual(p4.totalPages, 3);
  assert.strictEqual(p4.paginatedReviews.length, 0);

  const p99 = paginateReviews(mockReviews12, 99);
  assert.strictEqual(p99.totalPages, 3);
  assert.strictEqual(p99.paginatedReviews.length, 0);
});

test('4.4 State transition simulation: Page resets to 1 on search change', () => {
  // Simulate component state transitions
  let state = {
    searchQuery: '',
    ratingFilter: null,
    sortBy: 'terbaru',
    currentPage: 3, // User was on page 3
  };

  function handleSearchChange(query) {
    state.searchQuery = query;
    state.currentPage = 1;
  }

  handleSearchChange('budi');
  assert.strictEqual(state.searchQuery, 'budi');
  assert.strictEqual(state.currentPage, 1);
});

test('4.5 State transition simulation: Page resets to 1 on rating filter change', () => {
  let state = {
    searchQuery: '',
    ratingFilter: null,
    sortBy: 'terbaru',
    currentPage: 2, // User was on page 2
  };

  function handleRatingFilterChange(rating) {
    state.ratingFilter = rating;
    state.currentPage = 1;
  }

  handleRatingFilterChange(5);
  assert.strictEqual(state.ratingFilter, 5);
  assert.strictEqual(state.currentPage, 1);
});

test('4.6 State transition simulation: Page resets to 1 on sort change', () => {
  let state = {
    searchQuery: '',
    ratingFilter: null,
    sortBy: 'terbaru',
    currentPage: 3, // User was on page 3
  };

  function handleSortChange(sort) {
    state.sortBy = sort;
    state.currentPage = 1;
  }

  handleSortChange('rating-tinggi');
  assert.strictEqual(state.sortBy, 'rating-tinggi');
  assert.strictEqual(state.currentPage, 1);
});

// ============================================================================
// SUITE 5: Combined Filter, Search & Sort Stress Testing
// ============================================================================
console.log('\n--- SUITE 5: Combined Filter, Search & Sort Stress Testing ---');

test('5.1 Combined 5-star rating + "Bakery" search + "rating-tinggi" sort', () => {
  const filtered = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 5,
    searchQuery: 'bakery',
    sortBy: 'rating-tinggi',
    productsMap: mockProductsMap,
  });
  // Bakery reviews: rev-01 (5), rev-04 (3), rev-06 (5), rev-09 (5), rev-12 (3)
  // With 5 stars: rev-01, rev-06, rev-09 -> 3 items
  assert.strictEqual(filtered.length, 3);
  for (const r of filtered) {
    assert.strictEqual(r.rating, 5);
    assert.strictEqual(r.product_id, 'prod-1');
  }
});

test('5.2 Combined 4-star rating + "Bento" search', () => {
  const filtered = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 4,
    searchQuery: 'bento',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  // Bento reviews: rev-03 (5), rev-07 (1), rev-08 (4), rev-11 (5)
  // With 4 stars: rev-08 -> 1 item
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].id, 'rev-08');
  assert.strictEqual(filtered[0].author.name, 'Hana Lestari');
});

test('5.3 Combined criteria with zero match returns empty list', () => {
  const filtered = filterAndSortReviews({
    reviews: mockReviews12,
    ratingFilter: 1, // 1 star is rev-07 (Bento)
    searchQuery: 'salad', // Searching for salad
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });
  assert.strictEqual(filtered.length, 0);
  assert.deepStrictEqual(filtered, []);
});

test('5.4 Stress test: 100 random reviews generated & filtered', () => {
  const largeReviews = [];
  const names = ['Ahmad', 'Budi', 'Chandra', 'Dewi', 'Endang', 'Farhan', 'Gita'];
  const comments = ['Enak sekali', 'Kurang manis', 'Luar biasa renyah', 'Porsi pas', 'Sangat puas'];

  for (let i = 1; i <= 100; i++) {
    largeReviews.push({
      id: `stress-${i}`,
      rating: ((i % 5) + 1), // 1..5
      content: comments[i % comments.length],
      author: { id: `u-${i}`, name: `${names[i % names.length]} Ke-${i}` },
      product_id: (i % 2 === 0) ? 'prod-1' : 'prod-2',
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }

  const result = filterAndSortReviews({
    reviews: largeReviews,
    ratingFilter: 5,
    searchQuery: 'budi',
    sortBy: 'terbaru',
    productsMap: mockProductsMap,
  });

  for (const r of result) {
    assert.strictEqual(r.rating, 5);
    assert.ok(r.author.name.toLowerCase().includes('budi'));
  }

  // Verify pagination on stress dataset
  const paged = paginateReviews(result, 1);
  assert.ok(paged.totalPages >= 1);
  assert.ok(paged.paginatedReviews.length <= 5);
});

// ============================================================================
// SUITE 6: Date Formatting Function (formatDate)
// ============================================================================
console.log('\n--- SUITE 6: Date Formatting Function ---');

test('6.1 Valid ISO string formats to Indonesian readable date ("2026-10-28T09:00:00Z")', () => {
  const formatted = formatDate('2026-10-28T09:00:00Z');
  assert.ok(formatted.includes('28'));
  assert.ok(formatted.includes('Oktober'));
  assert.ok(formatted.includes('2026'));
});

test('6.2 Already human-formatted Indonesian date string preserved as-is', () => {
  const input = '28 Oktober 2026';
  assert.strictEqual(formatDate(input), input);
});

test('6.3 Empty or falsy date returns empty string', () => {
  assert.strictEqual(formatDate(''), '');
  assert.strictEqual(formatDate(undefined), '');
  assert.strictEqual(formatDate(null), '');
});

test('6.4 Invalid date string returns the raw string without crashing', () => {
  const invalid = 'not-a-valid-date';
  assert.strictEqual(formatDate(invalid), invalid);
});

// ============================================================================
// SUITE 7: Source Code & Contract Audit of SellerReviews.tsx & AppRoutes.tsx
// ============================================================================
console.log('\n--- SUITE 7: Source Code & Contract Audit ---');

const sellerReviewsPath = path.resolve(process.cwd(), 'src/pages/seller/SellerReviews.tsx');
const appRoutesPath = path.resolve(process.cwd(), 'src/app/AppRoutes.tsx');

test('7.1 Verify SellerReviews.tsx file exists and is readable', () => {
  assert.ok(fs.existsSync(sellerReviewsPath), 'SellerReviews.tsx must exist');
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  assert.ok(content.length > 500, 'SellerReviews.tsx must not be empty');
});

test('7.2 Verify REVIEWS_PER_PAGE is set to 5', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  assert.ok(/const\s+REVIEWS_PER_PAGE\s*=\s*5;/.test(content), 'Must define REVIEWS_PER_PAGE = 5');
});

test('7.3 Verify handleSearchChange calls setCurrentPage(1)', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  const fnMatch = content.match(/handleSearchChange\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\};/);
  assert.ok(fnMatch, 'handleSearchChange must exist');
  assert.ok(fnMatch[1].includes('setCurrentPage(1)'), 'handleSearchChange must reset currentPage to 1');
});

test('7.4 Verify handleRatingFilterChange calls setCurrentPage(1)', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  const fnMatch = content.match(/handleRatingFilterChange\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\};/);
  assert.ok(fnMatch, 'handleRatingFilterChange must exist');
  assert.ok(fnMatch[1].includes('setCurrentPage(1)'), 'handleRatingFilterChange must reset currentPage to 1');
});

test('7.5 Verify handleSortChange calls setCurrentPage(1)', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  const fnMatch = content.match(/handleSortChange\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\};/);
  assert.ok(fnMatch, 'handleSortChange must exist');
  assert.ok(fnMatch[1].includes('setCurrentPage(1)'), 'handleSortChange must reset currentPage to 1');
});

test('7.6 Verify search matches reviewer name, review content, and product name', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  assert.ok(content.includes('authorName.includes(query)'), 'Must match authorName');
  assert.ok(content.includes('content.includes(query)'), 'Must match review content');
  assert.ok(content.includes('productName.includes(query)'), 'Must match productName');
});

test('7.7 Verify rating filter matches Math.round(r.rating) === ratingFilter', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  assert.ok(content.includes('Math.round(r.rating) === ratingFilter'), 'Rating filter must match rounded star');
});

test('7.8 Verify sorting options: terbaru, terlama, rating-tinggi, rating-rendah', () => {
  const content = fs.readFileSync(sellerReviewsPath, 'utf-8');
  assert.ok(content.includes("'terlama'"), "Must support 'terlama'");
  assert.ok(content.includes("'rating-tinggi'"), "Must support 'rating-tinggi'");
  assert.ok(content.includes("'rating-rendah'"), "Must support 'rating-rendah'");
  assert.ok(content.includes('timeB - timeA'), "Must support default 'terbaru'");
});

test('7.9 Verify AppRoutes.tsx imports SellerReviews with lazy loading', () => {
  assert.ok(fs.existsSync(appRoutesPath), 'AppRoutes.tsx must exist');
  const content = fs.readFileSync(appRoutesPath, 'utf-8');
  assert.ok(
    content.includes("import('../pages/seller/SellerReviews')"),
    'AppRoutes.tsx must lazy-import SellerReviews'
  );
});

test('7.10 Verify AppRoutes.tsx renders SellerReviews for activeView === "view-ulasan"', () => {
  const content = fs.readFileSync(appRoutesPath, 'utf-8');
  assert.ok(
    content.includes("activeView === 'view-ulasan'"),
    "AppRoutes.tsx must branch for activeView === 'view-ulasan'"
  );
  assert.ok(
    content.includes('<SellerReviews'),
    'AppRoutes.tsx must render <SellerReviews />'
  );
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`TOTAL TESTS:  ${totalTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${findings.length}`);
console.log('================================================================\n');

if (findings.length > 0) {
  console.error('FAILURES SUMMARY:');
  for (const f of findings) {
    console.error(`- ${f.name}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED EMPIRICALLY WITH ZERO ERRORS!');
  process.exit(0);
}
