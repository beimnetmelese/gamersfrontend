import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Trophy, Sparkles, Wallet, X, ArrowRight } from 'lucide-react';

interface EntrySuccessModalProps {
  gameTitle: string;
  entryFee: number;
  gameType: string;
  selectionDetails?: string;
  remainingBalance: number;
  onClose: () => void;
}

export const EntrySuccessModal: React.FC<EntrySuccessModalProps> = ({
  gameTitle,
  entryFee,
  gameType,
  selectionDetails,
  remainingBalance,
  onClose,
}) => {
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <motion.div 
        initial={{ scale: 0.85, opacity: 0, y: 0 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 0 }}
        className="glass-panel max-w-md w-full p-6 sm:p-8 space-y-6 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/60 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-center my-auto"
      >
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Celebration Icon Header */}
        <div className="flex flex-col items-center gap-3">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center"
          >
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </motion.div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-mono font-bold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Entry Confirmed!
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight">Completed Successfully 🎉</h3>
            <p className="text-xs text-slate-400 font-medium">You have officially entered this competition!</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 text-xs font-mono text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <span className="text-slate-400">Competition:</span>
            <span className="text-white font-bold truncate max-w-[200px]">{gameTitle}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Engine Type:</span>
            <span className="text-cyan-300 font-semibold uppercase">{gameType.replace(/_/g, ' ')}</span>
          </div>

          {selectionDetails && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Your Selection:</span>
              <span className="text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                🔒 {selectionDetails}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Entry Fee Paid:</span>
            <span className="text-emerald-400 font-bold">{entryFee} ETB</span>
          </div>

          <div className="pt-2 border-t border-slate-850 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Remaining Balance:
            </span>
            <span className="text-cyan-300 font-bold text-sm">{remainingBalance.toLocaleString()} ETB</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            Awesome! Continue Playing <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
