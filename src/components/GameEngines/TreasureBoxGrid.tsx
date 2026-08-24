import React from 'react';
import { motion } from 'framer-motion';
import { Package, Lock } from 'lucide-react';

interface TreasureBoxGridProps {
  totalBoxes?: number;
  occupiedBoxes?: number[];
  selectedBox?: number | null;
  mySubmittedBoxes?: number[];
  isGameEnded?: boolean;
  onSelectBox: (boxNum: number) => void;
}

export const TreasureBoxGrid: React.FC<TreasureBoxGridProps> = ({
  totalBoxes = 100,
  occupiedBoxes = [],
  selectedBox,
  mySubmittedBoxes = [],
  isGameEnded = false,
  onSelectBox,
}) => {
  // Ensure count is at least 1 and matches totalBoxes dynamically
  const boxCount = Math.max(1, totalBoxes);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Select Your Treasure Box (1 to #{boxCount})
          </h4>
          <p className="text-xs text-slate-400">
            {isGameEnded
              ? 'This competition has ended. Bids can no longer be submitted.'
              : 'Pick an available box. You can submit multiple bids across different boxes!'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-3 h-3 rounded-sm bg-rose-950/60 border border-rose-800/40 inline-block"></span> Taken
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Lock className="w-3.5 h-3.5 text-cyan-400 inline-block" /> Your Box (Blue Lock)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-96 overflow-y-auto p-3 glass-card border border-slate-800/60 rounded-xl">
        {Array.from({ length: boxCount }, (_, i) => i + 1).map((boxNum) => {
          const isMySubmitted = mySubmittedBoxes.includes(boxNum);
          const isCurrentlySelected = selectedBox === boxNum;
          const isMyBox = isMySubmitted || isCurrentlySelected;
          const isOccupiedByOthers = occupiedBoxes.includes(boxNum) && !isMyBox;
          const isDisabled = isMySubmitted || isOccupiedByOthers || isGameEnded;

          return (
            <motion.button
              key={boxNum}
              whileHover={!isDisabled ? { scale: 1.1, translateY: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              disabled={isDisabled}
              onClick={() => onSelectBox(boxNum)}
              className={`
                h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all relative
                ${isMyBox 
                  ? `bg-gradient-to-br from-cyan-500 via-blue-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/50 border-2 border-cyan-300 ring-2 ring-cyan-400/80 z-10 ${
                      isMySubmitted || isGameEnded ? 'cursor-not-allowed' : 'cursor-pointer'
                    }` 
                  : isOccupiedByOthers || isGameEnded
                    ? 'bg-rose-950/20 text-slate-500 border border-slate-800/60 cursor-not-allowed'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700/60 cursor-pointer'
                }
              `}
            >
              {isMyBox ? (
                <Lock className="w-4 h-4 text-cyan-200 fill-cyan-400/30 animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              ) : isOccupiedByOthers ? (
                <Lock className="w-3.5 h-3.5 text-rose-500/50" />
              ) : (
                boxNum
              )}
            </motion.button>
          );
        })}
      </div>

      {(selectedBox || mySubmittedBoxes.length > 0 || isGameEnded) && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-cyan-300 shadow-lg shadow-cyan-950/30"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>
              {isGameEnded ? (
                <span className="text-rose-400 font-bold">🔒 Competition Ended — Bids are locked.</span>
              ) : selectedBox ? (
                <>New Pick: <strong className="text-white text-base font-mono">#{selectedBox}</strong></>
              ) : (
                <span className="text-slate-300">Pick any available box to submit another bid!</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {mySubmittedBoxes.length > 0 && (
              <span className="text-xs bg-blue-950/80 border border-cyan-500/40 px-3 py-1 rounded-full text-cyan-300 font-mono font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Your Locked ({mySubmittedBoxes.length}): #{mySubmittedBoxes.join(', #')}
              </span>
            )}
            {selectedBox && !isGameEnded && (
              <span className="text-xs bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30 font-semibold text-cyan-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-300" /> Ready to Submit
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
