import React, { useEffect, useRef, useId, useCallback } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const maxWidthStyles: Record<NonNullable<ModalProps['maxWidth']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  // Penjaga fokus keyboard dan penutup modal via tombol Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    // Simpan elemen aktif sebelumnya agar fokus kembali saat modal ditutup
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Kunci scroll body saat modal aktif
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(focusTimer);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthStyles[maxWidth]} bg-white rounded-2xl border border-outline-variant shadow-level-2 max-h-[90vh] flex flex-col overflow-hidden outline-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 pb-3 border-b border-outline-variant/60 shrink-0">
            <div>
              {title && (
                <h3 id={titleId} className="text-base font-bold font-heading text-on-surface">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-on-surface-variant/80 mt-1">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
