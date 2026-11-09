# Investigation Report: Geolocation (R7) & Session Management (R8)

- **Agent**: Explorer 3 (Systems, Geolocation & Auth Specialist)
- **State Folder**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_3\`
- **Parent Conversation ID**: `38968871-17e4-4323-bc74-f1f1c77fe5bd`
- **Date**: 2026-11-09T11:48:00Z
- **Working Directory**: `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe`

---

## 1. Observation

### 1.1 R7: Automatic Customer Geolocation

1. **Absence of Centralized Geolocation Hook / Service**:
   - Inspected `src/hooks/index.ts` (lines 1–17) and found no `useGeolocation` or location-related hook exported.
   - Inspected `src/context/` directory (`src/context/index.ts`, lines 1–7) which only exports `AuthContext`, `CartContext`, and `ToastContext`. There is no `LocationContext` or provider for application-wide coordinates.

2. **CustomerHome.tsx Static Coordinates Loading**:
   - In `src/pages/customer/CustomerHome.tsx` (lines 253–265):
     ```typescript
     const coords = (() => {
       try {
         const saved = localStorage.getItem('rescuebyte_user_coords');
         if (saved) return JSON.parse(saved);
       } catch {}
       return { lat: -7.9526, lng: 112.6146 };
     })();

     const products = await getPublicProducts({
       latitude: coords.lat,
       longitude: coords.lng,
     });
     ```
   - Observed that `CustomerHome.tsx` loads coordinates once on mount directly from `localStorage` without invoking `navigator.geolocation.getCurrentPosition()`. If the user has not granted permission or has never opened Marketplace, it silently uses the hardcoded fallback `{ lat: -7.9526, lng: 112.6146 }` (Malang default) and never requests live customer coordinates.
   - Furthermore, `CustomerHome.tsx` has no event listener or context subscription to react if coordinates update elsewhere.

3. **CustomerMarketplace.tsx Manual-Only Prompt**:
   - In `src/pages/customer/CustomerMarketplace.tsx` (lines 143–177):
     ```typescript
     const handleRequestLiveLocation = useCallback(() => {
       if (isLoadingLoc) return;
       if (!navigator.geolocation) {
         if (onShowToast) onShowToast('Browser tidak mendukung geolokasi');
         setSelectedCity('Malang');
         return;
       }
       setIsLoadingLoc(true);
       navigator.geolocation.getCurrentPosition(
         (pos) => {
           setIsLoadingLoc(false);
           hasWarnedLocationRef.current = false;
           const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
           setUserCoords(coords);
           try {
             localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords));
           } catch { }
           setSelectedCity('Lokasi Saat Ini');
           setOpenDropdown(null);
           if (onShowToast) onShowToast('📍 Lokasi terdeteksi, menampilkan Mystery Box terdekat');
         },
         (err) => {
           setIsLoadingLoc(false);
           console.warn('Geolocation permission:', err.message);
           if (!hasWarnedLocationRef.current) {
             hasWarnedLocationRef.current = true;
             if (onShowToast) onShowToast('Izin lokasi belum diberikan, default: Malang');
           }
           setSelectedCity('Malang');
           const fallback = CITY_COORDINATES['Malang'];
           setUserCoords(fallback);
         },
         { enableHighAccuracy: false, timeout: 3000 }
       );
     }, [isLoadingLoc, onShowToast]);
     ```
   - On line 419 of `CustomerMarketplace.tsx`, `handleRequestLiveLocation` is **only** triggered when the user manually opens the city dropdown and clicks the "Gunakan Lokasi Saat Ini" button:
     ```tsx
     <button
       type="button"
       onClick={handleRequestLiveLocation}
       className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-brand-green font-semibold hover:bg-brand-green/5 transition-colors text-left"
     >
     ```
   - There is zero automatic prompt on application startup or initial navigation.
   - The state guard `hasWarnedLocationRef` is scoped locally within `CustomerMarketplace`, leaving other pages unable to coordinate permission state.

4. **Product Sorting by Location in CustomerMarketplace**:
   - In `src/pages/customer/CustomerMarketplace.tsx` (lines 93–94 and 250–254):
     ```typescript
     const [sortField, setSortField] = useState<SortField>('lokasi');
     const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
     ...
     if (sortField === 'lokasi') {
       const distA = parseFloat(a.distanceText) || 0;
       const distB = parseFloat(b.distanceText) || 0;
       return sortOrder === 'asc' ? distA - distB : distB - distA;
     }
     ```
   - The sort config already supports sorting by distance ascending, which maps from `formatDistanceKm(p.distance_km)` computed by backend `GET /api/v1/products?latitude=...&longitude=...`.
   - However, because live coordinates are not automatically obtained at startup, `distanceText` and sorting default to relative distance from the hardcoded Malang coordinate rather than the user's actual browser position.

---

### 1.2 R8: Automatic Session Logout

1. **Incomplete HTTP 401 Interceptor in apiClient**:
   - In `src/api/client.ts` (lines 191–285):
     ```typescript
     // Handle 401 Unauthorized on protected routes with automatic token refresh
     if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
       const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

       if (!refreshToken) {
         // No refresh token available, session is completely expired
         return Promise.reject(error);
       }
     ```
   - Observed defects:
     - When `error.response?.status === 401` and `!refreshToken`, `client.ts` executes `return Promise.reject(error)` without clearing auth state, without dispatching an expiration event, and without redirecting to login.
     - When `isAuthEndpoint` is true (such as `/api/v1/auth/me`), 401 errors are completely bypassed by this block and directly rejected.
     - When token refresh fails (`catch (refreshErr)` on lines 270–281):
       ```typescript
       if (typeof window !== 'undefined') {
         localStorage.removeItem(ACCESS_TOKEN_KEY);
         localStorage.removeItem(REFRESH_TOKEN_KEY);
         localStorage.removeItem(AUTH_STORAGE_KEY);

         window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'));
       }
       ```
       Only three storage keys are removed (`ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `AUTH_STORAGE_KEY`). Sensitive session items like `rescuebyte_customer_cart`, `rescuebyte_user_role`, `rescuebyte_store_*`, and cached user data are retained in storage.

