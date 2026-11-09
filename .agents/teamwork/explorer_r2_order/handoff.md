# Investigation Report: Requirement R2 (Order Detail Review Trigger and Dual Submission Flow)

**Explorer**: explorer_r2_order  
**Milestone**: Requirement R2  
**Date**: 2026-11-09  

---

## 1. Observation

### 1.1 Current Order Status Handling in `CustomerOrderDetail.tsx`
In `src/pages/customer/CustomerOrderDetail.tsx`:
- Lines 162-171:
  ```tsx
  const [currentStatus, setCurrentStatus] = useState<CustomerOrderStatus>(() => {
    const s = effectiveOrderData?.status || orderData?.status;
    if (s === 'menunggu-pembayaran' || s === 'menunggu-konfirmasi' || s === 'diproses' || s === 'siap-diambil' || s === 'selesai' || s === 'dibatalkan') {
      return s;
    }
    if (effectiveOrderData?.snapRedirectUrl || effectiveOrderData?.snapToken) {
      return 'menunggu-pembayaran';
    }
    return 'menunggu-konfirmasi';
  });
  ```
- Lines 256-264:
  ```tsx
  const activeStep = useMemo(() => {
    if (currentStatus === 'menunggu-pembayaran') return 1;
    if (currentStatus === 'menunggu-konfirmasi') return 2;
    if (currentStatus === 'diproses') return 3;
    if (currentStatus === 'siap-diambil') return 4;
    if (currentStatus === 'selesai') return 5;
    if (currentStatus === 'dibatalkan') return 1;
    return 2;
  }, [currentStatus]);
  ```
- Backend status mapping in `src/services/orders/orderStatus.ts`:
  ```ts
  export function mapBackendStatusToCustomerStatus(backendStatus: string): CustomerOrderStatus {
    const status = (backendStatus || '').toUpperCase();
    if (['PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS'].includes(status)) return 'menunggu-konfirmasi';
    ...
    if (status.includes('COMPLETE') || status === 'COMPLETED' || status === 'FINISHED') return 'selesai';
    ...
  }
  ```

### 1.2 Review Prompt Card Guarding Condition in `CustomerOrderDetail.tsx`
In `src/pages/customer/CustomerOrderDetail.tsx` (lines 707-713):
```tsx
{/* Feedback & Review Prompt Card */}
<OrderReviewSection
  storeName={storeName}
  setIsReviewModalOpen={setIsReviewModalOpen}
  selectedRating={selectedRating}
  setSelectedRating={setSelectedRating}
  isReviewSubmitted={isReviewSubmitted}
/>
```
**Observation**: The card is rendered **unconditionally** without checking if the order status is `'selesai'`. Even orders in `menunggu-pembayaran`, `menunggu-konfirmasi`, `diproses`, or `siap-diambil` currently render this review card.

### 1.3 Review Submission Mock in `CustomerOrderDetail.tsx`
In `src/pages/customer/CustomerOrderDetail.tsx` (lines 527-536):
```tsx
const handleSubmitReview = (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmittingReview(true);
  setTimeout(() => {
    setIsSubmittingReview(false);
    setIsReviewModalOpen(false);
    setIsReviewSubmitted(true);
    onShowToast?.('Terima kasih! Ulasan kamu berhasil dikirim.', 'success');
  }, 600);
};
```
**Observation**: This is a mock implementation with `setTimeout`. It does NOT execute any API call to `POST /api/v1/stores/{store_id}/reviews` or `POST /api/v1/products/{product_id}/reviews`.

### 1.4 Existing Review Modal Architecture in `OrderReviewModal.tsx`
In `src/components/customer/order/OrderReviewModal.tsx`:
- Lines 16-76: `OrderReviewSection` renders the prompt card with heading "Bagaimana Pengalamanmu?", star rating buttons (1-5), and action button "Beri Ulasan Sekarang".
- Lines 79-188: `OrderReviewModal` only displays a single section for the store (`"Beri Ulasan untuk {storeName}"`), with one rating picker and one comment textarea. There is NO Product Review section.

### 1.5 Existing API Service & Mutation Hooks
In `src/api/services/reviewApi.ts`:
- Lines 35-44:
  ```ts
  export async function createProductReview(
    productId: string,
    data: CreateReviewRequest
  ): Promise<ReviewResponse> {
    const res = await apiClient.post<ReviewResponse>(
      `/api/v1/products/${productId}/reviews`,
      data
    );
    return res.data;
  }
  ```
- Lines 65-74:
  ```ts
  export async function createStoreReview(
    storeId: string,
    data: CreateReviewRequest
  ): Promise<ReviewResponse> {
    const res = await apiClient.post<ReviewResponse>(
      `/api/v1/stores/${storeId}/reviews`,
      data
    );
    return res.data;
  }
  ```
In `src/api/types.ts`:
```ts
export interface CreateReviewRequest {
  rating: number;
  content: string;
}
```
In `src/hooks/useReviews.ts`:
`useReviewMutations` provides `createProductReview` and `createStoreReview`.

