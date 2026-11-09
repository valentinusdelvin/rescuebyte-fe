/**
 * Empirical Challenger Verification Suite for Milestone 2: Review UI Primitives
 * Tests StarRating, RatingDistribution, ReviewFilterBar, ReviewPagination,
 * ReviewSummaryCards, ReviewCard, ReviewSubmissionModal, and index exports.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

function setupMockDispatcher() {
  const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  internals.H = {
    useState: (val) => [val, () => {}],
    useId: () => ':r_test:',
    useEffect: () => {},
    useRef: (val) => ({ current: val }),
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('Starting Empirical Test Harness for Milestone 2 Primitives');
  console.log('====================================================\n');

  const server = await createServer();

  try {
    // ----------------------------------------------------
    // Suite 1: StarRating
    // ----------------------------------------------------
    console.log('=== Suite 1: StarRating ===');
    const { StarRating } = await server.ssrLoadModule('./src/components/reviews/StarRating.tsx');

    // 1.1 Fractional rating 4.8
    {
      const html = renderToStaticMarkup(React.createElement(StarRating, { rating: 4.8, showScoreText: true }));
      assert(html.includes('aria-label="Penilaian: 4.8 dari 5 bintang"'), 'StarRating 4.8: correct aria-label');
      assert(html.includes('style="width:80%"'), 'StarRating 4.8: 5th star clipped at 80% width');
      assert(html.includes('style="width:100%"'), 'StarRating 4.8: full stars have 100% width');
      assert(html.includes('>4.8</span>'), 'StarRating 4.8: score text displays 4.8');
    }

    // 1.2 Fractional rating 3.2
    {
      const html = renderToStaticMarkup(React.createElement(StarRating, { rating: 3.2, showScoreText: true }));
      assert(html.includes('aria-label="Penilaian: 3.2 dari 5 bintang"'), 'StarRating 3.2: correct aria-label');
      assert(html.includes('style="width:20%"'), 'StarRating 3.2: 4th star clipped at 20% width');
      // Count how many style="width: instances appear (stars 1, 2, 3 full + star 4 fractional = 4 foreground divs)
      const matches = html.match(/style="width:\d+%"/g) || [];
      assert(matches.length === 4, 'StarRating 3.2: exactly 4 foreground filled star divs (3 full, 1 at 20%, 5th empty)', `got ${matches.length}`);
    }

    // 1.3 Zero rating 0.0
    {
      const html = renderToStaticMarkup(React.createElement(StarRating, { rating: 0 }));
      assert(html.includes('aria-label="Penilaian: 0.0 dari 5 bintang"'), 'StarRating 0: correct aria-label');
      assert(!html.includes('style="width:'), 'StarRating 0: no filled star divs rendered');
    }

    // 1.4 Full rating 5.0
    {
      const html = renderToStaticMarkup(React.createElement(StarRating, { rating: 5 }));
      const matches = html.match(/style="width:100%"/g) || [];
      assert(matches.length === 5, 'StarRating 5.0: all 5 stars filled 100%');
    }

    // 1.5 Edge case: Negative and excessive ratings
    {
      const htmlNeg = renderToStaticMarkup(React.createElement(StarRating, { rating: -2 }));
      assert(!htmlNeg.includes('style="width:'), 'StarRating -2: safely treated as 0 without crash');

      const htmlOver = renderToStaticMarkup(React.createElement(StarRating, { rating: 7.5 }));
      const matches = htmlOver.match(/style="width:100%"/g) || [];
      assert(matches.length === 5, 'StarRating 7.5: capped at 5 full stars without overflow');
    }

    // 1.6 Interactive onChange and keyboard behavior
    {
      setupMockDispatcher();
      let clickedRating = null;
      const vdom = StarRating({
        rating: 3,
        interactive: true,
        onChange: (val) => { clickedRating = val; },
      });

      assert(vdom.props.role === 'radiogroup', 'Interactive StarRating: root role is radiogroup');
      const starButtons = vdom.props.children[0].props.children;
      assert(starButtons.length === 5, 'Interactive StarRating: renders 5 interactive radio buttons');
      assert(starButtons[2].props['aria-checked'] === true, 'Interactive StarRating: star 3 is checked');
      assert(starButtons[0].props['aria-checked'] === false, 'Interactive StarRating: star 1 is not checked');

      // Click test
      starButtons[4].props.onClick();
      assert(clickedRating === 5, 'Interactive StarRating: clicking 5th star fires onChange(5)');

      // Keyboard test: Enter
      clickedRating = null;
      let prevented = false;
      starButtons[1].props.onKeyDown({ key: 'Enter', preventDefault: () => { prevented = true; } });
      assert(clickedRating === 2 && prevented, 'Interactive StarRating: Enter key fires onChange(2) with preventDefault');

      // Keyboard test: Space
      clickedRating = null;
      prevented = false;
      starButtons[0].props.onKeyDown({ key: ' ', preventDefault: () => { prevented = true; } });
      assert(clickedRating === 1 && prevented, 'Interactive StarRating: Space key fires onChange(1) with preventDefault');

      // Keyboard test: ArrowRight
      clickedRating = null;
      starButtons[2].props.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} });
      assert(clickedRating === 4, 'Interactive StarRating: ArrowRight on star 3 increments to 4');

      // Keyboard test: ArrowRight on star 5 (boundary clamp)
      clickedRating = null;
      starButtons[4].props.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} });
      assert(clickedRating === 5, 'Interactive StarRating: ArrowRight on star 5 clamps at max 5');

      // Keyboard test: ArrowLeft
      clickedRating = null;
      starButtons[2].props.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} });
      assert(clickedRating === 2, 'Interactive StarRating: ArrowLeft on star 3 decrements to 2');

      // Keyboard test: ArrowLeft on star 1 (boundary floor)
      clickedRating = null;
      starButtons[0].props.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} });
      assert(clickedRating === 1, 'Interactive StarRating: ArrowLeft on star 1 floors at 1');
    }

    // ----------------------------------------------------
    // Suite 2: RatingDistribution
    // ----------------------------------------------------
    console.log('\n=== Suite 2: RatingDistribution ===');
    const { RatingDistribution } = await server.ssrLoadModule('./src/components/reviews/RatingDistribution.tsx');

    // 2.1 Zero reviews (No NaN, 0% width)
    {
      const html = renderToStaticMarkup(React.createElement(RatingDistribution, {
        distribution: {},
        totalReviews: 0,
      }));
      assert(!html.includes('NaN'), 'RatingDistribution (0 reviews): no NaN in output');
      assert(!html.includes('undefined'), 'RatingDistribution (0 reviews): no undefined in output');
      const zeroWidthMatches = html.match(/style="width:0%"/g) || [];
      assert(zeroWidthMatches.length === 5, 'RatingDistribution (0 reviews): all 5 rows have width:0%');
    }

    // 2.2 Normal distribution percentages (5 down to 1)
    {
      const html = renderToStaticMarkup(React.createElement(RatingDistribution, {
        distribution: { 5: 50, 4: 25, 3: 15, 2: 7, 1: 3 },
        totalReviews: 100,
      }));

      assert(html.includes('5 Bintang'), 'RatingDistribution: includes 5 Bintang');
      assert(html.includes('style="width:50%"'), 'RatingDistribution: 5 Bintang has 50% width');
      assert(html.includes('style="width:25%"'), 'RatingDistribution: 4 Bintang has 25% width');
      assert(html.includes('style="width:15%"'), 'RatingDistribution: 3 Bintang has 15% width');
      
      // Parse widths numerically to tolerate IEEE 754 precision
      const widthRegex = /style="width:([0-9.]+)%"/g;
      const widths = [];
      let match;
      while ((match = widthRegex.exec(html)) !== null) {
        widths.push(parseFloat(match[1]));
      }
      assert(widths.length === 5, 'RatingDistribution: exactly 5 row widths found');
      assert(Math.abs(widths[0] - 50) < 0.001, 'RatingDistribution: row 1 width is 50%');
      assert(Math.abs(widths[1] - 25) < 0.001, 'RatingDistribution: row 2 width is 25%');
      assert(Math.abs(widths[2] - 15) < 0.001, 'RatingDistribution: row 3 width is 15%');
      assert(Math.abs(widths[3] - 7) < 0.001, 'RatingDistribution: row 4 width is 7% (IEEE 754 safe)');
      assert(Math.abs(widths[4] - 3) < 0.001, 'RatingDistribution: row 5 width is 3%');

      // Verify order is strictly 5, 4, 3, 2, 1
      const pos5 = html.indexOf('5 Bintang');
      const pos4 = html.indexOf('4 Bintang');
      const pos3 = html.indexOf('3 Bintang');
      const pos2 = html.indexOf('2 Bintang');
      const pos1 = html.indexOf('1 Bintang');
      assert(pos5 < pos4 && pos4 < pos3 && pos3 < pos2 && pos2 < pos1, 'RatingDistribution: rows are ordered descending 5 to 1');
    }

    // 2.3 Edge case: count > totalReviews clamped to 100%
    {
      const html = renderToStaticMarkup(React.createElement(RatingDistribution, {
        distribution: { 5: 150 },
        totalReviews: 100,
      }));
      assert(html.includes('style="width:100%"'), 'RatingDistribution: counts exceeding total are clamped at 100%');
    }

    // ----------------------------------------------------
    // Suite 3: ReviewFilterBar
    // ----------------------------------------------------
    console.log('\n=== Suite 3: ReviewFilterBar ===');
    const { ReviewFilterBar } = await server.ssrLoadModule('./src/components/reviews/ReviewFilterBar.tsx');

    // 3.1 Search input and clear button rendering
    {
      const htmlWithQuery = renderToStaticMarkup(React.createElement(ReviewFilterBar, {
        searchQuery: 'roti bakar',
        onSearchChange: () => {},
        ratingFilter: null,
        onRatingFilterChange: () => {},
        sortBy: 'terbaru',
        onSortChange: () => {},
      }));
      assert(htmlWithQuery.includes('value="roti bakar"'), 'ReviewFilterBar: renders current search query');
      assert(htmlWithQuery.includes('aria-label="Hapus pencarian"'), 'ReviewFilterBar: renders clear button when query is present');

      const htmlEmpty = renderToStaticMarkup(React.createElement(ReviewFilterBar, {
        searchQuery: '',
        onSearchChange: () => {},
        ratingFilter: null,
        onRatingFilterChange: () => {},
        sortBy: 'terbaru',
        onSortChange: () => {},
      }));
      assert(!htmlEmpty.includes('aria-label="Hapus pencarian"'), 'ReviewFilterBar: hides clear button when query is empty');
    }

    // 3.2 Rating filter and sort selection display
    {
      const html = renderToStaticMarkup(React.createElement(ReviewFilterBar, {
        searchQuery: '',
        onSearchChange: () => {},
        ratingFilter: 5,
        onRatingFilterChange: () => {},
        sortBy: 'rating-tinggi',
        onSortChange: () => {},
      }));
      assert(html.includes('5 Bintang'), 'ReviewFilterBar: renders selected rating label (5 Bintang)');
      assert(html.includes('Rating Tertinggi'), 'ReviewFilterBar: renders selected sort label (Rating Tertinggi)');
    }

    // 3.3 Event callbacks: Search, Rating, Sort
    {
      setupMockDispatcher();
      let changedQuery = null;
      let changedRating = null;
      let changedSort = null;

      const vdom = ReviewFilterBar({
        searchQuery: 'test',
        onSearchChange: (q) => { changedQuery = q; },
        ratingFilter: null,
        onRatingFilterChange: (r) => { changedRating = r; },
        sortBy: 'terbaru',
        onSortChange: (s) => { changedSort = s; },
      });

      // Search input change
      const searchInput = vdom.props.children[0].props.children[1];
      searchInput.props.onChange({ target: { value: 'donat' } });
      assert(changedQuery === 'donat', 'ReviewFilterBar: search input onChange calls onSearchChange');

      // Clear button click
      const clearBtn = vdom.props.children[0].props.children[2];
      clearBtn.props.onClick();
      assert(changedQuery === '', 'ReviewFilterBar: clear button onClick calls onSearchChange("")');
    }

    // ----------------------------------------------------
    // Suite 4: ReviewPagination
    // ----------------------------------------------------
    console.log('\n=== Suite 4: ReviewPagination ===');
    const { ReviewPagination } = await server.ssrLoadModule('./src/components/reviews/ReviewPagination.tsx');

    // 4.1 Total pages <= 1 returns null
    {
      const vdom1 = ReviewPagination({ currentPage: 1, totalPages: 1, onPageChange: () => {} });
      assert(vdom1 === null, 'ReviewPagination (totalPages=1): renders null');
      const vdom0 = ReviewPagination({ currentPage: 1, totalPages: 0, onPageChange: () => {} });
      assert(vdom0 === null, 'ReviewPagination (totalPages=0): renders null');
    }

    // 4.2 Page boundary calculations: Page 1 of 5
    {
      let targetPage = null;
      setupMockDispatcher();
      const vdom = ReviewPagination({
        currentPage: 1,
        totalPages: 5,
        onPageChange: (p) => { targetPage = p; },
      });

      const prevBtn = vdom.props.children[0];
      const pageBtns = vdom.props.children[1].props.children;
      const nextBtn = vdom.props.children[2];

      assert(prevBtn.props.disabled === true, 'ReviewPagination (page 1 of 5): Sebelumnya button is disabled');
      assert(nextBtn.props.disabled === false, 'ReviewPagination (page 1 of 5): Selanjutnya button is enabled');
      assert(pageBtns[0].props['aria-current'] === 'page', 'ReviewPagination (page 1 of 5): Page 1 has aria-current="page"');
      assert(pageBtns[0].props.className.includes('bg-gray-900'), 'ReviewPagination (page 1 of 5): Page 1 has active styling');

      nextBtn.props.onClick();
      assert(targetPage === 2, 'ReviewPagination: clicking Selanjutnya on page 1 requests page 2');
    }

    // 4.3 Page boundary calculations: Last page (5 of 5)
    {
      let targetPage = null;
      setupMockDispatcher();
      const vdom = ReviewPagination({
        currentPage: 5,
        totalPages: 5,
        onPageChange: (p) => { targetPage = p; },
      });

      const prevBtn = vdom.props.children[0];
      const pageBtns = vdom.props.children[1].props.children;
      const nextBtn = vdom.props.children[2];

      assert(prevBtn.props.disabled === false, 'ReviewPagination (page 5 of 5): Sebelumnya button is enabled');
      assert(nextBtn.props.disabled === true, 'ReviewPagination (page 5 of 5): Selanjutnya button is disabled');
      assert(pageBtns[4].props['aria-current'] === 'page', 'ReviewPagination (page 5 of 5): Page 5 has aria-current="page"');

      prevBtn.props.onClick();
      assert(targetPage === 4, 'ReviewPagination: clicking Sebelumnya on page 5 requests page 4');
    }

    // 4.4 Pagination with ellipses (Page 5 of 10)
    {
      let targetPage = null;
      setupMockDispatcher();
      const vdom = ReviewPagination({
        currentPage: 5,
        totalPages: 10,
        onPageChange: (p) => { targetPage = p; },
      });

      const pageItems = vdom.props.children[1].props.children;
      // Should generate: 1, ..., 4, 5, 6, ..., 10 -> 7 items
      assert(pageItems.length === 7, 'ReviewPagination (page 5 of 10): generates 7 items with ellipses');
      assert(pageItems[1].props.children === '…', 'ReviewPagination: second item is leading ellipsis');
      assert(pageItems[5].props.children === '…', 'ReviewPagination: sixth item is trailing ellipsis');

      // Click page 6
      pageItems[4].props.onClick();
      assert(targetPage === 6, 'ReviewPagination: clicking page 6 button requests page 6');
    }

    // ----------------------------------------------------
    // Suite 5: ReviewSummaryCards & ReviewCard
    // ----------------------------------------------------
    console.log('\n=== Suite 5: ReviewSummaryCards & ReviewCard ===');
    const { ReviewSummaryCards } = await server.ssrLoadModule('./src/components/reviews/ReviewSummaryCards.tsx');
    const { ReviewCard } = await server.ssrLoadModule('./src/components/reviews/ReviewCard.tsx');

    // 5.1 ReviewSummaryCards loading vs loaded
    {
      const htmlLoading = renderToStaticMarkup(React.createElement(ReviewSummaryCards, {
        averageRating: 4.8,
        totalReviews: 128,
        distribution: {},
        isLoading: true,
      }));
      assert(htmlLoading.includes('animate-pulse'), 'ReviewSummaryCards: renders pulse skeleton when loading');

      const htmlLoaded = renderToStaticMarkup(React.createElement(ReviewSummaryCards, {
        averageRating: 4.8,
        totalReviews: 1250,
        distribution: { 5: 1000, 4: 200, 3: 50, 2: 0, 1: 0 },
        isLoading: false,
      }));
      assert(htmlLoaded.includes('RATING TOKO'), 'ReviewSummaryCards: renders Card 1 (RATING TOKO)');
      assert(htmlLoaded.includes('4.8'), 'ReviewSummaryCards: renders score 4.8');
      assert(htmlLoaded.includes('TOTAL ULASAN'), 'ReviewSummaryCards: renders Card 2 (TOTAL ULASAN)');
      assert(htmlLoaded.includes('1.250'), 'ReviewSummaryCards: renders formatted count (1.250)');
      assert(htmlLoaded.includes('DISTRIBUSI PENILAIAN'), 'ReviewSummaryCards: renders Card 3 (DISTRIBUSI PENILAIAN)');
    }

    // 5.2 ReviewCard
    {
      let edited = false;
      let deleted = false;
      const htmlCard = renderToStaticMarkup(React.createElement(ReviewCard, {
        id: 'rev-1',
        reviewerName: 'Budi Santoso',
        rating: 5,
        createdAt: '2026-03-01T10:00:00Z',
        comment: 'Roti sangat fresh dan kemasannya rapi!',
        productName: 'Roti Gandum',
        canEdit: true,
        canDelete: true,
        onEdit: () => { edited = true; },
        onDelete: () => { deleted = true; },
      }));

      assert(htmlCard.includes('Budi Santoso'), 'ReviewCard: renders reviewer name');
      assert(htmlCard.includes('BS'), 'ReviewCard: renders fallback initials avatar "BS"');
      assert(htmlCard.includes('Roti Gandum'), 'ReviewCard: renders product pill badge');
      assert(htmlCard.includes('Roti sangat fresh'), 'ReviewCard: renders review comment');
      assert(htmlCard.includes('aria-label="Edit ulasan"'), 'ReviewCard: renders edit button with aria-label="Edit ulasan" when canEdit=true');
      assert(htmlCard.includes('aria-label="Hapus ulasan"'), 'ReviewCard: renders delete button with aria-label="Hapus ulasan" when canDelete=true');
    }

    // ----------------------------------------------------
    // Suite 6: Barrel Export Verification (index.ts)
    // ----------------------------------------------------
    console.log('\n=== Suite 6: Barrel Exports (index.ts) ===');
    const barrel = await server.ssrLoadModule('./src/components/reviews/index.ts');
    assert(typeof barrel.StarRating === 'function', 'index.ts: exports StarRating');
    assert(typeof barrel.RatingDistribution === 'function', 'index.ts: exports RatingDistribution');
    assert(typeof barrel.ReviewSummaryCards === 'function', 'index.ts: exports ReviewSummaryCards');
    assert(typeof barrel.ReviewCard === 'function', 'index.ts: exports ReviewCard');
    assert(typeof barrel.ReviewFilterBar === 'function', 'index.ts: exports ReviewFilterBar');
    assert(typeof barrel.ReviewPagination === 'function', 'index.ts: exports ReviewPagination');
    assert(typeof barrel.ReviewSubmissionModal === 'function', 'index.ts: exports ReviewSubmissionModal');

  } catch (err) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  } finally {
    await server.close();
  }

  console.log('\n====================================================');
  console.log(`Test Summary: Passed: ${passed}, Failed: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
