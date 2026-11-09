# Dispatch Log

## 2026-11-09T13:10:33Z

Continue the existing RescueByte Teamwork session using Turbo autonomous execution with the requested multi-role team distribution (Lead Architect, Frontend Developer, API Integration Specialist, UI/UX Specialist, Refactoring Specialist, QA & Code Reviewer, Bug Fixer). Resolve remaining bugs, ensure product rating data consistency, and improve UX across the RescueByte frontend application.

Working directory: c:\Users\fahmi\Documents\Lomba\rescuebyte-fe
Integrity mode: development

Backend: VITE_API_BASE_URL=https://dolpin-fourthree.bccdev.id/

## Requirements

### R1. Remove Floating Toast Notifications Globally
- Remove intrusive bottom-right floating toast notifications throughout the entire frontend (including order confirmation and review submission notifications).
- Ensure no duplicated notifications appear after a single user action.
- Replace necessary feedback with appropriate inline messages, form-level feedback, or button states; do not eliminate form validation or API error feedback.
- Remove obsolete toast components, notification providers, and unused notification libraries.

### R2. Remove Irrelevant Role Labels from Review Identity
- Remove account role labels (such as "seller") displayed underneath user names in review-related interfaces.
- Display the user's name and avatar without irrelevant role subtitles.
- Preserve reviewer identity and other relevant information without modifying backend roles, permissions, authentication, or authorization logic.

### R3. Fix Product Rating Data Consistency
- Ensure consistent rating information across Homepage cards ("Mystery Box di Sekitar", "Mystery Box Terlaris"), Marketplace product listings, and reusable product cards.
- Display average product rating, star rating indicator, and total review count when available.
- Use actual backend review data matched to the correct product ID, distinguishing product reviews from store reviews.
- Do not show "Belum ada ulasan" when reviews actually exist; only display "Belum ada ulasan" when the product genuinely has zero reviews.
- Inspect existing Product Reviews endpoints and listing responses for aggregated rating info, reusing existing API services efficiently and avoiding N+1 API calls per card.

### R4. Remove Stock Quantity Badges
- Remove visual stock quantity badges (e.g., "Sisa 97 Box", "Sisa 1 Box") and related visual overlays from product cards on Homepage, Marketplace, and reusable card components.
- Preserve actual stock data, inventory logic, out-of-stock handling, and order validation without modifying backend stock management.

### R5. Homepage Product Display
- Display exactly six product cards in "Mystery Box di Sekitar" and six in "Mystery Box Terlaris".
- Desktop layout: three columns, two rows containing six products; maintain responsive layout on tablet and mobile.
- "Mystery Box di Sekitar": retrieve products using the supported nearby-products query with customer current coordinates, sorted by nearest distance.
- "Mystery Box Terlaris": retrieve products using the supported best-selling / popularity query with backend sorting.
- Use backend query parameters supported by Swagger without hardcoding, manual card duplication, or inventing parameters. Gracefully handle cases where fewer than six products are available.

### R6. Marketplace Default Sorting by Nearest Location
- Set default Marketplace sorting to "Lokasi Terdekat" (nearest location ascending) when customer coordinates are available.
- The nearest product must appear first; do not use earliest pickup time as default sorting criteria.
- Preserve manual sorting and filtering options; ensure distance values correspond to actual coordinates and sorting works with pagination.

### R7. Automatic Customer Geolocation
- Automatically request customer geolocation via browser Geolocation API upon application startup when permission has not been granted.
- Centralize geolocation logic in a reusable hook or service, avoiding duplicate or repeated permission prompts on re-render.
- When coordinates are granted, store them in application state, automatically load nearby products, and apply nearest-location sorting to Marketplace and Homepage.
- Handle permission denied, unavailable position, and timeout gracefully; provide a clear fallback button to request or update location manually if automatic prompting is blocked.

### R8. Automatic Session Logout
- Automatically log the user out when the Bearer Token expires or when the frontend session reaches a maximum duration of 24 hours from login (whichever occurs first).
- Centralize HTTP 401 response handling in the API client or interceptor.
- Clear authentication state and sensitive session data during logout, preventing access to protected routes and redirecting to the login page.
- Handle browser refresh and tab restoration correctly without creating multiple expiration timers.
