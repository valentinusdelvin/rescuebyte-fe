# Handoff Report: API Integration & Swagger Contract Specification Miner

**Agent**: Survey Explorer 3 (API Integration & Swagger Contract Specification Miner)  
**Working Directory**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3`  
**Target File**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\handoff.md`  
**Date**: 2026-11-04T00:15:00Z  

---

## 1. Observation

### 1.1 Specification Source & Live Probing
- **Authoritative Swagger Spec**: Downloaded from `https://dolpin-fourthree.bccdev.id/swagger/doc.json` (Swagger 2.0, 170,123 bytes). Contains **43 distinct endpoints** categorized across **10 tags** and **49 schema definitions**.
- **Live Endpoint Probing**:
  - `GET /health` returned `200 OK`:
    ```json
    {
      "request_id": "OAn9oFFKhAx47AnXrV1jxp2ed7J9asz2dUQ3ye8DcKA",
      "payload": {
        "message": "RescueByte API is up and running",
        "status": "healthy"
      }
    }
    ```
  - `GET /api/v1/enums` returned `200 OK` with system enums (`active_statuses`, `genders`, `user_roles`).
  - `GET /api/v1/products?limit=2` returned `200 OK` with `payload.products` array and `payload.meta` pagination object (`total_data`, `total_page`, `page`, `limit`).
  - `GET /api/v1/stores?limit=2` returned `200 OK` with `payload.stores` array and `payload.meta` pagination object.
  - `GET /api/v1/products/{id}` returned `200 OK` with `variants`, `images`, and product metrics (`min_rescue_price`, `min_normal_price`, `total_current_stock`).
  - `GET /api/v1/stores/{id}` returned `200 OK` with operational days array `[1, 2, 3, 4, 5, 6, 7]`, times `08:00:00` - `22:00:00`, and location coordinates.

### 1.2 Universal Response Formats
- **Standard Success Response Wrapper** (`Response`):
  ```typescript
  export interface ApiResponse<T> {
    request_id: string; // e.g. "550e8400-e29b-41d4-a716-446655440000"
    payload: T;
  }
  ```
- **Standard Error Response Wrapper** (`ErrorResponse`):
  ```typescript
  export interface ApiErrorResponse {
    request_id: string;
    payload: {
      error: {
        error: string;       // e.g. "validation failed"
        error_code: string;  // e.g. "bad_request", "unauthorized", "not_found"
        location?: string;   // e.g. "body.email"
        message: string;     // e.g. "The request payload or parameter is not valid."
        details?: Record<string, unknown> | string;
      };
    };
  }
  ```
- **Standard Pagination Wrapper** (`PaginationResponse`):
  ```typescript
  export interface PaginationMeta {
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
  }
  ```

---

## Features Discovered (43 Endpoints Catalog)

