import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShieldCheck, Package, Gamepad2, X, Sparkles, CheckCircle2, Store, Upload, Trash2, Trophy, Clock } from 'lucide-react';
import type { Game, GameType } from '../types';

interface SellerDashboardProps {
  games: Game[];
  onAddGame: (game: Partial<Game>) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardProps> = ({
  games,
  onAddGame,
}) => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unified Post form state
  const [productTitle, setProductTitle] = useState('');
  const [category, setCategory] = useState('Phones');
  const [estimatedValue, setEstimatedValue] = useState('75000');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [condition, setCondition] = useState<'NEW' | 'REFURBISHED' | 'USED'>('NEW');
  const [location, setLocation] = useState('Bole, Addis Ababa');
  const [productDescription, setProductDescription] = useState('');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Game Engine state
  const [gameTitle, setGameTitle] = useState('');
  const [gameType, setGameType] = useState<GameType>('TREASURE_BOX');
  const [entryFee, setEntryFee] = useState('200');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [targetTimeSec, setTargetTimeSec] = useState('10.0');
  const [durationMinutes, setDurationMinutes] = useState('1440');

  const getDefaultRulesDescription = (type: GameType, targetTime?: string): string => {
    switch (type) {
      case 'TREASURE_BOX': return 'Choose 1 box out of available boxes. Winning box is selected randomly from chosen boxes.';
      case 'LOWEST_UNIQUE': return 'Pick a number between 1 and 100. Lowest unique non-duplicate number wins.';
      case 'HIGHEST_CARD': return 'Draw/pick a playing card. Duplicates are eliminated. Highest unique rank wins!';
      case 'SECRET_NUMBER': return 'Backend generated a secret target number (1-500). Closest guess wins!';
      case 'PRECISION_TIMER': return `Hit Start and click Stop as close as possible to ${targetTime || '10.0'} seconds (1 Attempt Only). Smallest millisecond delta wins!`;
      default: return 'Standard rules apply. Winner calculated deterministically by backend engine.';
    }
  };

