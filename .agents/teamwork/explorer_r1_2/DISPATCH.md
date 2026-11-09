# Task Assignment: Explorer 2 (API Integration & Rating Consistency)

## Target Focus
- **R3. Fix Product Rating Data Consistency**
  - Investigate rating displays across Homepage cards ("Mystery Box di Sekitar", "Mystery Box Terlaris"), Marketplace product listings, and reusable product cards (`MysteryBoxCard.tsx`, etc.).
  - Check how ratings are currently passed, calculated, or fetched. Check existing Product Reviews endpoints (`GET /api/v1/products/{product_id}/reviews`) and listing responses.
  - Distinguish product reviews from store reviews. Ensure products with reviews display average rating and review count, and never incorrectly show "Belum ada ulasan" when reviews exist.
  - Formulate an efficient strategy avoiding N+1 API calls per card (e.g. batch fetching, caching, or checking if backend list endpoint returns rating fields).
- **R5 (Data & Query aspect). Homepage Product Display Queries**
  - In `CustomerHome.tsx`, investigate queries for "Mystery Box di Sekitar" and "Mystery Box Terlaris".
  - Identify supported Swagger query parameters for nearby products (with customer coordinates, sorted by nearest distance) and best-selling / popularity products (with backend sorting).
  - Ensure exactly 6 product cards are retrieved/displayed without hardcoding, manual duplication, or inventing unsupported parameters.
- **R6. Marketplace Default Sorting by Nearest Location**
  - In `CustomerMarketplace.tsx` and `src/features/customer/marketplace/`, check default sorting and query parameters.
  - Ensure default is "Lokasi Terdekat" (nearest location ascending) when customer coordinates are available. Nearest product must appear first.
  - Verify interaction with pagination, actual coordinates, and filtering options.

## Input Documents
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md`

## Output Requirements
- Write your comprehensive investigation report to `.agents/teamwork/explorer_r1_2/handoff.md`.
- Include exact file paths, line numbers, API schema details, and concrete fix recommendations.


## 2026-11-09T11:37:58Z
You are Explorer 2 (API Integration & Rating Consistency Specialist).

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_2\
Parent conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd

MANDATORY INPUTS:
- Read ORIGINAL_REQUEST.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Read SCOPE.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md
- Read your task instructions: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_2\DISPATCH.md

FOCUS ON:
1. R3: Product rating data consistency across Homepage cards ("Mystery Box di Sekitar", "Mystery Box Terlaris"), Marketplace product listings, and reusable product cards.
   - Inspect existing Product Reviews endpoints (GET /api/v1/products/{product_id}/reviews) and listing responses.
   - Distinguish product reviews from store reviews.
   - Display average product rating, star indicator, total review count when available.
   - Do NOT show "Belum ada ulasan" when reviews exist.
   - Efficient strategy avoiding N+1 API calls per card.
2. R5 (API & Query): Homepage product display queries for "Mystery Box di Sekitar" and "Mystery Box Terlaris".
   - Identify supported Swagger parameters for nearby products (coordinates, sort by nearest distance) and best-selling products.
   - Exactly 6 product cards without hardcoding, manual duplication, or inventing parameters.
3. R6: Marketplace default sorting by nearest location ("Lokasi Terdekat", nearest location ascending) when customer coordinates are available.
   - Ensure nearest product appears first; verify pagination and coordinate sorting.

OUTPUT:
- Write your comprehensive investigation report to c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_2\handoff.md
- Maintain your liveness in c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_2\progress.md
- When complete, use send_message to report back to parent (Recipient: 38968871-17e4-4323-bc74-f1f1c77fe5bd).
