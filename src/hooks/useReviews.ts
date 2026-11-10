import { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
import {
  CreateReviewRequest,
  MessageResponse,
  PaginationMeta,
  ReviewResponse,
  StoreSummaryResponse,
  UpdateReviewRequest,
} from '../api/types';
import { reviewApi, GetReviewsParams } from '../api/services/reviewApi';
import { extractErrorMessage } from '../api/client';
import ToastContext from '../context/ToastContext';

export interface UseReviewsOptions {
  autoFetch?: boolean;
}

export interface UseReviewMutationsOptions {
  showToast?: boolean;
}

export type RatingDistribution = Record<number, number>;

/** Hitung rata-rata rating (1 angka desimal) dari daftar ulasan. Mengembalikan 0 jika ulasan kosong. */
export function calculateAverageRating(reviews: ReviewResponse[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const validReviews = reviews.filter((r) => typeof r.rating === 'number' && !isNaN(r.rating));
  if (validReviews.length === 0) return 0;
  const sum = validReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / validReviews.length) * 10) / 10;
}

/** Hitung sebaran jumlah ulasan dari bintang 1 hingga 5. */
export function calculateRatingDistribution(reviews: ReviewResponse[]): RatingDistribution {
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!reviews || reviews.length === 0) return distribution;

  for (const review of reviews) {
    const rawRating = Number(review.rating);
    if (!isNaN(rawRating)) {
      const star = Math.max(1, Math.min(5, Math.round(rawRating)));
      distribution[star] = (distribution[star] || 0) + 1;
    }
  }

  return distribution;
}

/** Custom hook untuk mengambil dan mengelola daftar ulasan produk. */
export function useProductReviews(
  productId?: string,
  params?: GetReviewsParams,
  options: UseReviewsOptions = {}
) {
  const { autoFetch = true } = options;

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(productId && autoFetch));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const page = params?.page;
  const limit = params?.limit;
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [page, limit, params]);

  const fetchReviews = useCallback(
    async (overrideParams?: GetReviewsParams) => {
      if (!productId) {
        setReviews([]);
        setMeta(undefined);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const queryParams = overrideParams !== undefined ? overrideParams : paramsRef.current;
        const res = await reviewApi.getProductReviews(productId, queryParams);
        setReviews(res.reviews || []);
        setMeta(res.meta);
      } catch (err) {
        setIsError(true);
        const msg = extractErrorMessage(err, 'Gagal memuat ulasan produk.');
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    if (autoFetch && productId) {
      void fetchReviews();
    } else if (!productId) {
      setReviews([]);
      setMeta(undefined);
      setIsLoading(false);
    }
  }, [autoFetch, fetchReviews, productId, page, limit]);

  const averageRating = useMemo(() => calculateAverageRating(reviews), [reviews]);
  const totalReviews = useMemo(() => meta?.total_data ?? reviews.length, [meta?.total_data, reviews.length]);
  const ratingDistribution = useMemo(() => calculateRatingDistribution(reviews), [reviews]);

  const refetch = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    meta,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/** Custom hook untuk mengambil ulasan toko serta ringkasan rating toko. */
export function useStoreReviews(
  storeId?: string,
  params?: GetReviewsParams,
  options: UseReviewsOptions = {}
) {
  const { autoFetch = true } = options;

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [summary, setSummary] = useState<StoreSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(storeId && autoFetch));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const page = params?.page;
  const limit = params?.limit;
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [page, limit, params]);

  const fetchStoreData = useCallback(
    async (overrideParams?: GetReviewsParams) => {
      if (!storeId) {
        setReviews([]);
        setMeta(undefined);
        setSummary(null);
        setIsLoading(false);
        setIsError(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const queryParams = overrideParams !== undefined ? overrideParams : paramsRef.current;
        const [reviewsRes, summaryRes] = await Promise.allSettled([
          reviewApi.getStoreReviews(storeId, queryParams),
          reviewApi.getStoreSummary(storeId),
        ]);

        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value.reviews || []);
          setMeta(reviewsRes.value.meta);
        } else {
          throw reviewsRes.reason;
        }

        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value);
        } else {
          setSummary(null);
        }
      } catch (err) {
        setIsError(true);
        const msg = extractErrorMessage(err, 'Gagal memuat ulasan toko.');
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [storeId]
  );

  useEffect(() => {
    if (autoFetch && storeId) {
      void fetchStoreData();
    } else if (!storeId) {
      setReviews([]);
      setMeta(undefined);
      setSummary(null);
      setIsLoading(false);
    }
  }, [autoFetch, fetchStoreData, storeId, page, limit]);

  const averageRating = useMemo(() => {
    if (summary && typeof summary.average_rating === 'number' && summary.average_rating > 0) {
      return Math.round(summary.average_rating * 10) / 10;
    }
    return calculateAverageRating(reviews);
  }, [summary, reviews]);

  const totalReviews = useMemo(() => {
    if (summary && typeof summary.total_reviews === 'number') {
      return summary.total_reviews;
    }
    return meta?.total_data ?? reviews.length;
  }, [summary, meta?.total_data, reviews.length]);

  const ratingDistribution = useMemo(() => calculateRatingDistribution(reviews), [reviews]);

  const refetch = useCallback(async () => {
    await fetchStoreData();
  }, [fetchStoreData]);

  return {
    reviews,
    meta,
    summary,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/** Custom hook untuk mengambil ringkasan rating toko (average_rating & total_reviews). */
export function useStoreSummary(
  storeId?: string,
  options: UseReviewsOptions = {}
) {
  const { autoFetch = true } = options;

  const [summary, setSummary] = useState<StoreSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(storeId && autoFetch));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!storeId) {
      setSummary(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const res = await reviewApi.getStoreSummary(storeId);
      setSummary(res);
    } catch (err) {
      setIsError(true);
      const msg = extractErrorMessage(err, 'Gagal memuat ringkasan toko.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (autoFetch && storeId) {
      void fetchSummary();
    } else if (!storeId) {
      setSummary(null);
      setIsLoading(false);
    }
  }, [autoFetch, fetchSummary, storeId]);

  const refetch = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/** Custom hook untuk mutasi ulasan (buat ulasan produk/toko, edit, dan hapus) dengan feedback toast otomatis. */