### 1.6 ID Propagation in Deep Linking (`App.tsx` & `useHashNavigation.ts`)
In `src/app/useHashNavigation.ts` (lines 74-87) and `src/App.tsx` (lines 283-296):
When `fetchOrderDetailApi(orderId)` loads order details, `store_id` and `product_id` were not mapped into `setPaymentOrderData`:
```ts
// Existing snippet in useHashNavigation.ts and App.tsx:
items: (apiDetail.items || []).map((it: any) => ({
  id: it.id,
  // it.product_id was NOT mapped to productId!
  name: it.product_name || 'Paket Surplus',
  ...
})),
primaryStore: {
  // apiDetail.store_id was NOT mapped to storeId!
  storeName: apiDetail.store_name || 'Toko Mitra',
  storeAddress: apiDetail.store_address || '',
}
```

---

## 2. Logic Chain

1. **Guarding the Review Card**:
   - The Acceptance Criteria mandates:
     - "The 'Bagaimana Pengalamanmu? Beri Ulasan Sekarang' card is hidden if the order status is not completed."
     - "The 'Bagaimana Pengalamanmu? Beri Ulasan Sekarang' card is visible when the order status is completed ('selesai')."
   - In `CustomerOrderDetail.tsx`, order completion is indicated by `currentStatus === 'selesai'` or `activeStep === 5`.
   - Wrapping `<OrderReviewSection ... />` in `{isOrderCompleted && (...) }` directly fulfills this requirement.

2. **Dual-Section Review Modal Design**:
   - The Acceptance Criteria mandates:
     - "The review modal contains two distinct sections: one for Store Review and one for Product Review."
   - In `OrderReviewModal.tsx`, structure the modal dialog into two explicit card sections:
     - **Section 1: Ulasan Toko (Store Review)**:
       - Displays store icon, `storeName`, and subtitle.
       - Star Rating picker (1–5) with text satisfaction indicator (e.g. "Sangat Puas!", "Puas", etc.).
       - Textarea for store review comment (e.g. "Ceritakan pengalaman berbelanja dan pelayanan toko...").
     - **Section 2: Ulasan Produk (Product Review)**:
       - Displays product thumbnail, `productName`, and quantity badge.
       - If multiple products exist in the order, provides an item selector tab or lists each item.
       - Star Rating picker (1–5) with text satisfaction indicator.
       - Textarea for product review comment (e.g. "Ceritakan kesegaran, rasa, dan kualitas makanan surplus...").
   - A single unified footer with "Batal" and "Kirim Ulasan" (or individual submission triggers).

3. **Dual Submission Execution**:
   - The Acceptance Criteria mandates:
     - "Submitting a store review sends a request to `POST /api/v1/stores/{store_id}/reviews`."
     - "Submitting a product review sends a request to `POST /api/v1/products/{product_id}/reviews`."
   - On clicking "Kirim Ulasan":
     - Store review payload: `{ rating: storeRating, content: storeComment.trim() }` submitted to `reviewApi.createStoreReview(storeId, ...)`.
     - Product review payload: `{ rating: productRating, content: productComment.trim() }` submitted to `reviewApi.createProductReview(productId, ...)`.
     - Dispatched simultaneously via `Promise.all` or `Promise.allSettled`.
     - Displays success toast: `"Ulasan toko dan produk berhasil dikirim!"`.
     - Closes modal and updates state: `isReviewSubmitted(true)`.

4. **Ensuring `store_id` and `product_id` Availability**:
   - In `CustomerOrderDetail.tsx`:
     - Maintain `backendOrderDetail` state when `refreshOrderStatus` fetches `fetchOrderDetailApi(backendOrderId)`.
     - `resolvedStoreId = backendOrderDetail?.store_id || effectiveOrderData?.primaryStore?.storeId || profileStoreId || storeProfile?.id || '';`
     - Map `resolvedItems`: each item receives `productId = it.product_id || it.productId || it.id`.
   - In `src/app/useHashNavigation.ts` and `src/App.tsx`:
     - Add `productId: it.product_id || it.id` in `items.map`.
     - Add `storeId: apiDetail.store_id` in `primaryStore`.

---

## 3. Caveats

1. **Multiple Items in an Order**:
   - Most food rescue orders contain 1 item (Mystery Box package). If an order contains multiple distinct items, the modal should default to the primary item and provide a simple selector/tab to switch between items or review the primary item.
2. **Missing Backend ID on Mock Orders**:
   - If a user tests an offline dummy order that has no real UUID in the database, the API will return 400 or 404. The submission logic must catch this with `extractErrorMessage(err)` and display an informative error toast instead of crashing.
3. **Empty Comment Handling**:
   - Backend Swagger validates review content. If the user only selects star ratings without text, prompt them with a helpful validation message: "Mohon isi ulasan sebelum mengirim."

---

## 4. Conclusion & Concrete Recommendations for Worker

### Step 1: Update `src/components/customer/order/types.ts`
Add `productId` to `OrderItemDetail`:
```ts
export interface OrderItemDetail {
  id?: string;
  productId?: string;
  name?: string;
  imageSrc?: string;
  originalPrice?: number;
  rescuePrice?: number;
  discountPercent?: number;
  quantity?: number;
  storeName?: string;
}
```

