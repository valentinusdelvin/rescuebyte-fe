import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDeleteModal
 * Styled with Tailwind CSS classes.
 */
export function ConfirmDeleteModal({
  isOpen,
  title = 'Hapus Dagangan?',
  itemName,
  message,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Handle escape key & autofocus
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-1050 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 shrink-0" aria-hidden="true">
          <Trash2 className="w-6.5 h-6.5" />
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-gray-900 font-display mb-2" id="confirm-delete-title">
          {title}
        </h3>

        {/* Modal Description */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed" id="confirm-delete-desc">
          {message || (
            <>
              Yakin ingin menghapus dagangan{' '}
              <strong className="font-semibold text-gray-900">"{itemName}"</strong> dari
              etalase? Tindakan ini tidak dapat dibatalkan.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            ref={cancelBtnRef}
            type="button"
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-gray-400"
            id="btn-cancel-delete"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-red-500"
            id="btn-confirm-delete-submit"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
