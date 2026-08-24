import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, Laptop, Gamepad2, Tv, Shirt, Home as HomeIcon, Car, Package, Grid
} from 'lucide-react';
import type { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { MOCK_CATEGORIES } from '../services/api';

interface CategoryPageProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Phones: <Smartphone className="w-6 h-6 text-cyan-400" />,
  Laptops: <Laptop className="w-6 h-6 text-purple-400" />,
  Gaming: <Gamepad2 className="w-6 h-6 text-rose-400" />,
  Electronics: <Tv className="w-6 h-6 text-emerald-400" />,
  Fashion: <Shirt className="w-6 h-6 text-amber-400" />,
  Home: <HomeIcon className="w-6 h-6 text-blue-400" />,
  Vehicles: <Car className="w-6 h-6 text-orange-400" />,
  Other: <Package className="w-6 h-6 text-slate-400" />,
};

export const CategoryPage: React.FC<CategoryPageProps> = ({
  games,
  onSelectGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredGames = selectedCategory === 'ALL'
    ? games
    : games.filter(g => g.product.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-8 py-6 animate-fadeIn">
      
      {/* Category Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Grid className="w-7 h-7 text-cyan-400" /> Browse by Category
        </h1>
        <p className="text-xs text-slate-400">Discover live game challenges grouped by product category</p>
      </div>

      {/* Visual Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory('ALL')}
          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
            selectedCategory === 'ALL'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-lg shadow-cyan-500/30'
              : 'glass-card bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          <Grid className="w-6 h-6" />
          <span className="text-xs font-bold">All Categories</span>
        </motion.button>

        {MOCK_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.name;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-white font-bold shadow-lg shadow-cyan-500/30'
                  : 'glass-card bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {CATEGORY_ICONS[cat.name] || <Package className="w-6 h-6" />}
              <span className="text-xs font-bold truncate">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Games List for Selected Category */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center justify-between">
          <span>{selectedCategory === 'ALL' ? 'All Active Games' : `${selectedCategory} Games`}</span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
            {filteredGames.length} Available
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={() => onSelectGame(game)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
