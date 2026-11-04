import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const endpoints = JSON.parse(fs.readFileSync(path.join(__dirname, 'detailed_endpoints.json'), 'utf8'));
const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'endpoint_analysis.json'), 'utf8'));
const defs = JSON.parse(fs.readFileSync(path.join(__dirname, 'definitions.json'), 'utf8'));

// Map frontend function names to endpoints
const feFunctionMap = {
  'POST /api/v1/auth/register': 'authService.ts -> registerUser',
  'POST /api/v1/auth/login': 'authService.ts -> loginUser',
  'POST /api/v1/auth/logout': 'authService.ts -> logoutUser',
  'GET /api/v1/auth/me': 'authService.ts -> fetchCurrentUser',
  'POST /api/v1/auth/refresh': 'authService.ts -> refreshAccessToken',
  'GET /api/v1/auth/google': 'authService.ts -> getGoogleAuthUrl',
  'GET /api/v1/auth/google/callback': 'authService.ts -> handleGoogleCallback',
  'GET /api/v1/enums': 'MISSING in frontend',
  'GET /api/v1/cart': 'cartService.ts -> fetchBackendCart',
  'DELETE /api/v1/cart': 'cartService.ts -> clearCartApi',
  'GET /api/v1/cart/count': 'MISSING in frontend (computed in local storage)',
  'POST /api/v1/cart/items': 'cartService.ts -> addToCartApi',
  'DELETE /api/v1/cart/items/{id}': 'cartService.ts -> removeCartItemApi',
  'PATCH /api/v1/cart/items/{id}': 'cartService.ts -> updateCartItemQtyApi',
  'DELETE /api/v1/cart/stores/{store_id}': 'cartService.ts -> removeCartStoreApi',
  'GET /api/v1/orders': 'orderService.ts -> fetchCustomerOrdersApi',
  'POST /api/v1/orders/checkout': 'orderService.ts -> checkoutOrderApi',
  'GET /api/v1/orders/seller': 'orderService.ts -> fetchMerchantOrdersApi',
  'GET /api/v1/orders/{id}': 'orderService.ts -> fetchOrderDetailApi',
  'POST /api/v1/orders/{id}/cancel': 'MISSING in frontend',
  'PATCH /api/v1/orders/{id}/status': 'orderService.ts -> updateMerchantOrderStatus / confirm / process / complete / cancelMerchantOrder',
  'POST /api/v1/payments/midtrans/webhook': 'N/A (Server-to-Server Webhook)',
  'GET /api/v1/payments/order/{order_id}': 'orderService.ts -> fetchPaymentDetailsApi, fetchPaymentStatusApi',
  'GET /api/v1/products': 'productService.ts -> getPublicProducts',
  'POST /api/v1/products': 'productService.ts -> createProduct',
  'GET /api/v1/products/me/list': 'productService.ts -> getMerchantProducts',
  'GET /api/v1/products/{id}': 'cartService.ts -> getProductVariantId / direct call in order detail',
  'PUT /api/v1/products/{id}': 'productService.ts -> updateProductStockApi',
  'DELETE /api/v1/products/{id}': 'productService.ts -> deleteProductApi',
  'PATCH /api/v1/products/{id}/status': 'productService.ts -> toggleProductStatusApi',
  'POST /api/v1/storage/upload': 'storageService.ts -> uploadImage',
  'POST /api/v1/storage/upload-multiple': 'MISSING in frontend',
  'GET /api/v1/stores': 'storeService.ts -> getAllStores',
  'POST /api/v1/stores': 'storeService.ts -> createStore',
  'PUT /api/v1/stores/me/operational': 'storeService.ts -> updateStoreOperational',
  'GET /api/v1/stores/me/profile': 'storeService.ts -> getStoreProfile',
  'PUT /api/v1/stores/me/profile': 'storeService.ts -> updateStoreProfile',
  'PATCH /api/v1/stores/me/status': 'storeService.ts -> toggleStoreStatus',
  'GET /api/v1/stores/{id}': 'storeService.ts -> getStoreById',
  'GET /api/v1/users/profile': 'userService.ts -> getUserProfile',
  'PUT /api/v1/users/profile': 'userService.ts -> updateUserProfile',
  'PATCH /api/v1/users/role': 'userService.ts -> updateUserRole',
  'GET /health': 'MISSING in frontend (Ops endpoint)'
};

let md = '### Exhaustive Backend Endpoint Catalog (43 Endpoints)\n\n';
md += '| # | Category | Method | Route | Auth | Summary | Parameters (Path / Query) | Request Body Schema | Response Model | Frontend Status |\n';
md += '|---|----------|--------|-------|------|---------|----------------------------|---------------------|----------------|-----------------|\n';

endpoints.forEach((ep, idx) => {
  const key = `${ep.method} ${ep.route}`;
  const feStatus = feFunctionMap[key] || 'Unmapped';
  const isAuth = ep.isAuth ? '`Bearer`' : 'Public';
  
  const pathParams = ep.parameters.filter(p => p.in === 'path').map(p => `${p.name} (${p.type})`).join(', ') || '-';
  const queryParams = ep.parameters.filter(p => p.in === 'query').map(p => `${p.name}${p.required ? '*' : ''} (${p.type || 'any'})`).join(', ') || '-';
  const paramsStr = `Path: ${pathParams}<br>Query: ${queryParams}`;

  const bodyParam = ep.parameters.find(p => p.in === 'body');
  const bodySchema = bodyParam ? (bodyParam.schemaRef ? `\`${bodyParam.schemaRef.split('.').pop()}\`` : bodyParam.type || 'object') : '-';

  const resp200 = ep.responses['200'] || ep.responses['201'] || ep.responses['204'];
  const respSchema = resp200?.schemaRef ? `\`${resp200.schemaRef.split('.').pop()}\`` : (resp200?.type || 'Standard Response');

  md += `| ${idx + 1} | ${ep.tag} | \`${ep.method}\` | \`${ep.route}\` | ${isAuth} | ${ep.summary} | ${paramsStr} | ${bodySchema} | ${respSchema} | ${feStatus} |\n`;
});

fs.writeFileSync(path.join(__dirname, 'endpoint_catalog_table.md'), md);
console.log('Generated endpoint_catalog_table.md');