2. **No Bearer Token JWT Expiration Tracking or Timer**:
   - In `src/context/AuthContext.tsx` and `src/services/authService.ts`:
     - Neither file inspects the Bearer Token (`access_token`) payload for standard JWT `exp` claims.
     - Neither file sets a timer (`setTimeout`) to proactively log the user out when the access token reaches expiration.
     - Neither file tracks the initial login timestamp or enforces a maximum 24-hour session limit.

3. **No 24-Hour Session Duration Enforcement**:
   - `saveAuthSession` (`AuthContext.tsx:58–85`) and `saveAuth` (`authService.ts:96–133`) save credentials into `localStorage` without storing a login timestamp (`rescuebyte_login_at`).
   - There is no check anywhere in the codebase comparing `Date.now() - loginTimestamp > 24 * 60 * 60 * 1000`.

4. **Inconsistent and Unprotected Route Redirections on Logout**:
   - In `src/App.tsx` (lines 486–520):
     ```typescript
     const unsubscribe = subscribeToAuth((authLatest) => {
       const { path } = parseHash();
       if (!authLatest) {
         if (
           path.startsWith('marketplace') ||
           path.startsWith('detail-produk') ||
           ...
           path.startsWith('beranda-seller') ||
           ...
         ) {
           handleNavigate('view-customer-home', 'Beranda Pelanggan');
         }
       }
     });
     ```
     Observed that when a user session ends, `App.tsx` redirects the user to `'view-customer-home'` (`#beranda-customer`) rather than the login page (`view-auth-role-selection` / `#auth`), directly violating requirement R8 ("redirecting to the login page").
   - In `src/components/customer/CustomerHeader.tsx` (lines 127–128) and `src/pages/customer/CustomerProfile.tsx` (line 140), logout defaults to `window.location.hash = '#beranda-customer'`.
   - In `src/components/layout/Header.tsx` (line 150), merchant logout defaults to `if (onNavigate) onNavigate('view-customer-home')`.