| # | Category | Feature / Endpoint | Description | Inputs (Path / Query / Body) | Outputs (Payload Schema) | Error Behavior | Discovered Via |
|---|----------|-------------------|-------------|------------------------------|--------------------------|----------------|----------------|
| 1 | Auth | `GET /api/v1/auth/google` | Get Google OAuth2 URL | None | `GoogleAuthURLResponse` (`auth_url`, `state`) | 500 | Swagger & Code |
| 2 | Auth | `GET /api/v1/auth/google/callback` | Exchange OAuth2 code/state | Query: `code*` (str), `state*` (str) | `AuthResponse` (`access_token`, `refresh_token`, `user`) | 400, 500 | Swagger & Code |
| 3 | Auth | `POST /api/v1/auth/login` | Login user with email & password | Body: `LoginRequest` (`email`, `password`) | `AuthResponse` (`access_token`, `refresh_token`, `user`) | 400, 401, 500 | Swagger & Code |
| 4 | Auth | `POST /api/v1/auth/logout` | Invalidate refresh token | Body: `RefreshTokenRequest` (`refresh_token`) | `object` (`{ message: string }`) | 400, 500 | Swagger & Code |
| 5 | Auth | `GET /api/v1/auth/me` | Current authenticated user profile | Header: `Authorization: Bearer <token>` | `UserResponse` (`id`, `name`, `email`, `role`, `avatar_url`) | 401, 404, 500 | Swagger & Code |
| 6 | Auth | `POST /api/v1/auth/refresh` | Renew expired access token | Body: `RefreshTokenRequest` (`refresh_token`) | `AuthResponse` (`access_token`, `refresh_token`) | 400, 401, 500 | Swagger & Code |
| 7 | Auth | `POST /api/v1/auth/register` | Register new user account | Body: `RegisterRequest` (`name`, `email`, `password`, `role_id`) | `AuthResponse` (`access_token`, `refresh_token`, `user`) | 400, 409, 500 | Swagger & Code |
| 8 | Cart | `GET /api/v1/cart` | Get customer cart | Query: `latitude` (num), `longitude` (num) | `CartResponse` (`stores: StoreCartGroup[]`, `subtotal`, fees) | 401, 500 | Swagger & Code |
| 9 | Cart | `DELETE /api/v1/cart` | Clear entire cart | Header: `Authorization: Bearer <token>` | `object` (`{ message: string }`) | 401, 500 | Swagger & Code |
| 10 | Cart | `GET /api/v1/cart/count` | Lightweight cart items counter | Header: `Authorization: Bearer <token>` | `CartCountResponse` (`count: number`) | 401, 500 | Swagger (Unused in FE) |
| 11 | Cart | `POST /api/v1/cart/items` | Add product variant to cart | Body: `AddToCartRequest` (`product_variant_id`, `quantity`) | `object` (`{ message: string }`) | 400, 401, 404, 500 | Swagger & Code |
| 12 | Cart | `DELETE /api/v1/cart/items/{id}` | Remove single item from cart | Path: `id` (item UUID) | `object` (`{ message: string }`) | 401, 404, 500 | Swagger & Code |
| 13 | Cart | `PATCH /api/v1/cart/items/{id}` | Update cart item quantity | Path: `id` (item UUID), Body: `UpdateCartItemRequest` (`quantity`) | `object` (`{ message: string }`) | 400, 401, 404, 500 | Swagger & Code |
| 14 | Cart | `DELETE /api/v1/cart/stores/{store_id}` | Remove all items of a store | Path: `store_id` (store UUID) | `object` (`{ message: string }`) | 401, 404, 500 | Swagger & Code |
| 15 | Enums | `GET /api/v1/enums` | System enums definition | Query: `types` (opt string) | `object` (`active_statuses`, `genders`, `user_roles`) | 500 | Swagger & Live Probe |
| 16 | Order | `GET /api/v1/orders` | Customer order history list | Query: `page`, `limit`, `tab`, `search` | `GetOrdersResponse` (`orders: OrderListItemResponse[]`, `meta`) | 401, 500 | Swagger & Code |
| 17 | Order | `POST /api/v1/orders/checkout` | Create new checkout order | Body: `CheckoutRequest` (store, customer, items, pickup, payment) | `CheckoutResponse` (`order: OrderDetailResponse`, `snap_token`) | 400, 401, 500 | Swagger & Code |
| 18 | Order | `GET /api/v1/orders/seller` | Merchant order queue list | Query: `page`, `limit`, `tab`, `search` | `GetOrdersResponse` (`orders: OrderListItemResponse[]`, `meta`) | 401, 403, 500 | Swagger & Code |
| 19 | Order | `GET /api/v1/orders/{id}` | Get full order detail | Path: `id` (order UUID) | `OrderDetailResponse` (customer, store, items, steps, payment) | 401, 404, 500 | Swagger & Code |
| 20 | Order | `POST /api/v1/orders/{id}/cancel` | Customer cancels order | Path: `id` (order UUID), Body: `CancelOrderRequest` (`reason`) | `object` (`{ message: string }`) | 400, 401, 404, 500 | Swagger (Unused in FE) |
| 21 | Order | `PATCH /api/v1/orders/{id}/status` | Merchant updates order status | Path: `id`, Body: `UpdateOrderStatusRequest` (`status`, `reason`) | `OrderDetailResponse` (updated order) | 400, 401, 403, 404, 500 | Swagger & Code |
| 22 | Payment | `POST /api/v1/payments/midtrans/webhook` | Midtrans IPN Webhook | Body: `MidtransNotificationPayload` | `object` (`{ message: string }`) | 400, 500 | Swagger (Backend IPN) |
| 23 | Payment | `GET /api/v1/payments/order/{order_id}` | Check payment transaction status | Path: `order_id` (order UUID) | `PaymentResponse` (`id`, `order_id`, `status`, `snap_token`) | 401, 404, 500 | Swagger & Code |
| 24 | Product | `GET /api/v1/products` | Public marketplace products | Query: `page`, `limit`, `store_id`, `search`, `city`, `latitude`, `longitude` | `GetProductsResponse` (`products: ProductCardResponse[]`, `meta`) | 500 | Swagger & Live Probe |
| 25 | Product | `POST /api/v1/products` | Merchant creates product | Body: `CreateProductRequest` (`name`, `description`, `variants`, `images`) | `ProductResponse` (created product details) | 400, 401, 403, 500 | Swagger & Code |
| 26 | Product | `GET /api/v1/products/me/list` | Merchant product catalogue | Query: `page`, `limit`, `search`, `tab`, `sort` | `ProductResponse[]` | 401, 403, 500 | Swagger & Code |
| 27 | Product | `GET /api/v1/products/{id}` | Public single product detail | Path: `id` (product UUID) | `ProductResponse` (`variants`, `images`, `stock`, `prices`) | 404, 500 | Swagger & Live Probe |
| 28 | Product | `PUT /api/v1/products/{id}` | Merchant updates product | Path: `id`, Body: `UpdateProductRequest` (`name`, `stock`, `is_active`) | `ProductResponse` (updated product) | 400, 401, 403, 404, 500 | Swagger & Code |
| 29 | Product | `DELETE /api/v1/products/{id}` | Merchant deletes product | Path: `id` (product UUID) | `object` (`{ message: string }`) | 400, 401, 403, 404, 500 | Swagger & Code |
| 30 | Product | `PATCH /api/v1/products/{id}/status` | Toggle product active status | Path: `id`, Body: `ToggleProductStatusRequest` (`is_active: bool`) | `ProductResponse` | 400, 401, 403, 404, 500 | Swagger & Code |
| 31 | Storage | `POST /api/v1/storage/upload` | Upload single image | FormData: `file` (binary), `folder` ('avatars'|'products'|'stores') | `UploadResponse` (`url`, `filename`, `content_type`, `size`) | 400, 401, 413, 500 | Swagger & Code |
| 32 | Storage | `POST /api/v1/storage/upload-multiple` | Upload multiple images | FormData: `files` (array), `folder` | `UploadResponse[]` | 400, 401, 413, 500 | Swagger (Unused in FE) |
| 33 | Store | `GET /api/v1/stores` | Public stores list | Query: `page`, `limit`, `name` | `GetStoresResponse` (`stores: StoreResponse[]`, `meta`) | 500 | Swagger & Live Probe |
| 34 | Store | `POST /api/v1/stores` | Create merchant store profile | Body: `CreateStoreRequest` (name, address, coords, operational) | `StoreResponse` (created store) | 400, 401, 409, 500 | Swagger & Code |
| 35 | Store | `PUT /api/v1/stores/me/operational` | Update store operational hours | Body: `UpdateStoreOperationalRequest` (`status`, `start`, `end`, `days`) | `StoreResponse` | 400, 401, 403, 500 | Swagger & Code |
| 36 | Store | `GET /api/v1/stores/me/profile` | Current seller store profile | Header: `Authorization: Bearer <token>` | `StoreResponse` (store details) | 401, 404, 500 | Swagger & Code |
| 37 | Store | `PUT /api/v1/stores/me/profile` | Update basic store profile | Body: `UpdateStoreProfileRequest` (name, description, contact, address) | `StoreResponse` | 400, 401, 403, 500 | Swagger & Code |
| 38 | Store | `PATCH /api/v1/stores/me/status` | Toggle store active status | Header: `Authorization: Bearer <token>` | `StoreResponse` | 401, 403, 500 | Swagger & Code |
| 39 | Store | `GET /api/v1/stores/{id}` | Public single store detail | Path: `id` (store UUID) | `StoreResponse` (store details) | 404, 500 | Swagger & Live Probe |
| 40 | User | `GET /api/v1/users/profile` | Authenticated user profile | Header: `Authorization: Bearer <token>` | `UserResponse` (profile details) | 401, 404, 500 | Swagger & Code |
| 41 | User | `PUT /api/v1/users/profile` | Update user profile | Body: `UpdateProfileRequest` (`name`, `avatar_url`, `phone`, `dob`, `gender`) | `UserResponse` | 400, 401, 500 | Swagger & Code |
| 42 | User | `PATCH /api/v1/users/role` | Switch user role | Body: `UpdateUserRoleRequest` (`user_id`, `role_id: 1|2|3`) | `UserResponse` | 400, 401, 403, 500 | Swagger & Code |
| 43 | Health | `GET /health` | Health check endpoint | None | `object` (`{ message: string, status: "healthy" }`) | 500 | Swagger & Live Probe |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | `GET /api/v1/users/{id}` (Frontend Bug) | User UUID passed in path | **401 Unauthorized** (no bearer token) or **404 Route Not Found** because the route does NOT exist in backend Swagger. Endpoint in `userService.ts:60` and `SellerOrderDetailModal.tsx:125` is erroneous. |
| 2 | `GET /api/v1/cart/count` | Valid Bearer token | Backend returns lightweight `{ count: N }`. Frontend never calls it, calculating count from localStorage instead. |
| 3 | `POST /api/v1/orders/{id}/cancel` | Valid Bearer token + `{ reason: "berubah pikiran" }` | Backend cancels order from customer side. Frontend lacks this API method entirely. |
| 4 | `DELETE /api/v1/products/{id}` | Product with existing orders | Fails with foreign key constraint error. Current workaround in `productService.ts:348` intercepts error and falls back to `toggleProductStatusApi(productId, false)`. |
| 5 | Token expiration (401 on private endpoint) | Expired access token in header | `api.ts:36-40` merely prints `console.warn` and rejects. Does NOT invoke `/api/v1/auth/refresh` to transparently refresh access token and retry. |
| 6 | Location coordinates filtering on `/api/v1/products` | `latitude` & `longitude` query params | Backend dynamically computes `distance_km` on each product card and returns sorted by proximity. |