export function useReviewMutations(options: UseReviewMutationsOptions = {}) {
  const { showToast = true } = options;
  const toastContext = useContext(ToastContext);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const triggerToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      if (showToast && toastContext?.showToast) {
        toastContext.showToast(message, type);
      }
    },
    [showToast, toastContext]
  );

  const createProductReview = useCallback(
    async (productId: string, data: CreateReviewRequest): Promise<ReviewResponse> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await reviewApi.createProductReview(productId, data);
        triggerToast('Ulasan produk berhasil dikirim!', 'success');
        return res;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal mengirim ulasan produk.');
        setError(msg);
        triggerToast(msg, 'error');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [triggerToast]
  );

  const createStoreReview = useCallback(
    async (storeId: string, data: CreateReviewRequest): Promise<ReviewResponse> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await reviewApi.createStoreReview(storeId, data);
        triggerToast('Ulasan toko berhasil dikirim!', 'success');
        return res;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal mengirim ulasan toko.');
        setError(msg);
        triggerToast(msg, 'error');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [triggerToast]
  );

  const updateReview = useCallback(
    async (id: string, data: UpdateReviewRequest): Promise<ReviewResponse> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await reviewApi.updateReview(id, data);
        triggerToast('Ulasan berhasil diperbarui!', 'success');
        return res;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal memperbarui ulasan.');
        setError(msg);
        triggerToast(msg, 'error');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [triggerToast]
  );

  const deleteReview = useCallback(
    async (id: string): Promise<Record<string, string> | MessageResponse> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await reviewApi.deleteReview(id);
        triggerToast('Ulasan berhasil dihapus!', 'success');
        return res;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal menghapus ulasan.');
        setError(msg);
        triggerToast(msg, 'error');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [triggerToast]
  );

  return {
    createProductReview,
    createStoreReview,
    updateReview,
    deleteReview,
    isSubmitting,
    error,
  };
}

export interface StoreProductReviewItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  comment: string;
  date: string;
  createdAt: string;
  productId: string;
  productName: string;
  productImage?: string;
  type: 'product';
}

/** Mengambil dan mengagregasi ulasan seluruh produk milik sebuah toko via Promise.allSettled secara paralel. */
export function useStoreProductReviews(
  products?: Array<{ id: string; name?: string; imageSrc?: string; imageUrl?: string }>,
  options: UseReviewsOptions = {}
) {
  const { autoFetch = true } = options;
  const [productReviews, setProductReviews] = useState<StoreProductReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const productsKey = useMemo(() => {
    if (!products || products.length === 0) return '';
    return products.map((p) => p.id).sort().join(',');
  }, [products]);

  const fetchProductReviews = useCallback(async () => {
    if (!products || products.length === 0) {
      setProductReviews([]);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const results = await Promise.allSettled(
        products.map(async (prod) => {
          const res = await reviewApi.getProductReviews(prod.id, { limit: 100 });
          const reviews = res.reviews || [];
          return reviews.map((r): StoreProductReviewItem => {
            const rawDate = r.created_at ? new Date(r.created_at) : new Date();
            const formattedDate = !isNaN(rawDate.getTime())
              ? rawDate.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Baru saja';

            return {
              id: r.id,
              name: r.author?.name || 'Pelanggan RescueByte',
              role: r.author?.role || 'Penyelamat Makanan',
              rating: r.rating,
              avatar: r.author?.avatar_url || '',
              comment: r.content,
              date: formattedDate,
              createdAt: r.created_at || '',
              productId: prod.id,
              productName: prod.name || 'Produk RescueByte',
              productImage: prod.imageSrc || prod.imageUrl || '',
              type: 'product',
            };
          });
        })
      );

      if (results.length > 0 && results.every((res) => res.status === 'rejected')) {
        setIsError(true);
        setError('Gagal memuat ulasan produk toko.');
        setProductReviews([]);
        return;
      }

      const combined: StoreProductReviewItem[] = [];
      for (const res of results) {
        if (res.status === 'fulfilled') {
          combined.push(...res.value);
        }
      }

      setProductReviews(combined);
    } catch (err) {
      setIsError(true);
      setError(extractErrorMessage(err, 'Gagal memuat ulasan produk toko.'));
    } finally {
      setIsLoading(false);
    }
  }, [productsKey]);

  useEffect(() => {
    if (autoFetch && products && products.length > 0) {
      void fetchProductReviews();
    } else if (!products || products.length === 0) {
      setProductReviews([]);
      setIsLoading(false);
    }
  }, [autoFetch, fetchProductReviews, productsKey]);

  return {
    productReviews,
    isLoading,
    isError,
    error,
    refetch: fetchProductReviews,
  };
}
