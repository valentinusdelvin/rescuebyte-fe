# API Integration

This guide applies for connecting the RescueBite React application with the backend API.

## Rules
- Use `axios` as the standard HTTP client for all API communication.
- Centralize the Axios instance in `src/services/api.ts` with request and response interceptors.
- Automatically attach `Authorization: Bearer <access_token>` from `localStorage` in the request interceptor.
- Avoid duplicating request logic across components; place API calls in `src/services/`.
- Keep API response handling separate from presentation where practical.
- Handle loading, success, empty, and error states in the UI.
- Check HTTP status codes and handle network failures with user-friendly error messages.
- Type API request and response data explicitly using TypeScript interfaces.
- Do not invent endpoint paths or response fields; follow the documented backend contract.

## Example: Axios Client Pattern

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