5. **Lack of Authentication Route Guards on Direct Page Reload and Hash Navigation**:
   - In `src/App.tsx` (lines 31–85), initial state resolution:
     ```typescript
     if (path.startsWith('beranda-seller') || path === 'beranda') return 'view-beranda';
     if (path.startsWith('profil-seller') || path === 'profil') return 'view-profil';
     if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) return 'view-riwayat';
     if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) return 'view-buat-dagangan';
     if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) return 'view-daganganku';
     if (path.startsWith('ulasan-seller') || path === 'ulasan') return 'view-ulasan';
     ```
     None of the seller routes verify whether a user is authenticated or holds the seller role on startup. An unauthenticated browser reload with `#beranda-seller` renders the merchant portal.
   - In `src/app/useHashNavigation.ts` (lines 33–55), browser hash changes to seller routes do not perform any authentication checks (`!getCurrentUser() && !isAuthenticated`).

6. **Tab Restoration & Multiple Timer Risks**:
   - In `src/context/AuthContext.tsx`, `refreshUser` is invoked in `useEffect` on mount (lines 135–149), but there is no listener for `visibilitychange` or `focus` to revalidate session expiration when a background tab is restored.
   - Multiple timers could be spawned if re-render or tab focus repeatedly calls `setTimeout` without clearing previous timer references.

---

## 2. Logic Chain

### 2.1 R7: Automatic Customer Geolocation

```
[Observation 1.1.1 & 1.1.2]
Geolocation state is fragmented; CustomerHome only reads cached localStorage coordinates; CustomerMarketplace has local manual-only prompt.
       │
       ▼
[Step 1: Centralized Location Architecture]
Create a centralized `LocationContext` and `useGeolocation` hook at the application root:
- Single source of truth for `coordinates` ({ lat, lng }), `permissionStatus`, `cityName`, `isLoading`, and `error`.
- Exports `requestLocation()` and `setManualLocation()`.
       │
       ▼
[Step 2: Startup Geolocation Trigger with Anti-Duplication Guard]
When application mounts or user visits the customer app:
- Check `navigator.permissions?.query({ name: 'geolocation' })`.
- If status is 'prompt' or 'granted', call `navigator.geolocation.getCurrentPosition()`.
- Use a module-level or singleton ref flag (`hasPromptedStartupRef`) to ensure `getCurrentPosition()` is called exactly once on startup, preventing repeated prompts on component re-renders.
       │
       ▼
[Step 3: State Storage & Automatic Product Refresh]
When live coordinates are granted:
- Store coordinates in `LocationContext` state and persist to `localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords))`.
- Update `CustomerHome.tsx` to subscribe to `useGeolocation()`: re-fetch `getPublicProducts({ latitude: coords.lat, longitude: coords.lng })` and update "Mystery Box di Sekitar" with distance-sorted items.
- Update `CustomerMarketplace.tsx` to subscribe to `useGeolocation()`: re-fetch `fetchMarketplaceProducts(coords)` and keep default sort `sortField = 'lokasi'`, `sortOrder = 'asc'`.
       │
       ▼
[Step 4: Graceful Error Handling & Fallback Button]
If permission is denied, times out (e.g. 5000ms), or geolocation is unavailable:
- Silently fall back to default coordinates (Malang: -7.9526, 112.6146).
- Set `permissionStatus = 'denied'`.
- Suppress repetitive error toasts (respecting R1 & R3).
- Provide a clear manual fallback button:
  - In CustomerMarketplace: existing city selector + "Gunakan Lokasi Saat Ini" button with `LocateFixed` icon.
  - In CustomerHome: location badge in section header indicating "📍 Malang (Default)" with button/pill to retry location access or choose manually.
```

