import React from 'react';
import type { Game } from '../types';
import { IconBox, IconKey, IconCard, IconTarget, IconTimer, IconSparkles, IconUser, IconClock } from './Icons';

interface GameCardProps {
  game: Game;
  onSelectGame: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'TREASURE_BOX': return <IconBox className="w-4 h-4 text-cyan-400" />;
      case 'LOWEST_UNIQUE': return <IconKey className="w-4 h-4 text-purple-400" />;
      case 'HIGHEST_CARD': return <IconCard className="w-4 h-4 text-amber-400" />;
      case 'SECRET_NUMBER': return <IconTarget className="w-4 h-4 text-emerald-400" />;
      case 'PREDICTION': return <IconSparkles className="w-4 h-4 text-blue-400" />;
      case 'PRECISION_TIMER': return <IconTimer className="w-4 h-4 text-rose-400" />;
      default: return <IconBox className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case 'TREASURE_BOX': return 'Treasure Box';
      case 'LOWEST_UNIQUE': return 'Lowest Unique';
      case 'HIGHEST_CARD': return 'Highest Card';
      case 'SECRET_NUMBER': return 'Secret Number';
      case 'PREDICTION': return 'Prediction';
      case 'PRECISION_TIMER': return 'Precision Timer';
      default: return type;
    }
  };

  const progressPercent = Math.round((game.participantsCount / game.maxParticipants) * 100);

  return (
    <div className="glass-card overflow-hidden flex flex-col justify-between group">
      {/* Top Image Preview & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={game.product.imageUrl}
          alt={game.product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge-pill bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-cyan-300 flex items-center gap-1.5">
            {getGameTypeIcon(game.gameType)}
            {getGameTypeLabel(game.gameType)}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="badge-pill bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-mono">
            {game.entryFee} ETB
          </span>
        </div>

        {/* Product Estimated Value */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium truncate max-w-[60%]">
            Seller: <strong className="text-white">{game.sellerName}</strong>
          </span>
          <span className="text-amber-400 font-mono bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
            Val: {game.product.estimatedValue.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {game.product.description}
          </p>
        </div>

        {/* Participant Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <IconUser className="w-3.5 h-3.5 text-slate-500" />
              Participants
            </span>
            <span className="text-cyan-300 font-bold">
              {game.participantsCount} / {game.maxParticipants} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <IconClock className="w-3.5 h-3.5 text-slate-500" />
            <span>2h left</span>
          </div>

          <button
            onClick={() => onSelectGame(game)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 transition-all transform hover:scale-105"
          >
            Enter Competition →
          </button>
        </div>
      </div>
    </div>
  );
};
