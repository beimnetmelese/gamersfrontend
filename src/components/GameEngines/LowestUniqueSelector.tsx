import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Sparkles } from 'lucide-react';

interface LowestUniqueProps {
  selectedNumber: number | null;
  onSelectNumber: (num: number) => void;
  mySubmittedNumbers?: number[];
}

export const LowestUniqueSelector: React.FC<LowestUniqueProps> = ({
  selectedNumber,
  onSelectNumber,
  mySubmittedNumbers = []
}) => {
  const isAlreadySubmitted = selectedNumber !== null && mySubmittedNumbers.includes(selectedNumber);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-400" />
          Choose Your Unique Number
        </h4>
        <p className="text-xs text-slate-400">
          Pick a positive integer between 1 and 100. If anyone else chooses the same number, you are both eliminated!
        </p>
      </div>

      <div className="glass-card p-6 border border-purple-500/20 text-center space-y-4 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Hash className="w-32 h-32 text-purple-400" />
        </div>

        <label className="text-xs text-purple-300 uppercase tracking-wider font-semibold block">
          Enter Target Number (1 - 100)
        </label>
        
        <div className="flex justify-center items-center gap-4">
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type="number"
            min="1"
            max="100"
            value={selectedNumber ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectNumber(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className={`w-36 h-16 bg-slate-950 border-2 rounded-2xl text-center text-3xl font-bold font-mono focus:outline-none shadow-inner ${
              isAlreadySubmitted ? 'border-rose-500 text-rose-300' : 'border-purple-500/50 text-purple-300 focus:border-purple-400'
            }`}
            placeholder="?"
          />
        </div>

        {isAlreadySubmitted && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-bold flex items-center justify-center gap-2">
            ⚠️ You already submitted number #{selectedNumber}! Please choose a different number.
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <span className="text-xs text-slate-400 self-center mr-1">Popular Quick Picks:</span>
          {[1, 3, 7, 13, 29, 42].map((num) => {
            const submitted = mySubmittedNumbers.includes(num);
            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelectNumber(num)}
                className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                  submitted
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 font-bold'
                    : selectedNumber === num
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/40'
                    : 'bg-slate-800/80 hover:bg-purple-950/60 border-slate-700 text-slate-300'
                }`}
              >
                {submitted ? `🔒 #${num}` : `#${num}`}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl flex items-center gap-3 text-xs text-purple-300">
        <Sparkles className="w-5 h-5 flex-shrink-0 text-purple-400" />
        <span><strong>Pro Strategy:</strong> The lowest unique integer wins. Balance going low with avoiding common choices like 1 or 7!</span>
      </div>
    </div>
  );
};
