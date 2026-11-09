# BRIEFING — 2026-11-09T11:47:00Z

## Mission
Investigate and synthesize technical findings for R7 (Automatic Customer Geolocation) and R8 (Automatic Session Logout) in rescuebyte-fe.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Systems, Geolocation & Auth Specialist
- Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
- State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_3\
- Original parent: 38968871-17e4-4323-bc74-f1f1c77fe5bd
- Milestone: Exploration & Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Produce comprehensive handoff report with exact file paths, line numbers, architectural details, and concrete fix recommendations
- Maintain liveness heartbeat in progress.md

## Current Parent
- Conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/services/locationService.ts`, `src/services/locationData.ts`
  - `src/features/customer/marketplace/model.ts`
  - `src/pages/customer/CustomerHome.tsx`, `src/pages/customer/CustomerMarketplace.tsx`
  - `src/api/client.ts`, `src/api/types.ts`, `src/api/services/authApi.ts`, `src/api/services/productApi.ts`
  - `src/context/AuthContext.tsx`, `src/context/CartContext.tsx`, `src/context/index.ts`
  - `src/services/authService.ts`, `src/services/productService.ts`
  - `src/App.tsx`, `src/app/AppRoutes.tsx`, `src/app/useHashNavigation.ts`, `src/app/hashRouting.ts`
  - Verification scripts: `npm run typecheck`, `npm run lint`, `npm run build`
- **Key findings**:
  - **R7 Geolocation**: No centralized geolocation hook/context exists; startup auto-request is completely absent; `CustomerMarketplace.tsx` only triggers `handleRequestLiveLocation` on manual dropdown click; `CustomerHome.tsx` loads boxes once with static fallback without requesting coordinates; no single-flight prompt guard against re-renders; fallback button is isolated in marketplace dropdown.
  - **R8 Session Expiry & Auth**: No 24-hour session duration tracker exists; no JWT `exp` parsing or expiration timer exists; `apiClient` 401 interceptor only handles refresh when refresh token exists, but silently rejects if absent or on auth endpoints without clearing auth or redirecting; on logout, redirects go to `#beranda-customer` rather than `#auth` / login page; seller protected routes lack authentication guards on direct URL access or hash navigation; sensitive session data (like `rescuebyte_customer_cart`, `rescuebyte_store_*`, tokens) is only partially cleared.
- **Unexplored areas**: None. Complete investigation conducted across all relevant files, interfaces, hooks, and application layers.

## Key Decisions Made
- Architecture designed for R7: Centralized `LocationContext` & `useGeolocation` hook with `Permissions` API check, singleton startup guard, automatic re-fetch on coordinate change, and graceful non-intrusive fallback with manual override controls.
- Architecture designed for R8: Session timestamping (`rescuebyte_login_at`), JWT payload `exp` extraction, effective expiration calculation `Math.min(jwtExp, loginTime + 24h)`, tab-restoration/visibilitychange lifecycle listeners, centralized 401 handler in `apiClient`, complete sensitive session data wipe, route guards on all protected routes, and redirection to login page (`#auth`).

## Artifact Index
- `.agents/teamwork/explorer_r1_3/DISPATCH.md` — Task assignment & instructions
- `.agents/teamwork/explorer_r1_3/BRIEFING.md` — Situational awareness & investigation state
- `.agents/teamwork/explorer_r1_3/progress.md` — Liveness heartbeat & checklist
- `.agents/teamwork/explorer_r1_3/handoff.md` — Comprehensive final investigation report
