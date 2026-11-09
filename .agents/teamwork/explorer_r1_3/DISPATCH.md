# Task Assignment: Explorer 3 (Geolocation & Session Management)

## Target Focus
- **R7. Automatic Customer Geolocation**
  - Investigate existing geolocation handling across `CustomerHome.tsx`, `CustomerMarketplace.tsx`, `useGeolocation`, and any location context/service.
  - Plan how to automatically request customer geolocation via browser Geolocation API upon application startup when permission has not been granted.
  - Centralize geolocation logic in a reusable hook or service, avoiding duplicate or repeated permission prompts on re-render.
  - When coordinates are granted, store them in application state, automatically load nearby products, and apply nearest-location sorting to Marketplace and Homepage.
  - Handle permission denied, unavailable position, and timeout gracefully; provide a clear fallback button to request or update location manually if automatic prompting is blocked.
- **R8. Automatic Session Logout**
  - Investigate `src/context/AuthContext.tsx`, `src/services/api.ts` (or axios/fetch client), and route protection.
  - Plan automatic logout when Bearer Token expires or when frontend session reaches a maximum duration of 24 hours from login (whichever occurs first).
  - Centralize HTTP 401 response handling in the API client or interceptor.
  - Clear authentication state and sensitive session data during logout, preventing access to protected routes and redirecting to the login page.
  - Handle browser refresh and tab restoration correctly without creating multiple expiration timers.

## Input Documents
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md`

## Output Requirements
- Write your comprehensive investigation report to `.agents/teamwork/explorer_r1_3/handoff.md`.
- Include exact file paths, line numbers, architectural details, and concrete fix recommendations.


## 2026-11-09T11:38:08Z
You are Explorer 3 (Systems, Geolocation & Auth Specialist).

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_3\
Parent conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd

MANDATORY INPUTS:
- Read ORIGINAL_REQUEST.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Read SCOPE.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md
- Read your task instructions: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_3\DISPATCH.md

FOCUS ON:
1. R7: Automatic Customer Geolocation
   - Automatically request customer geolocation via browser Geolocation API upon application startup when permission has not been granted.
   - Centralize geolocation logic in a reusable hook or service, avoiding duplicate or repeated permission prompts on re-render.
   - When coordinates are granted, store them in application state, automatically load nearby products, and apply nearest-location sorting to Marketplace and Homepage.
   - Handle permission denied, unavailable position, and timeout gracefully; provide a clear fallback button to request or update location manually if automatic prompting is blocked.
2. R8: Automatic Session Logout
   - Automatically log the user out when the Bearer Token expires or when the frontend session reaches a maximum duration of 24 hours from login (whichever occurs first).
   - Centralize HTTP 401 response handling in the API client or interceptor.
   - Clear authentication state and sensitive session data during logout, preventing access to protected routes and redirecting to the login page.
   - Handle browser refresh and tab restoration correctly without creating multiple expiration timers.

OUTPUT:
- Write your comprehensive investigation report to c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_3\handoff.md
- Maintain your liveness in c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_3\progress.md
- When complete, use send_message to report back to parent (Recipient: 38968871-17e4-4323-bc74-f1f1c77fe5bd).
