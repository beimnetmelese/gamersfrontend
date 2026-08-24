import { useState, useEffect } from 'react';
import type { Role, Game, Wallet } from './types';
import { fetchGames, fetchWallet, resolveGameAPI, createGameAPI, updateGameAPI, deductWalletBalance } from './services/api';
import { Navbar } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { CategoryPage } from './pages/CategoryPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { WinnerRevealModal } from './components/WinnerRevealModal';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('USER');
  const [activeTab, setActiveTab] = useState<string>('home');
  
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const [wallet, setWallet] = useState<Wallet>({ balance: 2500, transactions: [] });
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Winner Reveal modal state
  const [resolvedWinnerModal, setResolvedWinnerModal] = useState<{
    game: Game;
    winnerName: string;
    winningValue?: string;
    details?: string;
  } | null>(null);

  const loadInitialData = async () => {
    const loadedGames = await fetchGames();
    setGames(loadedGames);
    const loadedWallet = await fetchWallet();
    setWallet(loadedWallet);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddGame = async (newGame: Partial<Game>) => {
    if (newGame.id) {
      // RESUBMISSION of existing rejected post
      const updated = await updateGameAPI(newGame.id, {
        ...newGame,
        status: 'PENDING_APPROVAL',
        rejectionReason: ''
      });
      setGames(prev => prev.map(g => g.id === newGame.id ? (updated || {
        ...g,
        ...newGame,
        status: 'PENDING_APPROVAL',
        rejectionReason: ''
      }) : g));
      triggerToast(`Post "${newGame.title || 'Challenge'}" resubmitted for Admin Approval!`);
      return;
    }

    // Send POST payload to Django Backend REST API for new post
    const backendCreated = await createGameAPI({
      ...newGame,
      status: 'PENDING_APPROVAL'
    });

    const created: Game = backendCreated || {
      id: Date.now(),
      product: newGame.product || {
        id: Date.now(),
        title: newGame.title || 'New Product',
        category: 'Phones',
        description: 'Seller listed item',
        imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
        condition: 'NEW',
        estimatedValue: 75000,
        location: 'Addis Ababa',
        approvalStatus: 'PENDING'
      },
      sellerName: 'Addis Tech Hub',
      title: newGame.title || 'New Game Post',
      gameType: newGame.gameType || 'TREASURE_BOX',
      entryFee: newGame.entryFee || 200,
      maxParticipants: newGame.maxParticipants || 100,
      participantsCount: 0,
      durationMinutes: newGame.durationMinutes || 1440,
      targetTimeSec: newGame.targetTimeSec || 10.0,
      rulesDescription: newGame.rulesDescription || 'Standard rules',
      questionPrompt: newGame.questionPrompt,
      status: 'PENDING_APPROVAL',
      rejectionReason: '',
      createdAt: new Date().toISOString()
    };

    setGames(prev => [created, ...prev]);
    triggerToast(`Competition Post "${created.title}" submitted for Admin Approval!`);
  };

  const handleApproveGame = async (gameId: number) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'ACTIVE', rejectionReason: '' } : g));
    try {
      await fetch(`http://localhost:8000/api/games/${gameId}/approve_game/`, { method: 'POST' });
    } catch (e) {}
    triggerToast('Game approved by admin and is now LIVE & ACTIVE!');
  };

  const handleRejectGame = async (gameId: number, reason: string) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'REJECTED', rejectionReason: reason } : g));
    try {
      await fetch(`http://localhost:8000/api/games/${gameId}/reject_game/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch (e) {}
    triggerToast(`Post rejected by admin with feedback: "${reason}"`);
  };

  const handleResolveGame = async (gameId: number) => {
    const targetGame = games.find(g => g.id === gameId);
    const res = await resolveGameAPI(gameId);

    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'COMPLETED', winnerName: res.winner || 'User_Abebe' } : g));

    if (targetGame) {
      setResolvedWinnerModal({
        game: targetGame,
        winnerName: res.winner || 'User_Abebe',
        winningValue: res.winner ? 'Box #47' : 'Lowest Unique #3',
        details: res.details || res.message
      });
    }

    triggerToast('🏆 Backend Game Engine resolved game! Winner revealed.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        walletBalance={wallet.balance}
        onOpenWallet={() => setIsWalletOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'detail') setSelectedGame(null);
        }}
      />

      {/* Toast Notification Popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-2xl shadow-2xl shadow-cyan-500/20 animate-bounce">
          ✨ {toastMsg}
        </div>
      )}

      {/* Main Container Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pb-16">
        
        {activeTab === 'home' && (
          <HomePage
            games={games}
            onSelectGame={handleSelectGame}
            onNavigateExplore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'explore' && (
          <ExplorePage
            games={games}
            onSelectGame={handleSelectGame}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryPage
            games={games}
            onSelectGame={handleSelectGame}
          />
        )}

        {activeTab === 'detail' && selectedGame && (
          <GameDetailPage
            game={selectedGame}
            onBack={() => {
              setActiveTab('explore');
              setSelectedGame(null);
            }}
            walletBalance={wallet.balance}
            onRefreshWallet={loadInitialData}
            onDeductWallet={(fee) => {
              const newBal = deductWalletBalance(fee);
              setWallet(prev => ({ ...prev, balance: newBal }));
              return newBal;
            }}
            onOpenWallet={() => setIsWalletOpen(true)}
            onUpdateGame={(updated) => {
              setSelectedGame(updated);
              setGames(prev => prev.map(g => g.id === updated.id ? updated : g));
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <UserDashboardPage
            wallet={wallet}
            onOpenWallet={() => setIsWalletOpen(true)}
          />
        )}

        {activeTab === 'seller' && (
          <SellerDashboardPage
            games={games}
            onAddGame={handleAddGame}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage
            games={games}
            onApproveGame={handleApproveGame}
            onRejectGame={handleRejectGame}
            onResolveGame={handleResolveGame}
          />
        )}

      </main>

      {/* Global Wallet Modal */}
      {isWalletOpen && (
        <WalletModal
          wallet={wallet}
          onClose={() => setIsWalletOpen(false)}
          onRefreshWallet={loadInitialData}
        />
      )}

      {/* Winner Reveal Celebration Modal */}
      {resolvedWinnerModal && (
        <WinnerRevealModal
          game={resolvedWinnerModal.game}
          winnerName={resolvedWinnerModal.winnerName}
          winningValue={resolvedWinnerModal.winningValue}
          details={resolvedWinnerModal.details}
          onClose={() => setResolvedWinnerModal(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        AddisGigs Games Platform Architecture • Developer 2 Module Active
      </footer>

    </div>
  );
}

export default App;
