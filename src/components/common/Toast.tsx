export interface ToastProps {
  message: string;
  isVisible: boolean;
}

/**
 * Toast Notification Component
 * Displays temporary feedback messages with slide-in animation.
 * Styled with Tailwind CSS utility classes.
 */
export function Toast({ message, isVisible }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[9990] flex items-center gap-3 px-4 py-3 bg-gray-900/95 text-white rounded-xl shadow-xl backdrop-blur-sm transition-all duration-300 pointer-events-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      id="toast-notification"
      role="status"
      aria-live="polite"
    >
      <div className="text-emerald-400 shrink-0">
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
      <div className="text-sm font-medium" id="toast-message">
        {message}
      </div>
    </div>
  );
}