---

## 1.3 Detailed Audit of Frontend API Coupling (26 Components)

The audit of 70 source files revealed **26 components** directly importing and calling services:

1. **`src/pages/CustomerOrderDetail.tsx` (1,161 lines)**:
   - Imports 6 services: `orderService`, `productService`, `locationService`, `authService`, `midtransService`, `storeService`.
   - Direct `useEffect` polling and status mutations inside component.
2. **`src/pages/CustomerCheckout.tsx` (1,128 lines)**:
   - Imports 6 services: `orderService`, `cartService`, `authService`, `locationService`, `storeService`, `midtransService`.
   - Contains 120 lines of checkout loop, operational window calculations, item variant lookups, and Midtrans Snap callbacks directly in UI event handler.
3. **`src/pages/CustomerStoreDetail.tsx` (1,240 lines)**:
   - Directly calls `getAllStores`, `getPublicProducts`, `getStoredProducts`, `getUserCoordinates`.
   - Has no dedicated loading state spinner while stores and products load.
4. **`src/pages/CustomerMarketplace.tsx` (1,156 lines)**:
   - Directly calls `getPublicProducts`, `getCartCount`, `formatDistanceKm`.
5. **`src/pages/CustomerCart.tsx` (902 lines)**:
   - Directly calls `fetchBackendCart`, `removeCartItemApi`, `updateCartItemQtyApi`, `removeCartStoreApi`, `getAllStores`.
