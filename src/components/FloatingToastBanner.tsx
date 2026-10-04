import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface FloatingToastBannerProps {
  statusMsg?: string | null;
  errorMsg?: string | null;
  onClearStatus?: () => void;
  onClearError?: () => void;
  autoCloseDuration?: number;
}

export const FloatingToastBanner: React.FC<FloatingToastBannerProps> = ({
  statusMsg,
  errorMsg,
  onClearStatus,
  onClearError,
  autoCloseDuration = 4500,
}) => {
  useEffect(() => {
    if (statusMsg && onClearStatus) {
      const timer = setTimeout(() => {
        onClearStatus();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [statusMsg, onClearStatus, autoCloseDuration]);

  useEffect(() => {
    if (errorMsg && onClearError) {
      const timer = setTimeout(() => {
        onClearError();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, onClearError, autoCloseDuration]);

  if (!statusMsg && !errorMsg) return null;

  const content = (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-xl pointer-events-none space-y-2">
      <AnimatePresence mode="wait">
        {statusMsg && (
          <motion.div
            key="toast-success"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="pointer-events-auto p-4 bg-slate-900/95 border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-emerald-500/40 backdrop-blur-2xl text-emerald-200 text-xs font-sans font-bold flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-300 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="leading-snug text-slate-100 font-semibold">{statusMsg}</span>
            </div>
            {onClearStatus && (
              <button
                type="button"
                onClick={onClearStatus}
                className="p-1.5 rounded-lg hover:bg-emerald-900/70 text-emerald-400 hover:text-white transition-colors"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            key="toast-error"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="pointer-events-auto p-4 bg-slate-900/95 border-2 border-rose-500/80 rounded-2xl shadow-2xl shadow-rose-500/40 backdrop-blur-2xl text-rose-200 text-xs font-sans font-bold flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 border border-rose-400/50 rounded-xl text-rose-300 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <span className="leading-snug text-slate-100 font-semibold">{errorMsg}</span>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="p-1.5 rounded-lg hover:bg-rose-900/70 text-rose-400 hover:text-white transition-colors"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return createPortal(content, document.body);
};
