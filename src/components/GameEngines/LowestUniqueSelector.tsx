import React from 'react';
import { IconKey, IconSparkles } from '../Icons';

interface LowestUniqueProps {
  selectedNumber: number | null;
  onSelectNumber: (num: number) => void;
}

export const LowestUniqueSelector: React.FC<LowestUniqueProps> = ({
  selectedNumber,
  onSelectNumber
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <IconKey className="w-5 h-5 text-purple-400" />
          Choose Your Unique Number
        </h4>
        <p className="text-xs text-slate-400">
          Pick a number from 1 to 100. If anyone else picks the same number, both are eliminated!
        </p>
      </div>

      <div className="glass-card p-6 border border-purple-500/20 text-center space-y-4">
        <label className="text-xs text-purple-300 uppercase tracking-wider font-semibold block">
          Enter Your Chosen Number
        </label>
        
        <div className="flex justify-center items-center gap-4">
          <input
            type="number"
            min="1"
            max="100"
            value={selectedNumber ?? ''}
            onChange={(e) => onSelectNumber(parseInt(e.target.value) || 1)}
            className="w-32 h-16 bg-slate-900 border-2 border-purple-500/50 rounded-xl text-center text-3xl font-bold font-mono text-purple-300 focus:outline-none focus:border-purple-400"
            placeholder="?"
          />
        </div>

        <div className="flex justify-center gap-2">
          {[1, 7, 13, 21, 42, 77].map((num) => (
            <button
              key={num}
              onClick={() => onSelectNumber(num)}
              className="px-3 py-1 bg-slate-800 hover:bg-purple-950/60 text-xs font-mono rounded-lg border border-slate-700 text-slate-300"
            >
              #{num}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-lg flex items-center gap-3 text-xs text-purple-300">
        <IconSparkles className="w-5 h-5 flex-shrink-0" />
        <span>Strategy Tip: Choosing a slightly non-obvious small number increases your chances of being the only one!</span>
      </div>
    </div>
  );
};
