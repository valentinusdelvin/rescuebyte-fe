export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message?: string;
  isVisible?: boolean;
  type?: ToastType;
  onClose?: () => void;
}

/**
 * Toast Notification Component - Obsolete / Disabled
 * Floating toasts globally removed per requirement R1.
 */
export function Toast(_props: ToastProps) {
  return null;
}
