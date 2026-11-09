# Independent QA & Adversarial Review Report: Milestone M2

**Reviewer**: Agent 6 — QA & Code Reviewer (Reviewer M2 / Adversarial Critic)  
**Date**: 2026-11-03T19:48:00Z  
**Target Work Product**: Milestone M2 deliverables created by Agent 4 (Worker M2)  
**Verdict**: **APPROVE**  

---

## 1. Observation

### 1.1 Independent Verification Commands Execution
All three project verification scripts were executed independently in the project root:

1. **TypeScript Typecheck (`npm run typecheck`)**:
   - Command: `npm run typecheck` (`tsc -b`)
   - Exit code: `0`
   - Output verbatim:
     ```
     > rescuebyte-fe@0.0.0 typecheck
     > tsc -b
     ```
   - Result: **PASS** (0 compile errors across the entire codebase).

2. **Production Build (`npm run build`)**:
   - Command: `npm run build` (`tsc -b && vite build`)
   - Exit code: `0`
   - Output verbatim:
     ```
     vite v8.3.4 building client environment for production...
     transforming...
     ✓ 2497 modules transformed.
     rendering chunks...
     computing gzip size...
     dist/index.html                                          1.21 kB │ gzip:     0.65 kB
     ...
     dist/assets/index-DjkKvOLN.css                         135.99 kB │ gzip:    26.91 kB
     dist/assets/index-BohSM7Pn.js                        1,095.13 kB │ gzip:   305.14 kB
     ✓ built in 1.47s
     ```
   - Result: **PASS** (all 2,497 modules compiled into optimized production chunks).

3. **Linter Verification (`npm run lint`)**:
   - Command: `npm run lint` (`oxlint`)
   - Exit code: `0`
   - Output verbatim:
     ```
     Found 41 warnings and 0 errors.
     Finished in 146ms on 111 files with 104 rules using 12 threads.
     ```
   - Targeted linter check on M2 files (`npx oxlint src/api src/context src/hooks`):
     - Exit code: `0`
     - Errors: `0`
     - Warnings: 10 non-blocking React compiler / hook dependency notifications.
   - Result: **PASS** (0 blocking linter errors).

### 1.2 Inspection of Delivered Modules
1. **`src/api/types.ts`**:
   - Lines 1–528: Contains all 49 backend DTO schemas, pagination envelope `ApiResponse<T>`, `ApiErrorResponse`, `PaginationMeta`, and system enums (`AuthProvider`, `GenderIdx`, `UserRoleIdx`, `OrderStatusType`, `StoreStatusType`, `PaymentMethodType`, `EnumsResponse`).
   - Every model directly reflects the Swagger 2.0 specification (`#/definitions/*`).
2. **`src/api/client.ts`**:
   - Line 4–6: Configured with `API_BASE_URL = (import.meta.env.VITE_API_BASE_URL) || 'https://dolpin-fourthree.bccdev.id/'`.
   - Line 78–89: Request interceptor injects `Authorization: Bearer <access_token>` from `localStorage`.
   - Line 98–133: Response interceptor unwraps `{ request_id, payload }` while using `Object.defineProperty` to add non-enumerable `.payload` and `.request_id` getters, providing dual compatibility for `res.data` (new) and `res.data.payload` (legacy).
   - Line 146–247: Transparent 401 token refresh queue handles token renewal using an isolated Axios instance (`axios.post`), updates storage, dispatches `rescuebyte_auth_refreshed`, drains `failedQueue`, and on hard failure wipes credentials and dispatches `rescuebyte_auth_expired`.
   - Line 46–73: `extractErrorMessage` extracts human-readable Indonesian error messages from backend response envelopes.
