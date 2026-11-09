# Task Assignment: Explorer 1 (UI/UX, Toasts, Badges, Review Identity)

## Target Focus
- **R1. Remove Floating Toast Notifications Globally**
  - Locate all toast containers (e.g. `ToastContext.tsx`, `App.tsx`, `Toast.tsx`, any other notification providers/libraries).
  - Investigate how floating toasts are triggered across the entire app (order confirmation, review submission, cart actions, contact form, etc.).
  - Plan how to remove intrusive bottom-right toasts while preserving inline messages, form-level validation, and button states.
  - Plan cleanup of obsolete toast components, providers, or unused notification imports.
- **R2. Remove Irrelevant Role Labels from Review Identity**
  - Locate all review components displaying reviewer identity (e.g. `ProductReviewsSection.tsx`, `StoreReviewCard.tsx`, `CustomerStoreDetail.tsx`, `#ulasan-seller`).
  - Identify where account role labels (such as "seller", "customer", etc.) are displayed underneath user names.
  - Plan how to cleanly remove the role subtitle, showing only the user's name and avatar.
- **R4. Remove Stock Quantity Badges**
  - Locate all product card components: `MysteryBoxCard.tsx`, `ProductCard.tsx`, `src/features/customer/marketplace/components/MysteryBoxCard.tsx`, etc.
  - Identify visual stock quantity badges (e.g. "Sisa 97 Box", "Sisa 1 Box") and visual overlays.
  - Plan how to remove the visual badges while strictly preserving actual stock data, out-of-stock handling, and order logic.
- **R5 (Layout aspect). Homepage Product Display Grid**
  - Inspect `CustomerHome.tsx`. Check the grid layout for "Mystery Box di Sekitar" and "Mystery Box Terlaris".
  - Plan desktop layout: 3 columns x 2 rows (6 cards), maintaining responsive tablet/mobile layouts.

## Input Documents
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md`

## Output Requirements
- Write your comprehensive investigation report to `.agents/teamwork/explorer_r1_1/handoff.md`.
- Include exact file paths, line numbers, current behavior vs required behavior, and concrete fix recommendations.


## 2026-11-09T11:37:48Z
You are Explorer 1 (Lead Architect & UI/UX Specialist).

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
State folder: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_1\
Parent conversation ID: 38968871-17e4-4323-bc74-f1f1c77fe5bd

MANDATORY INPUTS:
- Read ORIGINAL_REQUEST.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\ORIGINAL_REQUEST.md
- Read SCOPE.md: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\orchestrator_6\SCOPE.md
- Read your task instructions: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_1\DISPATCH.md

FOCUS ON:
1. R1: Remove floating toast notifications globally across the frontend (order confirmation, review submission, cart actions, etc.), replace with inline/form/button feedback where needed, and plan removal of obsolete toast components/providers.
2. R2: Remove irrelevant role labels (e.g. "seller") from review identity displays in review cards and sections, showing only user name and avatar.
3. R4: Remove visual stock quantity badges (e.g. "Sisa 97 Box") and overlays from product cards across Homepage, Marketplace, and reusable card components, while preserving underlying stock logic and out-of-stock handling.
4. R5 (UI Layout): Inspect CustomerHome.tsx grid layout for "Mystery Box di Sekitar" and "Mystery Box Terlaris". Verify 3 columns x 2 rows (6 cards) on desktop with responsive layout for tablet and mobile.

OUTPUT:
- Write your comprehensive investigation report to c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_1\handoff.md
- Maintain your liveness in c:\Users\fahmi\Documents\Lomba\rescuebyte-fe\.agents\teamwork\explorer_r1_1\progress.md
- When complete, use send_message to report back to parent (Recipient: 38968871-17e4-4323-bc74-f1f1c77fe5bd).
