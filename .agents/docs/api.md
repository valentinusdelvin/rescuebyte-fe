# API Integration

This guide applies only if the React application communicates with a backend.

## Rules
- Follow the existing API client/service pattern. If none exists, create a small shared API utility only when multiple calls need it.
- Avoid duplicating request logic across components.
- Keep API response handling separate from presentation where practical.
- Handle loading, success, empty, and error states in the UI.
- Check HTTP status codes and handle network failures.
- Do not hardcode environment-specific API base URLs.
- Never put private backend credentials in client-side code.
- Do not invent endpoint paths or response fields; follow the documented backend contract.
- Use the HTTP library already installed. Do not add dependencies without a clear reason.

## Example: Fetching Data

```js
export async function getItems() {
  const response = await fetch("/api/items");

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}
```

- Place API functions in the existing service/API location when the project has one.
- This is a generic example only. Replace `/api/items` with a real documented endpoint.
- If the project has no backend integration, do not create API files or abstractions pre-emptively.
