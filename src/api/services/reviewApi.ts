import apiClient from '../client';
import {
  CreateReviewRequest,
  GetReviewsResponse,
  MessageResponse,
  ReviewResponse,
  StoreSummaryResponse,
  UpdateReviewRequest,
} from '../types';

export interface GetReviewsParams {
  page?: number;
  limit?: number;
}

/** Ambil ulasan terbaru untuk produk tertentu (GET /api/v1/products/{product_id}/reviews). */
export async function getProductReviews(
  productId: string,
  params?: GetReviewsParams
): Promise<GetReviewsResponse> {
  const res = await apiClient.get<GetReviewsResponse>(
    `/api/v1/products/${productId}/reviews`,
    { params }
  );
  return res.data;
}

/** Kirim rating dan ulasan produk sebagai user terautentikasi (POST /api/v1/products/{product_id}/reviews). */
export async function createProductReview(
  productId: string,
  data: CreateReviewRequest
): Promise<ReviewResponse> {
  const res = await apiClient.post<ReviewResponse>(
    `/api/v1/products/${productId}/reviews`,
    data
  );
  return res.data;
}

/** Ambil ulasan terbaru untuk toko tertentu (GET /api/v1/stores/{store_id}/reviews). */
export async function getStoreReviews(
  storeId: string,
  params?: GetReviewsParams
): Promise<GetReviewsResponse> {
  const res = await apiClient.get<GetReviewsResponse>(
    `/api/v1/stores/${storeId}/reviews`,
    { params }
  );
  return res.data;
}

/** Kirim rating dan ulasan toko sebagai user terautentikasi (POST /api/v1/stores/{store_id}/reviews). */
export async function createStoreReview(
  storeId: string,
  data: CreateReviewRequest
): Promise<ReviewResponse> {
  const res = await apiClient.post<ReviewResponse>(
    `/api/v1/stores/${storeId}/reviews`,
    data
  );
  return res.data;
}

/** Ambil ringkasan rating toko (rata-rata rating & total ulasan) (GET /api/v1/stores/{id}/summary). */
export async function getStoreSummary(storeId: string): Promise<StoreSummaryResponse> {
  const res = await apiClient.get<StoreSummaryResponse>(
    `/api/v1/stores/${storeId}/summary`
  );
  return res.data;
}

/** Edit isi ulasan dan rating (oleh pembuat ulasan atau admin) (PATCH /api/v1/reviews/{id}). */
export async function updateReview(
  id: string,
  data: UpdateReviewRequest
): Promise<ReviewResponse> {
  const res = await apiClient.patch<ReviewResponse>(
    `/api/v1/reviews/${id}`,
    data
  );
  return res.data;
}

/** Hapus ulasan (oleh pembuat ulasan atau admin) (DELETE /api/v1/reviews/{id}). */
export async function deleteReview(
  id: string
): Promise<Record<string, string> | MessageResponse> {
  const res = await apiClient.delete<Record<string, string> | MessageResponse>(
    `/api/v1/reviews/${id}`
  );
  return res.data;
}

export const reviewApi = {
  getProductReviews,
  createProductReview,
  getStoreReviews,
  createStoreReview,
  getStoreSummary,
  updateReview,
  deleteReview,
};

export default reviewApi;
