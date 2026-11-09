# Task Assignment: Challenger 2 (Empirical Stress & Edge-Case Suite: R7 - R8)

## Target Focus
Write and execute an automated empirical verification test script (e.g. `scripts/verify_r7_r8.mjs` or similar) to stress-test:
- R7: `LocationContext.tsx` and `useGeolocation.ts`:
  - Startup geolocation execution guard (prompted exactly once).
  - Graceful fallback when permission is denied or geolocation times out.
  - Absence of spammed error toasts.
  - Manual retry / city selection behavior.
- R8: Session Expiration & Auth Interceptor:
  - 24-hour session limit calculation (`Math.min(tokenExp, loginAt + 24h)`).
  - JWT exp claim parsing with invalid/valid token structures.
  - Tab restoration / visibilitychange / focus expiration evaluation.
  - Complete sensitive storage wipe (`rescuebyte_auth`, `access_token`, `refresh_token`, `rescuebyte_customer_cart`, `rescuebyte_store_*`, `rescuebyte_login_at`).
  - Redirection to `#auth` on logout and protected seller route guarding.
- Deliver verdict: APPROVE or REJECT.

## Input Documents
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_r1_1\handoff.md`

## Output Requirements
- Write your empirical verification report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\challenger_r1_2\handoff.md`.
- Explicitly state verdict (`APPROVE` or `REJECT`).
- Message parent using `send_message`.


## 2026-11-09T12:19:30Z
[Message] timestamp=2026-11-09T12:19:30Z sender=38968871-17e4-4323-bc74-f1f1c77fe5bd priority=MESSAGE_PRIORITY_HIGH content=You are Challenger 2 (Empirical Stress & Edge-Case Specialist: R7 - R8).

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\challenger_r1_2\
Parent conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd

MANDATORY INPUTS:
- Read ORIGINAL_REQUEST.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Read SCOPE.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md
- Read your task assignment: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\challenger_r1_2\DISPATCH.md
- Read Worker 1 handoff: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_r1_1\handoff.md

TASK:
Write and execute an automated empirical verification test script (e.g., in scripts/) to stress-test R7 & R8:
- R7: LocationContext startup execution guard, graceful fallback on denied/timeout, manual retry, state persistence.
- R8: Session expiration calculation (24h cap vs token exp), JWT exp parsing, tab restoration / visibility listeners, complete sensitive storage wipe, redirection to #auth on logout and route guarding on protected routes.
Deliver verdict: APPROVE or REJECT.

OUTPUT:
- Write your empirical verification report to c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\challenger_r1_2\handoff.md
- Maintain liveness in c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\challenger_r1_2\progress.md
- Use send_message to report back to parent (Recipient: 38968871-17e4-4323-bc74-f1f1c77fe5bd).