6. **`src/pages/CustomerOrderHistory.tsx` (837 lines)**:
   - Directly calls `fetchCustomerOrdersApi`, `getCustomerOrders`, `getAllStores`.
7. **`src/pages/CustomerProductDetail.tsx` (776 lines)**:
   - Directly calls `addToCartApi`, `getAllStores`, `getCartCount`.
8. **`src/pages/CustomerHome.tsx` (710 lines)**:
   - Directly calls `getPublicProducts`, `getCurrentUser`, `formatDistanceKm`.
9. **`src/pages/OrderHistory.tsx` (550 lines)**:
   - Directly calls `fetchMerchantOrdersApi`, `confirmMerchantOrder`, `processMerchantOrder`, `completeMerchantOrder`.
   - Lacks an explicit loading state spinner.
10. **`src/pages/Daganganku.tsx` (528 lines)**:
    - Directly calls `getMerchantProducts`, `toggleProductStatusApi`, `deleteProductApi`, `updateProductStockApi`.
11. **`src/pages/StoreProfile.tsx` (457 lines)**:
    - Directly calls `getStoreProfile`, `updateStoreProfile`, `updateStoreOperational`, `toggleStoreStatus`, `createStore`.
12. **`src/pages/CustomerAuth.tsx` (468 lines)**:
    - Directly calls `loginUser`, `registerUser`, `getGoogleAuthUrl`.
