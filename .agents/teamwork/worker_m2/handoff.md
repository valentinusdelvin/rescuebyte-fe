# Handoff Report: Milestone M2 — Centralized API Client, Swagger Types, React Contexts & Custom Hooks

**Agent**: Agent 4 — API Integration Specialist (Worker M2)  
**Date**: 2026-11-03T19:38:00Z  
**Target Milestone**: Milestone M2 (API Integration Layer, Global Contexts, Custom Hooks, Legacy Service Delegation)  
**Parent / Caller**: Project Orchestrator (`59a4cfaf-061f-42fa-9551-4492d1892343`)

---

## 1. Observation

### 1.1 Existing Codebase & Contract Surface
- **Authoritative Contract Basis**: Swagger 2.0 specification (`swagger_types.ts`, `endpoint_catalog_table.md`, `definitions.json`).
- **Initial Discrepancies Observed**:
  - `GET /api/v1/users/{id}` called in `userService.ts:60` and `SellerOrderDetailModal.tsx:125` did not exist on the backend Swagger specification, producing 404 runtime errors.
  - No customer order cancellation endpoint existed in frontend services, despite backend exposing `POST /api/v1/orders/{id}/cancel`.
  - Frontend calculated cart item counts purely in `localStorage`, never leveraging `GET /api/v1/cart/count`.
  - Legacy `src/services/api.ts` lacked a transparent 401 token refresh queue.
  - No global React Contexts existed for Auth or Cart; application components relied on fragmented `localStorage` polling and manual `window.dispatchEvent` CustomEvent triggers.

### 1.2 Delivered Artifacts Summary
The following files were created or modified under exclusive ownership for Milestone M2:

1. **`src/api/types.ts`**:
   - Comprehensive TypeScript definitions encompassing all 49 backend DTO schemas and system enums matching Swagger 2.0.
   - Standard envelope interfaces: `ApiResponse<T>`, `PaginationMeta`, `ApiErrorDetail`, `ApiErrorPayload`, `ApiErrorResponse`, `MessageResponse`, `HealthResponse`.
   - Enums: `AuthProvider`, `GenderIdx`, `UserRoleIdx`, `OrderStatusType`, `StoreStatusType`, `PaymentMethodType`, `EnumsResponse`.
   - Complete request & response DTOs for Auth, Cart, Order, Product, Store, User, Payment, and Storage.

2. **`src/api/client.ts`**:
   - Central Axios client configured with `import.meta.env.VITE_API_BASE_URL || 'https://dolpin-fourthree.bccdev.id/'`.
   - Request Interceptor: Automatically injects `Authorization: Bearer <access_token>` from `localStorage`.
   - Response Interceptor (Unwrap): Unwraps `{ request_id, payload }` while attaching non-enumerable `.payload` and `.request_id` getters to preserve backward compatibility for legacy callers expecting `res.data.payload`.
   - Error Normalization: `extractErrorMessage(error)` parses backend Swagger error structures (`payload.error.message` / `payload.error.error`) and network failure edge cases.
   - Transparent 401 Token Refresh Queue: Intercepts 401 errors on protected endpoints, queues concurrent failed requests, invokes `POST /api/v1/auth/refresh` with an isolated Axios instance, updates storage tokens, replays queued requests, and handles hard logout if refresh fails.

3. **`src/api/services/` (Pure Typed API Services)**:
   - `authApi.ts`: `getGoogleAuthUrl`, `handleGoogleCallback`, `login`, `logout`, `getMe`, `refreshAccessToken`, `register`.
   - `cartApi.ts`: `getCart`, `clearCart`, `getCartCount`, `addItem`, `removeItem`, `updateItemQty`, `removeStoreItems`.
   - `orderApi.ts`: `getCustomerOrders`, `checkout`, `getSellerOrders`, `getOrderDetail`, `cancelOrder`, `updateOrderStatus`, `getPaymentStatus`.
   - `productApi.ts`: `getProducts`, `createProduct`, `getSellerProducts`, `getProductDetail`, `updateProduct`, `deleteProduct`, `toggleProductStatus`.
   - `storeApi.ts`: `getStores`, `createStore`, `updateStoreOperational`, `getMyStoreProfile`, `updateMyStoreProfile`, `toggleStoreStatus`, `getStoreDetail`.
   - `userApi.ts`: `getUserProfile`, `updateUserProfile`, `updateUserRole` (non-existent `GET /api/v1/users/{id}` completely omitted).
   - `storageApi.ts`: `uploadImage`, `uploadMultipleImages`.
   - `enumApi.ts`: `getEnums`, `checkHealth`.
   - `index.ts`: Unified barrel export.

4. **`src/context/` (Global React Context Providers)**:
   - `ToastContext.tsx`: Accessible, auto-dismissing floating toast alerts with `showToast`, `removeToast`, `clearToasts`.
   - `AuthContext.tsx`: Global session state with `{ user, isAuthenticated, isLoading, login, register, logout, switchRole, refreshUser, error }`.
   - `CartContext.tsx`: Global shopping cart with `{ cart, stores, count, subtotal, totalPayment, isLoading, addItem, removeItem, updateQty, clearStore, clearCart, refreshCart, error }`, synchronizing with backend `/api/v1/cart`.
   - `index.ts`: Central context barrel export.

