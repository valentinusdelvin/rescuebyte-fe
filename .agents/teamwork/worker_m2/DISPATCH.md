## 2026-11-03T17:57:03Z
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are Agent 4 — API Integration Specialist (Worker M2).
Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m2
Original Request: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
Master Blueprint: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
Parent: da2dba90-b6bf-4c5e-813a-a8fef275193d / Project Orchestrator: 59a4cfaf-061f-42fa-9551-4492d1892343

Read the following reference reports before starting:
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator\PROJECT.md
- c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\handoff.md
- Reference Types: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\swagger_types.ts
- Endpoints Table: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\teamwork_explorer_survey_3\endpoint_catalog_table.md

Scope & File Ownership (Exclusive write ownership for Milestone M2):
- `src/api/` (`client.ts`, `types.ts`, `services/*`, `index.ts`)
- `src/context/` (`AuthContext.tsx`, `CartContext.tsx`, `ToastContext.tsx`, `index.ts`)
- `src/hooks/` (`useAuth.ts`, `useCart.ts`, `useProducts.ts`, `useProductDetail.ts`, `useOrders.ts`, `useMerchantOrders.ts`, `useStoreProfile.ts`, `useCheckout.ts`, `index.ts`)
- `src/main.tsx` (wrap `<App />` with Context Providers)
- `src/services/` (update existing services to route through `src/api/client.ts` with backward-compatible signatures so existing pages compile and function seamlessly)

Tasks:
1. Create `src/api/types.ts` incorporating all 49 backend DTO schemas and system enums matching Swagger 2.0 (use `swagger_types.ts` as the authoritative basis).
2. Implement `src/api/client.ts`:
   - Base URL: `import.meta.env.VITE_API_BASE_URL || 'https://dolpin-fourthree.bccdev.id/'`
   - Request interceptor: injects `Authorization: Bearer <token>` from localStorage.
   - Response interceptor: unwraps `{ request_id, payload }`, normalizes error responses.
   - Transparent 401 token refresh queue: on 401 error, queues request, invokes `POST /api/v1/auth/refresh` with refresh token, updates storage, and replays queued requests.
3. Implement pure typed API services in `src/api/services/` mapped to Swagger tags:
   - `authApi.ts`, `cartApi.ts`, `orderApi.ts`, `productApi.ts`, `storeApi.ts`, `userApi.ts`, `storageApi.ts`, `enumApi.ts`.
   - In `orderApi.ts`, include customer cancellation `POST /api/v1/orders/{id}/cancel` and checkout `POST /api/v1/orders/checkout`.
   - In `userApi.ts`, eliminate the non-existent `GET /api/v1/users/{id}` (customer info is already in `OrderDetailResponse`).
4. Implement React Context Providers in `src/context/`:
   - `AuthContext.tsx`: provides `{ user, isAuthenticated, isLoading, login, register, logout, switchRole, error }`.
   - `CartContext.tsx`: provides `{ cart, count, subtotal, isLoading, addItem, removeItem, updateQty, clearStore, clearCart, error }`, synchronizing with backend `/api/v1/cart`.
5. Implement reusable custom hooks in `src/hooks/`:
   - `useAuth.ts`, `useCart.ts`, `useProducts.ts`, `useProductDetail.ts`, `useOrders.ts`, `useMerchantOrders.ts`, `useStoreProfile.ts`, `useCheckout.ts`.
   - Ensure hooks provide explicit `isLoading`, `isError`, `error`, `data`, and execution callbacks.
6. Connect `main.tsx` with providers.
7. Update `src/services/` (e.g. `api.ts`, `authService.ts`, etc.) to delegate to the new centralized client to preserve backward compatibility for unrefactored pages.
8. Run verification commands: `npm run typecheck` (`tsc -b`), `npm run build`, and `npm run lint`. Ensure 0 errors!
9. Output your detailed handoff report to:
   `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m2\handoff.md`
10. Send a completion message to the orchestrator.

## 2026-11-03T19:23:47Z
**Context**: Resuming Milestone M2 execution (API Integration Specialist)
**Content**: Please continue your task from where you left off. `src/api/types.ts` is already created with Swagger schemas. Proceed with the remaining tasks:
- Task 2: Implement `src/api/client.ts` with Axios, `VITE_API_BASE_URL` (https://dolpin-fourthree.bccdev.id/), auth token injection, standard response unwrapping, and 401 refresh queue.
- Task 3: Implement pure typed API services in `src/api/services/` (auth, cart, order, product, store, user, storage, enum).
- Task 4: Implement React Context Providers in `src/context/` (`AuthContext`, `CartContext`, `ToastContext`).
- Task 5: Implement reusable custom hooks in `src/hooks/` (`useAuth`, `useCart`, `useProducts`, `useOrders`, `useStoreProfile`, `useCheckout`).
- Task 6: Wire Context Providers in `src/main.tsx`.
- Task 7: Update `src/services/` to route through new client with backward compatibility for existing pages.
- Task 8: Verification (`npm run typecheck`, `npm run build`, `npm run lint` — verify 0 errors).
- Task 9: Output handoff report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m2\handoff.md` and send completion message.
**Action**: Resume implementation and report when complete.
