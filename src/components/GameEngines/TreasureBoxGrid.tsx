import React from 'react';
import { IconBox, IconCheck, IconLock } from '../Icons';

interface TreasureBoxGridProps {
  totalBoxes?: number;
  selectedBox?: number | null;
  onSelectBox: (boxNum: number) => void;
}

export const TreasureBoxGrid: React.FC<TreasureBoxGridProps> = ({
  totalBoxes = 100,
  selectedBox,
  onSelectBox,
}) => {
  // Simulate some taken boxes for realism
  const takenBoxes = [3, 7, 14, 22, 29, 36, 44, 58, 67, 81, 95];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <IconBox className="w-5 h-5 text-cyan-400" />
            Select Your Treasure Box
          </h4>
          <p className="text-xs text-slate-400">
            Pick 1 available box. The winning box is chosen strictly from selected boxes!
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block"></span> Available
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-3 h-3 rounded-sm bg-rose-950/60 border border-rose-800/40 inline-block"></span> Taken
          </span>
          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block"></span> Selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 max-h-72 overflow-y-auto p-3 glass-card border border-slate-800/60 rounded-xl">
        {Array.from({ length: totalBoxes }, (_, i) => i + 1).map((boxNum) => {
          const isTaken = takenBoxes.includes(boxNum);
          const isSelected = selectedBox === boxNum;

          return (
            <button
              key={boxNum}
              disabled={isTaken}
              onClick={() => onSelectBox(boxNum)}
              className={`
                h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all relative
                ${isSelected 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40 scale-105 border-2 border-white' 
                  : isTaken
                    ? 'bg-rose-950/30 text-rose-500/40 border border-rose-900/30 cursor-not-allowed'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700/60'
                }
              `}
            >
              {isSelected ? (
                <IconCheck className="w-4 h-4 text-white" />
              ) : isTaken ? (
                <IconLock className="w-3.5 h-3.5" />
              ) : (
                boxNum
              )}
            </button>
          );
        })}
      </div>

      {selectedBox && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex items-center justify-between text-sm text-cyan-300">
          <span>Your Chosen Box: <strong>#{selectedBox}</strong></span>
          <span className="text-xs bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-400/30">Ready to submit</span>
        </div>
      )}
    </div>
  );
};
