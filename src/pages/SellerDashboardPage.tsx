import React, { useState } from 'react';
import type { Product, Game, GameType } from '../types';
import { IconPlus, IconShield } from '../components/Icons';

interface SellerDashboardProps {
  games: Game[];
  onAddProduct: (prod: Partial<Product>) => void;
  onAddGame: (game: Partial<Game>) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardProps> = ({
  games,
  onAddProduct,
  onAddGame,
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);

  // New product state
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('Smartphones');
  const [prodDesc, setProdDesc] = useState('');
  const [prodVal, setProdVal] = useState('50000');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80');

  // New game state
  const [gameTitle, setGameTitle] = useState('');
  const [gameType, setGameType] = useState<GameType>('TREASURE_BOX');
  const [entryFee, setEntryFee] = useState('200');
  const [maxPlayers, setMaxPlayers] = useState('100');
  const [rulesDesc, setRulesDesc] = useState('');

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      title: prodTitle,
      category: prodCategory,
      description: prodDesc,
      estimatedValue: parseFloat(prodVal) || 50000,
      imageUrl: prodImage,
      approvalStatus: 'PENDING'
    });
    setShowProductModal(false);
    setProdTitle('');
    setProdDesc('');
  };

  const handleCreateGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGame({
      title: gameTitle,
      gameType,
      entryFee: parseFloat(entryFee) || 200,
      maxParticipants: parseInt(maxPlayers) || 100,
      rulesDescription: rulesDesc || 'Winner determined deterministically on backend.',
      status: 'PENDING_APPROVAL'
    });
    setShowGameModal(false);
    setGameTitle('');
    setRulesDesc('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Seller Header Stats */}
      <div className="glass-panel p-6 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase">
            <IconShield className="w-4 h-4" /> Verified Seller Portal
          </div>
          <h2 className="text-2xl font-black text-slate-100">Addis Tech Hub Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2"
          >
            <IconPlus className="w-4 h-4 text-cyan-400" />
            + New Product
          </button>
          <button
            onClick={() => setShowGameModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            <IconPlus className="w-4 h-4" />
            + Create Competition Game
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Active Games</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">3</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Pending Approvals</span>
          <div className="text-2xl font-bold font-mono text-amber-400">1</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Total Sales Revenue</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">124,500 ETB</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Seller Rating</span>
          <div className="text-2xl font-bold font-mono text-purple-300">4.9 ★</div>
        </div>
      </div>

      {/* Seller Created Games Table */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-slate-100">My Listed Competitions</h3>
        <div className="glass-panel overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Game Type</th>
                <th className="p-3">Entry Fee</th>
                <th className="p-3">Players</th>
                <th className="p-3">Status</th>
                <th className="p-3">Admin Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-sans font-bold text-slate-100">{g.title}</td>
                  <td className="p-3 text-cyan-400">{g.gameType}</td>
                  <td className="p-3 text-slate-300">{g.entryFee} ETB</td>
                  <td className="p-3 text-slate-300">{g.participantsCount} / {g.maxParticipants}</td>
                  <td className="p-3">
                    <span className={`badge-pill ${g.status === 'ACTIVE' ? 'badge-cyan' : 'badge-amber'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400 font-sans font-semibold">
                    ✓ Verified by Admin
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border border-cyan-500/30">
            <h3 className="font-extrabold text-lg text-slate-100">Add New Product Inventory</h3>
            <form onSubmit={handleCreateProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Product Title:</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Category:</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Gaming Consoles">Gaming Consoles</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Est. Value (ETB):</label>
                  <input
                    type="number"
                    value={prodVal}
                    onChange={(e) => setProdVal(e.target.value)}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Image URL:</label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Description:</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200"
                  placeholder="Provide complete product details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create Game */}
      {showGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border border-purple-500/30">
            <h3 className="font-extrabold text-lg text-slate-100">Create Competition Game</h3>
            <form onSubmit={handleCreateGameSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Game Title:</label>
                <input
                  type="text"
                  required
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="e.g. Galaxy S24 Ultra - Treasure Box Game"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Game Engine Type:</label>
                  <select
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value as GameType)}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-semibold"
                  >
                    <option value="TREASURE_BOX">Treasure Box</option>
                    <option value="LOWEST_UNIQUE">Lowest Unique Number</option>
                    <option value="HIGHEST_CARD">Highest Unique Card</option>
                    <option value="SECRET_NUMBER">Secret Number</option>
                    <option value="PREDICTION">Prediction Challenge</option>
                    <option value="PRECISION_TIMER">Precision Timer</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Entry Fee (ETB):</label>
                  <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Max Participants:</label>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Game Rules Description:</label>
                <textarea
                  rows={3}
                  value={rulesDesc}
                  onChange={(e) => setRulesDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200"
                  placeholder="Explain winner rules to participants..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGameModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-bold rounded-lg">Submit for Admin Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
