# Task Assignment: Forensic Auditor (Integrity Forensics & Anti-Cheating)

## Target Focus
Conduct independent forensic integrity checks across all code modifications made for Milestone 1 (R1 - R8):
1. **Static & Source Code Analysis**:
   - Verify all implementations are authentic and genuine.
   - Verify NO hardcoded test results, mock facades, dummy bypasses, or synthetic fixtures exist.
   - Verify `batchFetchProductRatings` actually calls `reviewApi.getProductReviews` and computes mathematical averages.
   - Verify `LocationContext` actually interfaces with `navigator.geolocation` and `localStorage`.
   - Verify `AuthContext` actually parses JWT exp and enforces 24h cap with real timers and storage wipes.
   - Verify no cheats, backdoor passes, or test suppression.
2. **Build & Typecheck Validation**:
   - Independently run `npm run typecheck` and `npm run build`.
3. **Verdict**:
   - CLEAN (all checks pass, authentic code) or INTEGRITY VIOLATION (cheating detected).

## Input Documents
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_r1_1\handoff.md`

## Output Requirements
- Write your comprehensive audit report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\auditor_r1_1\handoff.md`.
- Explicitly state verdict (`CLEAN` or `INTEGRITY VIOLATION`).
- Message parent using `send_message`.


## 2026-11-09T12:19:43Z
You are the Forensic Integrity Auditor (teamwork_auditor).

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\auditor_r1_1\
Parent conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd

MANDATORY INPUTS:
- Read ORIGINAL_REQUEST.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Read SCOPE.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md
- Read your task assignment: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\auditor_r1_1\DISPATCH.md
- Read Worker 1 handoff: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_r1_1\handoff.md

TASK:
Perform rigorous forensic integrity verification:
1. Static analysis of all modified/new files (`src/services/productRatingService.ts`, `src/context/LocationContext.tsx`, `src/hooks/useGeolocation.ts`, `src/context/ToastContext.tsx`, `src/components/customer/MysteryBoxCard.tsx`, `src/pages/customer/CustomerHome.tsx`, `src/pages/customer/CustomerMarketplace.tsx`, `src/context/AuthContext.tsx`, `src/api/client.ts`, etc.).
2. Confirm there are NO hardcoded test results, NO dummy/facade implementations, NO test bypassing or evasion.
3. Confirm genuine calculations and API integration.
4. Run build and typecheck checks (`npm run typecheck`, `npm run build`).
5. Deliver verdict: CLEAN or INTEGRITY VIOLATION.

OUTPUT:
- Write your comprehensive audit report to c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\auditor_r1_1\handoff.md
- Maintain liveness in c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\auditor_r1_1\progress.md
- Use send_message to report back to parent (Recipient: 38968871-17e4-4323-bc74-f1f1c77fe5bd).
