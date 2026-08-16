import React from 'react';
import { IconSparkles } from '../Icons';

interface PredictionProps {
  predictionAnswer: number | null;
  onSelectPrediction: (val: number) => void;
}

export const PredictionChallengeInput: React.FC<PredictionProps> = ({
  predictionAnswer,
  onSelectPrediction,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <IconSparkles className="w-5 h-5 text-blue-400" />
          Prediction Challenge
        </h4>
        <p className="text-xs text-slate-400">
          Predict the measurable outcome. The prediction closest to the official final result wins!
        </p>
      </div>

      <div className="glass-card p-6 border border-blue-500/20 space-y-3">
        <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-800/40 text-xs text-blue-200">
          ❓ <strong>Challenge Question:</strong> "What will be the total number of goals scored across all English Premier League matches this weekend?"
        </div>

        <label className="text-xs text-slate-400 block font-semibold">Your Numeric Prediction:</label>
        <input
          type="number"
          step="0.1"
          value={predictionAnswer ?? ''}
          onChange={(e) => onSelectPrediction(parseFloat(e.target.value) || 0)}
          className="w-full h-12 bg-slate-900 border border-slate-700 rounded-lg px-4 text-lg font-bold font-mono text-blue-300 focus:outline-none focus:border-blue-400"
          placeholder="e.g. 28"
        />
      </div>
    </div>
  );
};
