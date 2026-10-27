// Toast notification component with motion/react
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check, ShoppingBag, CheckCircle2, X, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: ToastType;
  onClose?: () => void;
}

/**
 * Toast Notification Component
 * Features dynamic icon and theme matching toast intent:
 *  - Error: Coral/Red badge with 'X' cross icon
 *  - Warning: Amber badge with 'AlertCircle' icon
 *  - Success: Emerald Green badge with 'Check' or context icon
 * Fluid spring motion enter/exit compliant with prefers-reduced-motion.
 */
export function Toast({ message, isVisible, type, onClose }: ToastProps) {
  const shouldReduceMotion = useReducedMotion();

  // Determine toast category (explicit type or keyword detection)
  const isError =
    type === 'error' ||
    (type === undefined &&
      /(minimal|tidak cocok|gagal|harus|salah|belum|wajib|silakan isi|error|batal|peringatan)/i.test(message));

  const isWarning = type === 'warning';

  const isCart = message.toLowerCase().includes('keranjang');
  const isCheckout = message.toLowerCase().includes('pesanan') || message.toLowerCase().includes('checkout');
  const isPayment = message.toLowerCase().includes('pembayaran');

  const IconComponent = isError
    ? X
    : isWarning
      ? AlertCircle
      : isCart
        ? ShoppingBag
        : isCheckout || isPayment
          ? CheckCircle2
          : Check;

  const containerBorder = isError
    ? 'border-[#4a1d1d]'
    : isWarning
      ? 'border-[#4a3a1d]'
      : 'border-[#203926]';

  const badgeClasses = isError
    ? 'bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444]'
    : isWarning
      ? 'bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b]'
      : 'bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="toast-notification"
          role="status"
          aria-live="polite"
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 20, scale: 0.94 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 12, scale: 0.94 }
          }
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 32,
            mass: 0.8,
          }}
          className={`fixed bottom-24 right-4 sm:right-6 z-[9990] flex items-center gap-3.5 px-4 py-3.5 bg-[#0d1611]/95 text-white border ${containerBorder} rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-auto pointer-events-auto`}
        >
          {/* Accent Badge with Icon (X for errors, Check for success) */}
          <div
            className={`w-8 h-8 rounded-full ${badgeClasses} flex items-center justify-center shrink-0 shadow-xs`}
            aria-hidden="true"
          >
            <IconComponent className="w-4 h-4 stroke-[2.5]" />
          </div>

          {/* Toast Message Content */}
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-100 leading-snug" id="toast-message">
              {message}
            </p>
          </div>

          {/* Optional manual close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
