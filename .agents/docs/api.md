# API Integration

This guide applies for connecting the RescueBite React application with the backend API.

## Base URL & Documentation
- Default Backend API: `https://dolpin-fourthree.bccdev.id/`
- Swagger UI: `https://dolpin-fourthree.bccdev.id/swagger/index.html`
- OpenAPI Schema: `https://dolpin-fourthree.bccdev.id/swagger/doc.json`
- Environment variable: `VITE_API_BASE_URL` (with fallback to default URL).

## Auth Endpoints (/api/v1/auth)
- `POST /api/v1/auth/register` (body: `{ name, email, password }`): Creates new account, returns payload with `user`, `access_token`, `refresh_token`.
- `POST /api/v1/auth/login` (body: `{ email, password }`): Logs in, returns payload with `user`, `access_token`, `refresh_token`.
- `POST /api/v1/auth/logout` (body: `{ refresh_token }`): Invalidates session token.
- `GET /api/v1/auth/me` (header: `Bearer <token>`): Returns currently authenticated user details.
- `POST /api/v1/auth/refresh` (body: `{ refresh_token }`): Generates a new access token.
- `GET /api/v1/auth/google`: Retrieves Google OAuth authorization URL.
- `GET /api/v1/auth/google/callback`: Handles OAuth redirect and issues tokens.

## Rules
- Use `axios` as the standard HTTP client for all API communication.
- Centralize the Axios instance in `src/services/api.ts` with request and response interceptors.
- Automatically attach `Authorization: Bearer <access_token>` from `localStorage` in the request interceptor.
- Extract descriptive error messages from `err.response.data.payload.error.message` for toast notifications.
- Avoid duplicating request logic across components; place API calls in `src/services/`.
- Keep API response handling separate from presentation where practical.
- Handle loading, success, empty, and error states in the UI.
- Type API request and response data explicitly using TypeScript interfaces.

## Example: Axios Client Pattern

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dolpin-fourthree.bccdev.id/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

