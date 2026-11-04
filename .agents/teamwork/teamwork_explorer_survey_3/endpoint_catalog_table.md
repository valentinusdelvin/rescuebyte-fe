### Exhaustive Backend Endpoint Catalog (43 Endpoints)

| # | Category | Method | Route | Auth | Summary | Parameters (Path / Query) | Request Body Schema | Response Model | Frontend Status |
|---|----------|--------|-------|------|---------|----------------------------|---------------------|----------------|-----------------|
| 1 | Auth | `GET` | `/api/v1/auth/google` | Public | Get Google OAuth2 URL | Path: -<br>Query: - | - | Standard Response | authService.ts -> getGoogleAuthUrl |
| 2 | Auth | `GET` | `/api/v1/auth/google/callback` | Public | Handle Google OAuth2 callback | Path: -<br>Query: code* (string), state* (string) | - | Standard Response | authService.ts -> handleGoogleCallback |
| 3 | Auth | `POST` | `/api/v1/auth/login` | Public | Login user | Path: -<br>Query: - | `LoginRequest` | Standard Response | authService.ts -> loginUser |
| 4 | Auth | `POST` | `/api/v1/auth/logout` | Public | Logout user | Path: -<br>Query: - | `RefreshTokenRequest` | Standard Response | authService.ts -> logoutUser |
| 5 | Auth | `GET` | `/api/v1/auth/me` | `Bearer` | Get current authenticated user | Path: -<br>Query: - | - | Standard Response | authService.ts -> fetchCurrentUser |
| 6 | Auth | `POST` | `/api/v1/auth/refresh` | Public | Refresh access token | Path: -<br>Query: - | `RefreshTokenRequest` | Standard Response | authService.ts -> refreshAccessToken |
| 7 | Auth | `POST` | `/api/v1/auth/register` | Public | Register new user account | Path: -<br>Query: - | `RegisterRequest` | Standard Response | authService.ts -> registerUser |
| 8 | Cart | `GET` | `/api/v1/cart` | `Bearer` | Get customer cart | Path: -<br>Query: latitude (number), longitude (number) | - | Standard Response | cartService.ts -> fetchBackendCart |
| 9 | Cart | `DELETE` | `/api/v1/cart` | `Bearer` | Clear cart | Path: -<br>Query: - | - | Standard Response | cartService.ts -> clearCartApi |
| 10 | Cart | `GET` | `/api/v1/cart/count` | `Bearer` | Get cart items count | Path: -<br>Query: - | - | Standard Response | MISSING in frontend (computed in local storage) |
| 11 | Cart | `POST` | `/api/v1/cart/items` | `Bearer` | Add item to cart | Path: -<br>Query: - | `AddToCartRequest` | Standard Response | cartService.ts -> addToCartApi |
| 12 | Cart | `DELETE` | `/api/v1/cart/items/{id}` | `Bearer` | Remove item from cart | Path: id (string)<br>Query: - | - | Standard Response | cartService.ts -> removeCartItemApi |
| 13 | Cart | `PATCH` | `/api/v1/cart/items/{id}` | `Bearer` | Update cart item quantity | Path: id (string)<br>Query: - | `UpdateCartItemRequest` | Standard Response | cartService.ts -> updateCartItemQtyApi |
| 14 | Cart | `DELETE` | `/api/v1/cart/stores/{store_id}` | `Bearer` | Remove all items from a store | Path: store_id (string)<br>Query: - | - | Standard Response | cartService.ts -> removeCartStoreApi |
| 15 | Enums | `GET` | `/api/v1/enums` | Public | Get system enums | Path: -<br>Query: types (string) | - | Standard Response | MISSING in frontend |
| 16 | Order | `GET` | `/api/v1/orders` | `Bearer` | List customer orders | Path: -<br>Query: page (integer), limit (integer), tab (string), search (string) | - | Standard Response | orderService.ts -> fetchCustomerOrdersApi |
| 17 | Order | `POST` | `/api/v1/orders/checkout` | `Bearer` | Checkout order | Path: -<br>Query: - | `CheckoutRequest` | Standard Response | orderService.ts -> checkoutOrderApi |
| 18 | Order | `GET` | `/api/v1/orders/seller` | `Bearer` | List seller orders | Path: -<br>Query: page (integer), limit (integer), tab (string), search (string) | - | Standard Response | orderService.ts -> fetchMerchantOrdersApi |
| 19 | Order | `GET` | `/api/v1/orders/{id}` | `Bearer` | Get order detail | Path: id (string)<br>Query: - | - | Standard Response | orderService.ts -> fetchOrderDetailApi |
| 20 | Order | `POST` | `/api/v1/orders/{id}/cancel` | `Bearer` | Cancel order | Path: id (string)<br>Query: - | `CancelOrderRequest` | Standard Response | MISSING in frontend |
| 21 | Order | `PATCH` | `/api/v1/orders/{id}/status` | `Bearer` | Update order status by merchant | Path: id (string)<br>Query: - | `UpdateOrderStatusRequest` | Standard Response | orderService.ts -> updateMerchantOrderStatus / confirm / process / complete / cancelMerchantOrder |
| 22 | Payment | `POST` | `/api/v1/payments/midtrans/webhook` | Public | Midtrans payment webhook | Path: -<br>Query: - | `MidtransNotificationPayload` | Standard Response | N/A (Server-to-Server Webhook) |
| 23 | Payment | `GET` | `/api/v1/payments/order/{order_id}` | `Bearer` | Check payment status | Path: order_id (string)<br>Query: - | - | Standard Response | orderService.ts -> fetchPaymentDetailsApi, fetchPaymentStatusApi |
| 24 | Product | `GET` | `/api/v1/products` | Public | Get all products | Path: -<br>Query: page (integer), limit (integer), store_id (string), nama (string), name (string), search (string), city (string), latitude (number), longitude (number) | - | Standard Response | productService.ts -> getPublicProducts |
| 25 | Product | `POST` | `/api/v1/products` | `Bearer` | Create a new product | Path: -<br>Query: - | `CreateProductRequest` | Standard Response | productService.ts -> createProduct |
| 26 | Product | `GET` | `/api/v1/products/me/list` | `Bearer` | List merchant products | Path: -<br>Query: page (integer), limit (integer), search (string), tab (string), sort (string) | - | Standard Response | productService.ts -> getMerchantProducts |
| 27 | Product | `GET` | `/api/v1/products/{id}` | Public | Get product detail | Path: id (string)<br>Query: - | - | Standard Response | cartService.ts -> getProductVariantId / direct call in order detail |
| 28 | Product | `PUT` | `/api/v1/products/{id}` | `Bearer` | Update product | Path: id (string)<br>Query: - | `UpdateProductRequest` | Standard Response | productService.ts -> updateProductStockApi |
| 29 | Product | `DELETE` | `/api/v1/products/{id}` | `Bearer` | Delete product | Path: id (string)<br>Query: - | - | Standard Response | productService.ts -> deleteProductApi |
| 30 | Product | `PATCH` | `/api/v1/products/{id}/status` | `Bearer` | Toggle product status | Path: id (string)<br>Query: - | `ToggleProductStatusRequest` | Standard Response | productService.ts -> toggleProductStatusApi |
| 31 | Storage | `POST` | `/api/v1/storage/upload` | `Bearer` | Upload an image | Path: -<br>Query: - | - | Standard Response | storageService.ts -> uploadImage |
| 32 | Storage | `POST` | `/api/v1/storage/upload-multiple` | `Bearer` | Upload multiple images | Path: -<br>Query: - | - | Standard Response | MISSING in frontend |
| 33 | Store | `GET` | `/api/v1/stores` | Public | Get all stores | Path: -<br>Query: page (integer), limit (integer), name (string), nama (string) | - | Standard Response | storeService.ts -> getAllStores |
| 34 | Store | `POST` | `/api/v1/stores` | `Bearer` | Create a new store | Path: -<br>Query: - | `CreateStoreRequest` | Standard Response | storeService.ts -> createStore |
| 35 | Store | `PUT` | `/api/v1/stores/me/operational` | `Bearer` | Update store operational info | Path: -<br>Query: - | `UpdateStoreOperationalRequest` | Standard Response | storeService.ts -> updateStoreOperational |
| 36 | Store | `GET` | `/api/v1/stores/me/profile` | `Bearer` | Get authenticated user's store | Path: -<br>Query: - | - | Standard Response | storeService.ts -> getStoreProfile |
| 37 | Store | `PUT` | `/api/v1/stores/me/profile` | `Bearer` | Update store profile | Path: -<br>Query: - | `UpdateStoreProfileRequest` | Standard Response | storeService.ts -> updateStoreProfile |
| 38 | Store | `PATCH` | `/api/v1/stores/me/status` | `Bearer` | Toggle store active status | Path: -<br>Query: - | - | Standard Response | storeService.ts -> toggleStoreStatus |
| 39 | Store | `GET` | `/api/v1/stores/{id}` | Public | Get store by ID | Path: id (string)<br>Query: - | - | Standard Response | storeService.ts -> getStoreById |
| 40 | User | `GET` | `/api/v1/users/profile` | `Bearer` | Get user profile | Path: -<br>Query: - | - | Standard Response | userService.ts -> getUserProfile |
| 41 | User | `PUT` | `/api/v1/users/profile` | `Bearer` | Update user profile | Path: -<br>Query: - | `UpdateProfileRequest` | Standard Response | userService.ts -> updateUserProfile |
| 42 | User | `PATCH` | `/api/v1/users/role` | `Bearer` | Update user role | Path: -<br>Query: - | `UpdateUserRoleRequest` | Standard Response | userService.ts -> updateUserRole |
| 43 | Health Check | `GET` | `/health` | Public | Health check endpoint | Path: -<br>Query: - | - | Standard Response | MISSING in frontend (Ops endpoint) |
