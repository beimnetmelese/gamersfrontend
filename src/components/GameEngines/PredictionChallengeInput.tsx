import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles, TrendingUp } from 'lucide-react';

interface PredictionProps {
  questionPrompt?: string;
  predictionAnswer: number | null;
  onSelectPrediction: (val: number) => void;
}

export const PredictionChallengeInput: React.FC<PredictionProps> = ({
  questionPrompt,
  predictionAnswer,
  onSelectPrediction,
}) => {
  const prompt = questionPrompt || "What will be the official 24k Gold price per gram in ETB at market close today?";

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Prediction Challenge
        </h4>
        <p className="text-xs text-slate-400">
          Predict the exact numerical outcome. The participant with the prediction closest to the official final result wins!
        </p>
      </div>

      <div className="glass-card p-6 border border-blue-500/20 space-y-4 rounded-xl relative overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 rounded-xl border border-blue-800/40 text-xs text-blue-200 shadow-md">
          <div className="flex items-center gap-2 font-bold text-blue-400 uppercase tracking-wider text-[11px] mb-1">
            <HelpCircle className="w-4 h-4 text-blue-400" /> Official Challenge Question
          </div>
          <p className="text-sm font-semibold text-white">{prompt}</p>
        </div>

        <div>
          <label className="text-xs text-slate-400 block font-semibold mb-1">Your Numerical Prediction:</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            step="0.01"
            value={predictionAnswer ?? ''}
            onChange={(e) => onSelectPrediction(parseFloat(e.target.value) || 0)}
            className="w-full h-14 bg-slate-950 border-2 border-blue-500/50 rounded-xl px-4 text-2xl font-bold font-mono text-blue-300 focus:outline-none focus:border-blue-400 shadow-inner"
            placeholder="e.g. 5420.50"
          />
        </div>
      </div>

      <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-center gap-3 text-xs text-blue-300">
        <Sparkles className="w-4 h-4 flex-shrink-0 text-blue-400" />
        <span>Submissions are locked once the game period expires. Verified by backend resolution.</span>
      </div>
    </div>
  );
};
