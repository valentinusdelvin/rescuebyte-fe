import type { PaginationMeta } from './common';

// DTO ulasan & ringkasan toko

export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export interface UpdateReviewRequest {
  rating: number;
  content: string;
}

export interface ReviewAuthorResponse {
  id?: string;
  name?: string;
  role?: string;
  avatar_url?: string;
}

export interface ReviewResponse {
  id: string;
  user_id?: string;
  product_id?: string;
  store_id?: string;
  rating: number;
  content: string;
  author?: ReviewAuthorResponse;
  created_at: string;
  updated_at?: string;
}

export interface GetReviewsResponse {
  meta?: PaginationMeta;
  reviews?: ReviewResponse[];
}

export interface StoreSummaryResponse {
  average_rating: number;
  total_reviews: number;
}
