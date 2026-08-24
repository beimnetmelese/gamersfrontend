import React from 'react';
import { motion } from 'framer-motion';
import { Target, HelpCircle, ShieldAlert } from 'lucide-react';

interface SecretNumberProps {
  selectedNumber: number | null;
  onSelectNumber: (num: number) => void;
  mySubmittedNumbers?: number[];
}

export const SecretNumberInput: React.FC<SecretNumberProps> = ({
  selectedNumber,
  onSelectNumber,
  mySubmittedNumbers = []
}) => {
  const value = selectedNumber ?? 250;
  const isAlreadySubmitted = selectedNumber !== null && mySubmittedNumbers.includes(selectedNumber);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          Guess the Secret Target Number
        </h4>
        <p className="text-xs text-slate-400">
          The backend generated a hidden target number (1 - 500). The player whose guess is closest to the secret target wins!
        </p>
      </div>

      <div className="glass-card p-6 border border-emerald-500/20 text-center space-y-4 rounded-xl relative overflow-hidden">
        <div className="text-xs text-emerald-400 font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" /> Secret Number Target Range: 1 - 500
        </div>

        <motion.div 
          key={value}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`text-5xl font-black font-mono drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
            isAlreadySubmitted ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {value}
        </motion.div>

        {isAlreadySubmitted && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-bold flex items-center justify-center gap-2">
            ⚠️ You already submitted guess #{selectedNumber}! Please choose a different number.
          </div>
        )}

        <div className="px-4">
          <input
            type="range"
            min="1"
            max="500"
            value={value}
            onChange={(e) => onSelectNumber(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-slate-700 shadow-inner"
          />
          <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
            <span>1</span>
            <span>250</span>
            <span>500</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 pt-2">
          {[50, 125, 250, 375, 450].map((num) => {
            const submitted = mySubmittedNumbers.includes(num);
            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectNumber(num)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                  submitted
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 font-bold'
                    : 'bg-slate-800/80 hover:bg-emerald-950/60 border-slate-700 text-slate-300'
                }`}
              >
                {submitted ? `🔒 ${num}` : num}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-emerald-400" />
        <span>Target is securely hashed on the backend. Closest numerical delta wins!</span>
      </div>
    </div>
  );
};
