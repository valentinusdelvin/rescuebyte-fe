## 2026-11-09T04:17:50Z
You are the Navigation Bug Fixer (teamwork_worker) for Milestone 2 Remediation.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Instructions:
- Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
- State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-remediation_m2\ (or .agents/teamwork/worker_m2_remediation/)
- Original request path: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope document: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_2\SCOPE.md
- Reviewer 2 report: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\reviewer_m2_2\handoff.md
- Adversarial test script: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\reviewer_m2_2\test_adversarial_m2.mjs

The Bug Identified by Reviewer 2:
In `src/App.tsx`, lines 510–528, `handleNavigateStore` sets `window.location.hash = '#toko?' + query.toString()` (which includes `section=ulasan-pelanggan` and `id`), but then immediately calls `handleNavigate('view-customer-store', 'Detail Toko')`.
Inside `handleNavigate` (lines 410 and 428–430), `window.history.replaceState` runs and replaces the browser URL with `#toko?name=...`, destroying `section=ulasan-pelanggan` and `id`, while `window.scrollTo(0,0)` forces a scroll to the top. As a result, clicking the store rating on `CustomerProductDetail` clobbers the deep link and fails to scroll to the Ulasan Pelanggan section on the store page.

Tasks to Complete:
1. In `src/App.tsx`:
   - In `handleNavigateStore`, do not call `handleNavigate('view-customer-store')`. Instead, set `window.location.hash = '#toko?' + query.toString()`, and directly update `setActiveView('view-customer-store')`, `setActiveLabel('Detail Toko')`, and `setIsMobileOpen(false)`.
   - In `handleNavigate` (lines 428–430), protect `view-customer-store` so that if `window.location.hash` already has `#toko?` or includes `section=`, it does NOT overwrite it with `replaceState`.
2. Run Reviewer 2's test suite:
   `node .agents/teamwork/reviewer_m2_2/test_adversarial_m2.mjs`
   Verify that it passes 100%!
3. Run `npm run build` (`tsc -b && vite build`) to ensure 0 compilation errors.
4. Document the fix and test output in `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\worker_m2_remediation\handoff.md` and message the orchestrator when completed.
