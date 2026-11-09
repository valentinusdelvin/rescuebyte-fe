# Handoff Report — Card Touchpoints Explorer

**Agent**: Card Touchpoints Explorer  
**Folder**: `.agents/teamwork/explorer_touchpoints_3`  
**Recipient**: Orchestrator (`68d5bdc7-864d-42bd-82e4-1b0756b65661`)  
**Mission**: Audit and identify all hardcoded 4.9 and 48 ratings across customer-facing cards and components  
**Date**: 2026-11-09  
**Type**: Hard Handoff  

---

## 1. Observation

Direct code and schema inspection commands performed:
- `Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "4\.9|48\b|\b48\b"`
- `Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "\b4\.8\b"`
- `Select-String -Path "src\api\types.ts" -Pattern "interface.*Store|interface.*Product"`
- `Select-String -Path "swagger_doc.json" -Pattern "ProductCardResponse|StoreResponse"`

Exact code locations and verbatim lines identified:
1. `src/components/customer/MysteryBoxCard.tsx` (lines 261–262):
   ```tsx
   <span>{item.rating?.toFixed(1) || '4.9'}</span>
   <span className="text-white/70 font-normal">({item.reviewCount || '1.2k'} ulasan)</span>
   ```
2. `src/components/customer/cart/CartStoreGroup.tsx` (lines 115–116):
   ```tsx
   <span className="text-amber-500 font-bold">★ {store.rating.toFixed(1)}</span>
   <span className="text-gray-400">({store.reviewCount} ulasan)</span>
   ```
3. `src/services/cartService.ts` (lines 178–179 and 278–279):
   ```ts
   rating: 4.9,
   reviewCount: 42,
   ...
   rating: box.rating ?? 4.8,
   reviewCount: typeof box.reviewCount === 'number' ? box.reviewCount : Number(box.reviewCount) || 100,
   ```
4. `src/components/customer/checkout/CheckoutItemsList.tsx` (lines 109–110 and 235–236):
   ```tsx
   <span className="text-amber-500 font-bold">★ {item.rating || group.rating || 4.9}</span>
   <span className="text-gray-400">({item.reviewCount || group.reviewCount || 42} ulasan)</span>
   ...
   <span className="text-amber-500 font-bold">★ {group.rating}</span>
   <span className="text-gray-400">({group.reviewCount} ulasan)</span>
   ```
5. `src/pages/customer/CustomerCheckout.tsx` (lines 216–217):
   ```ts
   rating: item.rating || 4.9,
   reviewCount: item.reviewCount || 42,
   ```
6. `src/pages/customer/CustomerStoreDetail.tsx` (lines 114, 206–207, 316, 414):
   ```ts
   rating: 5.0, reviewCount: 0,
   ...
   rating: 4.9,
   reviewCount: 48,
   ...
   const storeReviews: StoreReviewItem[] = useMemo(() => [], []);
   ...
   <StoreReviewsList reviews={storeReviews} reviewCount={storeData.reviewCount} storeId={storeId} />
   ```
7. `src/components/customer/store/StoreHero.tsx` (lines 97–99):
   ```tsx
   <span>{storeData.rating}</span>
   <span className="text-slate-500 font-normal group-hover:text-emerald-700 transition-colors">
     ({storeData.reviewCount} ulasan)
   </span>
   ```
8. `src/components/customer/store/StoreInfoCard.tsx` (lines 163–170 and 185–187):
   Directly renders `storeData.rating` and `storeData.reviewCount`.
9. `src/pages/customer/CustomerProductDetail.tsx` (lines 83 and 477–478):
   ```ts
   const rating = product?.rating ?? 5.0;
   ...
   ★ <span className="text-gray-700 font-bold ml-1">{rating.toFixed(1)}</span>
   <span className="text-gray-400 font-normal ml-0.5">({reviewCount} ulasan)</span>
   ```
10. `src/pages/customer/CustomerHome.tsx` (lines 88–89):
    ```ts
    rating: 4.9,
    reviewCount: '42',
    ```
11. `src/features/customer/marketplace/model.ts` (lines 78–79):
    ```ts
    rating: 4.9,
    reviewCount: 42,
    ```
12. `src/pages/customer/CustomerMarketplace.tsx` (lines 250–252):
    ```ts
    const ratingA = a.rating || 4.8;
    const ratingB = b.rating || 4.8;
    ```
13. `src/app/AppRoutes.tsx` (lines 52 and 130–131):
    ```ts
    handleNavigateStore: (storeName?: string, storeId?: string) => void;
    ...
    rating: product.rating || 4.8,
    reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : Number(product.reviewCount) || 320,
    ```
14. Backend Swagger schema (`swagger_doc.json:4199–4245` and `4475–4530`):
    Neither `ProductCardResponse` nor `StoreResponse` includes `rating` or `review_count` properties.
    The real review endpoints are `GET /api/v1/stores/{id}/summary` (returns `StoreSummaryResponse: { average_rating, total_reviews }`), `GET /api/v1/stores/{id}/reviews`, and `GET /api/v1/products/{id}/reviews`.

