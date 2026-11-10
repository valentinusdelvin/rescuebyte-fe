/**
 * Definisi TypeScript API Backend selaras kontrak Swagger 2.0.
 * Sumber Swagger: https://dolpin-fourthree.bccdev.id/swagger/doc.json
 * Base URL: https://dolpin-fourthree.bccdev.id/
 */

// Kontrak universal response & format error

export interface ApiResponse<T = unknown> {
  request_id: string;
  payload: T;
}

export interface PaginationMeta {
  limit?: number;
  page?: number;
  total_data?: number;
  total_page?: number;
}

export interface ApiErrorDetail {
  details?: unknown;
  error?: string;
  error_code?: string;
  location?: string;
  message?: string;
}

export interface ApiErrorPayload {
  error?: ApiErrorDetail;
}

export interface ApiErrorResponse {
  request_id?: string;
  payload?: ApiErrorPayload;
}

export interface MessageResponse {
  message: string;
}

export interface HealthResponse {
  message: string;
  status: 'healthy' | string;
}

// Alias kompatibilitas tipe Swagger lama

export type ErrorDetail = ApiErrorDetail;
export type ErrorPayload = ApiErrorPayload;
export type ErrorResponse = ApiErrorResponse;