5. **`src/hooks/` (Custom Business Logic & Data Hooks)**:
   - `useAuth.ts`: Ergonomic wrapper around `AuthContext`.
   - `useCart.ts`: Ergonomic wrapper around `CartContext`.
   - `useProducts.ts`: Parametric data hook for product discovery with `products`, `meta`, `isLoading`, `isError`, `error`, `filters`, `setFilters`, `refetch`.
   - `useProductDetail.ts`: Single product data hook with `product`, `isLoading`, `isError`, `error`, `refetch`.
   - `useOrders.ts`: Customer orders history and cancellation hook with `orders`, `meta`, `isLoading`, `isError`, `error`, `cancelOrder`, `refetch`.
   - `useMerchantOrders.ts`: Merchant incoming order queue and status mutation hook with `orders`, `meta`, `isLoading`, `isError`, `error`, `updateStatus`, `refetch`.
   - `useStoreProfile.ts`: Merchant store profile management hook with `store`, `updateProfile`, `updateOperational`, `toggleStatus`, `refetch`.
   - `useCheckout.ts`: Checkout mutation and Midtrans payment status checker with `checkout`, `checkPaymentStatus`, `isLoading`, `isError`, `error`.
   - `index.ts`: Central hooks barrel export.

6. **`src/main.tsx`**:
   - Wrapped root application tree with `<ToastProvider>`, `<AuthProvider>`, and `<CartProvider>`.

7. **`src/services/` (Backward-Compatibility Layer)**:
   - `api.ts`: Re-exports `apiClient` as `api`, routing all legacy service requests through the new centralized client.
   - `userService.ts`: Guarded `getUserById` to prevent 404 network requests to the non-existent backend route.
   - `orderService.ts`: Added `cancelCustomerOrderApi`.
   - `cartService.ts`: Added `getCartCountApi`.

---

## 2. Logic Chain

1. **Step 1: Contract Enforcement**: All types were constructed directly against Swagger 2.0 schemas (`swagger_types.ts`). Using strict TypeScript interfaces prevents typing mismatch between frontend and backend.
2. **Step 2: Backward-Compatible Unwrapping**: Legacy frontend components expect `res.data?.payload`, while modern pure services consume `res.data` directly as the unwrapped payload. By defining `.payload` and `.request_id` as non-enumerable properties on the unwrapped object in `client.ts`, both access patterns succeed simultaneously with zero breaking changes.
3. **Step 3: 401 Refresh Deadlock Prevention**: The 401 response interceptor uses an independent Axios call (`axios.post`) to renew tokens rather than calling `apiClient.post`, ensuring that a failing refresh request cannot trigger recursive 401 interception loops. A FIFO queue coordinates concurrent requests while refresh is pending.
4. **Step 4: Non-Existent Route Remediation**: The Swagger spec defines customer information (`customer_name`, `customer_phone`, `customer_email`) directly inside `OrderDetailResponse`. Thus, `GET /api/v1/users/{id}` is unnecessary and omitted from `userApi.ts`. In `userService.ts`, `getUserById` now resolves from cached session or returns `null` safely without triggering a 404.
5. **Step 5: Architectural Decoupling**: Global state (`AuthContext`, `CartContext`, `ToastContext`) and custom hooks (`useProducts`, `useOrders`, etc.) provide clean headless abstractions. Components in upcoming Milestone M3 can now consume these hooks directly without importing raw Axios instances or managing ad-hoc state in `localStorage`.

---

## 3. Caveats

- **Mock/Placeholder Fallbacks in UI Pages**: Certain legacy pages still contain fallback dummy data logic for offline demos. The new hooks connect to live backend endpoints while Milestone M3 will decompose the presentational pages to fully switch to these hooks.
- **Midtrans Snap Script**: Snap payment execution relies on `window.snap.pay` loaded in `index.html`. `useCheckout` and `orderApi.checkout` deliver the `snap_token` and `snap_redirect_url` provided by the backend.

---

## 4. Conclusion

Milestone M2 is **100% complete**:
- The centralized API client with automatic token injection, transparent 401 refresh queue, and normalized response/error handling is operational.
- All 49 Swagger DTO schemas and system enums are typed in `src/api/types.ts`.
- Pure service callers for all 8 backend domains are implemented in `src/api/services/`.
- `AuthContext`, `CartContext`, and `ToastContext` are created and wired at application root in `src/main.tsx`.
- 8 headless custom hooks are implemented and exported in `src/hooks/`.
- All legacy services delegate to the new client seamlessly.
- Zero TypeScript errors (`tsc -b` pass), zero build errors (`vite build` pass), and zero lint errors (`oxlint` pass).

---

## 5. Verification Method

To independently verify the implementation, execute the following commands in the project root:

```powershell
# 1. Typecheck the entire codebase
npm run typecheck

# 2. Production build verification
npm run build

# 3. Linter verification
npm run lint
```

**Observed Verification Results**:
- `npm run typecheck`: Exited with code 0 (0 errors).
- `npm run build`: Exited with code 0 (all 2,497 modules transformed, production bundles generated in `dist/`).
- `npm run lint`: Exited with code 0 (0 errors across 111 files).