### Step 2: Refactor `src/components/customer/order/OrderReviewModal.tsx`
1. Keep `OrderReviewSection` intact, ensuring it triggers opening the modal.
2. Upgrade `OrderReviewModal` to implement the dual-section layout:
   - Accept props:
     - `storeName: string`
     - `storeId: string`
     - `items: OrderItemDetail[]`
     - `isOpen: boolean`
     - `onClose: () => void`
     - `onSubmit: (storeReview: { rating: number; content: string }, productReviews: Array<{ productId: string; rating: number; content: string }>) => Promise<void>`
     - `isSubmitting: boolean`
     - `isSubmitted: boolean`
   - Render Section 1: Store Review (`storeName`, star rating, comment textarea).
   - Render Section 2: Product Review (`productName`, thumbnail, star rating, comment textarea).
   - Add input validation (minimum 1 star and non-empty comment).
   - Call `onSubmit` on form submission.

### Step 3: Update `src/pages/customer/CustomerOrderDetail.tsx`
1. Guard `OrderReviewSection`:
   ```tsx
   const isOrderCompleted = currentStatus === 'selesai' || activeStep === 5;

   {/* Feedback & Review Prompt Card - ONLY rendered when status is selesai */}
   {isOrderCompleted && (
     <OrderReviewSection
       storeName={storeName}
       setIsReviewModalOpen={setIsReviewModalOpen}
       selectedRating={selectedRating}
       setSelectedRating={setSelectedRating}
       isReviewSubmitted={isReviewSubmitted}
     />
   )}
   ```
2. Store `backendOrderDetail` when `refreshOrderStatus` runs:
   ```tsx
   const [backendOrderDetail, setBackendOrderDetail] = useState<any | null>(null);
   // inside refreshOrderStatus:
   const latest = await fetchOrderDetailApi(backendOrderId);
   if (latest) setBackendOrderDetail(latest);
   ```
3. Compute `resolvedStoreId` and `resolvedItems` with `productId`.
4. Replace `handleSubmitReview` mock with real API calls using `reviewApi`:
   ```tsx
   const handleSubmitReviewDual = async (
     storeReview: { rating: number; content: string },
     productReviews: Array<{ productId: string; rating: number; content: string }>
   ) => {
     setIsSubmittingReview(true);
     try {
       const calls: Promise<any>[] = [];
       if (resolvedStoreId && storeReview.rating > 0) {
         calls.push(reviewApi.createStoreReview(resolvedStoreId, storeReview));
       }
       for (const pr of productReviews) {
         if (pr.productId && pr.rating > 0) {
           calls.push(reviewApi.createProductReview(pr.productId, { rating: pr.rating, content: pr.content }));
         }
       }
       if (calls.length === 0) {
         onShowToast?.('Mohon lengkapi ulasan toko atau produk terlebih dahulu.', 'warning');
         return;
       }
       await Promise.all(calls);
       setIsReviewSubmitted(true);
       setIsReviewModalOpen(false);
       onShowToast?.('Terima kasih! Ulasan toko dan produk berhasil dikirim.', 'success');
     } catch (err) {
       onShowToast?.(extractErrorMessage(err, 'Gagal mengirim ulasan. Silakan coba lagi.'), 'error');
     } finally {
       setIsSubmittingReview(false);
     }
   };
   ```

### Step 4: Update `src/app/useHashNavigation.ts` & `src/App.tsx`
In `fetchOrderDetailApi(oId).then((apiDetail) => ...)`:
- Ensure `primaryStore.storeId: apiDetail.store_id` is passed.
- Ensure `items: apiDetail.items.map(it => ({ ..., productId: it.product_id }))` is passed.

---

## 5. Verification Method

1. **Type Safety & Build Verification**:
   ```powershell
   npm run typecheck
   npm run build
   ```
   Must pass with 0 errors.

2. **Order Detail Status Guarding Verification**:
   - Open order detail with status `menunggu-pembayaran`, `menunggu-konfirmasi`, `diproses`, or `siap-diambil`:
     - Verify: "Bagaimana Pengalamanmu? Beri Ulasan Sekarang" card is **NOT rendered**.
   - Open order detail with status `selesai` (or completed order):
     - Verify: "Bagaimana Pengalamanmu? Beri Ulasan Sekarang" card is **rendered visibly**.

3. **Dual Review Modal & API Submission Verification**:
   - Click "Beri Ulasan Sekarang":
     - Verify: Modal dialog opens with two distinct sections:
       1. Store Review section with star rating and comment.
       2. Product Review section with product info, star rating, and comment.
   - Enter reviews and click "Kirim Ulasan":
     - Verify network tab:
       - `POST /api/v1/stores/{store_id}/reviews` sent with `{ rating, content }`.
       - `POST /api/v1/products/{product_id}/reviews` sent with `{ rating, content }`.
     - Verify UI feedback: Success toast appears and modal closes.

4. **Invalidation Conditions**:
   - If "Bagaimana Pengalamanmu?" card appears when order status is NOT selesai.
   - If the review modal only provides a single store or single product review.
   - If review submission uses fake `setTimeout` mock instead of `reviewApi`.
