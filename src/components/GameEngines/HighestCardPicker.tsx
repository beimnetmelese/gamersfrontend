import React from 'react';
import { IconCard } from '../Icons';

interface HighestCardProps {
  selectedCard: string | null;
  onSelectCard: (card: string) => void;
}

const CARDS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const HighestCardPicker: React.FC<HighestCardProps> = ({
  selectedCard,
  onSelectCard,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <IconCard className="w-5 h-5 text-amber-400" />
          Select Your Playing Card
        </h4>
        <p className="text-xs text-slate-400">
          Duplicate card choices are eliminated. The highest remaining unique card wins! (Ace is highest).
        </p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
        {CARDS.map((card) => {
          const isSelected = selectedCard === card;
          return (
            <button
              key={card}
              onClick={() => onSelectCard(card)}
              className={`
                h-20 rounded-xl flex flex-col items-center justify-between p-2 font-bold font-mono transition-all border
                ${isSelected
                  ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-slate-950 border-2 border-white shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                }
              `}
            >
              <span className="text-xs self-start">♠</span>
              <span className="text-xl font-black">{card}</span>
              <span className="text-xs self-end">♠</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
