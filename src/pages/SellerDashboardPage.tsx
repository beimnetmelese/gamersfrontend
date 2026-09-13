import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ShieldCheck, Package, Gamepad2, X, CheckCircle2, Store,
  Upload, Trophy, Clock, Truck, Star, AlertTriangle, Edit3,
  BarChart3, Phone, MapPin, Loader2
} from 'lucide-react';
import type { Game, GameType, Product, Seller, SellerStats, ProductDelivery } from '../types';
import { DeliveryTracker } from '../components/DeliveryTracker';
import {
  fetchSellerProfileAPI, updateSellerProfileAPI, fetchSellerStatsAPI,
  fetchSellerAnalyticsAPI, fetchSellerProductsAPI, createProductAPI,
  updateProductAPI, deleteProductAPI, fetchSellerGamesAPI, createSellerGameAPI,
  fetchDeliveriesAPI, updateDeliveryStatusAPI
} from '../services/api';

interface SellerDashboardProps {
  games?: Game[];
  onAddGame?: (game: Partial<Game>) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'competitions' | 'fulfillment' | 'analytics'>('overview');

  // Backend Data
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalGames: 0,
    activeGames: 0,
    completedGames: 0,
    totalRevenueEtb: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    averageRating: 0,
    ratingCount: 0,
    walletBalance: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerGames, setSellerGames] = useState<Game[]>([]);
  const [deliveries, setDeliveries] = useState<ProductDelivery[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>({
    games_performance: [],
    ratings_breakdown: {},
    recent_reviews: []
  });
  const [loading, setLoading] = useState(true);

  // Filters & Notifications
  const [competitionFilter, setCompetitionFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'COMPLETED'>('ALL');
  const [deliveryFilter, setDeliveryFilter] = useState<'ALL' | 'PREPARING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'>('ALL');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productModalError, setProductModalError] = useState('');
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [submittingGame, setSubmittingGame] = useState(false);
  const [gameModalError, setGameModalError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Product Form State
  const [pTitle, setPTitle] = useState('');
  const [pCategory, setPCategory] = useState('Phones');
  const [pDescription, setPDescription] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pCondition, setPCondition] = useState<'NEW' | 'REFURBISHED' | 'USED'>('NEW');
  const [pEstimatedValue, setPEstimatedValue] = useState('75000');
  const [pLocation, setPLocation] = useState('Bole, Addis Ababa');
  const [productFileRef, setProductFileRef] = useState<string>('');

  // Game Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('NEW');
  const [gTitle, setGTitle] = useState('');
  const [gType, setGType] = useState<GameType>('TREASURE_BOX');
  const [gEntryFee, setGEntryFee] = useState('200');
  const [gMaxParticipants, setGMaxParticipants] = useState('100');
  const [gTargetTimeSec, setGTargetTimeSec] = useState('10.0');
  const [gDurationMinutes, setGDurationMinutes] = useState('1440');

  // Delivery Update Form State
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<number | null>(null);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<string>('SHIPPED');
  const [newTrackingCode, setNewTrackingCode] = useState<string>('');

  // Profile Form State
  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bDesc, setBDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllSellerData();
  }, []);

  const loadAllSellerData = async () => {
    setLoading(true);
    try {
      const [prof, st, prods, gms, dels, an] = await Promise.all([
        fetchSellerProfileAPI(),
        fetchSellerStatsAPI(),
        fetchSellerProductsAPI(),
        fetchSellerGamesAPI(),
        fetchDeliveriesAPI(),
        fetchSellerAnalyticsAPI()
      ]);

      if (prof) {
        setSeller(prof);
        setBName(prof.businessName || '');
        setBPhone(prof.phoneNumber || '');
        setBAddress(prof.address || '');
        setBDesc(prof.description || '');
      }
      setStats(st);
      setProducts(prods);
      setSellerGames(gms);
      setDeliveries(dels);
      setAnalyticsData(an);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const notifySuccess = (msg: string) => {
    setStatusMsg(msg);
    setErrorMsg('');
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const notifyError = (msg: string) => {
    setErrorMsg(msg);
    setStatusMsg('');
    setTimeout(() => setErrorMsg(''), 6000);
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPTitle('');
    setPCategory('Phones');
    setPDescription('');
    setPImageUrl('');
    setProductFileRef('');
    setPCondition('NEW');
    setPEstimatedValue('50000');
    setPLocation('Addis Ababa');
    setProductModalError('');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPTitle(prod.title);
    setPCategory(prod.category);
    setPDescription(prod.description);
    setPImageUrl(prod.imageUrl);
    setProductFileRef('');
    setPCondition(prod.condition);
    setPEstimatedValue(prod.estimatedValue.toString());
    setPLocation(prod.location);
    setProductModalError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductModalError('');
    if (!pTitle.trim()) {
      setProductModalError('Product title is required.');
      return;
    }

    setSubmittingProduct(true);
    try {
      const payload: Partial<Product> = {
        title: pTitle.trim(),
        category: pCategory,
        description: pDescription.trim(),
        imageUrl: pImageUrl.trim() || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
        condition: pCondition,
        estimatedValue: parseFloat(pEstimatedValue) || 1000,
        location: pLocation.trim() || 'Addis Ababa'
      };

      if (editingProduct) {
        const res = await updateProductAPI(editingProduct.id, payload);
        if (res.success) {
          notifySuccess('Product updated successfully!');
          setShowProductModal(false);
          loadAllSellerData();
        } else {
          setProductModalError(res.message);
          notifyError(res.message);
        }
      } else {
        const res = await createProductAPI(payload);
        if (res.success) {
          notifySuccess('Product submitted for admin review!');
          setShowProductModal(false);
          loadAllSellerData();
        } else {
          setProductModalError(res.message);
          notifyError(res.message);
        }
      }
    } catch (err: any) {
      setProductModalError(err.message || 'An unexpected error occurred while saving product.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const res = await deleteProductAPI(id);
    if (res.success) {
      notifySuccess('Product deleted successfully.');
      loadAllSellerData();
    } else {
      notifyError(res.message);
    }
  };

  // --- GAME POST ACTIONS ---
  const handleOpenCreateGame = () => {
    setEditingGame(null);
    setSelectedProductId('NEW');
    setGTitle('');
    setGType('TREASURE_BOX');
    setGEntryFee('200');
    setGMaxParticipants('100');
    setGTargetTimeSec('10.0');
    setGDurationMinutes('1440');
    setPTitle('');
    setGameModalError('');
    setShowGameModal(true);
  };

  const handleOpenEditGame = (g: Game) => {
    setEditingGame(g);
    setSelectedProductId(g.product.id.toString());
    setGTitle(g.title);
    setGType(g.gameType);
    setGEntryFee(g.entryFee.toString());
    setGMaxParticipants(g.maxParticipants.toString());
    setGTargetTimeSec(g.targetTimeSec ? g.targetTimeSec.toString() : '10.0');
    setGDurationMinutes(g.durationMinutes.toString());
    setPTitle(g.product.title);
    setPCategory(g.product.category);
    setPDescription(g.product.description);
    setPImageUrl(g.product.imageUrl);
    setPCondition(g.product.condition);
    setPEstimatedValue(g.product.estimatedValue.toString());
    setPLocation(g.product.location);
    setGameModalError('');
    setShowGameModal(true);
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGameModalError('');
    const durMins = parseInt(gDurationMinutes) || 1440;

    let productPayload: any = null;
    if (selectedProductId === 'NEW') {
      if (!pTitle.trim()) {
        setGameModalError('Please specify product title.');
        return;
      }
      productPayload = {
        title: pTitle.trim(),
        category: pCategory,
        description: pDescription.trim(),
        imageUrl: pImageUrl.trim() || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
        condition: pCondition,
        estimatedValue: parseFloat(pEstimatedValue) || 50000,
        location: pLocation.trim() || 'Addis Ababa'
      };
    } else {
      const existing = products.find(p => p.id === parseInt(selectedProductId));
      if (existing) {
        productPayload = { id: existing.id };
      }
    }

    const payload = {
      product: productPayload,
      title: gTitle.trim() || `${pTitle || 'Competition'} - ${gType.replace(/_/g, ' ')}`,
      game_type: gType,
      entry_fee: parseFloat(gEntryFee) || 100,
      max_participants: parseInt(gMaxParticipants) || 100,
      total_boxes: parseInt(gMaxParticipants) || 100,
      duration_minutes: durMins,
      target_time_sec: gType === 'PRECISION_TIMER' ? (parseFloat(gTargetTimeSec) || 10.0) : undefined,
      rules_description: `Deterministic winner resolution on platform.`
    };

    setSubmittingGame(true);
    try {
      const res = await createSellerGameAPI(payload);
      if (res.success) {
        notifySuccess('Competition created and submitted for Admin verification!');
        setShowGameModal(false);
        loadAllSellerData();
      } else {
        setGameModalError(res.message);
        notifyError(res.message);
      }
    } catch (err: any) {
      setGameModalError(err.message || 'An unexpected error occurred while creating competition.');
    } finally {
      setSubmittingGame(false);
    }
  };

  // --- DELIVERY ACTIONS ---
  const handleUpdateDeliverySubmit = async (id: number) => {
    const res = await updateDeliveryStatusAPI(id, newDeliveryStatus, newTrackingCode);
    if (res.success) {
      notifySuccess('Delivery status updated and winner notified!');
      setUpdatingDeliveryId(null);
      loadAllSellerData();
    } else {
      notifyError(res.message);
    }
  };

  // --- PROFILE UPDATE ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateSellerProfileAPI({
      businessName: bName,
      phoneNumber: bPhone,
      address: bAddress,
      description: bDesc
    });
    if (res.success) {
      notifySuccess('Store profile updated successfully!');
      setShowProfileModal(false);
      loadAllSellerData();
    } else {
      notifyError(res.message);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductFileRef(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCompetitions = sellerGames.filter(g => {
    if (competitionFilter === 'ALL') return true;
    return g.status === competitionFilter;
  });

  const filteredDeliveries = deliveries.filter(d => {
    if (deliveryFilter === 'ALL') return true;
    return d.status === deliveryFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn py-4 px-2 sm:px-4">
      {loading && (
        <div className="text-xs text-cyan-400 font-mono animate-pulse">Syncing portal telemetry...</div>
      )}
      {/* Alert Notifications */}
      {statusMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-lg animate-fadeIn">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Seller Portal Header */}
      <div className="glass-panel p-6 sm:p-8 border border-cyan-500/30 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Verified Seller Portal
          </div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-cyan-400" /> {seller?.businessName || 'Seller Hub'}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {seller?.address || 'Addis Ababa'}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-cyan-400" /> {seller?.phoneNumber || '+2519...'}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold uppercase">
              {seller?.status || 'VERIFIED'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
          <button
            onClick={handleOpenAddProduct}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> + Add Product
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenCreateGame}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-cyan-500/20 flex items-center gap-2 uppercase tracking-wider transition-all"
          >
            <Gamepad2 className="w-4 h-4 stroke-[2.5]" /> + Create Competition
          </motion.button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        {[
          { key: 'overview', label: 'Overview & KPIs', icon: Store },
          { key: 'products', label: `Products (${products.length})`, icon: Package },
          { key: 'competitions', label: `Competitions (${sellerGames.length})`, icon: Trophy },
          { key: 'fulfillment', label: `Fulfillment (${stats.pendingDeliveries} Pending)`, icon: Truck },
          { key: 'analytics', label: 'Analytics & Reviews', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real Backend Aggregated KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[11px] font-mono uppercase">Active Competitions</span>
              <div className="text-2xl font-black font-mono text-cyan-400">{stats.activeGames}</div>
              <div className="text-[10px] text-slate-500 font-mono">of {stats.totalGames} total</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[11px] font-mono uppercase">Products Inventory</span>
              <div className="text-2xl font-black font-mono text-blue-400">{stats.totalProducts}</div>
              <div className="text-[10px] text-emerald-400 font-mono">{stats.activeProducts} approved</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[11px] font-mono uppercase">Total Sales Revenue</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{stats.totalRevenueEtb.toLocaleString()} <span className="text-xs">ETB</span></div>
              <div className="text-[10px] text-slate-500 font-mono">from completed entries</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[11px] font-mono uppercase">Pending Deliveries</span>
              <div className="text-2xl font-black font-mono text-amber-400">{stats.pendingDeliveries}</div>
              <div className="text-[10px] text-slate-500 font-mono">{stats.completedDeliveries} completed</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[11px] font-mono uppercase">Store Rating</span>
              <div className="text-2xl font-black font-mono text-purple-300 flex items-center gap-1">
                {stats.averageRating} <Star className="w-4 h-4 fill-purple-300 text-purple-300" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{stats.ratingCount} reviews</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 text-[11px] font-mono uppercase">Wallet Balance</span>
              <div className="text-2xl font-black font-mono text-emerald-300">{stats.walletBalance.toLocaleString()} <span className="text-xs">ETB</span></div>
              <div className="text-[10px] text-slate-500 font-mono">available to withdraw</div>
            </div>
          </div>

          {/* Quick Actions & Store Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 glass-panel p-6 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-cyan-400" /> About Your Storefront
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {seller?.description || "Welcome to your verified storefront. Add your product inventory, launch competitions, track winner packages, and build your seller reputation on Ethiopia's premier competition platform."}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button onClick={() => setActiveTab('products')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/20">
                  Manage Products →
                </button>
                <button onClick={() => setActiveTab('competitions')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-bold border border-purple-500/20">
                  View Competitions →
                </button>
                <button onClick={() => setActiveTab('fulfillment')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/20">
                  Track Deliveries →
                </button>
              </div>
            </div>

            <div className="glass-panel p-6 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" /> Dispatch Required
              </h3>
              {stats.pendingDeliveries > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-pulse text-amber-400" /> {stats.pendingDeliveries} Prize(s) Waiting For Dispatch
                  </div>
                  <p className="text-[11px] text-slate-300">Winners have been selected! Please dispatch the items and update tracking numbers in Fulfillment.</p>
                  <button onClick={() => setActiveTab('fulfillment')} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors">
                    Fulfill Orders Now
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-white font-bold">All Orders Fulfilled!</div>
                  <p className="text-[11px]">No pending prize packages currently awaiting dispatch.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" /> Product Inventory
              </h3>
              <p className="text-xs text-slate-400">All registered physical items available for your competitions</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="glass-panel p-12 text-center border border-slate-800 rounded-3xl space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-base">No Products Listed Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add your physical products (phones, consoles, laptops, luxury fashion) to inventory. Once verified by admin, you can create competitions for them!
              </p>
              <button
                onClick={handleOpenAddProduct}
                className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl"
              >
                + Add Your First Product
              </button>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-slate-800 rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4">Estimated Value</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Approval Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-sans font-bold text-white flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 flex-shrink-0 bg-slate-900"
                          />
                          <div>
                            <div className="text-sm font-bold text-white line-clamp-1">{p.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                          </div>
                        </td>
                        <td className="p-4 text-cyan-400 font-bold">{p.category}</td>
                        <td className="p-4">{p.condition}</td>
                        <td className="p-4 text-emerald-400 font-bold">{p.estimatedValue.toLocaleString()} ETB</td>
                        <td className="p-4 text-slate-400">{p.location}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : p.approvalStatus === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          }`}>
                            {p.approvalStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 font-sans">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold border border-rose-500/30 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPETITIONS */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" /> Seller Competition Posts
              </h3>
              <p className="text-xs text-slate-400">Launch and track challenges powered by the backend resolution engine</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenCreateGame}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> + Create Competition
            </motion.button>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'COMPLETED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setCompetitionFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  competitionFilter === st
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {st.replace(/_/g, ' ')} ({st === 'ALL' ? sellerGames.length : sellerGames.filter(g => g.status === st).length})
              </button>
            ))}
          </div>

          <div className="glass-panel overflow-hidden border border-slate-800 rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-4">Competition / Prize</th>
                    <th className="p-4">Game Engine</th>
                    <th className="p-4">Entry Fee</th>
                    <th className="p-4">Entries</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Verification / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredCompetitions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                        No competitions found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCompetitions.map(g => (
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
                              : g.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                : g.status === 'REJECTED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          }`}>
                            {g.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-sans">
                          {g.status === 'ACTIVE' ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active on Live Feed
                            </span>
                          ) : g.status === 'COMPLETED' ? (
                            <div className="text-xs text-slate-300 space-y-0.5">
                              <span className="text-emerald-400 font-bold">Winner: @{g.winnerName || 'Resolved'}</span>
                              <div className="text-[10px] text-slate-500">Collected: {(g.entryFee * g.participantsCount).toLocaleString()} ETB</div>
                            </div>
                          ) : g.status === 'REJECTED' ? (
                            <div className="space-y-1.5">
                              <div className="text-[11px] text-rose-400 font-semibold bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                                ⚠️ Reason: <span className="text-white font-mono">{g.rejectionReason || 'Requires changes by seller.'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenEditGame(g)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all uppercase tracking-wider"
                              >
                                ✏️ Edit & Resubmit
                              </button>
                            </div>
                          ) : (
                            <span className="text-amber-400 font-semibold flex items-center gap-1.5 text-xs bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30 inline-flex">
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Pending Review
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FULFILLMENT & ORDERS */}
      {activeTab === 'fulfillment' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" /> Physical Product Fulfillment
              </h3>
              <p className="text-xs text-slate-400">Manage prize package deliveries to competition winners across Ethiopia</p>
            </div>
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setDeliveryFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    deliveryFilter === st
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="glass-panel p-12 text-center border border-slate-800 rounded-3xl space-y-2">
              <Truck className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-base">No Deliveries Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                When a competition completes with a winner, a physical delivery order is automatically created here so you can dispatch the prize!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map(d => (
                <div key={d.id} className="glass-panel p-6 border border-slate-800 rounded-3xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-4">
                      {d.productImage ? (
                        <img src={d.productImage} alt={d.productTitle} className="w-14 h-14 rounded-2xl object-cover border border-slate-800 bg-slate-900 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 flex-shrink-0">
                          <Package className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">Order #{d.id}</span>
                        <h4 className="text-base font-black text-white">{d.productTitle || d.gameTitle}</h4>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                          <span>Competition: <strong className="text-white">{d.gameTitle}</strong></span>
                          <span>•</span>
                          <span>Winner: <strong className="text-cyan-300">@{d.winnerName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        d.status === 'DELIVERED' || d.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : d.status === 'SHIPPED' || d.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                      {updatingDeliveryId !== d.id && (
                        <button
                          onClick={() => {
                            setUpdatingDeliveryId(d.id);
                            setNewDeliveryStatus(d.status === 'PREPARING' ? 'SHIPPED' : d.status);
                            setNewTrackingCode(d.trackingCode || '');
                          }}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <DeliveryTracker delivery={d} />

                  {/* Recipient Shipping Address & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> Delivery Address</span>
                      <div className="text-white font-semibold">{d.deliveryAddress || 'Address to be confirmed by winner.'}</div>
                    </div>
                    <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]"><Phone className="w-3.5 h-3.5 text-cyan-400" /> Recipient Phone Number</span>
                      <div className="text-white font-semibold font-mono">{d.phoneNumber || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Inline Status Update Form */}
                  {updatingDeliveryId === d.id && (
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-3 animate-fadeIn">
                      <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center justify-between">
                        <span>Update Delivery Tracking Info</span>
                        <button onClick={() => setUpdatingDeliveryId(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-mono">Delivery Status</label>
                          <select
                            value={newDeliveryStatus}
                            onChange={(e) => setNewDeliveryStatus(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400"
                          >
                            <option value="PREPARING">Preparing Package</option>
                            <option value="SHIPPED">Shipped (Dispatched)</option>
                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                            <option value="DELIVERED">Delivered to Recipient</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-mono">Tracking Code / Courier Receipt</label>
                          <input
                            type="text"
                            value={newTrackingCode}
                            onChange={(e) => setNewTrackingCode(e.target.value)}
                            placeholder="e.g. DHL-ET-987654 / Local Rider #09..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setUpdatingDeliveryId(null)}
                          className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateDeliverySubmit(d.id)}
                          className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs rounded-lg font-black uppercase tracking-wider"
                        >
                          Save & Notify Winner
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ANALYTICS & REVIEWS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rating Breakdown Card */}
            <div className="glass-panel p-6 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" /> Customer Satisfaction
              </h3>
              <div className="text-center py-2 space-y-1">
                <div className="text-5xl font-black font-mono text-purple-300">{stats.averageRating}</div>
                <div className="flex items-center justify-center gap-1 text-purple-400">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(stats.averageRating) ? 'fill-purple-400 text-purple-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-mono">Based on {stats.ratingCount} verified buyer reviews</div>
              </div>

              {/* Star breakdown bars */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = analyticsData.ratings_breakdown?.[stars] || 0;
                  const pct = stats.ratingCount > 0 ? (count / stats.ratingCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-8 text-slate-400">{stars} ★</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-6 text-right text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews List */}
            <div className="md:col-span-2 glass-panel p-6 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verified Customer Reviews
              </h3>
              {(!analyticsData.recent_reviews || analyticsData.recent_reviews.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No customer reviews yet. Reviews are posted by winners after prize fulfillment.
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.recent_reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">@{rev.username}</span>
                        <div className="flex items-center gap-1 text-purple-400">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-purple-400 text-purple-400' : 'text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{rev.review || 'Fast delivery and genuine product!'}"</p>
                      <div className="text-[10px] text-slate-500 font-mono">{new Date(rev.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Table */}
          <div className="glass-panel p-6 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" /> Competitions Performance History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Challenge Title</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Participants</th>
                    <th className="p-3">Revenue Generated</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(!analyticsData.games_performance || analyticsData.games_performance.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        No competition history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    analyticsData.games_performance.map((gp: any) => (
                      <tr key={gp.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-white">{gp.title}</td>
                        <td className="p-3 text-cyan-300">{gp.product_title}</td>
                        <td className="p-3">{gp.participants_count} / {gp.max_participants}</td>
                        <td className="p-3 text-emerald-400 font-bold">{gp.collected_etb?.toLocaleString()} ETB</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            gp.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {gp.status}
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
      )}

      {/* --- MODAL: ADD / EDIT PRODUCT --- */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-400" />
                  {editingProduct ? 'Edit Product Item' : 'Add New Product to Inventory'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
              </div>

              {productModalError && (
                <div className="p-3 bg-rose-950/90 border border-rose-500/50 text-rose-300 rounded-xl flex items-center gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{productModalError}</span>
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="e.g. Apple iPhone 15 Pro Max 256GB sealed"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="Phones">Phones & Mobile</option>
                      <option value="Laptops">Laptops & Computers</option>
                      <option value="Gaming">Gaming Rigs & Consoles</option>
                      <option value="Electronics">Electronics & Audio</option>
                      <option value="Fashion">Luxury Watches & Fashion</option>
                      <option value="Vehicles">Motorbikes & Scooters</option>
                      <option value="Other">Other Goods</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Condition</label>
                    <select
                      value={pCondition}
                      onChange={(e) => setPCondition(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="NEW">Brand New (Sealed)</option>
                      <option value="REFURBISHED">Certified Refurbished</option>
                      <option value="USED">Used (Good Condition)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Estimated Retail Value (ETB) *</label>
                    <input
                      type="number"
                      required
                      value={pEstimatedValue}
                      onChange={(e) => setPEstimatedValue(e.target.value)}
                      placeholder="e.g. 85000"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Item Location</label>
                    <input
                      type="text"
                      value={pLocation}
                      onChange={(e) => setPLocation(e.target.value)}
                      placeholder="e.g. Bole Medhanialem, Addis Ababa"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pImageUrl}
                      onChange={(e) => setPImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or upload image"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </button>
                  </div>
                  {pImageUrl && (
                    <div className="pt-2 flex items-center gap-3">
                      <img src={pImageUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                      <div>
                        <span className="text-[11px] text-emerald-400 block">✓ Image loaded successfully</span>
                        {productFileRef && <span className="text-[10px] text-slate-400 font-mono">{productFileRef}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Product Specs & Description</label>
                  <textarea
                    rows={3}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Provide full details: storage capacity, warranty status, color, accessories included..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submittingProduct ? 'Submitting...' : editingProduct ? 'Save Changes' : 'Submit Product For Verification'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: CREATE / EDIT COMPETITION --- */}
      <AnimatePresence>
        {showGameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  {editingGame ? 'Edit & Resubmit Competition' : 'Create New Competition Challenge'}
                </h3>
                <button onClick={() => setShowGameModal(false)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
              </div>

              {gameModalError && (
                <div className="p-3 bg-rose-950/90 border border-rose-500/50 text-rose-300 rounded-xl flex items-center gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{gameModalError}</span>
                </div>
              )}

              <form onSubmit={handleGameSubmit} className="space-y-4 text-xs font-mono">
                {/* Product Selection */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Select Competition Prize Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      if (e.target.value !== 'NEW') {
                        const sel = products.find(p => p.id === parseInt(e.target.value));
                        if (sel) {
                          setPTitle(sel.title);
                          setPCategory(sel.category);
                          setPDescription(sel.description);
                          setPImageUrl(sel.imageUrl);
                          setPEstimatedValue(sel.estimatedValue.toString());
                        }
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                  >
                    <option value="NEW">+ Enter a New Product Listing Directly</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id.toString()}>
                        [{p.approvalStatus}] {p.title} — {p.estimatedValue.toLocaleString()} ETB ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* If New Product is chosen, show Product fields */}
                {selectedProductId === 'NEW' && (
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider">New Product Details</span>
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        value={pTitle}
                        onChange={(e) => setPTitle(e.target.value)}
                        placeholder="Product Title (e.g. Sony PlayStation 5)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-400 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="Phones">Phones</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="number"
                        value={pEstimatedValue}
                        onChange={(e) => setPEstimatedValue(e.target.value)}
                        placeholder="Estimated Value ETB"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Competition Settings */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Competition Title</label>
                  <input
                    type="text"
                    value={gTitle}
                    onChange={(e) => setGTitle(e.target.value)}
                    placeholder={`e.g. ${pTitle || 'iPhone 15 Pro'} Treasure Box Drop`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Game Engine Type *</label>
                    <select
                      value={gType}
                      onChange={(e) => setGType(e.target.value as GameType)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="TREASURE_BOX">Treasure Box (Pick 1 of 100)</option>
                      <option value="LOWEST_UNIQUE">Lowest Unique Number</option>
                      <option value="HIGHEST_CARD">Highest Unique Card</option>
                      <option value="SECRET_NUMBER">Secret Number Guess</option>
                      <option value="PRECISION_TIMER">Precision Timer Challenge</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Entry Fee (ETB) *</label>
                    <input
                      type="number"
                      required
                      value={gEntryFee}
                      onChange={(e) => setGEntryFee(e.target.value)}
                      placeholder="e.g. 200"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Max Participants *</label>
                    <input
                      type="number"
                      required
                      value={gMaxParticipants}
                      onChange={(e) => setGMaxParticipants(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={gDurationMinutes}
                      onChange={(e) => setGDurationMinutes(e.target.value)}
                      placeholder="1440 (24 hours)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                {gType === 'PRECISION_TIMER' && (
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold uppercase tracking-wider">Target Time (Seconds)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={gTargetTimeSec}
                      onChange={(e) => setGTargetTimeSec(e.target.value)}
                      placeholder="10.000"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                )}

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  ℹ️ When submitted, your competition challenge will be queued for Admin approval. Once approved, it appears live on the home feed.
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowGameModal(false)}
                    className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGame}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingGame && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submittingGame ? 'Publishing...' : 'Publish Competition Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: EDIT SELLER PROFILE --- */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-lg border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-cyan-400" /> Edit Store Profile
                </h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Business / Store Name</label>
                  <input
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Official Phone Number</label>
                  <input
                    type="text"
                    required
                    value={bPhone}
                    onChange={(e) => setBPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Physical Location / Address</label>
                  <input
                    type="text"
                    required
                    value={bAddress}
                    onChange={(e) => setBAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider">Storefront Description</label>
                  <textarea
                    rows={3}
                    value={bDesc}
                    onChange={(e) => setBDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
