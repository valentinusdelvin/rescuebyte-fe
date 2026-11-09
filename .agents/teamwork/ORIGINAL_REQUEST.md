# Original User Request

## Approved Task Prompt — 2026-11-09T14:17:19Z

Use a team with Lead Architect, Frontend Developer, UI/UX Specialist, Refactoring Specialist, API Integration Specialist, QA & Code Reviewer, and Bug Fixer. Perform final homepage adjustments (limiting "Mystery Box di Sekitar" and "Mystery Box Terlaris" to 3 cards with "Lihat Selengkapnya" navigation to Marketplace) and global language localization to natural Indonesian across user-facing text in RescueByte.

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
Integrity mode: development

## Requirements

### R1. Homepage Section — Mystery Box di Sekitar
- Display a maximum of 3 product cards only.
- Retrieve products dynamically using the existing nearby-products API query, prioritizing products based on the customer's actual location and maintaining nearest-first sorting.
- Do not use hardcoded or duplicated product data.
- Preserve existing product card design and functionality.
- Below the three product cards, add a clickable text link "Lihat Selengkapnya" that navigates to the Marketplace page using existing routing and navigation without breaking application state, with appropriate hover and pointer states.
- If fewer than 3 products are available, display the available products without duplicating them.

### R2. Homepage Section — Mystery Box Terlaris
- Display a maximum of 3 product cards only.
- Retrieve products dynamically using the existing best-selling or popularity query supported by the backend, preserving backend sorting criteria.
- Do not use hardcoded or duplicated product data.
- Maintain existing product card design.
- Below the three product cards, add a clickable text link "Lihat Selengkapnya" that navigates to the Marketplace page using existing navigation without creating duplicate routes.
- If fewer than 3 products are available, display the available products without duplicating them.
- Do not change the Marketplace product listing limit or pagination.

### R3. Global Language Localization — Natural Indonesian
- Audit and localize user-facing text across the frontend: navigation menus, page titles, section headings, buttons and action labels, product descriptions and supporting text, form labels and placeholders, validation messages, success and error messages, loading states, empty states, confirmation dialogs, tooltips and helper text, authentication and account messages, review and rating interfaces, and marketplace/homepage content.
- Use natural, conversational, clear, slightly casual yet professional, and concise Indonesian that feels written by a real Indonesian university student or developer.
- Antislop guidelines for copywriting and code hygiene apply during the work.
- Technical terminology must remain in English where appropriate (e.g., API, Backend, Frontend, Dashboard, Marketplace, Authentication, Authorization, Bearer Token, Request, Response, Loading State, Error Handling, Pagination, Filtering, Sorting, Review, Component, Hook, Responsive, Location, Checkout).
- Do not translate programming identifiers, variable names, function names, API endpoints, database fields, or code-level terminology.
- Do not translate brand names such as RescueByte or Mystery Box.
- Only modify user-facing text and copywriting; do not change application logic just to translate text, and do not modify backend responses.
- Avoid excessive slang, emojis, overly promotional language, and robotic or repetitive AI-generated wording.

## Verification Resources
- Standard repository verification commands: `npm run build` and TypeScript typechecking.
- Manual/visual verification of the homepage sections, navigation links, and localized Indonesian text across UI components.

## Acceptance Criteria

### Homepage Product Display & Navigation
- [ ] Mystery Box di Sekitar displays a maximum of 3 products.
- [ ] Mystery Box Terlaris displays a maximum of 3 products.
- [ ] Both sections use their respective backend queries independently.
- [ ] Neither section duplicates product cards when fewer than 3 products are available.
- [ ] Both sections have a "Lihat Selengkapnya" link with proper hover and pointer states.
- [ ] Both links navigate correctly to Marketplace without breaking application state or creating duplicate routes.
- [ ] Marketplace product listing and pagination remain unchanged.

### Language Localization & Consistency
- [ ] User-facing English text that should be Indonesian has been localized into natural, conversational, concise, and consistent Indonesian across all audited areas.
- [ ] Technical terminology remains in English where appropriate.
- [ ] Brand names (RescueByte, Mystery Box) are preserved.
- [ ] No application logic or API contracts are broken by localization changes.

### Build & Integrity
- [ ] Build and TypeScript checks pass without errors.
- [ ] Existing working features and previous bug fixes remain functional.


## Follow-up — 2026-11-09T14:18:48Z

CRITICAL USER CLARIFICATION:
The user explicitly clarified:
"eh itu yang kumaksud tuh command pada kode loh ya, kek dokumentasi nya! bukan pada UI FrontEnd nya oke."

TRANSLATION & SCOPE ADJUSTMENT:
- DO NOT change user-facing UI copy/text across components/pages. The UI text is already established.
- The localization / natural Indonesian instruction applies to CODE COMMENTS, JSDoc, and CODEBASE DOCUMENTATION (antislop-code guidelines).
- Keep technical terms in English (API, Backend, Dashboard, Marketplace, etc.).
- Ensure code comments and documentation sound natural and clean (no generic AI slop comments).

HOMEPAGE REQUIREMENTS REMAIN ACTIVE:
- Mystery Box di Sekitar: maximum 3 cards, nearby dynamic query, with "Lihat Selengkapnya" link navigating to Marketplace.
- Mystery Box Terlaris: maximum 3 cards, popularity query, with "Lihat Selengkapnya" link navigating to Marketplace.

Please adjust the team's scope immediately to respect this clarification.
