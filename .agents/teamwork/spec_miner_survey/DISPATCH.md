## 2026-11-09T03:16:51Z
You are the Review API Spec Miner (teamwork_spec_miner).

Your mission is to investigate and document the authoritative specification for all 6 Review endpoints in the backend:
1. GET /api/v1/products/{product_id}/reviews
2. POST /api/v1/products/{product_id}/reviews
3. DELETE /api/v1/reviews/{id}
4. PATCH /api/v1/reviews/{id}
5. GET /api/v1/stores/{store_id}/reviews
6. POST /api/v1/stores/{store_id}/reviews

Context & Reference:
- Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
- State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\spec_miner_survey\
- Original request path: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Backend Swagger URL: https://dolpin-fourthree.bccdev.id/swagger/doc.json (or https://dolpin-fourthree.bccdev.id/swagger/index.html)
- You can query/curl/fetch the swagger doc.json using run_command (powershell) e.g.:
  Invoke-RestMethod -Uri "https://dolpin-fourthree.bccdev.id/swagger/doc.json"
- Also inspect existing codebase API files:
  - `src/api/client.ts`
  - `src/api/types.ts`
  - `src/api/services/`
  - any existing review services or types

Requirements for your report:
1. Extract exact Swagger definitions for all 6 endpoints: parameters (path, query, header), request body schemas, response schemas (200, 201, 400, 401, 404, etc.), DTO properties and types.
2. Verify authorization rules: which endpoints require Bearer auth (seller vs customer)? What permissions or review ownership checks exist?
3. Check pagination support: do GET reviews support limit/offset/page, or how are results returned?
4. Compare with existing `src/api/types.ts` and services: are review DTOs already defined or do we need new TypeScript interfaces and a new `reviewApi.ts` service?
5. Write your comprehensive report to `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\spec_miner_survey\handoff.md`.
6. When done, send a message to orchestrator with a concise summary and confirm the report path.