### 2.2 R8: Automatic Session Logout

```
[Observation 1.2.1, 1.2.2, 1.2.3]
No 24-hour cap; no JWT exp tracking; 401 interceptor fails to logout when refreshToken is absent or on auth endpoints; sensitive data left behind.
       │
       ▼
[Step 1: Session Expiration Rules Engine]
Define two bounding constraints for session lifetime:
1. Bearer Token Expiry (`tokenExpMs`):
   Parse the `access_token` JWT payload (standard base64url header.payload.signature) to extract the `exp` claim (`tokenExpMs = payload.exp * 1000`). If unparseable or not JWT, fallback to session cap.
2. 24-Hour Session Cap (`maxSessionExpMs`):
   When login occurs (`saveAuthSession` / `saveAuth`), record `rescuebyte_login_at = Date.now()`.
   `maxSessionExpMs = loginAt + (24 * 60 * 60 * 1000)`.
3. Effective Expiration:
   `effectiveExpiresAt = Math.min(tokenExpMs || maxSessionExpMs, maxSessionExpMs)`.
       │
       ▼
[Step 2: Single Timer Management & Tab Restoration]
To prevent multiple or conflicting timers on re-render / tab restoration:
- Store a single timer handle: `let sessionTimerId: NodeJS.Timeout | null = null`.
- Provide `clearSessionTimer()` to cancel any active timer before scheduling a new one.
- On mount and after login:
  `remainingMs = effectiveExpiresAt - Date.now()`.
  If `remainingMs <= 0`, execute `logout()` immediately.
  Else, schedule `sessionTimerId = setTimeout(logout, remainingMs)`.
- Listen to `document.addEventListener('visibilitychange', ...)` and `window.addEventListener('focus', ...)`:
  When tab is restored/focused, immediately recalculate `effectiveExpiresAt - Date.now()`. If expired while backgrounded, trigger immediate logout.
- Cross-tab synchronization: Listen to `window.addEventListener('storage', ...)` so logout in one tab instantly logs out all other tabs.
       │
       ▼
[Step 3: Centralized HTTP 401 Handling in apiClient]
In `src/api/client.ts`:
- Intercept 401 responses for all non-login endpoints.
- If refresh token is missing, or token refresh fails (401/403), or Bearer token is expired:
  1. Wipe all authentication tokens and sensitive storage data.
  2. Dispatch `window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'))`.
  3. Ensure all pending queued requests reject.
       │
       ▼
[Step 4: Complete Session Wipe & Route Guarding]
During logout:
- Wipe: `access_token`, `refresh_token`, `rescuebyte_auth`, `rescuebyte_user_role`, `rescuebyte_store_*`, `rescuebyte_selected_store`, `rescuebyte_login_at`, and `rescuebyte_customer_cart`.
- Route protection:
  - Guard all customer protected routes (`#marketplace`, `#detail-produk`, `#keranjang`, `#checkout`, `#pesanan-saya`, `#detail-pesanan`, `#akun`).
  - Guard all seller protected routes (`#beranda-seller`, `#profil-seller`, `#riwayat-seller`, `#buat-dagangan-seller`, `#daganganku-seller`, `#ulasan-seller`).
  - Upon logout or unauthorized access, redirect immediately to `#auth` (`view-auth-role-selection` / login page), satisfying requirement R8.
