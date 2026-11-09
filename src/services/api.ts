/**
 * Legacy API Service Adapter:
 * Delegates to the centralized Axios client in src/api/client.ts
 * with automatic token refresh, response unwrapping, and error normalization.
 */
import apiClient, { API_BASE_URL } from '../api/client';

export { API_BASE_URL };
export const api = apiClient;
export default api;
