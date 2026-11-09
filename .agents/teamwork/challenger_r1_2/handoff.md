# Handoff Report — Challenger 2 (Empirical Stress & Edge-Case Specialist: R7 - R8)

**Date**: 2026-11-09T12:31:00Z  
**Author**: Challenger 2 (`challenger_r1_2`)  
**Recipient**: Lead Architect & Orchestrator (`38968871-17e4-4323-bc74-f1f1c77fe5bd`)  
**Milestone**: M1 Verification (R7 - R8)  
**Verdict**: **APPROVE**  

---

## 1. Observation

An adversarial empirical verification suite was authored in `scripts/test_challenger_r7_r8.mjs` containing 42 automated tests organized into 13 test suites. Execution yielded **42 passed, 0 failed (100% pass rate)**.

### R7: Automatic Customer Geolocation & Fallback
1. **Startup Execution Guard**:
   - `LocationContext.tsx` uses a module-level guard `let hasInitializedStartupGeo = false;` (lines 42 & 164-166).
   - In Suite 1.1, triggering the startup effect 100 times sequentially across component re-renders yielded exactly 1 call to `navigator.geolocation.getCurrentPosition()`.
2. **In-Flight Concurrency Control**:
   - `isRequestingRef.current` (lines 81 & 112-114) prevents duplicate browser permission dialogs when concurrent `requestLocation(false)` calls occur.
   - When `force = true` (line 106), deliberate retries (e.g. clicking "Gunakan Live Loc" in `CustomerMarketplace.tsx` or `CustomerHome.tsx`) bypass the in-flight lock and trigger a fresh location probe.
3. **Graceful Fallback & Zero Toast Spam**:
   - Simulated `PERMISSION_DENIED` (code 1), `POSITION_UNAVAILABLE` (code 2), and `TIMEOUT` (code 3) cleanly resolve to Malang center `{ lat: -7.9526, lng: 112.6146 }` without throwing unhandled promise rejections.
   - Verified that `LocationContext.tsx` contains 0 calls to `showToast` or imports of `ToastContext`, eliminating all noisy permission error toast spam.
4. **State Persistence & Corrupted Storage**:
   - Successful location grants persist to `rescuebyte_user_coords` and `rescuebyte_user_city`, dispatching `rescuebyte_location_updated`.
   - On rehydration, corrupted storage inputs (e.g., malformed JSON, `null`, `[]`, `{}`, non-numeric coordinates) safely fall back to Malang coordinates without throwing errors.
5. **Manual Location Override**:
   - `setManualLocation()` cleanly updates coordinates, saves to storage, and notifies downstream consumers (`CustomerMarketplace`, `CustomerHome`).

### R8: Automatic Session Logout & Route Guarding
1. **JWT Expiration Parsing (`parseJwtExp`)**:
   - Correctly parses 3-part base64url JWT tokens and extracts `exp` in milliseconds (`payload.exp * 1000`).
   - Rejects non-3-part strings, invalid base64, missing `exp`, non-numeric `exp`, empty strings, and null tokens safely without exceptions.
2. **24-Hour Session Absolute Cap (`calculateSessionExpiresAt`)**:
   - In Suite 6.1: When token expiration is 2 hours and login was recent, effective expiry is 2 hours.
   - In Suite 6.2: When token expiration is 7 days, effective expiry is strictly capped at `loginAt + 24 hours` (`Math.min(tokenExp, maxExp)`).
   - In Suite 6.6: Expired sessions (`remaining <= 0`) are detected immediately on evaluation.
3. **Tab Visibility & Restoration Listeners**:
   - In Suite 7.1: When a tab is backgrounded and restored after session expiration, `visibilitychange` (`document.visibilityState === 'visible'`) and window `focus` evaluate `calculateSessionExpiresAt() <= Date.now()`, dispatch `rescuebyte_auth_expired`, and execute immediate logout.
   - In Suite 7.2: Active sessions reschedule the check timer cleanly without premature logouts.
   - In Suite 7.3: Cross-tab logout via `storage` event (`key === 'rescuebyte_auth' && !newValue`) immediately triggers session wipe.
4. **Complete Sensitive Storage Wipe (12 Keys)**:
   - Verified that `clearAllSensitiveSessionData()` in `AuthContext.tsx`, `clearAllSensitiveSession()` in `client.ts`, and `clearAuth()` in `authService.ts` wipe all 12 sensitive session items:
     1. `access_token`
     2. `refresh_token`
     3. `rescuebyte_auth`
     4. `rescuebyte_login_at`
     5. `rescuebyte_user_role`
     6. `rescuebyte_customer_cart`
     7. `rescuebyte_selected_store`
     8. `rescuebyte_store_logo`
     9. `rescuebyte_store_name`
     10. `rescuebyte_store_email`
     11. `rescuebyte_store_address`
     12. `rescuebyte_store_coordinates`
   - Verified that non-sensitive preference keys (`rescuebyte_user_coords`, `rescuebyte_user_city`) are retained.
