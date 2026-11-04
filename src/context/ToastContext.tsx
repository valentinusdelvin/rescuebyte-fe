import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, clearToasts }}>
      {children}
      {/* Toast Notification Floating Container */}
      {toasts.length > 0 && (
        <div
          role="region"
          aria-label="Notifikasi"
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
        >
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            const bgClass = isSuccess
              ? 'bg-[#1b4332] text-white border-[#2d6a4f]'
              : isError
              ? 'bg-[#b91c1c] text-white border-red-700'
              : isWarning
              ? 'bg-[#d97706] text-white border-amber-600'
              : 'bg-[#212529] text-white border-neutral-700';

            return (
              <div
                key={toast.id}
                role="alert"
                className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 text-sm font-medium ${bgClass}`}
              >
                <div className="flex items-center gap-2">
                  {isSuccess && <span>✓</span>}
                  {isError && <span>✕</span>}
                  {isWarning && <span>⚠</span>}
                  <span>{toast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Tutup notifikasi"
                  className="opacity-70 hover:opacity-100 transition-opacity ml-2 text-base leading-none focus:outline-none"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
