## 2026-11-09T03:14:30Z

Continue the existing RescueByte Teamwork session.

# PROJECT TASK: REVIEW FEATURE — API INTEGRATION, UI IMPLEMENTATION & NAVIGATION

Reference screenshot for Seller Dashboard Review page:
C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794193326013_1e8c58c4.jpg

We are implementing and integrating the Review feature across the RescueByte frontend.

This task includes:
1. Seller Dashboard — Buyer Reviews page.
2. Product Detail — Customer Reviews section.
3. Interactive rating and review-count navigation.
4. Backend integration using the existing Review API endpoints.

IMPORTANT: This is a focused feature implementation. Do not integrate unrelated backend modules.

---

# 1. PROJECT CONTEXT

Frontend:
- React
- TypeScript
- TSX
- Tailwind CSS
- Vite

Backend:
VITE_API_BASE_URL=https://dolpin-fourthree.bccdev.id/

Swagger:
https://dolpin-fourthree.bccdev.id/swagger/index.html

Existing frontend:
https://rescuebyte-fe.vercel.app/

Product Detail:
https://rescuebyte-fe.vercel.app/#detail-produk

Store Page:
https://rescuebyte-fe.vercel.app/#toko

Previous frontend refactoring has already been completed.

Before implementation:
- Inspect the existing project structure.
- Read relevant `.agents` skills and project instructions.
- Understand existing routing and navigation mechanisms.
- Reuse existing components and design conventions.
- Do not repeat previous refactoring unnecessarily.

# 2. DESIGN REFERENCE — SELLER DASHBOARD

I have provided a screenshot as the primary visual reference for the Seller Dashboard Review page.
Screenshot path: C:/Users/fahmi/.gemini/antigravity/brain/4423c825-0620-4ba8-a2a4-23e9688b9196/.user_uploaded/media_1794193326013_1e8c58c4.jpg

Implement the design based on that screenshot.

Page title:
Ulasan Pembeli

The page should contain the following sections:

A. HEADER AND SIDEBAR
- Maintain the existing RescueByte branding.
- Display the seller identity.
- Maintain the seller dashboard sidebar navigation.
- Highlight the active menu item: Ulasan Pembeli.
- Follow the layout and visual hierarchy from the reference screenshot.

B. REVIEW SUMMARY CARDS

Create three summary sections:

1. Rating Toko
   - Display the store's average rating.
   - Display the maximum rating, such as 5.0.
   - Display visual star indicators.
   - Display a short description.

2. Total Ulasan
   - Display the total number of reviews.
   - Use actual backend data.

3. Distribusi Penilaian
   - Display the distribution of 5-star, 4-star, 3-star, 2-star, and 1-star reviews.
   - Use horizontal progress bars.
   - Display the actual number of reviews for each rating.
   - Calculate percentages based on actual review data when the backend does not provide aggregated statistics.

C. SEARCH AND FILTER

Implement:
- Search input for products or review content.
- Rating filter: Semua Rating, 5, 4, 3, 2, and 1 stars.
- Sorting options such as Terbaru and Terlama.

Search and filtering must work with the available data. Use server-side filtering if supported by the API, otherwise implement appropriate client-side filtering.

D. REVIEW LIST

Each review card should contain:
- Reviewer name.
- Reviewer avatar or initials.
- Rating stars.
- Review date.
- Related product information when available.
- Product thumbnail when available.
- Review text.

E. PAGINATION

Implement pagination:
- Sebelumnya.
- Page numbers.
- Selanjutnya.

Use backend pagination if supported. Otherwise implement client-side pagination.

F. VISUAL REQUIREMENTS

- Follow the provided screenshot closely.
- Use white cards with subtle borders and shadows.
- Use a warm off-white background.
- Use green accents for rating distribution.
- Use yellow or orange for rating stars.
- Maintain clean typography and spacing.
- Ensure responsive behavior for desktop, tablet, and mobile.

Do not hardcode the example values from the screenshot, such as 4.8 rating or 128 reviews. All displayed statistics must come from actual backend data or calculations based on actual reviews.

---

# 3. PRODUCT DETAIL — CUSTOMER REVIEWS SECTION

Reference page:
https://rescuebyte-fe.vercel.app/#detail-produk

Add a new section called:

Ulasan Pengguna

This section must appear below the existing product detail information.

Requirements:

A. REVIEW SUMMARY
- Average product rating.
- Total number of reviews.
- Star distribution when sufficient data is available.

B. REVIEW LIST
Each review should display:
- Customer name.
- Customer avatar or initials.
- Rating stars.
- Review date.
- Review content.

C. REVIEW INTERACTION
- Provide a review submission interface for eligible users.
- Allow users to submit a rating and review content.
- Allow editing and deleting their own reviews when authorized.
- Display loading, empty, success, and error states.

D. REVIEW PRESENTATION
- Use reusable review components.
- Maintain RescueByte's existing design system.
- Keep the section visually consistent with the existing product detail page.
- Ensure responsive design.

Use actual backend data. Do not use dummy reviews in the final integrated implementation.

---

# 4. INTERACTIVE RATING & REVIEW NAVIGATION

This is an important requirement.

Reference destinations:

Store page:
https://rescuebyte-fe.vercel.app/#toko

Target section:
Ulasan Pelanggan

Every interactive rating and review-count element on the Product Detail page must navigate to the Store page's Ulasan Pelanggan section.

This includes:
- Product rating star icons.
- Average rating display.
- Total review count, such as "128 Ulasan".
- Any clickable review summary or rating indicator.

