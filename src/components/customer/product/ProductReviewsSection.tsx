import React, { useState, useContext } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { StarRating } from '../../reviews/StarRating';
import { RatingDistribution } from '../../reviews/RatingDistribution';
import { ReviewCard } from '../../reviews/ReviewCard';
import { ReviewSubmissionModal } from '../../reviews/ReviewSubmissionModal';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { Modal } from '../../ui/Modal';
import { useProductReviews, useReviewMutations } from '../../../hooks/useReviews';
import ToastContext from '../../../context/ToastContext';
import { ReviewResponse } from '../../../api/types';

export interface ProductReviewsSectionProps {
  productId?: string;
  productName?: string;
  productImage?: string;
  onShowToast?: (message: string) => void;
  onRequireAuth?: () => void;
  className?: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
  productImage,
  onShowToast,
  onRequireAuth: _onRequireAuth,
  className = '',
}) => {
  const toastContext = useContext(ToastContext);

  // Reviews data fetched from real backend API
  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductReviews(productId, undefined, {
    autoFetch: Boolean(productId),
  });

  // Review mutations (create, update, delete)
  const {
    createProductReview,
    updateReview,
    deleteReview,
    isSubmitting,
  } = useReviewMutations({ showToast: true });

  // Modal states for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);

  // Modal state for Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Open Edit review modal
  const handleEditReview = (review: ReviewResponse) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  // Handle Review submission (create or update)
  const handleSubmitReview = async (data: { rating: number; content: string }) => {
    try {
      if (editingReview) {
        await updateReview(editingReview.id, data);
        if (onShowToast && !toastContext?.showToast) {
          onShowToast('Ulasan berhasil diperbarui!');
        }
      } else {
        if (!productId) return;
        await createProductReview(productId, data);
        if (onShowToast && !toastContext?.showToast) {
          onShowToast('Ulasan produk berhasil dikirim!');
        }
      }
      setIsModalOpen(false);
      setEditingReview(null);
      await refetch();
    } catch {
      // Error is caught, logged, and toasted by useReviewMutations
    }
  };

  // Open Delete confirmation dialog
  const handleDeleteClick = (reviewId: string) => {
    setDeletingReviewId(reviewId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm review deletion
  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return;
    try {
      await deleteReview(deletingReviewId);
      if (onShowToast && !toastContext?.showToast) {
        onShowToast('Ulasan berhasil dihapus!');
      }
      setIsDeleteDialogOpen(false);
      setDeletingReviewId(null);
      await refetch();
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <section
      id="ulasan-produk"
      aria-label="Ulasan Pengguna"
      className={`bg-white rounded-3xl p-6 sm:p-7 border border-black/10 shadow-xs mt-6 sm:mt-8 ${className}`.trim()}
    >
      {/* Header with Title (Read-Only on Product Detail) */}
      <div className="pb-6 border-b border-gray-100">
        <div>
          <h2 className="font-display font-extrabold text-base sm:text-lg text-[#1b1c1c]">
            Ulasan Pengguna
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {totalReviews > 0
              ? `Berdasarkan ${totalReviews} ulasan dari pelanggan terverifikasi`
              : 'Ulasan langsung dari pelanggan yang telah memesan produk ini'}
          </p>
        </div>
      </div>

      {/* Main Section Content Area */}
      <div className="mt-6 space-y-6">
        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="space-y-4" aria-busy="true" aria-label="Memuat ulasan...">
            <div className="p-6 bg-gray-50 border border-gray-150 rounded-2xl animate-pulse">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-28 h-12 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 w-full space-y-2.5">
                  <div className="h-3 bg-gray-200 rounded-full w-full" />
                  <div className="h-3 bg-gray-200 rounded-full w-5/6" />
                  <div className="h-3 bg-gray-200 rounded-full w-4/6" />
                </div>
              </div>
            </div>
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-gray-150 rounded-2xl animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="w-20 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error Alert State */}
        {!isLoading && isError && (
          <div
            role="alert"
            className="p-5 sm:p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">Gagal Memuat Ulasan</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  {error || 'Terjadi kesalahan saat memuat data ulasan produk. Silakan coba lagi.'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 self-end sm:self-auto shrink-0"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && reviews.length === 0 && (
          <EmptyState
            title="Belum Ada Ulasan"
            description="Belum ada ulasan untuk produk ini."
            className="py-10"
          />
        )}

        {/* Data Loaded: Rating Summary + Review List */}
        {!isLoading && !isError && reviews.length > 0 && (
          <>
            {/* Rating Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 sm:p-6 bg-[#fafaf8] border border-gray-150 rounded-2xl">
              {/* Left Column: Average Score, Stars, Total Count */}
              <div className="md:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black font-display text-gray-900 tracking-tight">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-gray-400">/ 5.0</span>
                </div>
                <div className="mt-2">
                  <StarRating rating={averageRating} size="lg" />
                </div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium mt-1.5">
                  {totalReviews} ulasan terverifikasi
                </span>
              </div>

              {/* Right Column: Rating Distribution Bars */}
              <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-gray-200/80 pt-4 md:pt-0 md:pl-6">
                <RatingDistribution
                  distribution={ratingDistribution}
                  totalReviews={totalReviews}
                />
              </div>
            </div>

            {/* Review Cards List */}
            <div className="space-y-4 pt-2">
              {reviews.map((review) => {
                return (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    reviewerName={review.author?.name || 'Pelanggan RescueByte'}
                    reviewerAvatar={review.author?.avatar_url}
                    rating={review.rating}
                    createdAt={review.created_at}
                    comment={review.content}
                    productName={productName}
                    productImage={productImage}
                    canEdit={false}
                    canDelete={false}
                    onEdit={() => handleEditReview(review)}
                    onDelete={() => handleDeleteClick(review.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Review Submission Modal (Create / Edit) */}
      <ReviewSubmissionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleSubmitReview}
        initialRating={editingReview?.rating ?? 5}
        initialContent={editingReview?.content ?? ''}
        title={editingReview ? 'Edit Ulasan Produk' : 'Ulasan Produk'}
        description={
          editingReview
            ? 'Perbarui penilaian atau ulasan Anda untuk produk ini.'
            : 'Bagikan pengalaman Anda tentang produk surplus ini kepada calon pembeli lain.'
        }
        targetName={productName}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsDeleteDialogOpen(false);
            setDeletingReviewId(null);
          }
        }}
        title="Hapus Ulasan?"
        description="Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan."
        maxWidth="sm"
      >
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeletingReviewId(null);
            }}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleConfirmDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
          >
            Hapus Ulasan
          </Button>
        </div>
      </Modal>
    </section>
  );
};

export default ProductReviewsSection;
