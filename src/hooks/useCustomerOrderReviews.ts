import { FormEvent, useCallback, useState } from 'react';
import { extractErrorMessage } from '../api/client';
import { reviewApi } from '../api/services/reviewApi';
import { DualReviewSubmitPayload } from '../components/customer/order/OrderReviewModal';
import { OrderItemDetail } from '../components/customer/order';

interface UseCustomerOrderReviewsOptions {
  resolvedStoreId: string;
  orderItems: OrderItemDetail[];
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useCustomerOrderReviews({
  resolvedStoreId,
  orderItems,
  onShowToast,
}: UseCustomerOrderReviewsOptions) {
  const [selectedRating, setSelectedRating] = useState(5);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  const handleSubmitReview = useCallback((event: FormEvent) => {
    event.preventDefault();
    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setIsReviewModalOpen(false);
      setIsReviewSubmitted(true);
      onShowToast?.('Terima kasih! Ulasan kamu berhasil dikirim.', 'success');
    }, 600);
  }, [onShowToast]);

  const handleSubmitDualReview = useCallback(async (payload: DualReviewSubmitPayload) => {
    setIsSubmittingReview(true);
    try {
      const { storeReview, productReview } = payload;
      const apiCalls: Promise<unknown>[] = [];

      if (resolvedStoreId && storeReview.rating > 0) {
        apiCalls.push(reviewApi.createStoreReview(resolvedStoreId, {
          rating: storeReview.rating,
          content: storeReview.content,
        }));
      }

      const targetProductId =
        productReview.productId && productReview.productId !== 'default-product'
          ? productReview.productId
          : orderItems[0]?.productId || orderItems[0]?.id;

      if (targetProductId && productReview.rating > 0) {
        apiCalls.push(reviewApi.createProductReview(targetProductId, {
          rating: productReview.rating,
          content: productReview.content,
        }));
      }

      if (apiCalls.length === 0) {
        onShowToast?.('Mohon lengkapi ulasan toko dan produk terlebih dahulu.', 'warning');
        return;
      }

      await Promise.all(apiCalls);
      setIsReviewSubmitted(true);
      setIsReviewModalOpen(false);
      onShowToast?.('Terima kasih! Ulasan toko dan produk berhasil dikirim.', 'success');
    } catch (err) {
      onShowToast?.(
        extractErrorMessage(err, 'Gagal mengirim ulasan. Silakan coba lagi.'),
        'error'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  }, [onShowToast, orderItems, resolvedStoreId]);

  return {
    handleSubmitDualReview,
    handleSubmitReview,
    isReviewModalOpen,
    isReviewSubmitted,
    isSubmittingReview,
    reviewComment,
    selectedRating,
    setIsReviewModalOpen,
    setReviewComment,
    setSelectedRating,
  };
}