Expected behavior:

1. User opens Product Detail.
2. User clicks the star rating or review count.
3. Frontend navigates to the Store page.
4. The page automatically scrolls to the Ulasan Pelanggan section.
5. The target section should be visible and positioned correctly.

IMPORTANT IMPLEMENTATION DETAILS:

- Inspect the existing routing and navigation implementation first.
- Do not use arbitrary navigation that breaks existing routes.
- Ensure the target section has a stable identifier, for example `id="ulasan-pelanggan"`.
- Implement reliable hash navigation and scrolling.
- If the store page is rendered asynchronously, wait until the target element is available before scrolling.
- Ensure navigation works on direct URL access and browser refresh.
- Preserve the existing `#toko` navigation behavior.
- Provide hover states and pointer cursors for clickable elements.
- Provide accessible labels and keyboard interaction.

The target destination is specifically the Ulasan Pelanggan section, not the top of the Store page.

Also inspect other existing rating and review-count elements across the frontend. Apply the same navigation behavior wherever they represent the relevant store rating or review destination.

Do not make decorative stars clickable if they are only part of an individual review card and are not intended as navigation controls.

---

# 5. BACKEND API INTEGRATION

Use the following six existing endpoints:

PRODUCT REVIEWS:

GET /api/v1/products/{product_id}/reviews
Purpose: Retrieve product reviews.

POST /api/v1/products/{product_id}/reviews
Purpose: Submit a product review.

DELETE /api/v1/reviews/{id}
Purpose: Delete a review.

PATCH /api/v1/reviews/{id}
Purpose: Edit a review.

STORE REVIEWS:

GET /api/v1/stores/{store_id}/reviews
Purpose: Retrieve store reviews.

POST /api/v1/stores/{store_id}/reviews
Purpose: Submit a store review.

Before implementation, inspect the complete Swagger schemas.

Determine:
- Request parameters.
- Request body.
- Response structure.
- Rating format.
- Review content fields.
- Reviewer information.
- Related product information.
- Pagination support.
- Authentication requirements.
- Authorization and review ownership rules.

Do not invent request or response fields.

Implement:
- Centralized API integration.
- Review services.
- TypeScript interfaces.
- Custom hooks where appropriate.
- Proper error handling.
- Loading and empty states.
- Mutation success feedback.
- Correct authentication handling.

Use the existing API architecture wherever possible.

---

# 6. AGENT RESPONSIBILITIES

Lead Architect:
Coordinate implementation, establish dependencies, and prevent file conflicts.

UI/UX Specialist:
Implement and validate the Seller Dashboard design and Product Detail review presentation.

Frontend Developer:
Implement review pages, review components, forms, and interactive navigation.

API Integration Specialist:
Own the six Review endpoints, API services, types, and hooks.

Refactoring Specialist:
Maintain clean code and modularity. Only refactor where necessary for this feature.

QA & Code Reviewer:
Validate all review workflows, navigation, API integration, and responsive layouts.

Bug Fixer:
Fix bugs reported by QA and verify that fixes do not introduce regressions.

Use parallel execution only for independent tasks. Assign explicit file ownership to prevent concurrent modifications.

---

# 7. TESTING & ACCEPTANCE CRITERIA

The feature is considered complete only when the following requirements are verified.

SELLER DASHBOARD:
- Review summary displays real data.
- Rating distribution is correct.
- Search works.
- Rating filter works.
- Sorting works.
- Pagination works.
- Review cards display correct information.
- Responsive layout works.

PRODUCT DETAIL:
- Customer reviews are displayed below product information.
- Average rating and total reviews are correct.
- Product review submission works.
- Editing and deleting reviews work when authorized.
- Empty and error states work.

NAVIGATION:
- Clicking rating stars navigates to the Store page.
- Clicking review count navigates to the Store page.
- Navigation scrolls to Ulasan Pelanggan.
- Direct hash navigation works.
- Browser refresh does not break navigation.

BACKEND:
- All six endpoints are tested where credentials and test data are available.
- Request payloads match Swagger.
- Response data is correctly mapped.
- Authentication and authorization are respected.
- UI updates correctly after mutations.

QUALITY:
- TypeScript checks pass.
- Build succeeds.
- No unnecessary duplicate components.
- No hardcoded backend URLs.
- No regression in existing features.

If backend testing is blocked by missing credentials or unavailable test data, document it clearly instead of claiming success.

---

# 8. EXECUTION STRATEGY

Use Turbo autonomous execution.

Proceed in this order:

PHASE A — Inspect existing frontend and Swagger.
PHASE B — Map API endpoints to the relevant components.
PHASE C — Implement Seller Dashboard Review page.
PHASE D — Implement Product Detail Customer Reviews section.
PHASE E — Implement interactive rating and review navigation.
PHASE F — Integrate and validate all six API endpoints.
PHASE G — QA, bug fixing, and regression testing.

Keep implementation focused on the Review feature.

Do not modify backend source code, database, or production infrastructure.

Do not perform destructive Git operations, push, merge to main, or deploy without permission.

# 9. FINAL REPORT

Provide:
1. Summary of implemented Review features.
2. Seller Dashboard changes.
3. Product Detail changes.
4. Navigation implementation details.
5. API integration results.
6. Files created and modified.
7. QA and testing results.
8. Remaining issues and limitations.

Start by inspecting the existing implementation and Swagger schemas, then proceed with the feature implementation.