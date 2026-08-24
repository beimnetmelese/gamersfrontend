import React from 'react';
import { motion } from 'framer-motion';
import { Swords, UserCheck, ShieldCheck, Zap } from 'lucide-react';

interface HeadToHeadWidgetProps {
  selectedChoice: string | null;
  onSelectChoice: (choice: string) => void;
}

export const HeadToHeadWidget: React.FC<HeadToHeadWidgetProps> = ({
  selectedChoice,
  onSelectChoice,
}) => {
  const CHOICES = [
    { id: 'RED_DUELIST', name: 'Crimson Duelist', color: 'from-rose-600 to-red-800', border: 'border-rose-500', text: 'text-rose-400' },
    { id: 'BLUE_DUELIST', name: 'Azure Guardian', color: 'from-cyan-600 to-blue-800', border: 'border-cyan-500', text: 'text-cyan-400' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Swords className="w-5 h-5 text-rose-400" />
          Head-to-Head 1v1 Battle
        </h4>
        <p className="text-xs text-slate-400">
          Direct 1-on-1 matchup! Select your contender to back in this head-to-head duel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHOICES.map((c) => {
          const isSelected = selectedChoice === c.id;
          return (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectChoice(c.id)}
              className={`
                glass-card p-5 border-2 rounded-2xl cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-44
                ${isSelected
                  ? `bg-slate-900 border-2 ${c.border} shadow-xl ring-4 ring-slate-800`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono uppercase tracking-wider ${c.text} flex items-center gap-1`}>
                  <Zap className="w-3.5 h-3.5" /> Contender
                </span>
                {isSelected && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>

              <div className="my-2">
                <div className="text-xl font-black text-white">{c.name}</div>
                <div className="text-xs text-slate-400">1v1 Combatant #1</div>
              </div>

              <div className={`w-full py-2 bg-gradient-to-r ${c.color} rounded-xl text-center text-xs font-bold text-white shadow-md`}>
                {isSelected ? '✓ BACKED FOR VICTORY' : 'SELECT CONTENDER'}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl flex items-center gap-3 text-xs text-rose-300">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-rose-400" />
        <span>Winner is resolved instantly when the match countdown timer reaches zero.</span>
      </div>
    </div>
  );
};
