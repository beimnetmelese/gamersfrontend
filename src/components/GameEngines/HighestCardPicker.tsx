import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

interface HighestCardProps {
  selectedCard: string | null;
  onSelectCard: (card: string) => void;
  mySubmittedCards?: string[];
}

const CARDS = [
  { rank: 'A', label: 'Ace of Spades', suit: '♠', color: 'text-amber-400' },
  { rank: 'K', label: 'King of Hearts', suit: '♥', color: 'text-rose-400' },
  { rank: 'Q', label: 'Queen of Diamonds', suit: '♦', color: 'text-amber-400' },
  { rank: 'J', label: 'Jack of Clubs', suit: '♣', color: 'text-emerald-400' },
  { rank: '10', label: 'Ten of Spades', suit: '♠', color: 'text-amber-400' },
  { rank: '9', label: 'Nine of Hearts', suit: '♥', color: 'text-rose-400' },
  { rank: '8', label: 'Eight of Diamonds', suit: '♦', color: 'text-amber-400' },
  { rank: '7', label: 'Seven of Clubs', suit: '♣', color: 'text-emerald-400' },
  { rank: '6', label: 'Six of Spades', suit: '♠', color: 'text-amber-400' },
  { rank: '5', label: 'Five of Hearts', suit: '♥', color: 'text-rose-400' },
  { rank: '4', label: 'Four of Diamonds', suit: '♦', color: 'text-amber-400' },
  { rank: '3', label: 'Three of Clubs', suit: '♣', color: 'text-emerald-400' },
  { rank: '2', label: 'Two of Spades', suit: '♠', color: 'text-amber-400' },
];

export const HighestCardPicker: React.FC<HighestCardProps> = ({
  selectedCard,
  onSelectCard,
  mySubmittedCards = []
}) => {
  const isAlreadySubmitted = selectedCard !== null && mySubmittedCards.includes(selectedCard);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          Select Your Playing Card
        </h4>
        <p className="text-xs text-slate-400">
          Duplicate cards selected by multiple users are eliminated. The highest remaining unique card rank wins! (Ace is highest).
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {CARDS.map((c) => {
          const isSelected = selectedCard === c.rank;
          const isSubmitted = mySubmittedCards.includes(c.rank);
          return (
            <motion.button
              key={c.rank}
              whileHover={{ scale: 1.08, rotateY: 10, translateY: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCard(c.rank)}
              className={`
                h-24 rounded-xl flex flex-col items-center justify-between p-2 font-bold font-mono transition-all border relative overflow-hidden
                ${isSubmitted
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-inner'
                  : isSelected
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 text-slate-950 border-2 border-white shadow-xl shadow-amber-500/40 ring-4 ring-amber-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow-md'
                }
              `}
            >
              <span className={`text-xs self-start ${isSubmitted ? 'text-cyan-400' : isSelected ? 'text-slate-950 font-black' : c.color}`}>{c.suit}</span>
              <span className={`text-2xl font-black ${isSubmitted ? 'text-cyan-300' : isSelected ? 'text-slate-950' : 'text-slate-100'}`}>
                {c.rank}
              </span>
              {isSubmitted && (
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/90 px-1 py-0.2 rounded border border-cyan-500/40">
                  🔒 SUBMITTED
                </span>
              )}
              {!isSubmitted && (
                <span className={`text-xs self-end ${isSelected ? 'text-slate-950 font-black' : c.color}`}>{c.suit}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {isAlreadySubmitted && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-bold flex items-center justify-center gap-2">
          ⚠️ You already submitted Card {selectedCard}! Please pick a different card.
        </div>
      )}

      {selectedCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300"
        >
          <span>Selected Card: <strong className="text-white text-sm font-mono">{selectedCard}</strong></span>
          <span className="bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30 text-amber-200">Card Locked</span>
        </motion.div>
      )}
    </div>
  );
};
