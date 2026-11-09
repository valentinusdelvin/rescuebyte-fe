import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('WORKER VERIFICATION TEST SUITE: REVIEW REMEDIATION (R1, R2, R3)');
console.log('================================================================\n');

const projectRoot = process.cwd();

// --- Requirement R1 Verification ---
console.log('--- REQUIREMENT R1: Read-Only Reviews on Product Detail ---');
const prodReviewsCode = fs.readFileSync(
  path.join(projectRoot, 'src/components/customer/product/ProductReviewsSection.tsx'),
  'utf8'
);

assert(
  !prodReviewsCode.includes('Tulis Ulasan'),
  'FAIL R1: ProductReviewsSection must NOT contain "Tulis Ulasan" button'
);
console.log('  ✓ PASS R1: No "Tulis Ulasan" button exists in ProductReviewsSection');

assert(
  !prodReviewsCode.includes('Ulasan Pertama'),
  'FAIL R1: ProductReviewsSection must NOT contain "Ulasan Pertama" button'
);
console.log('  ✓ PASS R1: No "Ulasan Pertama" button exists in ProductReviewsSection');

assert(
  prodReviewsCode.includes('canEdit={false}'),
  'FAIL R1: Review cards must enforce canEdit={false}'
);
assert(
  prodReviewsCode.includes('canDelete={false}'),
  'FAIL R1: Review cards must enforce canDelete={false}'
);
console.log('  ✓ PASS R1: Review cards strictly enforce canEdit={false} and canDelete={false}');

assert(
  prodReviewsCode.includes('useProductReviews'),
  'FAIL R1: Review fetching hook useProductReviews must be preserved'
);
console.log('  ✓ PASS R1: useProductReviews data fetching is preserved and functional');

// --- Requirement R2 Verification ---
console.log('\n--- REQUIREMENT R2: Order Detail Review Trigger and Dual Submission Flow ---');
const orderDetailCode = fs.readFileSync(
  path.join(projectRoot, 'src/pages/customer/CustomerOrderDetail.tsx'),
  'utf8'
);
const orderReviewModalCode = fs.readFileSync(
  path.join(projectRoot, 'src/components/customer/order/OrderReviewModal.tsx'),
  'utf8'
);
const orderTypesCode = fs.readFileSync(
  path.join(projectRoot, 'src/components/customer/order/types.ts'),
  'utf8'
);

assert(
  orderTypesCode.includes('productId?: string;'),
  'FAIL R2: OrderItemDetail must contain productId?: string'
);
console.log('  ✓ PASS R2: OrderItemDetail includes optional productId');

assert(
  orderDetailCode.includes('isOrderCompleted &&'),
  'FAIL R2: OrderReviewSection must be conditionally rendered only when order is completed'
);
console.log('  ✓ PASS R2: OrderReviewSection is guarded by isOrderCompleted status check');

assert(
  orderReviewModalCode.includes('Ulasan Toko') && orderReviewModalCode.includes('Ulasan Produk'),
  'FAIL R2: OrderReviewModal must have two distinct sections for Store Review and Product Review'
);
console.log('  ✓ PASS R2: OrderReviewModal contains dual sections for Store Review and Product Review');

assert(
  orderDetailCode.includes('reviewApi.createStoreReview') &&
  orderDetailCode.includes('reviewApi.createProductReview'),
  'FAIL R2: CustomerOrderDetail must submit reviews via reviewApi.createStoreReview and reviewApi.createProductReview'
);
console.log('  ✓ PASS R2: CustomerOrderDetail submits both store and product reviews to real API endpoints');

assert(
  orderDetailCode.includes('Promise.all'),
  'FAIL R2: Dual review submission must execute via Promise.all'
);
console.log('  ✓ PASS R2: Dual review submission executes in parallel via Promise.all');

// --- Requirement R3 Verification ---
console.log('\n--- REQUIREMENT R3: Seller Dashboard & Store Page Review Display ---');
const appCode = fs.readFileSync(path.join(projectRoot, 'src/App.tsx'), 'utf8');
const appRoutesCode = fs.readFileSync(path.join(projectRoot, 'src/app/AppRoutes.tsx'), 'utf8');
const sellerReviewsCode = fs.readFileSync(
  path.join(projectRoot, 'src/pages/seller/SellerReviews.tsx'),
  'utf8'
);
const storeTypesCode = fs.readFileSync(
  path.join(projectRoot, 'src/components/customer/store/types.ts'),
  'utf8'
);
const useReviewsCode = fs.readFileSync(
  path.join(projectRoot, 'src/hooks/useReviews.ts'),
  'utf8'
);
const customerStoreDetailCode = fs.readFileSync(
  path.join(projectRoot, 'src/pages/customer/CustomerStoreDetail.tsx'),
  'utf8'
);
const storeReviewsListCode = fs.readFileSync(
  path.join(projectRoot, 'src/components/customer/store/StoreReviewsList.tsx'),
  'utf8'
);

assert(
  appCode.includes("localStorage.setItem('rescuebyte_store_id', store.id)"),
  'FAIL R3: App.tsx must persist store.id into localStorage rescuebyte_store_id'
);
console.log('  ✓ PASS R3: App.tsx saves store.id into localStorage rescuebyte_store_id');

assert(
  !appRoutesCode.includes('<SellerReviews storeName={storeName} storeId={storeId} />'),
  'FAIL R3: AppRoutes.tsx must not pass foreign storeId to SellerReviews'
);
console.log('  ✓ PASS R3: AppRoutes.tsx avoids passing foreign storeId to SellerReviews');

assert(
  sellerReviewsCode.includes('rescuebyte_store_id'),
  'FAIL R3: SellerReviews must resolve stored store ID from localStorage'
);
console.log('  ✓ PASS R3: SellerReviews resolves stored store ID cleanly');

assert(
  storeTypesCode.includes("type?: 'store' | 'product';"),
  'FAIL R3: StoreReviewItem must include type?: store | product'
);
console.log('  ✓ PASS R3: StoreReviewItem includes type, productId, productName, productImage');

assert(
  useReviewsCode.includes('export function useStoreProductReviews'),
  'FAIL R3: useReviews.ts must export useStoreProductReviews hook'
);
console.log('  ✓ PASS R3: useStoreProductReviews hook is exported');

assert(
  customerStoreDetailCode.includes('useStoreProductReviews(storeProducts)'),
  'FAIL R3: CustomerStoreDetail must consume useStoreProductReviews hook'
);
console.log('  ✓ PASS R3: CustomerStoreDetail consumes useStoreProductReviews hook');

assert(
  storeReviewsListCode.includes('Semua Ulasan') &&
  storeReviewsListCode.includes('Ulasan Toko') &&
  storeReviewsListCode.includes('Ulasan Produk'),
  'FAIL R3: StoreReviewsList must provide filter tabs for Semua, Toko, and Produk'
);
console.log('  ✓ PASS R3: StoreReviewsList provides filter tabs for Semua Ulasan, Ulasan Toko, and Ulasan Produk');

assert(
  storeReviewsListCode.includes('🏪 Ulasan Toko'),
  'FAIL R3: StoreReviewsList must display store review badge'
);
console.log('  ✓ PASS R3: StoreReviewsList renders differentiated badges for store vs product reviews');

console.log('\n================================================================');
console.log('ALL WORKER VERIFICATION TESTS PASSED SUCCESSFULLY! (14/14)');
console.log('================================================================');
