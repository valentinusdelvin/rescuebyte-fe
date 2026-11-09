import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import StarRating from './StarRating';

export interface ReviewSubmissionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Submit handler receiving rating (1-5) and content (string) */
  onSubmit: (data: { rating: number; content: string }) => Promise<void> | void;
  /** Initial rating if editing */
  initialRating?: number;
  /** Initial content if editing */
  initialContent?: string;
  /** Modal header title */
  title?: string;
  /** Modal header description */
  description?: string;
  /** Name of the product or store being reviewed */
  targetName?: string;
  /** Loading state during submission */
  isSubmitting?: boolean;
}

const SATISFACTION_LABELS: Record<number, string> = {
  1: 'Sangat Kecewa',
  2: 'Kurang Puas',
  3: 'Cukup',
  4: 'Puas',
  5: 'Sangat Puas!',
};

interface FormContentProps {
  initialRating: number;
  initialContent: string;
  onSubmit: (data: { rating: number; content: string }) => Promise<void> | void;
  onClose: () => void;
  isSubmitting: boolean;
}

const FormContent: React.FC<FormContentProps> = ({
  initialRating,
  initialContent,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [content, setContent] = useState<string>(initialContent);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      setError('Ulasan tidak boleh kosong. Mohon tuliskan ulasan Anda.');
      return;
    }

    if (trimmed.length > 2000) {
      setError('Ulasan maksimal 2000 karakter.');
      return;
    }

    setError(null);
    await onSubmit({ rating, content: trimmed });
  };

  const satisfactionText = SATISFACTION_LABELS[rating] || 'Puas';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-1">
      {/* Rating Picker */}
      <div className="flex flex-col items-center justify-center py-2 px-4 bg-[#fafaf8] border border-gray-150 rounded-2xl">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Beri Penilaian
        </span>

        <StarRating
          rating={rating}
          size="xl"
          interactive
          onChange={(newRating) => setRating(newRating)}
        />

        <span className="mt-2 text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
          {satisfactionText}
        </span>
      </div>

      {/* Comment Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="review-content-textarea"
            className="text-xs sm:text-sm font-bold text-gray-800"
          >
            Ulasan Anda
          </label>
          <span
            className={`text-xs ${
              content.length > 2000 ? 'text-rose-600 font-bold' : 'text-gray-400'
            }`}
          >
            {content.length}/2000
          </span>
        </div>

        <textarea
          id="review-content-textarea"
          rows={4}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Bagikan pengalaman Anda tentang kualitas makanan surplus, proses pengambilan, atau rasa..."
          className={`w-full p-3.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 shadow-2xs resize-none transition-colors focus:outline-none ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
          }`}
        />

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>

      {/* Modal Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={isSubmitting || content.trim().length === 0}
        >
          Kirim Ulasan
        </Button>
      </div>
    </form>
  );
};

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRating = 5,
  initialContent = '',
  title = 'Tulis Ulasan',
  description,
  targetName,
  isSubmitting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={
        description ||
        (targetName
          ? `Bagikan ulasan dan penilaian Anda untuk ${targetName}.`
          : 'Bagikan pengalaman Anda agar membantu pengguna lainnya.')
      }
      maxWidth="md"
    >
      {isOpen ? (
        <FormContent
          key={`${initialRating}-${initialContent}`}
          initialRating={initialRating}
          initialContent={initialContent}
          onSubmit={onSubmit}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </Modal>
  );
};

export default ReviewSubmissionModal;