```

---

## 3. Caveats

1. **Browser Permissions API Support**:
   - `navigator.permissions?.query({ name: 'geolocation' })` is supported in Chromium and Firefox, but historically restricted or unsupported in some WebKit / Safari environments.
   - *Mitigation*: The implementation must wrap the permissions query in a `try...catch` and fall back directly to checking whether `navigator.geolocation` exists and calling `getCurrentPosition()` with an execution flag if `query` throws or is undefined.

2. **Secure Context Requirement (HTTPS / Localhost)**:
   - The browser Geolocation API is strictly restricted to secure contexts (`window.isSecureContext === true` or `localhost`). On unencrypted HTTP IP addresses, `navigator.geolocation` will be `undefined` or fail with `PERMISSION_DENIED`.
   - *Mitigation*: Check `window.isSecureContext`. If false and not localhost, immediately fall back to default coordinates without throwing an unhandled exception or blocking startup.

3. **Silent Token Refresh vs. 24-Hour Absolute Session Cap**:
   - If the backend successfully executes `POST /api/v1/auth/refresh`, the new `access_token` may have a renewed expiry. However, requirement R8 explicitly mandates:
     *"when the frontend session reaches a maximum duration of 24 hours from login (whichever occurs first)."*
   - *Constraint*: The initial login timestamp (`rescuebyte_login_at`) must **not** be reset on token refresh; it must remain anchored to the user's explicit login event. When 24 hours elapsed from `rescuebyte_login_at`, the session must terminate even if the Bearer token has remaining validity.

4. **Background Tab Timer Throttling**:
   - Modern browsers throttle background tab timers to 1 execution per minute or freeze `setTimeout` entirely when tabs are put to sleep.
   - *Mitigation*: Relying exclusively on `setTimeout` is insufficient. The `visibilitychange` listener and `focus` listener ensure that the moment a user switches back to an inactive tab, expiration is checked synchronously.

---

## 4. Conclusion

### 4.1 Concrete Architecture for R7 (Automatic Customer Geolocation)

1. **New File**: `src/context/LocationContext.tsx`
   - Defines `LocationContext` and `LocationProvider`.
   - State variables:
     - `coordinates`: `{ lat: number; lng: number }` (initialized from `localStorage.getItem('rescuebyte_user_coords')` or fallback `{ lat: -7.9526, lng: 112.6146 }`).
     - `permissionStatus`: `'unknown' | 'prompt' | 'granted' | 'denied' | 'unavailable'`.
     - `isLoading`: `boolean`.
     - `selectedCity`: `string` ('Lokasi Saat Ini' or city name).
     - `error`: `string | null`.
   - Startup Effect:
     - Guarded by a module-level singleton ref `hasInitializedStartupGeoRef`.
     - On mount, if `typeof window !== 'undefined'` and `navigator.geolocation`:
       - If `navigator.permissions?.query`:
         - If state is `'granted'` or `'prompt'`, invoke `getCurrentPosition()`.
         - If state is `'denied'`, set `permissionStatus = 'denied'` without calling `getCurrentPosition()`.
       - If permissions API is unavailable, call `getCurrentPosition()` with 5000ms timeout.
     - On success:
       - Update state `coordinates`.
       - Persist to `localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords))`.
       - Set `permissionStatus = 'granted'`.
       - Dispatch `window.dispatchEvent(new CustomEvent('rescuebyte_location_updated', { detail: coords }))`.
     - On error (timeout, position unavailable, or denied):
       - Fallback to `{ lat: -7.9526, lng: 112.6146 }` (Malang default).
       - Set `permissionStatus = 'denied'`.
       - No intrusive floating toasts or infinite loops.
   - Provides methods:
     - `requestLocation(force?: boolean)`: callable manually by UI buttons.
     - `setManualLocation(coords: Coordinates, cityName?: string)`.

2. **New Hook**: `src/hooks/useGeolocation.ts`
   - Re-exports `useLocationContext()` with convenience getters: `coordinates`, `isLoading`, `permissionStatus`, `requestLocation`, `setManualLocation`.
   - Re-exported from `src/hooks/index.ts`.

3. **Modifications to `src/main.tsx`**:
   - Wrap the application with `<LocationProvider>` alongside `<AuthProvider>` and `<CartProvider>`.

4. **Modifications to `src/pages/customer/CustomerHome.tsx`**:
   - Consume `useGeolocation()`.
   - When `coordinates` change, re-fetch `getPublicProducts({ latitude: coordinates.lat, longitude: coordinates.lng })`.
   - "Mystery Box di Sekitar": slice 6 items sorted by `distance_km` ascending.
   - Display a clean fallback button / pill if `permissionStatus === 'denied'` to allow manual retry or city selection.

5. **Modifications to `src/pages/customer/CustomerMarketplace.tsx`**:
   - Replace local `userCoords` state and manual `handleRequestLiveLocation` with `useGeolocation()`.
   - Keep default sorting: `sortField = 'lokasi'`, `sortOrder = 'asc'`.
   - Ensure "Gunakan Lokasi Saat Ini" button triggers `requestLocation(true)` to retry if previously blocked.

---

### 4.2 Concrete Architecture for R8 (Automatic Session Logout)

1. **Modifications to `src/context/AuthContext.tsx`**:
   - Add JWT parsing helper:
     ```typescript
     function parseJwtExp(token?: string | null): number | null {
       if (!token) return null;
       try {
         const parts = token.split('.');
         if (parts.length !== 3) return null;
         const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
         return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
       } catch {
         return null;
       }
     }
     ```
   - Store login timestamp on login / session creation:
     `const LOGIN_AT_KEY = 'rescuebyte_login_at';`
     `localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));`
   - Maximum session duration constant:
     `const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;` (24 hours).
   - Expiration calculation:
     ```typescript
     function calculateSessionExpiresAt(): number | null {
       const loginAtStr = localStorage.getItem(LOGIN_AT_KEY);
       const loginAt = loginAtStr ? parseInt(loginAtStr, 10) : null;
       const maxExp = loginAt ? loginAt + MAX_SESSION_DURATION_MS : null;
       const token = localStorage.getItem(ACCESS_TOKEN_KEY);
       const tokenExp = parseJwtExp(token);

       if (tokenExp && maxExp) return Math.min(tokenExp, maxExp);
       return tokenExp || maxExp;
     }
     ```
   - Timer management with tab restoration:
     ```typescript
     let sessionTimerId: ReturnType<typeof setTimeout> | null = null;

     function clearSessionTimer() {
       if (sessionTimerId) {
         clearTimeout(sessionTimerId);
         sessionTimerId = null;
       }
     }

     function scheduleSessionCheck(onExpire: () => void) {
       clearSessionTimer();
       const expiresAt = calculateSessionExpiresAt();
       if (!expiresAt) return;

       const remaining = expiresAt - Date.now();
       if (remaining <= 0) {
         onExpire();
         return;
       }
       sessionTimerId = setTimeout(onExpire, remaining);
     }
     ```
   - Add `visibilitychange`, `focus`, and `storage` event listeners:
     - When `document.visibilityState === 'visible'` or window receives `focus`, re-run `scheduleSessionCheck`.
     - When `storage` event detects `rescuebyte_auth` removed, call `clearAuthSession()`.
   - Comprehensive sensitive session data wipe in `clearAuthSession()`:
     Remove `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `AUTH_STORAGE_KEY`, `LOGIN_AT_KEY`, `rescuebyte_user_role`, `rescuebyte_customer_cart`, `rescuebyte_store_*`, `rescuebyte_selected_store`.

