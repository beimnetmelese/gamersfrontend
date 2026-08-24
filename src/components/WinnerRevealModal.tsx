import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X, PartyPopper } from 'lucide-react';
import type { Game } from '../types';

interface WinnerRevealModalProps {
  game: Game;
  winnerName: string;
  winningValue?: string;
  details?: string;
  onClose: () => void;
}

export const WinnerRevealModal: React.FC<WinnerRevealModalProps> = ({
  game,
  winnerName,
  winningValue,
  details,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 2 }}
          className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto glass-panel bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/30 my-auto"
        >
          {/* Confetti Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/50 my-2"
          >
            <Trophy className="w-10 h-10 stroke-[2.5]" />
          </motion.div>

          <div className="space-y-2 mt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
              <PartyPopper className="w-4 h-4 text-amber-400" /> Backend Resolution Completed
            </span>
            <h2 className="text-3xl font-black text-white">
              Official Winner Declared!
            </h2>
            <p className="text-xs text-slate-400">
              Game: <span className="text-slate-200 font-semibold">{game.title}</span>
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="my-6 p-4 bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/40 rounded-2xl space-y-2"
          >
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              🏆 Champion
            </div>
            <div className="text-2xl font-black text-white font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {winnerName}
            </div>
            {winningValue && (
              <div className="text-xs text-amber-200 bg-amber-500/20 px-3 py-1 rounded-full inline-block border border-amber-400/30 font-mono">
                Winning Entry: <strong>{winningValue}</strong>
              </div>
            )}
          </motion.div>

          {/* Prize Summary */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left text-xs mb-6">
            <img
              src={game.product.imageUrl}
              alt={game.product.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{game.product.title}</div>
              <div className="text-slate-400 text-[11px]">Value: {game.product.estimatedValue.toLocaleString()} ETB</div>
            </div>
          </div>

          {details && (
            <p className="text-xs text-slate-400 mb-6 italic">
              "{details}"
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 transition-all text-sm uppercase tracking-wider"
          >
            Acknowledge & Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
