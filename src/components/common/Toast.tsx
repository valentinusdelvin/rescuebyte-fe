export interface ToastProps {
  message: string;
  isVisible: boolean;
}

/**
 * Toast Notification Component
 * Displays temporary feedback messages with slide-in animation.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function Toast({ message, isVisible }: ToastProps) {
  return (
    <div
      className={`toast-notification ${isVisible ? 'show' : ''}`}
      id="toast-notification"
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <div className="toast-message" id="toast-message">
        {message}
      </div>
    </div>
  );
}
