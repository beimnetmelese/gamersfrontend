import { CountdownTimer } from './CountdownTimer';
import type { Game } from '../types';
import { Package, Key, Layers, Target, TrendingUp, Timer, Swords, Trophy, Users } from 'lucide-react';

export interface GameCardProps {
  game: Game;
  onSelect?: (game: Game) => void;
  onSelectGame?: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, onSelectGame }) => {
  const handleCardClick = () => {
    if (onSelect) onSelect(game);
    else if (onSelectGame) onSelectGame(game);
  };

  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'TREASURE_BOX': return <Package className="w-3.5 h-3.5 text-cyan-400" />;
      case 'LOWEST_UNIQUE': return <Key className="w-3.5 h-3.5 text-purple-400" />;
      case 'HIGHEST_CARD': return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      case 'SECRET_NUMBER': return <Target className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PREDICTION': return <TrendingUp className="w-3.5 h-3.5 text-blue-400" />;
      case 'PRECISION_TIMER': return <Timer className="w-3.5 h-3.5 text-rose-400" />;
      case 'HEAD_TO_HEAD': return <Swords className="w-3.5 h-3.5 text-rose-400" />;
      case 'TOURNAMENT': return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Package className="w-3.5 h-3.5 text-cyan-400" />;
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
      case 'HEAD_TO_HEAD': return '1v1 Duel';
      case 'TOURNAMENT': return 'Tournament';
      default: return type;
    }
  };

  const progressPercent = Math.round((game.participantsCount / game.maxParticipants) * 100);

  const isEnded = (game.status as string) === 'COMPLETED' || (game.status as string) === 'ENDED' || Boolean(game.winnerName);

  return (
    <div className={`glass-card overflow-hidden flex flex-col justify-between group rounded-2xl border transition-all ${
      isEnded ? 'border-amber-500/40 opacity-90' : 'border-slate-800 hover:border-cyan-500/40'
    }`}>
      {/* Top Image Preview & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={game.product.imageUrl}
          alt={game.product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
        
        {/* Top Floating Badges */}
        {Boolean(game.winnerName) && (game.winnerName === 'User_Abebe' || game.winnerName === 'You' || game.winnerName === 'gamer_alex') && (
          <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] py-1 text-center shadow-lg uppercase tracking-wider flex items-center justify-center gap-1 z-20 border-b border-amber-300">
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            🎉 YOU WON THIS PRIZE! 🏆
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[70%]">
          <span className="badge-pill bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-cyan-300 flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            {getGameTypeIcon(game.gameType)}
            {getGameTypeLabel(game.gameType)}
          </span>
          {isEnded && game.participantsCount === 0 ? (
            <span className="badge-pill bg-rose-950/90 border border-rose-600/50 text-rose-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase">
              ❌ No Winner (0 Bids)
            </span>
          ) : Boolean(game.winnerName) ? (
            <span className="badge-pill bg-amber-500/90 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30 uppercase">
              <Trophy className="w-3 h-3 text-slate-950 fill-slate-950" /> Winner: {game.winnerName}
            </span>
          ) : isEnded ? (
            <span className="badge-pill bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase">
              ⏳ Resolving Winner
            </span>
          ) : null}
        </div>

        <div className="absolute top-3 right-3">
          <span className="badge-pill bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
            {game.entryFee} ETB
          </span>
        </div>

        {/* Product Estimated Value */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium truncate max-w-[60%] text-[11px]">
            Seller: <strong className="text-white">{game.sellerName}</strong>
          </span>
          <span className="text-amber-400 font-mono bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-500/30 font-semibold text-[11px]">
            Val: {game.product.estimatedValue.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {game.product.description}
          </p>
        </div>

        {/* Participant Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Users className="w-3 h-3 text-slate-500" />
              Entries
            </span>
            <span className="text-cyan-300 font-bold text-[11px]">
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
          <CountdownTimer
            createdAt={game.createdAt}
            durationMinutes={game.durationMinutes}
            endTime={game.endTime}
            variant="card"
          />

          <button
            onClick={handleCardClick}
            className={`px-3.5 py-1.5 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all transform hover:scale-105 ${
              isEnded
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
            }`}
          >
            {isEnded ? 'VIEW RESULTS →' : 'JOIN GAME →'}
          </button>
        </div>
      </div>
    </div>
  );
};
