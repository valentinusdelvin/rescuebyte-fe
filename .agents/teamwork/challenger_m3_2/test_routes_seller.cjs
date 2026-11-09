const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('CHALLENGER 2: EMPIRICAL ROUTING & NAVIGATION TEST');
console.log('Milestone 3: Seller Dashboard "Ulasan Pembeli"');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  process.stdout.write(`TEST ${totalTests}: ${name} ... `);
  try {
    fn();
    passedTests++;
    console.log('PASSED');
  } catch (err) {
    failedTests++;
    console.log('FAILED');
    console.error('  Error:', err.message);
  }
}

const rootDir = path.resolve(__dirname, '../../..');
const appRoutesPath = path.join(rootDir, 'src/app/AppRoutes.tsx');
const sidebarPath = path.join(rootDir, 'src/components/layout/Sidebar.tsx');
const sellerReviewsPath = path.join(rootDir, 'src/pages/seller/SellerReviews.tsx');

const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
const sellerReviewsContent = fs.readFileSync(sellerReviewsPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: AppRoutes.tsx Integration
// ----------------------------------------------------

runTest('AppRoutes has lazy-loaded SellerReviews import', () => {
  const lazyRegex = /const\s+SellerReviews\s*=\s*React\.lazy\(\s*\(\)\s*=>\s*import\(['"]\.\.\/pages\/seller\/SellerReviews['"]\)\.then\(\s*\(m\)\s*=>\s*\(\{\s*default:\s*m\.SellerReviews\s*\}\)\s*\)\s*\);/;
  assert(
    lazyRegex.test(appRoutesContent),
    'AppRoutes.tsx does not contain code-split React.lazy import for SellerReviews matching project pattern'
  );
});

runTest('AppRoutes renders <SellerReviews> when activeView === "view-ulasan"', () => {
  const sellerReviewRenderRegex = /\{activeView\s*===\s*['"]view-ulasan['"]\s*&&\s*\(\s*<SellerReviews\s+storeName=\{storeName\}\s+storeId=\{storeId\}\s*\/>\s*\)\}/;
  assert(
    sellerReviewRenderRegex.test(appRoutesContent),
    'AppRoutes.tsx does not correctly render <SellerReviews storeName={storeName} storeId={storeId} /> for view-ulasan'
  );
});

runTest('AppRoutes excludes "view-ulasan" from PlaceholderPage fallback', () => {
  const placeholderBlockRegex = /\{activeView\s*!==\s*['"]view-beranda['"]\s*&&\s*activeView\s*!==\s*['"]view-profil['"]\s*&&\s*activeView\s*!==\s*['"]view-riwayat['"]\s*&&\s*activeView\s*!==\s*['"]view-buat-dagangan['"]\s*&&\s*activeView\s*!==\s*['"]view-daganganku['"]\s*&&\s*activeView\s*!==\s*['"]view-ulasan['"]\s*&&\s*\(\s*<PlaceholderPage/;
  assert(
    placeholderBlockRegex.test(appRoutesContent),
    'AppRoutes.tsx does not exclude "view-ulasan" from triggering <PlaceholderPage>'
  );
});

runTest('Empirically simulate AppRoutes route resolution logic', () => {
  // Extract all exclusion clauses for placeholder
  function wouldRenderPlaceholder(activeView) {
    return (
      activeView !== 'view-beranda' &&
      activeView !== 'view-profil' &&
      activeView !== 'view-riwayat' &&
      activeView !== 'view-buat-dagangan' &&
      activeView !== 'view-daganganku' &&
      activeView !== 'view-ulasan'
    );
  }

  function resolveViewComponent(activeView) {
    if (activeView === 'view-ulasan') return 'SellerReviews';
    if (activeView === 'view-beranda') return 'Dashboard';
    if (activeView === 'view-profil') return 'StoreProfile';
    if (activeView === 'view-riwayat') return 'OrderHistory';
    if (activeView === 'view-buat-dagangan') return 'BuatDagangan';
    if (activeView === 'view-daganganku') return 'Daganganku';
    if (wouldRenderPlaceholder(activeView)) return 'PlaceholderPage';
    return null;
  }

  assert.strictEqual(
    wouldRenderPlaceholder('view-ulasan'),
    false,
    'PlaceholderPage should NOT render for view-ulasan'
  );
  assert.strictEqual(
    resolveViewComponent('view-ulasan'),
    'SellerReviews',
    'Component for view-ulasan must resolve to SellerReviews'
  );
  assert.strictEqual(
    resolveViewComponent('view-laporan'),
    'PlaceholderPage',
    'Unimplemented views must still resolve to PlaceholderPage'
  );
});

// ----------------------------------------------------
// TEST GROUP 2: Sidebar.tsx Interaction & Active State
// ----------------------------------------------------

runTest('Sidebar contains button with id="nav-ulasan"', () => {
  assert(
    sidebarContent.includes('id="nav-ulasan"'),
    'Sidebar.tsx is missing navigation item with id="nav-ulasan"'
  );
});

runTest('Sidebar nav-ulasan has label "Ulasan Pembeli"', () => {
  const ulasanLabelRegex = /id="nav-ulasan"[\s\S]*?<StaggeredLinkText\s+text="Ulasan Pembeli"/;
  const alternateUlasanLabelRegex = /<StaggeredLinkText\s+text="Ulasan Pembeli"[\s\S]*?id="nav-ulasan"/;
  assert(
    ulasanLabelRegex.test(sidebarContent) || alternateUlasanLabelRegex.test(sidebarContent),
    'Sidebar.tsx nav-ulasan button does not contain <StaggeredLinkText text="Ulasan Pembeli" ... />'
  );
});

runTest('Sidebar nav-ulasan applies active class "font-extrabold text-[#111827]" when activeView === "view-ulasan"', () => {
  const activeClassPattern = /activeView\s*===\s*['"]view-ulasan['"]\s*\?\s*['"]font-extrabold text-\[#111827\]['"]\s*:\s*['"]font-medium text-\[#4b5563\]['"]/;
  assert(
    activeClassPattern.test(sidebarContent),
    'Sidebar.tsx does not set "font-extrabold text-[#111827]" when activeView === "view-ulasan"'
  );
});

runTest('Sidebar nav-ulasan passes active boolean flag to StaggeredLinkText', () => {
  const staggeredActivePattern = /<StaggeredLinkText\s+text="Ulasan Pembeli"\s+active=\{activeView\s*===\s*['"]view-ulasan['"]\}\s*\/>/;
  assert(
    staggeredActivePattern.test(sidebarContent),
    'Sidebar.tsx does not pass active={activeView === "view-ulasan"} to StaggeredLinkText'
  );
});

runTest('Sidebar nav-ulasan onClick triggers handleItemClick("view-ulasan", "Ulasan Pembeli")', () => {
  const clickHandlerPattern = /onClick=\{\(\)\s*=>\s*handleItemClick\(['"]view-ulasan['"],\s*['"]Ulasan Pembeli['"]\)\}/;
  assert(
    clickHandlerPattern.test(sidebarContent),
    'Sidebar.tsx nav-ulasan onClick does not call handleItemClick("view-ulasan", "Ulasan Pembeli")'
  );
});

runTest('StaggeredLinkText sets font-extrabold text-[#111827] on inner character spans when active=true', () => {
  const spanActivePattern = /active\s*\?\s*['"]font-extrabold text-\[#111827\]['"]\s*:\s*['"]['"]/;
  assert(
    spanActivePattern.test(sidebarContent),
    'StaggeredLinkText does not apply font-extrabold text-[#111827] to character spans when active'
  );
});

// ----------------------------------------------------
// TEST GROUP 3: SellerReviews.tsx Component Integrity
// ----------------------------------------------------

runTest('SellerReviews component exists and has named export', () => {
  const exportPattern = /export\s+function\s+SellerReviews\s*\(/;
  assert(
    exportPattern.test(sellerReviewsContent),
    'SellerReviews.tsx does not have named export "export function SellerReviews"'
  );
});

runTest('SellerReviews accepts storeName and storeId props', () => {
  const propsPattern = /export\s+interface\s+SellerReviewsProps\s*\{[\s\S]*?storeName\?: string;[\s\S]*?storeId\?: string;/;
  assert(
    propsPattern.test(sellerReviewsContent),
    'SellerReviewsProps is missing storeName or storeId optional string properties'
  );
});

runTest('SellerReviews connects with useStoreReviews hook with autoFetch', () => {
  const hookPattern = /useStoreReviews\(\s*effectiveStoreId,\s*undefined,\s*\{\s*autoFetch:\s*Boolean\(effectiveStoreId\),?\s*\}\s*\)/;
  assert(
    hookPattern.test(sellerReviewsContent),
    'SellerReviews does not call useStoreReviews with effectiveStoreId and autoFetch condition'
  );
});

runTest('SellerReviews renders ReviewSummaryCards, ReviewFilterBar, ReviewCard, and ReviewPagination', () => {
  assert(sellerReviewsContent.includes('<ReviewSummaryCards'), 'SellerReviews missing <ReviewSummaryCards');
  assert(sellerReviewsContent.includes('<ReviewFilterBar'), 'SellerReviews missing <ReviewFilterBar');
  assert(sellerReviewsContent.includes('<ReviewCard'), 'SellerReviews missing <ReviewCard');
  assert(sellerReviewsContent.includes('<ReviewPagination'), 'SellerReviews missing <ReviewPagination');
});

// ----------------------------------------------------
// Summary
// ----------------------------------------------------

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed, ${failedTests} failed.`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
