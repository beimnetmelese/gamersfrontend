import React, { useState, useEffect } from 'react';
import { CountdownTimer } from '../components/CountdownTimer';
import { motion } from 'framer-motion';
import { 
  Trophy, Flame, Clock, Sparkles, Star, TrendingUp, CheckCircle2, 
  ShieldCheck, Gamepad2
} from 'lucide-react';
import type { Game, WinnerRecord } from '../types';
import { GameCard } from '../components/GameCard';
import { fetchWinnersHistory } from '../services/api';

interface HomePageProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  onNavigateExplore: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  games,
  onSelectGame,
  onNavigateExplore,
}) => {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'featured' | 'live' | 'ending' | 'popular' | 'completed'>('featured');

  useEffect(() => {
    fetchWinnersHistory().then(setWinners);
  }, []);

  const liveGames = games.filter(g => g.status === 'ACTIVE');
  const featuredGames = liveGames.filter(g => g.isFeatured) || liveGames.slice(0, 4);
  const endingSoonGames = [...liveGames].sort((a, b) => a.durationMinutes - b.durationMinutes).slice(0, 4);
  const popularGames = [...liveGames].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 4);
  const completedGames = games.filter(g => g.status === 'COMPLETED');

  const displayedGames = 
    activeCategoryTab === 'featured' ? (featuredGames.length ? featuredGames : liveGames.slice(0, 4)) :
    activeCategoryTab === 'live' ? liveGames :
    activeCategoryTab === 'ending' ? endingSoonGames :
    activeCategoryTab === 'popular' ? popularGames : completedGames;

  return (
    <div className="space-y-12 py-6 animate-fadeIn">

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Next-Gen Fair Bidding & Gaming Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Win High-Value Tech with <span className="text-gradient">Skill & Precision</span>
            </h1>
            
            <p className="text-slate-300 text-base leading-relaxed max-w-xl">
              Enter unique game-based bidding challenges. From Treasure Box to Lowest Unique Number and Precision Timers — every winner is determined 100% algorithmically on the backend.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateExplore}
                className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/30 transition-all flex items-center gap-2 text-sm"
              >
                <Gamepad2 className="w-5 h-5" /> EXPLORE LIVE GAMES
              </button>
              <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Provably Fair
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" /> Instant Winner Payouts
                </span>
              </div>
            </div>
          </div>

          {/* Hero Feature Showcase Card */}
          <div className="lg:col-span-5">
            {liveGames[0] && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6 border-2 border-cyan-500/40 rounded-2xl shadow-2xl relative bg-slate-900/90"
              >
                <div className="absolute top-4 right-4 bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse">
                  <Flame className="w-3 h-3 fill-white" /> HOT SPOTLIGHT
                </div>
                
                <img
                  src={liveGames[0]?.product?.imageUrl || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80'}
                  alt={liveGames[0]?.title || 'Featured Game'}
                  className="w-full h-52 object-cover rounded-xl border border-slate-800 mb-4"
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-cyan-400 font-semibold font-mono">{(liveGames[0]?.gameType || 'TREASURE_BOX').replace(/_/g, ' ')}</div>
                    <CountdownTimer
                      createdAt={liveGames[0]?.createdAt}
                      durationMinutes={liveGames[0]?.durationMinutes}
                      endTime={liveGames[0]?.endTime}
                      variant="badge"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white line-clamp-1">{liveGames[0]?.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Entry Fee: <strong className="text-white font-mono">{liveGames[0]?.entryFee} ETB</strong></span>
                    <button
                      onClick={() => onSelectGame(liveGames[0])}
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all"
                    >
                      Join Challenge →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Discovery Tabs Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-cyan-400" /> Game Discovery
            </h2>
            <p className="text-xs text-slate-400">Filter through active and upcoming live game challenges</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: 'featured', label: '⭐ Featured', icon: Star },
              { id: 'live', label: '🔴 Live Now', icon: Flame },
              { id: 'ending', label: '⏳ Ending Soon', icon: Clock },
              { id: 'popular', label: '🔥 Popular', icon: TrendingUp },
              { id: 'completed', label: '🏆 Completed', icon: Trophy }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeCategoryTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={() => onSelectGame(game)}
            />
          ))}
        </div>
      </section>

      {/* Winners Section */}
      <section className="glass-panel p-8 border border-amber-500/30 rounded-3xl space-y-6 bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Winners Hall of Fame
            </h2>
            <p className="text-xs text-slate-400">Recent winners calculated live by the backend resolution engine</p>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full font-mono font-semibold">
            Live Winner Feed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {winners.map((w: WinnerRecord) => (
            <motion.div
              key={w.id}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-4 border border-amber-500/20 rounded-2xl flex items-center gap-4 bg-slate-900/80"
            >
              <img
                src={w.productImage}
                alt={w.productTitle}
                className="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {w.winnerName}
                </div>
                <div className="text-sm font-bold text-white truncate">{w.productTitle}</div>
                <div className="text-[11px] text-slate-400 font-mono">Winning Selection: <strong className="text-amber-300">{w.winningValue}</strong></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};