  const handleStartEditPost = (g: Game) => {
    setEditingGame(g);
    setProductTitle(g.product.title);
    setCategory(g.product.category);
    setProductDescription(g.product.description);
    setImageUrl(g.product.imageUrl);
    setEstimatedValue(g.product.estimatedValue.toString());
    setCondition(g.product.condition);
    setLocation(g.product.location);
    setGameTitle(g.title);
    setGameType(g.gameType);
    setEntryFee(g.entryFee.toString());
    setMaxParticipants(g.maxParticipants.toString());
    setTargetTimeSec(g.targetTimeSec ? g.targetTimeSec.toString() : '10.0');
    setDurationMinutes(g.durationMinutes.toString());
    setShowCreatePostModal(true);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durMins = parseInt(durationMinutes) || 1440;

    const newPost: Partial<Game> = {
      ...(editingGame ? { id: editingGame.id } : {}),
      title: gameTitle || `${productTitle} - ${gameType.replace('_', ' ')} Challenge`,
      gameType,
      entryFee: parseFloat(entryFee) || 200,
      maxParticipants: parseInt(maxParticipants) || 100,
      totalBoxes: parseInt(maxParticipants) || 100,
      durationMinutes: durMins,
      endTime: new Date(Date.now() + durMins * 60 * 1000).toISOString(),
      targetTimeSec: gameType === 'PRECISION_TIMER' ? (parseFloat(targetTimeSec) || 10.0) : undefined,
      rulesDescription: getDefaultRulesDescription(gameType, targetTimeSec),
      status: 'PENDING_APPROVAL',
      rejectionReason: '',
      product: {
        id: editingGame ? editingGame.product.id : Date.now(),
        title: productTitle,
        category,
        description: productDescription || 'Seller listed product item',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
        condition,
        estimatedValue: parseFloat(estimatedValue) || 50000,
        location,
        approvalStatus: 'PENDING'
      }
    };

    onAddGame(newPost);
    setShowCreatePostModal(false);
    setEditingGame(null);

    // Reset form
    setProductTitle('');
    setProductDescription('');
    setGameTitle('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn py-4">
      
      {/* Seller Header & Single Create Post Button */}
      <div className="glass-panel p-6 sm:p-8 border border-cyan-500/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Verified Seller Portal
          </div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <Store className="w-7 h-7 text-cyan-400" /> Addis Tech Hub Dashboard
          </h2>
          <p className="text-xs text-slate-400">Manage competition posts, inventory listings, and seller revenue</p>
        </div>

        {/* SINGLE CREATE POST BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreatePostModal(true)}
          className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/30 flex items-center gap-2 transition-all uppercase tracking-wider"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> + Create Post
        </motion.button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 text-xs font-mono">Active Games</span>
          <div className="text-3xl font-black font-mono text-cyan-400">{games.filter(g => g.status === 'ACTIVE').length}</div>
        </div>
        <div className="glass-card p-5 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 text-xs font-mono">Pending Approvals</span>
          <div className="text-3xl font-black font-mono text-amber-400">{games.filter(g => g.status === 'PENDING_APPROVAL').length}</div>
        </div>
        <div className="glass-card p-5 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 text-xs font-mono">Total Sales Revenue</span>
          <div className="text-3xl font-black font-mono text-emerald-400">124,500 ETB</div>
        </div>
        <div className="glass-card p-5 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 text-xs font-mono">Seller Rating</span>
          <div className="text-3xl font-black font-mono text-purple-300">4.9 ★</div>
        </div>
      </div>

      {/* Seller Created Games Table */}
      <div className="space-y-4">
        <h3 className="font-black text-xl text-white">My Listed Competition Posts</h3>
        <div className="glass-panel overflow-hidden border border-slate-800 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Product / Game Post</th>
                  <th className="p-4">Game Type</th>
                  <th className="p-4">Entry Fee</th>
                  <th className="p-4">Participants</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {games.filter(g => g.status !== 'COMPLETED').map((g) => (
                  <tr key={g.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-sans font-bold text-white flex items-center gap-3">
                      <img
                        src={g.product.imageUrl}
                        alt={g.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <div className="text-sm font-bold text-white line-clamp-1">{g.title}</div>
                        <div className="text-[11px] text-slate-400">{g.product.title}</div>
                      </div>
                    </td>
                    <td className="p-4 text-cyan-400 font-bold">{g.gameType.replace(/_/g, ' ')}</td>
                    <td className="p-4 text-emerald-400 font-bold">{g.entryFee} ETB</td>
                    <td className="p-4 text-slate-300">{g.participantsCount} / {g.maxParticipants}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.status === 'ACTIVE'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : g.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {g.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : g.status}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      {g.status === 'ACTIVE' ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Admin Verified
                        </span>
                      ) : g.status === 'REJECTED' ? (
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-rose-400 font-semibold bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                            ⚠️ Rejection Reason: <span className="text-white font-mono">{g.rejectionReason || 'Requires revision by seller.'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditPost(g)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all flex items-center gap-1 uppercase tracking-wider"
                          >
                            ✏️ Edit & Resubmit
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5 text-xs bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30 inline-flex">
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Pending Admin Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COMPLETED GAMES SECTION AT THE BOTTOM */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Completed Games & Past Winners
            </h3>
            <p className="text-xs text-slate-400">Past competition posts resolved by the backend resolution engine</p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full font-mono font-semibold">
            {games.filter(g => g.status === 'COMPLETED').length} Finished
          </span>
        </div>

        <div className="glass-panel overflow-hidden border border-slate-800 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Completed Game / Product</th>
                  <th className="p-4">Game Engine</th>
                  <th className="p-4">Winner Champion</th>
                  <th className="p-4">Winning Score / Entry</th>
                  <th className="p-4">Revenue Earned</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {games.filter(g => g.status === 'COMPLETED').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                      No completed games yet. Run <code className="text-amber-300 bg-slate-950 px-2 py-1 rounded">python manage.py resolve_winners</code> in backend to resolve active games!
                    </td>
                  </tr>
                ) : (
                  games.filter(g => g.status === 'COMPLETED').map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-sans font-bold text-white flex items-center gap-3">
                        <img
                          src={g.product.imageUrl}
                          alt={g.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <div className="text-sm font-bold text-white line-clamp-1">{g.title}</div>
                          <div className="text-[11px] text-slate-400">{g.product.title}</div>
                        </div>
                      </td>
                      <td className="p-4 text-cyan-400 font-bold">{g.gameType.replace(/_/g, ' ')}</td>
                      <td className="p-4 text-amber-300 font-bold flex items-center gap-1.5 font-sans">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        @{g.winnerName || 'gamer_champion'}
                      </td>
                      <td className="p-4 text-slate-200">{g.winningValue || 'Winning Entry'}</td>
                      <td className="p-4 text-emerald-400 font-bold">{(g.participantsCount * g.entryFee).toLocaleString()} ETB</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SINGLE UNIFIED MODAL: Create Post */}
      <AnimatePresence>
        {showCreatePostModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative max-w-2xl w-full my-4 sm:my-8 glass-panel bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-cyan-950/80"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 mb-6 border-b border-slate-800 pb-4">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Single Post Publisher
                </span>
                <h3 className="text-2xl font-black text-white">Create Competition Post</h3>
                <p className="text-xs text-slate-400">List product inventory and game rules together in one simple post</p>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="space-y-6">
                
                {/* SECTION 1: Product Information */}
                <div className="space-y-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <Package className="w-4 h-4 text-cyan-400" /> 1. Product Information
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="e.g. PlayStation 5 Digital Edition (Slim)"
                      className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Phones">Phones</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home">Home</option>
                        <option value="Vehicles">Vehicles</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Estimated Value (ETB) *</label>
                      <input
                        type="number"
                        required
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Item Condition *</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as any)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="NEW">Brand New</option>
                        <option value="REFURBISHED">Refurbished</option>
                        <option value="USED">Used - Excellent</option>
                      </select>
                    </div>
                  </div>

                  {/* Image File Upload & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Product Photo File *</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      
                      {!imageUrl ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-24 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all text-center"
                        >
                          <Upload className="w-5 h-5 text-cyan-400" />
                          <span className="text-xs font-semibold text-cyan-300">Click or Drag & Drop Photo File</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                      ) : (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-cyan-500/50 bg-slate-900 flex items-center gap-3 p-2">
                          <img
                            src={imageUrl}
                            alt="Uploaded Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Photo Uploaded
                            </span>
                            <p className="text-[11px] text-slate-300 truncate font-mono">{imageFileName || 'product_photo.jpg'}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setImageUrl('');
                                setImageFileName('');
                              }}
                              className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Change Photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Pickup Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Bole, Addis Ababa"
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Product Description</label>
                    <textarea
                      rows={2}
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Describe specs, warranty, packaging..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* SECTION 2: Competition Game Rules */}
                <div className="space-y-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <Gamepad2 className="w-4 h-4 text-purple-400" /> 2. Competition Game Setup
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Competition Title</label>
                    <input
                      type="text"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      placeholder="e.g. PS5 Slim - Treasure Box Challenge (Optional)"
                      className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Game Engine Type *</label>
                      <select
                        value={gameType}
                        onChange={(e) => setGameType(e.target.value as GameType)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-purple-300 font-semibold focus:outline-none focus:border-purple-500"
                      >
                        <option value="TREASURE_BOX">Treasure Box</option>
                        <option value="LOWEST_UNIQUE">Lowest Unique Number</option>
                        <option value="HIGHEST_CARD">Highest Unique Card</option>
                        <option value="SECRET_NUMBER">Secret Number</option>
                        <option value="PRECISION_TIMER">Precision Timer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Entry Fee (ETB) *</label>
                      <input
                        type="number"
                        required
                        value={entryFee}
                        onChange={(e) => setEntryFee(e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Max Players *</label>
                      <input
                        type="number"
                        required
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Bidding Duration *</label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-amber-300 font-semibold focus:outline-none focus:border-purple-500"
                      >
                        <option value="60">1 Hour</option>
                        <option value="180">3 Hours</option>
                        <option value="360">6 Hours</option>
                        <option value="720">12 Hours</option>
                        <option value="1440">1 Day (24h)</option>
                        <option value="2880">2 Days</option>
                        <option value="4320">3 Days</option>
                        <option value="10080">7 Days</option>
                      </select>
                    </div>
                  </div>

                  {gameType === 'PRECISION_TIMER' && (
                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                      <label className="text-xs font-semibold text-amber-300 block mb-1">Target Stop Time (Seconds) *</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        value={targetTimeSec}
                        onChange={(e) => setTargetTimeSec(e.target.value)}
                        placeholder="e.g. 10.000 or 5.500"
                        className="w-full h-11 bg-slate-900 border border-amber-500/40 rounded-xl px-3.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[11px] text-slate-400 block">Participants will attempt to click STOP as close as possible to this exact duration (1 attempt only).</span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePostModal(false)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-cyan-500/30 transition-all uppercase tracking-wider"
                  >
                    🚀 Publish Competition Post
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