3. **`src/api/services/*` (8 domain modules + index.ts)**:
   - `authApi.ts`: Complete coverage for login, logout, getMe, refreshAccessToken, register, Google auth URL, Google callback.
   - `cartApi.ts`: Complete coverage for getCart, clearCart, getCartCount, addItem, removeItem, updateItemQty, removeStoreItems.
   - `orderApi.ts`: Complete coverage for getCustomerOrders, checkout, getSellerOrders, getOrderDetail, cancelOrder, updateOrderStatus, getPaymentStatus.
   - `productApi.ts`: Complete coverage for getProducts, createProduct, getSellerProducts, getProductDetail, updateProduct, deleteProduct, toggleProductStatus.
   - `storeApi.ts`: Complete coverage for getStores, createStore, updateStoreOperational, getMyStoreProfile, updateMyStoreProfile, toggleStoreStatus, getStoreDetail.
   - `userApi.ts`: Complete coverage for getUserProfile, updateUserProfile, updateUserRole. Erroneous `GET /api/v1/users/{id}` is omitted.
   - `storageApi.ts`: Complete coverage for uploadImage, uploadMultipleImages using `FormData`.
   - `enumApi.ts`: Complete coverage for getEnums, checkHealth.
4. **`src/context/*` & `src/main.tsx`**:
   - `AuthContext.tsx`: Full auth lifecycle, storage synchronization (`rescuebyte_auth`, `access_token`, `refresh_token`), role tracking, and event listening.
   - `CartContext.tsx`: Backend-synchronized cart state, computed totals and count, optimistic mutation triggers.
   - `ToastContext.tsx`: Accessible, floating toast notifications with 4 color-coded alert variants.
   - `src/main.tsx`: Correct nesting order `<ToastProvider><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></ToastProvider>`.
5. **`src/hooks/*` (8 custom hooks + index.ts)**:
   - `useAuth`: Wraps `AuthContext`.
   - `useCart`: Wraps `CartContext`.
   - `useProducts`: Supports filters, pagination meta, loading/error states, refetch.
   - `useProductDetail`: Single product fetcher with auto-fetch and refetch.
   - `useOrders`: Customer order history and cancellation.
   - `useMerchantOrders`: Merchant order queue and fulfillment status mutation.
   - `useStoreProfile`: Merchant store profile and operational hours management.
   - `useCheckout`: Checkout mutation and Midtrans status polling.
6. **`src/services/*` (Backward Compatibility)**:
   - `src/services/api.ts`: Re-exports `apiClient` as `api`.
   - `src/services/userService.ts`: Lines 62–69 guard `getUserById` to return cached session or `null` without issuing 404 network requests.
   - `src/services/orderService.ts`: Added `cancelCustomerOrderApi`.
   - `src/services/cartService.ts`: Added `getCartCountApi`.

---

## 2. Logic Chain

1. **Premise**: The acceptance criteria for Milestone M2 require:
   - Clean compilation with 0 errors on `npm run typecheck` (`tsc -b`), `npm run build`, and `npm run lint`.
   - Comprehensive Swagger 2.0 TypeScript definitions (49 DTO schemas and enums).
   - Centralized Axios client with automatic Bearer token injection, transparent 401 refresh queue, and dual-accessor unwrapping.
   - 8 pure domain API modules strictly mapped to backend Swagger endpoints.
   - React context providers for Auth, Cart, and Toast wired into `src/main.tsx`.
   - 8 custom data hooks providing headless loading, error, empty, and mutation states.
   - Backward compatibility for existing UI components and elimination of the 404 `GET /api/v1/users/{id}` call.
2. **Step 1 — Build & Static Analysis**: As verified in Observation 1.1, all three static verification commands pass with exit code `0`.
3. **Step 2 — Integrity & Real Implementation**: Detailed code inspection confirms zero mock data, zero hardcoded test outputs, zero facade stubs, and genuine API calls via Axios for all 8 service domains.
4. **Step 3 — Backward Compatibility & Safety**: The dual-accessor non-enumerable unwrapping in `src/api/client.ts` guarantees that legacy code accessing `res.data.payload` and modern code accessing `res.data` both receive the unwrapped payload without code breakages.
5. **Step 4 — Concurrency & Recursion Defense**: The 401 refresh implementation uses an isolated Axios instance and a FIFO queued promise pattern, preventing recursive interception loops and handling concurrent 401 spikes gracefully.
6. **Step 5 — Architectural Readiness**: The hooks and context providers provide headless interfaces ready for Milestone M3 (component decomposition and UI slicing).

---

## 3. Adversarial Stress Test & Attack Surface Analysis