13. **`src/pages/BuatDagangan.tsx` (465 lines)**:
    - Directly calls `createProduct`, `uploadImage`.
14. **`src/pages/CustomerProfile.tsx` (232 lines)**:
    - Directly calls `getUserProfile`, `updateUserProfile`, `logoutUser`.
15. **`src/components/seller/SellerOrderDetailModal.tsx` (573 lines)**:
    - Calls `fetchOrderDetailApi`, `getStoreById`, and the invalid `getUserById`.
16. **`src/components/seller/StoreInfoForm.tsx` (467 lines)**:
    - Calls `searchCities`, `getKecamatansForCity`, `searchOpenStreetMap`.
17. **`src/components/seller/StoreLocationMap.tsx` (420 lines)**:
    - Calls `reverseGeocodeOSM`.
18. **`src/components/dashboard/PerformanceChart.tsx` (508 lines)**:
    - Calls `getSellerPerformanceData`, `subscribeToMerchantOrders`.
19. **`src/components/customer/CustomerHeader.tsx` (474 lines)**:
    - Calls `getCurrentUser`, `subscribeToAuth`, `logoutUser`.
20. **`src/components/customer/CustomerProfileDropdown.tsx` (340 lines)**:
    - Calls `getRoleForEmail`, `getStoreProfile`.
21. **`src/components/common/ProfileAvatar.tsx` (280 lines)**:
    - Calls `uploadImage`.
22. **`src/components/layout/Header.tsx` (269 lines)**:
    - Calls `logoutUser`, `getStoreProfile`.
23. **`src/components/dashboard/ActivityCards.tsx` (107 lines)**:
    - Calls `getMerchantOrders`, `subscribeToMerchantOrders`, `getStoredProducts`.
24. **`src/components/dashboard/FinanceCard.tsx` (71 lines)**:
    - Calls `getMerchantOrders`, `subscribeToMerchantOrders`.
25. **`src/pages/CustomerContact.tsx` (282 lines)**:
    - Calls `getCurrentUser`.
26. **`src/App.tsx` (930 lines)**:
    - Calls `handleGoogleCallback`, `getStoreProfile`, `getCurrentUser`.

---

## 2. Logic Chain

1. **Premise 1 (Contract Integrity)**: The Swagger 2.0 specification hosted at `https://dolpin-fourthree.bccdev.id/swagger/doc.json` is the authoritative contract for the backend API. It defines 43 endpoints and 49 data transfer objects.
2. **Premise 2 (Live Endpoint Verification)**: Live testing against `/health`, `/api/v1/enums`, `/api/v1/products`, `/api/v1/stores`, `/api/v1/products/{id}`, and `/api/v1/stores/{id}` confirmed that every response strictly wraps its data in `{ request_id: string, payload: T }` and follows snake_case naming.
3. **Premise 3 (Discrepancy Discovery)**:
   - `GET /api/v1/users/{id}` does NOT exist in Swagger. Its presence in `userService.ts:60` and `SellerOrderDetailModal.tsx:125` is an invalid hallucination/relic.
   - Investigation of `definitions.json` revealed `OrderDetailResponse` already contains `customer_name`, `customer_email`, and `customer_phone`. Therefore, `getUserById` is completely redundant and must be eliminated.
   - The backend provides `GET /api/v1/cart/count` and `POST /api/v1/orders/{id}/cancel`, yet the frontend calculates counts locally and lacks cancellation support.
4. **Premise 4 (Architectural Non-Compliance with R4)**:
   - Requirement R4 demands: "Establish a centralized API client utilizing VITE_API_BASE_URL (https://dolpin-fourthree.bccdev.id/) with typed service functions, custom hooks, and TypeScript response/request schemas matching backend Swagger documentation. Eliminate direct API calls inside presentational components."
   - The codebase currently has 26 presentational components containing raw async service invocations, manual `response.data?.payload` extraction, inconsistent error string parsing, and no reusable React query hooks.
