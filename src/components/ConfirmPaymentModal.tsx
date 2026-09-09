import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Wallet, Zap, X } from 'lucide-react';

interface ConfirmPaymentModalProps {
  gameTitle: string;
  entryFee: number;
  selectionDetails?: string;
  currentBalance: number;
  onClose: () => void;
  onConfirmPay: () => void;
  isSubmitting?: boolean;
}

export const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  gameTitle,
  entryFee,
  selectionDetails,
  currentBalance,
  onClose,
  onConfirmPay,
  isSubmitting = false,
}) => {
  const newBalance = Math.max(0, currentBalance - entryFee);

  const modalContent = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 0 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 0 }}
        className="bg-slate-900 max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-700/80 rounded-3xl shadow-2xl relative overflow-hidden my-auto"
      >
        <button 
          onClick={onClose} 
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Confirm Payment</h3>
            <p className="text-xs text-amber-300/90 font-medium">Please confirm real money deduction</p>
          </div>
        </div>

        {/* Warning text banner */}
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 leading-relaxed">
          ⚠️ <strong>{entryFee} ETB</strong> will be deducted from your internal wallet balance to enter this competition. Are you sure you want to proceed?
        </div>

        {/* Breakdown Card */}
        <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Target Game:</span>
            <span className="text-white font-bold truncate max-w-[180px]">{gameTitle}</span>
          </div>

          {selectionDetails && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Your Pick:</span>
              <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                🔒 {selectionDetails}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-400">
            <span>Entry Fee:</span>
            <span className="text-amber-400 font-bold text-sm">-{entryFee} ETB</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Current Balance:</span>
            <span className="text-cyan-300">{currentBalance.toLocaleString()} ETB</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-emerald-300">
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Balance After Payment:
            </span>
            <span className="font-bold text-sm text-emerald-400">{newBalance.toLocaleString()} ETB</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-800 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={onConfirmPay}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            {isSubmitting ? 'Processing...' : `Yes, Pay ${entryFee} ETB`}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
