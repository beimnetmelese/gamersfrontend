import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';

interface AdminActionReasonModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  defaultReason?: string;
  placeholder?: string;
  confirmButtonText?: string;
  confirmButtonVariant?: 'danger' | 'warning' | 'primary';
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const AdminActionReasonModal: React.FC<AdminActionReasonModalProps> = ({
  isOpen,
  title,
  subtitle = 'Please provide a clear reason or administrative note for this action.',
  defaultReason = '',
  placeholder = 'Type your reason or administrative note here...',
  confirmButtonText = 'Confirm & Proceed',
  confirmButtonVariant = 'danger',
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState(defaultReason);

  useEffect(() => {
    setReason(defaultReason);
  }, [defaultReason, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  const getVariantStyles = () => {
    switch (confirmButtonVariant) {
      case 'danger':
        return 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/30';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold shadow-amber-900/30';
      default:
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-900/30';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Reason / Administrative Note <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={placeholder}
                rows={3}
                autoFocus
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-sans"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason.trim()}
                className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()}`}
              >
                <Check className="h-4 w-4" />
                {confirmButtonText}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
