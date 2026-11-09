# Handoff Report — Explorer 1 (Lead Architect & UI/UX Specialist)
**Milestone**: M1 — RescueByte Frontend Polish & Consistency  
**Date**: 2026-11-09T11:50:00Z  
**Author**: Explorer 1 (`explorer_r1_1`)  
**Recipient**: Lead Architect & Orchestrator (`38968871-17e4-4323-bc74-f1f1c77fe5bd`)  

---

## 1. Observation

### Summary of Scope Investigated
This investigation covers four critical requirements assigned to Explorer 1:
- **R1**: Global removal of floating toast notifications, replacement with inline/button feedback, and removal of obsolete toast components/providers.
- **R2**: Removal of irrelevant role labels (e.g., "seller", "pelanggan") from review identity displays in review cards and sections.
- **R4**: Removal of visual stock quantity badges ("Sisa 97 Box", "Sisa 1 Box") and image overlays from product cards while strictly preserving underlying stock/out-of-stock logic.
- **R5 (UI Layout)**: Inspection of `CustomerHome.tsx` grid layout for "Mystery Box di Sekitar" and "Mystery Box Terlaris" (3 columns x 2 rows = 6 cards on desktop, responsive for tablet/mobile).

---

### Detailed Observations by Requirement

#### R1. Floating Toast Notifications System & Call Sites

