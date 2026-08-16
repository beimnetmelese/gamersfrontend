import React, { useState } from 'react';
import type { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { IconSearch, IconSparkles, IconTrophy } from '../components/Icons';

interface MarketplacePageProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  games,
  onSelectGame,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const categories = ['ALL', 'Gaming Consoles', 'Smartphones', 'Laptops', 'Audio'];
  const gameTypes = [
    { key: 'ALL', label: 'All Game Types' },
    { key: 'TREASURE_BOX', label: 'Treasure Box' },
    { key: 'LOWEST_UNIQUE', label: 'Lowest Unique' },
    { key: 'HIGHEST_CARD', label: 'Highest Card' },
    { key: 'SECRET_NUMBER', label: 'Secret Number' },
    { key: 'PREDICTION', label: 'Prediction' },
    { key: 'PRECISION_TIMER', label: 'Precision Timer' },
  ];

  const filteredGames = games.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || g.product.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || g.gameType === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-300">
            <IconSparkles className="w-4 h-4 text-cyan-400" />
            Product Competition Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Win Premium Products For <span className="text-gradient">Fractional Entry Fees</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select a verified seller competition, choose your strategy across 6 unique backend-certified game types, and win iPhones, PlayStations, and MacBooks!
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search games or products..."
            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Game Type Filter Dropdown */}
        <div className="w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
          >
            {gameTypes.map((gt) => (
              <option key={gt.key} value={gt.key}>{gt.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <IconTrophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No active competitions found</h3>
          <p className="text-xs text-slate-500">Try adjusting your category or game type filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onSelectGame={onSelectGame} />
          ))}
        </div>
      )}

    </div>
  );
};
