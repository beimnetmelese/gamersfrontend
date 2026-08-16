import React from 'react';
import type { Game } from '../types';
import { IconShield, IconCheck } from './Icons';

interface GameRulesModalProps {
  game: Game;
  onClose: () => void;
  onConfirmJoin: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({
  game,
  onClose,
  onConfirmJoin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel max-w-xl w-full p-6 space-y-6 border border-cyan-500/30 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 rounded-xl border border-cyan-500/30">
              <IconShield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-100">{game.title}</h3>
              <p className="text-xs text-cyan-400 font-mono uppercase">Official Game Rules & Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        {/* Rules Overview */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider">📜 How the Winner is Determined:</h4>
            <p className="text-xs leading-relaxed text-slate-300">
              {game.rulesDescription}
            </p>
          </div>

          {/* Key Parameters Matrix */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Entry Fee:</span>
              <strong className="text-emerald-400 font-mono text-base">{game.entryFee} ETB</strong>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Max Participants:</span>
              <strong className="text-cyan-300 font-mono text-base">{game.maxParticipants} players</strong>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Refund Guarantee:</span>
              <span className="text-amber-400 font-semibold">100% Refund if rule tie</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Winner Calculation:</span>
              <span className="text-purple-300 font-semibold">Backend Deterministic</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmJoin}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2"
          >
            <IconCheck className="w-4 h-4" />
            I Agree & Continue to Play
          </button>
        </div>

      </div>
    </div>
  );
};