1. **Dual Floating Toast Infrastructure Detected**:
   - **System A (`ToastContext.tsx`)**:
     - File: `src/context/ToastContext.tsx` (lines 73-117)
     - Directly mounts a floating fixed container at bottom-right of viewport:
       ```tsx
       {toasts.length > 0 && (
         <div
           role="region"
           aria-label="Notifikasi"
           className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
         >
       ```
     - Wrap location: `src/main.tsx` lines 11-17:
       ```tsx
       <StrictMode>
         <ToastProvider>
           <AuthProvider>
             <CartProvider>
               <App />
             </CartProvider>
           </AuthProvider>
         </ToastProvider>
       </StrictMode>
       ```
   - **System B (`Toast.tsx` + `App.tsx`)**:
     - Component: `src/components/common/Toast.tsx` lines 87-88:
       ```tsx
       className={`fixed bottom-24 right-4 sm:right-6 z-9990 flex items-center gap-3.5 px-4 py-3.5 bg-[#0d1611]/95 text-white border ${containerBorder} rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-auto pointer-events-auto`}
       ```
     - Mounted in: `src/App.tsx` lines 201-228 and line 574:
       ```tsx
       // Global Toast & Loading Overlay
       <Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />
       ```
     - Passed down via `AppRoutes.tsx` as `onShowToast` across ~18 route views.

2. **Duplicate Notification Mechanism (`ProductReviewsSection.tsx`)**:
   - File: `src/components/customer/product/ProductReviewsSection.tsx` (lines 53, 74-104)
     ```tsx
     const {
       handleCreateProductReview,
       handleUpdateReview,
       handleDeleteReview,
       isMutating,
     } = useReviewMutations({ showToast: true });
     ```
     And lines 74-82, 103-105:
     ```tsx
     if (onShowToast && !toastContext?.showToast) {
       onShowToast('Ulasan berhasil diperbarui!');
     }
     ```
     `useReviewMutations` in `src/hooks/useReviews.ts` (lines 320-412) already invokes `toastContext.showToast(...)` for product reviews, store reviews, edits, and deletes. When parent `onShowToast` was also provided, dual notifications were triggered.

3. **Form Validation via Toasts vs Inline Messages**:
   - `src/pages/auth/CustomerAuth.tsx` (lines 101, 110-125, 243, 250-266):
     Validations for empty email/password, role mismatch ("Akun ini terdaftar sebagai Mitra Toko..."), password length, and API errors currently only call `onShowToast(message, 'error')`. Neither `CustomerLoginForm` nor `CustomerRegisterForm` has an inline error banner for form-level errors.
   - `src/pages/seller/BuatDagangan.tsx` (lines 120-138):
     Validations ("Nama produk minimal 2 karakter!", "Harga produk harus lebih dari 0!", "Stok tersedia minimal 1 box!") only call `onShowToast`. No inline banner exists in the form card.
   - `src/pages/customer/CustomerContact.tsx` (lines 75-77):
     Calls `onShowToast('Silakan periksa kembali formulir yang belum lengkap.', 'error')`, but lines 179-183, 206-210, 233-237 ALREADY provide red inline error text under every field (`errors.name`, `errors.email`, `errors.suggestion`). The toast is entirely redundant.
   - `src/pages/seller/StoreProfile.tsx` (lines 282-306):
     Field checks ("Nama toko wajib diisi", "Nomor WhatsApp...", etc.) call `onShowToast`.

4. **Noisy / Operational Toasts**:
   - `src/components/seller/StoreLocationMap.tsx` (lines 134, 151, 160, 184, 192, 238, 271): Toasts for "Mencari alamat titik pin...", "Pin dipindahkan...", "Posisi GPS berhasil diperbarui...".
   - `src/components/seller/StoreInfoForm.tsx` (lines 136, 168, 192): Toasts for "Titik peta disesuaikan", "Kota dipilih", "Kecamatan dipilih".
   - `src/pages/customer/CustomerMarketplace.tsx` (lines 146, 162, 169): "📍 Lokasi terdeteksi...", "Izin lokasi belum diberikan...".
   - `src/pages/customer/CustomerHome.tsx` (line 684) & `CustomerProductDetail.tsx` (line 871): Mock hardcoded toast: `"Selamat datang kembali, Reza Akbar!"`.

---

#### R2. Review Identity Role Labels Display

1. **`CustomerHome.tsx` Testimonials / Customer Reviews ("Apa Kata Mereka")**:
   - File: `src/pages/customer/CustomerHome.tsx` (lines 149-204)
     `TESTIMONIALS` contains explicit role fields:
     - `name: 'Reza Akbar', role: 'Pelanggan'` (line 153)
     - `name: 'Fahmi Fayyidl', role: 'Seller'` (line 162)
     - `name: 'Nadia Putri', role: 'Pelanggan'` (line 171)
     - `name: 'Maya Lestari', role: 'Seller'` (line 189)
   - Rendering: `src/pages/customer/CustomerHome.tsx` (lines 625-630):
     ```tsx
     <h3 className="font-bold text-[#1b1c1c] text-sm">
       {testi.name}
     </h3>
     <span className="text-xs text-gray-500 font-medium">
       {testi.role}
     </span>
     ```
     `{testi.role}` is explicitly rendered directly underneath the user name in each review card!

2. **`StoreReviewsList.tsx` (Customer Store Reviews Section)**:
   - File: `src/components/customer/store/StoreReviewsList.tsx` (lines 68-70):
     ```tsx
     name: r.author?.name || 'Pelanggan',
     role: r.author?.role || 'Penyelamat Makanan',
     avatar: r.author?.avatar_url || '',
     ```
   - Rendering in lines 304-307:
     ```tsx
     <div>
       <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">{rev.name}</p>
       <span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>
     </div>
     ```
     Line 306 explicitly displays `{rev.role}` underneath the reviewer name. If the reviewer's backend role is "seller" or "user", or defaults to "Penyelamat Makanan", that role subtitle is shown.

3. **`CustomerStoreDetail.tsx`**:
   - File: `src/pages/customer/CustomerStoreDetail.tsx` (lines 387-389):
     ```tsx
     name: r.author?.name || 'Pelanggan',
     role: r.author?.role || 'Penyelamat Makanan',
     avatar: r.author?.avatar_url || '',
     ```
   - Directly maps `role` to be consumed by `StoreReviewsList`.

4. **`useReviews.ts`**:
   - File: `src/hooks/useReviews.ts` (line 489):
     ```tsx
     name: r.author?.name || 'Pelanggan RescueByte',
     role: r.author?.role || 'Penyelamat Makanan',
     ```

5. **`ReviewCard.tsx` (Product Reviews & Seller Dashboard Reviews)**:
   - File: `src/components/reviews/ReviewCard.tsx` (lines 122-129):
     ```tsx
     <div className="min-w-0">
       <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
         {reviewerName}
       </h3>
       <div className="mt-1">
         <StarRating rating={rating} size="sm" />
       </div>
     </div>
     ```
     `ReviewCard.tsx` does NOT display a role label. Only user name, avatar/initials, star rating, and date are shown.

---

#### R4. Stock Quantity Badges and Visual Overlays

1. **`MysteryBoxCard.tsx` (Homepage & Marketplace Card Component)**:
   - File: `src/components/customer/MysteryBoxCard.tsx`
   - Lines 120-194 render visual stock badge overlays on top of the product card image:
     ```tsx
     {/* Stock Badge: Abu-abu jika Habis, Merah Muda jika > 2, Merah Tebal jika <= 2 */}
     {isOutOfStock ? (
       <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold ...">
         <span>Sisa 0 Box</span>
       </span>
     ) : isAboveTwo ? (
       <span className="px-2.5 py-1 rounded-full bg-[#FDECEB] text-[#D94A38] text-[11px] font-bold ...">
         <span>{cleanStockText}</span>
       </span>
     ) : (
       <span className="px-2.5 py-1 rounded-full bg-[#b91c1c] text-white text-[11px] font-bold ...">
         <span>{cleanStockText}</span>
       </span>
     )}
     ```
     This produces badges like "Sisa 97 Box", "Sisa 1 Box", "Sisa 0 Box".
   - Underlying Stock Logic:
     - Lines 74-76:
       ```tsx
       const stockMatch = item.remainingBoxesText.match(/\d+/);
       const stockCount = stockMatch ? parseInt(stockMatch[0], 10) : 1;
       const isOutOfStock = stockCount === 0 || item.remainingBoxesText.toLowerCase().includes('0 box');
       ```
     - Lines 323-343:
       ```tsx
       {isOutOfStock ? (
         <button
           type="button"
           disabled
           className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-200 text-gray-400 text-xs sm:text-sm font-bold shadow-xs cursor-not-allowed shrink-0 select-none"
           id={`btn-order-${item.id}`}
           aria-label={`Mystery Box dari ${item.storeName} telah habis`}
         >
           <span>Habis</span>
         </button>
       ) : (
         <button
           type="button"
           className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#18201b] ... text-white text-xs sm:text-sm font-bold ..."
           ...
         >
           <span>Pesan Sekarang</span>
         </button>
       )}
       ```
     - When out-of-stock, the button state changes to "Habis" (disabled). This functional behavior must be preserved.

2. **`StoreDaganganGrid.tsx` (Customer Store Page Product Grid)**:
   - File: `src/components/customer/store/StoreDaganganGrid.tsx`
   - Lines 193-217 render identical stock badges:
     ```tsx
     {(() => {
       const stockVal = item.remainingBoxes ?? item.stock ?? 0;
       if (stockVal === 0) {
         return <span>Sisa 0 Box</span>;
       }
       if (stockVal > 2) {
         return <span>Sisa {stockVal} Box</span>;
       }
       return <span>Sisa {stockVal} Box</span>;
     })()}
     ```
   - Lines 268-285 have the "Habis" button logic when `stockVal === 0`.

3. **`CustomerOrderDetail.tsx`**:
   - File: `src/pages/customer/CustomerOrderDetail.tsx` (line 868):
     `<p className="text-[11px] font-semibold text-emerald-600">Sisa {rec.stock} Box</p>` in the surplus recommendation list.

---

#### R5 (UI Layout). Homepage Product Display Grid

1. **`CustomerHome.tsx` Grid Structure**:
   - File: `src/pages/customer/CustomerHome.tsx`
   - "Mystery Box di Sekitar":
     - Container line 436: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
     - Card loop lines 446-455: `nearbyBoxes.map((box) => <MysteryBoxCard ... />)`
     - Loading skeleton lines 439-441: Only 3 `<BoxCardSkeleton />` items.
   - "Mystery Box Terlaris":
     - Container line 469: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
     - Card loop lines 479-488: `bestSellerBoxes.map((box) => <MysteryBoxCard ... />)`
     - Loading skeleton lines 472-474: Only 3 `<BoxCardSkeleton />` items.

2. **Product Count & Slicing Defect**:
   - Lines 268-278:
     ```tsx
     if (products && products.length > 0) {
       const sortedByDistance = [...products]
         .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
         .map((p) => mapPublicProductToCustomerBox(p, false));

       const sortedByDiscount = [...products]
         .sort((a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))
         .map((p) => mapPublicProductToCustomerBox(p, true));

       setNearbyBoxes(sortedByDistance);
       setBestSellerBoxes(sortedByDiscount);
     }
     ```
     `setNearbyBoxes` and `setBestSellerBoxes` store ALL returned products without limiting to 6 items! If the API returns 15 products, 15 cards are rendered.
   - In contrast, initial cache helper `getCachedBoxes()` (lines 127, 133) uses `.slice(0, 6)`.
   - Grid behavior:
     - On Desktop (`lg:` width >= 1024px): 3 columns. When limited to 6 cards, 6 cards / 3 cols = exactly 2 rows.
     - On Tablet (`md:` 768px <= width < 1024px): 2 columns. 6 cards / 2 cols = 3 rows.
     - On Mobile (width < 768px): 1 column. 6 cards / 1 col = 6 rows.

---

## 2. Logic Chain

1. **R1 Toast Removal & Inline Feedback Logic**:
   - *Observation*: Two floating UI containers exist (`ToastContext.tsx` line 78 and `Toast.tsx` line 87 mounted in `App.tsx` line 574).
   - *Deduction*: Simply removing toast calls without removing the floating containers still leaves dead UI nodes in the DOM. Removing both `<ToastProvider>` floating container and `<Toast>` in `App.tsx` guarantees that zero floating toasts can appear anywhere on screen.
   - *Observation*: In `CustomerAuth.tsx` and `BuatDagangan.tsx`, form validation failures only invoke `onShowToast`.
   - *Deduction*: Silently dropping those toasts would violate R1 ("do not eliminate form validation or API error feedback"). Therefore, inline error alert banners must be added to `CustomerAuth.tsx` and `BuatDagangan.tsx`.
   - *Observation*: `CustomerContact.tsx` already has per-field red validation messages below every input.
   - *Deduction*: The toast call at line 76 of `CustomerContact.tsx` was purely duplicate noise and can be cleanly removed with zero degradation of validation feedback.
   - *Observation*: Cart addition in `CustomerProductDetail.tsx` showed a floating toast "Berhasil ditambahkan ke keranjang".
   - *Deduction*: The button state can briefly display "✓ Ditambahkan ke Keranjang" or remain normal while the header cart badge increment provides clear, accessible, persistent visual confirmation without intrusive popups.

2. **R2 Review Role Label Removal Logic**:
   - *Observation*: The user prompt states: "Remove account role labels (such as 'seller') displayed underneath user names in review-related interfaces. Display the user's name and avatar without irrelevant role subtitles."
   - *Observation*: In `CustomerHome.tsx` lines 628-630, each testimonial card in the review section renders `<span className="text-xs text-gray-500 font-medium">{testi.role}</span>` directly below `{testi.name}`. Two items have `role: 'Seller'`, and four have `role: 'Pelanggan'`.
   - *Observation*: In `StoreReviewsList.tsx` line 306, each store review card renders `<span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>` directly below `{rev.name}`.
   - *Deduction*: Removing line 629 in `CustomerHome.tsx` and line 306 in `StoreReviewsList.tsx` directly fulfills R2, leaving only the user name and avatar visible, while preserving all underlying review data, rating stars, quotes, and timestamps.

3. **R4 Stock Badge Removal Logic**:
   - *Observation*: `MysteryBoxCard.tsx` (lines 122-194) and `StoreDaganganGrid.tsx` (lines 193-217) contain top-left stock badge overlays that render "Sisa 0 Box", "Sisa 97 Box", etc.
   - *Observation*: Both components also have bottom action buttons that check `isOutOfStock` (e.g. `MysteryBoxCard.tsx` line 323: `<button disabled>Habis</button>`).
   - *Deduction*: Removing lines 122-194 from `MysteryBoxCard.tsx` and lines 193-217 from `StoreDaganganGrid.tsx` completely removes the visual stock quantity badges from Homepage, Marketplace, and Store views.
   - *Deduction*: Keeping `stockCount` and `isOutOfStock` intact guarantees that sold-out items still display the disabled "Habis" button, fulfilling the requirement to preserve out-of-stock handling and order validation.

4. **R5 Homepage Grid (3x2 = 6 Cards) Logic**:
   - *Observation*: `CustomerHome.tsx` uses `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
   - *Observation*: When live products are loaded via `loadBoxes`, all items are assigned to `nearbyBoxes` and `bestSellerBoxes` without `.slice(0, 6)`.
   - *Deduction*: Slicing both arrays to 6 items (`nearbyBoxes.slice(0, 6)` and `bestSellerBoxes.slice(0, 6)`) directly produces a 3-column x 2-row layout (6 cards) on desktop (`lg:`, width >= 1024px), reflowing to 2 columns on tablet (`md:`) and 1 column on mobile.
   - *Deduction*: Increasing the skeleton placeholders from 3 to 6 cards in `BoxCardSkeleton` ensures visual stability during loading.

---

## 3. Caveats

1. **Other Toast Call Sites**:
   - There are ~22 files with `onShowToast` or `showToast` props. If the floating toast container is removed, existing calls to `showToast` become no-ops if `showToast` is made a dummy function `() => {}`. This safely prevents runtime errors while implementers progressively remove obsolete calls.
2. **ReviewCard in Other Views**:
   - `src/components/reviews/ReviewCard.tsx` is already compliant with R2 (it does not render any role subtitle). No changes are needed in `ReviewCard.tsx`.
3. **Product Detail Page Stock Text**:
   - In `CustomerProductDetail.tsx` line 606, there is an inline text inside the purchase quantity box: `Tersisa X box`. The prompt specifically focuses on visual stock quantity badges and overlays on product cards across Homepage, Marketplace, and reusable cards. Implementers can decide whether to keep or remove the counter in the detail panel.

---

## 4. Conclusion & Concrete Implementation Plan

### High-Impact Action Items by File

| Item | File Path | Current State | Target State |
|---|---|---|---|
| **R1-A** | `src/context/ToastContext.tsx` | Lines 73-117 render floating bottom-right container | Remove floating container markup; keep context/provider as lightweight no-op or state holder so imports do not break |
| **R1-B** | `src/components/common/Toast.tsx` | Renders bottom-24 floating toast with motion | Mark obsolete / remove component |
| **R1-C** | `src/App.tsx` | Lines 201-228, line 574: renders `<Toast />` | Remove `<Toast />` element and local toast state; pass empty/no-op handler or remove `showToast` prop |
| **R1-D** | `src/pages/auth/CustomerAuth.tsx` | Error feedback only via toasts | Add inline error banner inside `CustomerLoginForm` and `CustomerRegisterForm` |
| **R1-E** | `src/pages/seller/BuatDagangan.tsx` | Validation checks only call toast | Add inline error banner above submit button |
| **R1-F** | `src/pages/customer/CustomerContact.tsx` | Redundant toast call at line 76 | Remove toast call; rely entirely on existing inline field errors |
| **R1-G** | `src/hooks/useReviews.ts` | Dispatches toasts on review CRUD | Remove `toastContext.showToast` calls from `useReviewMutations` |
| **R2-A** | `src/pages/customer/CustomerHome.tsx` | Lines 628-630 render `{testi.role}` | Remove `<span className="text-xs text-gray-500 font-medium">{testi.role}</span>` |
| **R2-B** | `src/components/customer/store/StoreReviewsList.tsx` | Line 306 renders `<span ...>{rev.role}</span>` | Remove `{rev.role}` span; render only name and avatar |
| **R2-C** | `src/pages/customer/CustomerStoreDetail.tsx` | Line 388 maps `role: r.author?.role` | Remove `role` mapping |
| **R4-A** | `src/components/customer/MysteryBoxCard.tsx` | Lines 120-194 render stock badge overlay | Remove lines 122-194; keep Distance badge, Discount badge, and `isOutOfStock` "Habis" button logic |
| **R4-B** | `src/components/customer/store/StoreDaganganGrid.tsx` | Lines 193-217 render stock badges | Remove lines 193-217; keep Distance badge, Discount badge, and `isOutOfStock` "Habis" button logic |
| **R4-C** | `src/pages/customer/CustomerOrderDetail.tsx` | Line 868 renders `Sisa {rec.stock} Box` | Remove `Sisa {rec.stock} Box` line |
| **R5-A** | `src/pages/customer/CustomerHome.tsx` | Lines 277-278: sets all products into state | Slice to 6: `setNearbyBoxes(sortedByDistance.slice(0, 6))` and `setBestSellerBoxes(sortedByDiscount.slice(0, 6))` |
| **R5-B** | `src/pages/customer/CustomerHome.tsx` | Lines 439-441 & 472-474: 3 skeletons | Render 6 skeletons (3 columns x 2 rows) matching the desktop 6-card grid |

---

### Concrete Code Snippet Recommendations

#### 1. R1: `src/context/ToastContext.tsx`
Remove the floating container JSX from `ToastProvider`:
```tsx
// Replace lines 73-117 in src/context/ToastContext.tsx:
return (
  <ToastContext.Provider value={{ toasts, showToast, removeToast, clearToasts }}>
    {children}
  </ToastContext.Provider>
);
```

#### 2. R1: `src/App.tsx`
Remove `<Toast ... />` at line 574:
```tsx
// Delete line 574:
// <Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />
```

#### 3. R2: `src/pages/customer/CustomerHome.tsx`
Remove `{testi.role}` subtitle:
```tsx
// Before (lines 625-634):
<h3 className="font-bold text-[#1b1c1c] text-sm">
  {testi.name}
</h3>
<span className="text-xs text-gray-500 font-medium">
  {testi.role}
</span>
<div className="flex text-amber-500 text-xs mt-0.5">
  {'★'.repeat(testi.rating)}
</div>

// After:
<h3 className="font-bold text-[#1b1c1c] text-sm">
  {testi.name}
</h3>
<div className="flex text-amber-500 text-xs mt-0.5">
  {'★'.repeat(testi.rating)}
</div>
```

#### 4. R2: `src/components/customer/store/StoreReviewsList.tsx`
Remove `{rev.role}` subtitle:
```tsx
// Before (lines 304-307):
<div>
  <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">{rev.name}</p>
  <span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>
</div>

// After:
<div>
  <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">{rev.name}</p>
</div>
```

#### 5. R4: `src/components/customer/MysteryBoxCard.tsx`
Remove stock badge overlay from image header:
```tsx
// Before (lines 118-200):
<div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
  <div className="flex items-center gap-1.5">
    {isPopular ? (
      <>
        {/* Stock Badge ... (lines 122-194) */}
        {/* Popular Distance Pill */}
        <span className="px-2.5 py-1 rounded-full bg-white text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs">
          {item.distanceText}
        </span>
      </>
    ) : (
      <span className="px-2.5 py-1 rounded-full bg-white/95 ...">
        ...
        <span>{item.distanceText}</span>
      </span>
    )}
  </div>
  ...

// After:
<div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
  <div className="flex items-center gap-1.5">
    <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green shrink-0" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <span>{item.distanceText}</span>
    </span>
  </div>
  {displayDiscount > 0 && (
    <div>
      <span className="px-2.5 py-1 rounded-full bg-brand-green text-white text-[11px] font-black shadow-xs">
        -{displayDiscount}%
      </span>
    </div>
  )}
</div>
```
*(Notice: `isOutOfStock` logic and the "Habis" disabled button at lines 323-332 are strictly preserved!)*

#### 6. R5: `src/pages/customer/CustomerHome.tsx`
Ensure exactly 6 products in 3x2 grid:
```tsx
// Lines 277-278:
setNearbyBoxes(sortedByDistance.slice(0, 6));
setBestSellerBoxes(sortedByDiscount.slice(0, 6));

// Lines 439-442 & 472-475 (Skeleton count):
{Array.from({ length: 6 }).map((_, idx) => (
  <BoxCardSkeleton key={idx} />
))}
```

---

## 5. Verification Method

To independently verify all findings and confirm fixes:
1. **TypeScript Typecheck**:
   ```powershell
   npm run typecheck
   ```
   *Expected result*: Exits with code 0.
2. **Codebase Linting**:
   ```powershell
   npm run lint
   ```
   *Expected result*: Exits with 0 errors.
3. **UI Verification**:
   - Inspect `#box-card-*`: Verify no badges with text "Sisa ... Box" exist in the DOM or on product images. Verify sold-out items still display the disabled "Habis" button.
   - Inspect `#testimoni-section` on `#beranda-customer`: Verify user cards display only `name` and `quote`, with no "Seller" or "Pelanggan" subtitles.
   - Inspect `#ulasan-pelanggan` on `#toko`: Verify store review cards display only `name` and review text/stars, with no role subtitle.
   - Inspect `#beranda-customer`: Count cards in "Mystery Box di Sekitar" and "Mystery Box Terlaris"; verify exactly 6 cards (or fewer only if backend returns fewer). Check desktop (3 columns x 2 rows) and mobile viewport reflow (1 column).
   - Trigger actions (order, review, cart, invalid form): Verify no bottom-right floating toast notification box (`#toast-notification` or fixed bottom container) appears on screen. Verify inline error states appear in forms.