2. **Modifications to `src/api/client.ts`**:
   - Centralize 401 handling:
     ```typescript
     if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
       const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
       if (!refreshToken) {
         // Immediate centralized logout
         if (typeof window !== 'undefined') {
           clearAllSensitiveSessionData();
           window.dispatchEvent(new CustomEvent('rescuebyte_auth_expired'));
         }
         return Promise.reject(error);
       }
       // ... attempt token refresh ...
     ```
   - In `refreshErr` catch block:
     Call `clearAllSensitiveSessionData()` and dispatch `rescuebyte_auth_expired`.

3. **Modifications to `src/App.tsx` and `src/app/useHashNavigation.ts`**:
   - In `App.tsx`:
     - Update auth subscription redirect: when `!authLatest`, redirect to `'view-auth-role-selection'` (`#auth` / login page), instead of `'view-customer-home'`.
     - Add route guards to `activeView` initial calculation (lines 31–85) for seller views: if `#beranda-seller`, `#profil-seller`, etc. are accessed without a valid authenticated seller session, return `'view-auth-role-selection'`.
   - In `src/app/useHashNavigation.ts`:
     - Add auth checks to seller hash change handlers (lines 33–55): if `!getCurrentUser() && !isAuthenticated`, redirect to `#auth` with warning toast.

