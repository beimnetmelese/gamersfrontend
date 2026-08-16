import React from 'react';
import { IconTarget } from '../Icons';

interface SecretNumberProps {
  selectedNumber: number | null;
  onSelectNumber: (num: number) => void;
}

export const SecretNumberInput: React.FC<SecretNumberProps> = ({
  selectedNumber,
  onSelectNumber,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <IconTarget className="w-5 h-5 text-emerald-400" />
          Guess the Secret Target Number
        </h4>
        <p className="text-xs text-slate-400">
          The backend generated a hidden target number. The guess closest to the target wins!
        </p>
      </div>

      <div className="glass-card p-6 border border-emerald-500/20 text-center space-y-4">
        <div className="text-4xl font-bold font-mono text-emerald-400">
          {selectedNumber ?? 250}
        </div>
        <input
          type="range"
          min="1"
          max="500"
          value={selectedNumber ?? 250}
          onChange={(e) => onSelectNumber(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
        <div className="flex justify-between text-xs text-slate-500 font-mono">
          <span>1</span>
          <span>250</span>
          <span>500</span>
        </div>
      </div>
    </div>
  );
};
