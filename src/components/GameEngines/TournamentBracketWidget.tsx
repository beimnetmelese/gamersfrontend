import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TournamentBracketWidgetProps {
  selectedSlot?: number | null;
  onSelectSlot: (slot: number) => void;
  bracketData?: any;
}

export const TournamentBracketWidget: React.FC<TournamentBracketWidgetProps> = ({
  selectedSlot,
  onSelectSlot,
  bracketData
}) => {
  const defaultSlots = [
    { slot: 1, name: 'User_Abebe (Seeded #1)', status: 'Quarterfinals' },
    { slot: 2, name: 'User_Kebede', status: 'Quarterfinals' },
    { slot: 3, name: 'User_Tigist', status: 'Quarterfinals' },
    { slot: 4, name: 'User_Dawit', status: 'Quarterfinals' },
    { slot: 5, name: 'User_Sami', status: 'Quarterfinals' },
    { slot: 6, name: 'User_Beti', status: 'Quarterfinals' },
    { slot: 7, name: 'Open Bracket Slot #7', status: 'Available' },
    { slot: 8, name: 'Open Bracket Slot #8', status: 'Available' },
  ];

  const sfText1 = bracketData?.semiFinals?.[0] ? `${bracketData.semiFinals[0].p1} vs ${bracketData.semiFinals[0].p2}` : 'Winner Match #1 vs Match #2';
  const sfText2 = bracketData?.semiFinals?.[1] ? `${bracketData.semiFinals[1].p1} vs ${bracketData.semiFinals[1].p2}` : 'Winner Match #3 vs Match #4';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Single Elimination Tournament Bracket
          </h4>
          <p className="text-xs text-slate-400">
            8-Player Bracket Tournament. Pick your starting slot to enter the tournament!
          </p>
        </div>
        <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full font-mono font-semibold">
          Round 1 / 3
        </span>
      </div>

      {/* Bracket Tree Visualizer */}
      <div className="glass-card p-5 border border-slate-800/80 rounded-2xl overflow-x-auto">
        <div className="min-w-[650px] grid grid-cols-3 gap-6 items-center">
          
          {/* Quarterfinals */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Quarterfinals (8)
            </div>
            {defaultSlots.map((item) => {
              const isSelected = selectedSlot === item.slot;
              return (
                <motion.button
                  key={item.slot}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSelectSlot(item.slot)}
                  className={`
                    w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all
                    ${isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-500/30'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }
                  `}
                >
                  <span className="truncate flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-amber-400 font-mono text-[10px] flex items-center justify-center font-bold">
                      #{item.slot}
                    </span>
                    {item.name}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Semifinals */}
          <div className="space-y-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> Semifinals (4)
            </div>
            {[sfText1, sfText2].map((sf, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>{sf}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </div>
            ))}
          </div>

          {/* Championship Finals */}
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" /> Grand Finals (2)
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-950/40 to-slate-900 border-2 border-amber-500/40 rounded-2xl text-center space-y-2">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <div className="text-xs font-bold text-amber-300 uppercase">Championship Match</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {bracketData?.finals?.[0] ? `${bracketData.finals[0].p1} vs ${bracketData.finals[0].p2}` : 'TBD vs TBD'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