5. **Conclusion**: To satisfy R4 and prepare for Phase 3 implementation, the frontend requires:
   - Generated Swagger TypeScript types (`swagger_types.ts`).
   - A centralized Axios client with standard response unwrapping, error normalization, and transparent 401 token refresh queue.
   - Domain service modules strictly mapped to Swagger tags.
   - Custom React hooks (`useAuth`, `useCart`, `useProducts`, `useOrders`, `useStore`) to decouple UI presentation from API transport.

---

## 3. Caveats

1. **No Backend Modifications**: In accordance with user rules and R1-R5, no backend endpoints, database structures, or server configurations were or can be changed.
2. **Third-Party External Services**: The project uses OpenStreetMap/Nominatim (`nominatim.openstreetmap.org`) for geocoding and Midtrans Snap (`app.sandbox.midtrans.com/snap/snap.js`) for payment popups. These are external vendor integrations outside the core `dolpin-fourthree.bccdev.id` Swagger spec.
3. **Offline / Cache Fallback**: Some services currently maintain dual caches in `localStorage` (e.g. `cartService`, `orderService`). The transition to custom hooks must ensure that offline/unauthenticated guest browsing continues to function seamlessly while prioritizing backend state when authenticated.

---

## 4. Conclusion & Recommended Architecture

### 4.1 Target Folder Structure for API Integration
```
src/
├── api/
│   ├── client.ts             # Central Axios client with interceptors & auto-refresh
│   ├── types.ts              # Exported Swagger schemas (from swagger_types.ts)
│   ├── mappers/              # Clean DTO (snake_case) <-> UI Model (camelCase) converters
│   │   ├── productMapper.ts
│   │   ├── orderMapper.ts
│   │   ├── cartMapper.ts
│   │   └── storeMapper.ts
│   └── services/             # Pure API callers grouped by Swagger tag
│       ├── authApi.ts        # Tag: Auth (7 endpoints)
│       ├── cartApi.ts        # Tag: Cart (7 endpoints)
│       ├── orderApi.ts       # Tag: Order & Payment (8 endpoints)
│       ├── productApi.ts     # Tag: Product (7 endpoints)
│       ├── storeApi.ts       # Tag: Store (7 endpoints)
│       ├── userApi.ts        # Tag: User (3 endpoints)
│       ├── storageApi.ts     # Tag: Storage (2 endpoints)
│       └── enumApi.ts        # Tag: Enums (1 endpoint)
├── hooks/                    # Reusable React hooks with loading, error, empty states
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useCheckout.ts
│   ├── useProducts.ts
│   ├── useProductDetail.ts
│   ├── useOrders.ts
│   ├── useOrderDetail.ts
│   ├── useMerchantOrders.ts
│   ├── useStoreProfile.ts
│   └── useImageUpload.ts
```

### 4.2 Core Client Architecture (`src/api/client.ts`)
```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dolpin-fourthree.bccdev.id/';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor with Token Refresh Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken || originalRequest.url?.includes('/api/v1/auth/')) {
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
          `${API_BASE_URL}api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const { access_token, refresh_token: newRefreshToken } = refreshRes.data.payload;
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);

        processQueue(null, access_token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('rescuebyte_session_expired'));
        return Promise.reject(normalizeError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: unknown): Error {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    const msg = data.payload?.error?.message || data.payload?.error?.error || error.message;
    return new Error(msg);
  }
  return error instanceof Error ? error : new Error('Terjadi kesalahan jaringan.');
}
```

---

## 5. Verification Method

To independently verify all findings and specifications:

1. **Verify Backend Connectivity & Health**:
   ```powershell
   powershell -Command "Invoke-RestMethod -Uri 'https://dolpin-fourthree.bccdev.id/health' | ConvertTo-Json"
   ```
2. **Inspect Downloaded Swagger Spec & Artifacts**:
   - `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\doc.json`
   - `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\swagger_types.ts`
   - `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\endpoint_catalog_table.md`
   - `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\endpoints_with_payloads.json`
   - `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\component_api_audit.json`
3. **Verify Component Coupling List**:
   - Inspect `component_api_audit.json` to view the 26 coupled components and their service imports.
4. **Verify TypeScript Compilation**:
   ```bash
   npm run typecheck
   ```
   (Must pass with 0 errors).