### 3.1 Challenge 1: 401 Refresh Deadlock & Concurrent Request Floods
- **Assumption**: Multiple simultaneous requests failing with 401 while the token is expired should not spawn multiple refresh requests or deadlock the application.
- **Attack Scenario**: 5 concurrent API requests trigger 401 simultaneously.
- **Evaluation**: In `src/api/client.ts:161-172`, the first request sets `isRefreshing = true` and proceeds to call `/api/v1/auth/refresh`. Subsequent requests see `isRefreshing === true` and are enqueued in `failedQueue`. Once the refresh call succeeds, `processQueue` replays all queued requests with the new token. If refresh fails, `processQueue` rejects all queued requests and purges tokens. Deadlock is impossible because `isRefreshing` is reset in a `finally` block.
- **Result**: **PASS (ROBUST)**.

### 3.2 Challenge 2: Dual-Accessor Payload Pollution
- **Assumption**: Defining `.payload` on the unwrapped object must not pollute enumerable object properties or break array iterations (`for..in`, `Object.keys`, `JSON.stringify`).
- **Attack Scenario**: An array of products is returned from `/api/v1/products/me/list`. Calling `products.map()` or serializing with `JSON.stringify()` must not include a recursive `.payload` property.
- **Evaluation**: `src/api/client.ts:109-123` uses `Object.defineProperty` with `enumerable: false`. Non-enumerable properties are completely ignored by `JSON.stringify`, `Object.keys()`, `for..in`, and Array iterator protocols.
- **Result**: **PASS (ROBUST)**.

### 3.3 Challenge 3: Phantom User 404 Route (`GET /api/v1/users/{id}`)
- **Assumption**: Calling `getUserById` in `SellerOrderDetailModal.tsx` must not trigger 404 network requests or throw unhandled exceptions.
- **Attack Scenario**: Merchant opens order detail modal where customer phone number is absent.
- **Evaluation**: `src/services/userService.ts:62-69` intercepts `getUserById`. If the ID matches current logged-in user, it returns the cached session; otherwise, it returns `null` immediately without making any HTTP request. In `SellerOrderDetailModal.tsx:125-128`, the return value is guarded with `if (isMounted && fetchedUser)`, degrading gracefully without any 404 error.
- **Result**: **PASS (ROBUST)**.

---

## 4. Caveats

1. **Guest Cart Behavior**:
   - `CartContext` currently synchronizes directly with backend `/api/v1/cart`. Since the backend requires a Bearer token for cart operations, unauthenticated guest users adding items to cart will receive an authentication prompt/error. Milestone M3 UI components should ensure login prompts are shown before cart mutation or preserve local storage fallback during anonymous browsing.
2. **Live Backend Dependency**:
   - Live backend endpoints (`https://dolpin-fourthree.bccdev.id/`) are subject to remote server availability and database state. The API client and services are constructed strictly according to the Swagger 2.0 contract.

---

## 5. Conclusion

Milestone M2 has met all architectural, functional, and static verification criteria outlined in `PROJECT.md` and `ORIGINAL_REQUEST.md`:
- **Integrity**: Zero integrity violations, zero mock facades, zero hardcoded test outputs.
- **Completeness**: 49 Swagger DTOs & enums in `src/api/types.ts`, 8 pure domain API modules in `src/api/services/`, 3 React Context providers in `src/context/`, 8 custom data hooks in `src/hooks/`, and full backward compatibility in `src/services/`.
- **Quality**: `npm run typecheck`, `npm run build`, and `npm run lint` all pass with 0 errors.

**Verdict**: **APPROVE**. Milestone M2 is fully verified and ready for Milestone M3.

---

## 6. Verification Method

Any reviewer or orchestrator can independently reproduce the verification results using the following commands in the workspace root:

```powershell
# 1. Typecheck the entire TypeScript codebase
npm run typecheck

# 2. Production build verification
npm run build

# 3. Lint verification
npm run lint

# 4. Verify no git untracked files or integrity violations in .agents/teamwork/
git status
```

**Invalidation Conditions**:
- Any non-zero exit code on `npm run typecheck` or `npm run build`.
- Missing endpoints in `src/api/services/`.
- Regressions in legacy service backward compatibility.