---

## 5. Verification Method

To verify these changes independently:

### 5.1 Static Verification Commands
```bash
# 1. Type check
npm run typecheck

# 2. Lint check
npm run lint

# 3. Production build
npm run build
```
*Expected Result*: All commands exit with code 0 and 0 errors.

### 5.2 Geolocation Verification Scenarios (R7)
1. **Startup Prompt**:
   - Clear `rescuebyte_user_coords` in `localStorage`.
   - Open `#beranda-customer`.
   - Verify browser triggers geolocation prompt automatically without clicking any button.
   - When granted, verify `rescuebyte_user_coords` is updated in `localStorage` and `getPublicProducts` is called with live coordinates.
2. **Re-render / Navigation Idempotency**:
   - Navigate between `#beranda-customer` and `#marketplace`.
   - Verify `getCurrentPosition()` is not repeatedly called on each tab switch or re-render.
3. **Nearest-Location Sorting**:
   - Verify products in "Mystery Box di Sekitar" on Homepage and products in Marketplace are sorted by distance ascending.
4. **Permission Denied / Timeout Fallback**:
   - Block location in browser settings.
   - Reload application.
   - Verify application loads smoothly with default Malang coordinates (-7.9526, 112.6146), without spamming error toasts.
   - Verify manual fallback button in Marketplace city dropdown remains clickable to retry or select a city manually.

### 5.3 Session Management Verification Scenarios (R8)
1. **24-Hour Expiration Cap**:
   - In DevTools console: `localStorage.setItem('rescuebyte_login_at', String(Date.now() - 25 * 60 * 60 * 1000));`
   - Refresh or focus tab.
   - Verify user is immediately logged out, sensitive storage keys are cleared, and view redirects to `#auth` (login page).
2. **Bearer Token Expiry**:
   - Set an expired JWT in `access_token` and trigger an API call.
   - If refresh token is absent or invalid, verify user is immediately logged out and redirected to `#auth`.
3. **Centralized HTTP 401 Interceptor**:
   - Clear `refresh_token` while keeping `access_token`.
   - Make an authenticated request that returns 401.
   - Verify interceptor wipes session, dispatches expiration event, and redirects to `#auth`.
4. **Sensitive Data Wipe**:
   - Add items to cart (`rescuebyte_customer_cart`), log in as seller with store data.
   - Trigger logout.
   - Verify `rescuebyte_customer_cart`, `access_token`, `refresh_token`, `rescuebyte_auth`, and `rescuebyte_store_*` are completely removed from `localStorage`.
5. **Direct URL Guarding on Reload**:
   - While logged out, enter `#beranda-seller` in browser address bar and reload.
   - Verify user is not shown the seller portal and is redirected to `#auth`.

### 5.4 Invalidation Conditions
- Any changes that cause `npm run typecheck` or `npm run build` to fail.
- Reverting to manual-only location requests or spamming repeated permission prompts on re-render.
- Redirecting to `#beranda-customer` on logout instead of `#auth` (login page).
- Bypassing route guards on browser reload for seller routes.
