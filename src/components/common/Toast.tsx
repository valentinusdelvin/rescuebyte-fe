// Toast notification component with motion/react
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check, ShoppingBag, CheckCircle2 } from 'lucide-react';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose?: () => void;
}

/**
 * Toast Notification Component
 * Features dark theme, emerald green accent, rounded corners, and fluid motion enter/exit.
 * Complies with .agents/docs/architecture.md, styling.md, and prefers-reduced-motion.
 */
export function Toast({ message, isVisible, onClose }: ToastProps) {
  const shouldReduceMotion = useReducedMotion();

  // Pick suitable Lucide icon based on action message
  const isCart = message.toLowerCase().includes('keranjang');
  const isCheckout = message.toLowerCase().includes('pesanan') || message.toLowerCase().includes('checkout');
  const isPayment = message.toLowerCase().includes('pembayaran');

  const IconComponent = isCart ? ShoppingBag : isCheckout || isPayment ? CheckCircle2 : Check;

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
          className="fixed bottom-24 right-4 sm:right-6 z-[9990] flex items-center gap-3.5 px-4 py-3.5 bg-[#0d1611]/95 text-white border border-[#203926] rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-auto pointer-events-auto"
        >
          {/* Emerald Green Accent Badge with Icon */}
          <div className="w-8 h-8 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] flex items-center justify-center shrink-0 shadow-xs">
            <IconComponent className="w-4 h-4 stroke-[2.4]" />
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