---

## 2. Logic Chain

1. **Premise 1 (Backend contracts)**:
   Observations 14 establish that backend list endpoints (`GET /api/v1/products`, `GET /api/v1/stores`) do not return rating or review count. The official backend source of truth for store ratings is `GET /api/v1/stores/{id}/summary`.
2. **Premise 2 (Why mock values appeared)**:
   Observations 3, 5, 10, 11, and 13 show that because `ProductCardResponse` lacked rating/review fields, frontend mapper functions in `CustomerHome.tsx`, `cartService.ts`, and `model.ts` filled the gap by hardcoding `rating: 4.9` and `reviewCount: 42` or `48`.
3. **Premise 3 (Card presentation and fallback bugs)**:
   Observations 1, 2, 4, 7, 8, and 9 show that presentational card components either defaulted to `'4.9'` and `'1.2k'` (as in `MysteryBoxCard.tsx:261–262`) or blindly displayed the mocked values from the data layer without safe empty-state formatting (`★ - (Belum ada ulasan)`).
4. **Premise 4 (Store summary decoupling)**:
   Observations 6, 7, and 8 show why the user's screenshot showed `4.9 Rating Toko (48 ulasan)` and `48 Total Ulasan` on `StoreInfoCard`: `CustomerStoreDetail.tsx:206–207` hardcoded `rating: 4.9, reviewCount: 48` on every load and never called `reviewApi.getStoreSummary(targetStoreId)`.
5. **Premise 5 (Touchpoint navigation validity)**:
   All customer cards (`MysteryBoxCard`, `CartStoreGroup`, `CheckoutItemsList`, `CustomerProductDetail`) already navigate to `#toko?name=...&id=...&section=ulasan-pelanggan`. In `CustomerStoreDetail.tsx:68–73`, `parseHash()` catches `section=ulasan-pelanggan`, activates the `'ulasan'` tab, and smoothly scrolls to `id="ulasan-pelanggan"`. This navigation chain is completely functional, provided `targetStoreId` is preserved and not dropped.

---

## 3. Caveats

- **API Rate Limits / Data Availability**: If the backend store does not have any reviews submitted yet, `GET /api/v1/stores/{id}/summary` returns `average_rating: 0, total_reviews: 0`. The UI must therefore handle 0 gracefully as `★ - (Belum ada ulasan)` rather than crashing or showing fake stats.
- **Scope Restriction**: As Card Touchpoints Explorer, this analysis is strictly read-only. No code changes have been applied. Implementation must be carried out by the assigned implementer agent.

---

## 4. Conclusion

All occurrences of hardcoded `4.9` and `48` (as well as `4.8`, `42`, `1.2k`, `320`) have been identified across 13 distinct files.
To completely resolve the issue:
1. Update `CustomerStoreDetail.tsx` to fetch `reviewApi.getStoreSummary(targetStoreId)` and assign live `average_rating` and `total_reviews` to `storeData`.
2. Update `CustomerHome.tsx`, `model.ts`, `cartService.ts`, `CustomerCheckout.tsx`, and `AppRoutes.tsx` to set default rating and review count to `0` instead of `4.9 / 48 / 42 / 4.8`.
3. Update `MysteryBoxCard.tsx`, `CartStoreGroup.tsx`, `CheckoutItemsList.tsx`, `StoreHero.tsx`, `StoreInfoCard.tsx`, and `CustomerProductDetail.tsx` to format rating and review counts with honest zero/empty states:
   - When rating > 0: `★ {rating.toFixed(1)} ({reviewCount} ulasan)`
   - When rating == 0: `★ - ({reviewCount > 0 ? ... : 'Belum ada ulasan'})`
4. Detailed before/after code proposals for all 13 files are documented in `analysis.md`.

---

## 5. Verification Method

To verify the audit and test future implementations:
1. **Search Verification Command**:
   Run in PowerShell:
   ```powershell
   Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Select-String -Pattern "4\.9|48\b|\b48\b"
   ```
   *Expected Result after fix*: 0 instances of rating/review hardcoding (only CSS color `#2D3748`, opacity `0.48`, SVG path coordinates, or width/height tailwind classes `w-48`).
2. **TypeScript Compilation Check**:
   ```bash
   npm run typecheck
   ```
   *Expected Result*: Exits with code 0.
3. **Production Build Check**:
   ```bash
   npm run build
   ```
   *Expected Result*: Exits with code 0 and bundles without errors.
4. **Visual Inspection**:
   - Navigate to `#beranda-customer`: Mystery box cards show real rating or `★ - (Belum ada ulasan)` instead of fake 4.9.
   - Click star rating on `MysteryBoxCard`: Navigates to `#toko?name=...&id=...&section=ulasan-pelanggan` and scrolls directly to `#ulasan-pelanggan`.
   - Open `#toko`: "Ringkasan Toko" shows real backend rating and total reviews (or 0 / `-`).
   - Open `#keranjang` and `#checkout`: Store groups and item lists display real rating or zero state without `4.9` or `42`.
