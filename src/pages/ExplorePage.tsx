import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Package, Loader2, Sparkles } from 'lucide-react';
import type { Game, GameFilterState } from '../types';
import { GameCard } from '../components/GameCard';
import { searchGamesAPI, MOCK_CATEGORIES } from '../services/api';

interface ExplorePageProps {
  onSelectGame: (game: Game) => void;
  games?: Game[];
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onSelectGame, games = [] }) => {
  const [filters, setFilters] = useState<GameFilterState>({
    searchQuery: '',
    category: 'ALL',
    gameType: 'ALL',
    minEntryFee: 0,
    maxEntryFee: 10000,
    status: 'ALL',
    sortBy: 'newest'
  });

  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreBackendPages, setHasMoreBackendPages] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const displayList = gamesList.map(g => {
    const appGame = games.find(ag => ag.id === g.id);
    if (appGame) {
      return {
        ...g,
        participantsCount: Math.max(g.participantsCount || 0, appGame.participantsCount || 0, (appGame.participants || []).length),
        participants: appGame.participants || g.participants
      };
    }
    return g;
  });

  const sortGamesActiveFirst = (games: Game[]) => {
    return [...games].sort((a, b) => {
      const aEnded = (a.status as string) === 'COMPLETED' || (a.status as string) === 'ENDED' || Boolean(a.winnerName);
      const bEnded = (b.status as string) === 'COMPLETED' || (b.status as string) === 'ENDED' || Boolean(b.winnerName);
      if (!aEnded && bEnded) return -1;
      if (aEnded && !bEnded) return 1;
      return 0;
    });
  };

  // Load Page 1 on Filter change
  const loadInitialPage = async () => {
    setIsLoading(true);
    setPage(1);
    const results = await searchGamesAPI(filters, 1);
    
    // Sort so ACTIVE games appear FIRST, and ENDED / COMPLETED games appear AT THE BOTTOM!
    const sorted = sortGamesActiveFirst(results);
    setGamesList(sorted);
    setHasMoreBackendPages(results.length >= 20);
    setIsLoading(false);
  };

  // Load Next Page (Page 2, Page 3, etc.) via Backend HTTP Request on Scroll
  const fetchNextBackendPage = async () => {
    if (isLoadingMore || !hasMoreBackendPages) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    // Sends real backend API request for ?page=2&page_size=20, ?page=3&page_size=20, etc.
    const results = await searchGamesAPI(filters, nextPage);
    
    if (results.length > 0) {
      const sortedNew = sortGamesActiveFirst(results);
      setGamesList(prev => [...prev, ...sortedNew]);
      setPage(nextPage);
      setHasMoreBackendPages(results.length >= 20);
    } else {
      setHasMoreBackendPages(false);
    }
    setIsLoadingMore(false);
  };

  useEffect(() => {
    loadInitialPage();
  }, [filters]);

  // Infinite Scroll Trigger via Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && hasMoreBackendPages) {
          fetchNextBackendPage();
        }
      },
      { rootMargin: '300px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, hasMoreBackendPages, page, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      gameType: 'ALL',
      minEntryFee: 0,
      maxEntryFee: 10000,
      status: 'ALL',
      sortBy: 'newest'
    });
  };

  return (
    <div className="space-y-8 py-6 animate-fadeIn">

      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Search className="w-7 h-7 text-cyan-400" /> Games Marketplace
          </h1>
          <p className="text-xs text-slate-400">Search competitions, game types, sellers, and entry fee ranges</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by game title, product name (e.g. iPhone, PS5, MacBook)..."
              className="w-full h-13 pl-12 pr-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="h-13 px-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="fee_low">Sort: Entry Fee (Low to High)</option>
              <option value="fee_high">Sort: Entry Fee (High to Low)</option>
              <option value="popular">Sort: Most Popular</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="h-13 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-2xl flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid with Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6 glass-panel p-6 border border-slate-800 rounded-3xl h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Filter Options
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {gamesList.length} Games
            </span>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              {MOCK_CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Game Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Game Type</label>
            <select
              value={filters.gameType}
              onChange={(e) => setFilters(prev => ({ ...prev, gameType: e.target.value }))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Game Types</option>
              <option value="TREASURE_BOX">Treasure Box</option>
              <option value="LOWEST_UNIQUE">Lowest Unique Number</option>
              <option value="HIGHEST_CARD">Highest Unique Card</option>
              <option value="SECRET_NUMBER">Secret Number</option>
              <option value="PRECISION_TIMER">Precision Timer</option>
            </select>
          </div>

          {/* Entry Fee Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Max Entry Fee:</span>
              <span className="text-cyan-400 font-mono">{filters.maxEntryFee} ETB</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={filters.maxEntryFee}
              onChange={(e) => setFilters(prev => ({ ...prev, maxEntryFee: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Game Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Game Status</label>
            <div className="flex gap-1.5">
              {['ALL', 'ACTIVE', 'COMPLETED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilters(prev => ({ ...prev, status: st }))}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                    filters.status === st
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Fetching page #1 from backend API...</p>
            </div>
          ) : gamesList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayList.map((game, idx) => (
                  <GameCard
                    key={`${game.id}-${idx}`}
                    game={game}
                    onSelect={() => onSelectGame(game)}
                  />
                ))}
              </div>

              {/* Infinite Scroll Sentinel & Backend Loader */}
              <div ref={loaderRef} className="py-8 flex flex-col items-center justify-center gap-2">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    Requesting Page #{page + 1} (20 items) from Backend API...
                  </div>
                ) : hasMoreBackendPages ? (
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-500" /> Scroll down to request page #{page + 1} from backend
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 font-mono">
                    ✓ All backend pages loaded ({gamesList.length} total items)
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-4">
              <Package className="w-16 h-16 text-slate-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-300">No Matching Games Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any active games matching your search criteria. Try adjusting filters or resetting search parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