5. **401 Interceptor & Transparent Refresh**:
   - Suite 9.1: 401 on protected route without refresh token immediately wipes session and dispatches `rescuebyte_auth_expired`.
   - Suite 9.2: 401 on protected route with valid refresh token refreshes access token, updates storage, and retries the original request with `Authorization: Bearer <new_token>`.
   - Suite 9.3: Refresh failure (token revoked) wipes all sensitive session storage and dispatches `rescuebyte_auth_expired`.
   - Suite 9.4: Concurrent 401 requests are stalled in `failedQueue` and retried in a single batch with the refreshed token (0 duplicate refresh calls).
   - Suite 11.1 & 11.2: Probing the live backend (`https://dolpin-fourthree.bccdev.id/`) confirmed that invalid refresh tokens return HTTP 401 `invalid_refresh_token` and invalid bearer tokens return HTTP 401 `invalid_bearer_token`, matching client error handling.
   - Suite 12.1: `originalRequest._retry = true` strictly prevents infinite 401 recursion loops.
6. **Route Guarding & Redirection to `#auth`**:
   - Suite 10.1: Initial URL resolution in `App.tsx` redirects unauthenticated users accessing seller routes (`#beranda-seller`, `#profil-seller`, `#riwayat-seller`, `#buat-dagangan-seller`, `#daganganku-seller`, `#ulasan-seller`, `#beranda`, `#profil`, `#riwayat`, `#ulasan`) to `'view-auth-role-selection'` (`#auth`).
   - Suite 10.2: Protected customer routes (`#marketplace`, `#detail-produk`, `#keranjang`, `#checkout`, `#pesanan-saya`, `#akun`, `#detail-pesanan`) require authentication and redirect unauthenticated users to `'view-auth-role-selection'` (`#auth`).
   - Suite 10.3: Public routes (`#beranda-customer`, `#toko`, `#kontak`, `#auth`, `#masuk-customer`, `#masuk-mitra`) remain accessible.
   - Suite 10.4: Dynamic auth revocation via `subscribeToAuth(null)` immediately redirects active view to `'view-auth-role-selection'` and updates hash to `#auth`.

---

## 2. Logic Chain

1. **R7 Geolocation Resilience**:
   - The primary risk with automatic geolocation is browser permission denial throwing errors or causing repeated prompt loops and intrusive toast spam.
   - The implementation isolates startup geolocation using a module-level boolean flag (`hasInitializedStartupGeo`), guaranteeing execution at most once per page lifecycle regardless of React 18 strict mode double-invocations or component remounts.
   - In-flight request locking (`isRequestingRef`) guarantees that concurrent requests return existing coordinates rather than triggering duplicate browser dialogs.
   - If denied or timed out (6000ms), it returns `DEFAULT_COORDINATES` (Malang) and sets status to `'denied'` without calling `showToast()`.
   - The empirical test suite subjected this engine to 100 simulated re-mounts, concurrency races, simulated code 1/2/3 errors, and corrupted storage inputs; all 13 R7 tests passed with zero defects.

2. **R8 Session Expiration & Route Protection**:
   - The primary risk in session management is token lingering past 24 hours, unhandled 401 refresh loops, incomplete storage wiping leaving cart/store state behind, or route guard bypasses via direct URL hash entry.
   - Computing `Math.min(tokenExp, loginAt + 24h)` guarantees that even if a JWT has a 7-day expiration, the frontend session terminates within 24 hours.
   - Tab restoration listeners (`visibilitychange` and `focus`) close the background sleep loophole where setTimeout fails to fire while the laptop/tab is asleep.
   - Storage wiping encompasses 12 dedicated sensitive keys across `AuthContext`, `client.ts`, and `authService`, preventing customer cart leakage or merchant store state collision.
   - The 401 response interceptor queues concurrent requests, uses an isolated axios instance to perform the token exchange, sets `_retry = true` to prevent infinite loops, and purges credentials on hard failure.
   - Unauthenticated direct URL hash access across all 9 seller routes and 7 protected customer routes was proven to redirect to `view-auth-role-selection` (`#auth`).
   - All 29 R8 tests passed with zero defects.

---

## 3. Caveats

1. **Browser Native Permission Dialog**: In actual browsers, if the user explicitly clicked "Block" in browser settings, `navigator.permissions.query({ name: 'geolocation' })` returns `'denied'`. The implementation detects this and avoids calling `getCurrentPosition()`, relying cleanly on default Malang coordinates until the user changes browser permissions.
2. **Clock Manipulation**: If a user manually rewinds their system clock by multiple hours, the 24-hour timeout calculation (`Date.now() - loginAt`) could be temporarily delayed until JWT expiration occurs on the backend, where the live backend will enforce token validity and reject with 401.

---

## 4. Conclusion

**VERDICT: APPROVE**

Requirements R7 and R8 are fully satisfied, empirically robust, and resilient against hostile inputs, concurrency races, expired sessions, and unauthenticated route entry.
- `scripts/test_challenger_r7_r8.mjs`: 42 passed, 0 failed (100% pass rate).
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors.
- `npm run build`: 0 errors in 1.34s.

---

## 5. Verification Method

To independently reproduce and verify this work:

1. **Run the Empirical Test Suite**:
   ```powershell
   node scripts/test_challenger_r7_r8.mjs
   ```
   *Expected Result*: Exits with code 0 (`VERIFICATION COMPLETE: 42 passed, 0 failed out of 42 tests`).

2. **Run TypeScript Typecheck**:
   ```powershell
   npm run typecheck
   ```
   *Expected Result*: Exits with code 0 (`tsc -b` completes with 0 errors).

3. **Run Linter Check**:
   ```powershell
   npm run lint
   ```
   *Expected Result*: Exits with code 0 (0 errors).

4. **Run Production Build**:
   ```powershell
   npm run build
   ```
   *Expected Result*: Exits with code 0 (`tsc -b && vite build` completes in ~1.34s).
