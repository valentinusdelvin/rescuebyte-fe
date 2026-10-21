import { useEffect, useRef } from 'react';

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
 * A clean, lightweight, accessible confirmation modal tailored to RescueBite's aesthetic.
 * Replaces native browser alert/confirm dialogs with on-brand styling.
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

    // Focus cancel button by default for safety
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
      className="confirm-modal-backdrop"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      <div
        className="confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Red Warning Icon */}
        <div className="confirm-modal-icon-badge" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        {/* Modal Title */}
        <h3 className="confirm-modal-title" id="confirm-delete-title">
          {title}
        </h3>

        {/* Modal Description */}
        <p className="confirm-modal-desc" id="confirm-delete-desc">
          {message || (
            <>
              Yakin ingin menghapus dagangan{' '}
              <strong className="confirm-item-name">"{itemName}"</strong> dari
              etalase? Tindakan ini tidak dapat dibatalkan.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="confirm-modal-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn-confirm-cancel"
            id="btn-cancel-delete"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-confirm-delete"
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
