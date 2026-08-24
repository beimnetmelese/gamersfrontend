import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Wallet, ArrowRight, X } from 'lucide-react';

interface InsufficientFundsModalProps {
  entryFee: number;
  walletBalance: number;
  onClose: () => void;
  onGoToWallet: () => void;
}

export const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  entryFee,
  walletBalance,
  onClose,
  onGoToWallet,
}) => {
  const shortfall = Math.max(0, entryFee - walletBalance);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel max-w-md w-full p-6 space-y-6 border border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 my-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Insufficient Money</h3>
            <p className="text-xs text-rose-300/90 font-medium mt-0.5">You don't have enough money in your wallet!</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Required Entry Fee:</span>
            <span className="text-rose-400 font-bold text-sm">{entryFee.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Your Current Balance:</span>
            <span className="text-cyan-300 font-bold text-sm">{walletBalance.toLocaleString()} ETB</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-rose-300">
            <span>Shortfall:</span>
            <span className="text-amber-400 font-black text-sm">+{shortfall.toLocaleString()} ETB Needed</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToWallet();
            }}
            className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Wallet className="w-4 h-4 fill-slate-950" />
            Go to Wallet <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
