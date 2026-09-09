import { useState, useEffect } from 'react';
import type { Role, Game, Wallet, User } from './types';
import { fetchGames, fetchWallet, resolveGameAPI, createGameAPI, updateGameAPI, deductWalletBalance, logoutUserAPI, fetchUserProfileAPI } from './services/api';
import { Navbar } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
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
  
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, reservedBalance: 0, availableBalance: 0, transactions: [] });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMsg, setAuthModalMsg] = useState<string | undefined>(undefined);
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

    const token = localStorage.getItem('allin_auth_token');
    if (token) {
      const userProfile = await fetchUserProfileAPI();
      if (userProfile) {
        setCurrentUser(userProfile);
        if (userProfile.role) setCurrentRole(userProfile.role);
      }
      const loadedWallet = await fetchWallet();
      setWallet(loadedWallet);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Real-time polling timer for wallet balance & session state sync (every 4s)
    const interval = setInterval(() => {
      const token = localStorage.getItem('allin_auth_token');
      if (token) {
        fetchWallet().then(w => setWallet(w));
      }
    }, 4000);

    const handleWalletUpdate = () => {
      const token = localStorage.getItem('allin_auth_token');
      if (token) {
        fetchWallet().then(w => setWallet(w));
      }
    };
    window.addEventListener('allin_wallet_updated', handleWalletUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('allin_wallet_updated', handleWalletUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRequireAuth = (msg?: string) => {
    setAuthModalMsg(msg || 'Please log in or register to perform this action.');
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logoutUserAPI();
    setCurrentUser(null);
    setCurrentRole('USER');
    setWallet({ balance: 0, reservedBalance: 0, availableBalance: 0, transactions: [] });
    setActiveTab('home');
    triggerToast('Logged out successfully.');
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddGame = async (newGame: Partial<Game>) => {
    if (!currentUser) {
      handleRequireAuth('You must be logged in as a Seller to post games.');
      return;
    }

    if (newGame.id) {
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

    const backendCreated = await createGameAPI({
      ...newGame,
      status: 'PENDING_APPROVAL'
    });

    if (backendCreated) {
      setGames(prev => [backendCreated, ...prev]);
      triggerToast(`Competition Post "${backendCreated.title}" submitted for Admin Approval!`);
    } else {
      triggerToast('Failed to create competition post.');
    }
  };

  const handleApproveGame = async (gameId: number) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'ACTIVE', rejectionReason: '' } : g));
    try {
      await fetch(`http://localhost:8000/api/games/${gameId}/approve_game/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('allin_auth_token')}`
        }
      });
    } catch (e) {}
    triggerToast('Game approved by admin and is now LIVE & ACTIVE!');
  };

  const handleRejectGame = async (gameId: number, reason: string) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'REJECTED', rejectionReason: reason } : g));
    try {
      await fetch(`http://localhost:8000/api/games/${gameId}/reject_game/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('allin_auth_token')}`
        },
        body: JSON.stringify({ reason })
      });
    } catch (e) {}
    triggerToast(`Post rejected by admin with feedback: "${reason}"`);
  };

  const handleResolveGame = async (gameId: number) => {
    const targetGame = games.find(g => g.id === gameId);
    const res = await resolveGameAPI(gameId);

    if (res.success) {
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'COMPLETED', winnerName: res.winner || 'Winner' } : g));

      if (targetGame) {
        setResolvedWinnerModal({
          game: targetGame,
          winnerName: res.winner || 'Winner',
          winningValue: res.winner ? 'Official Winning Entry' : 'Draw Result',
          details: res.details || res.message
        });
      }
      triggerToast('🏆 Backend Game Engine resolved game! Winner revealed.');
    } else {
      triggerToast(res.message || 'Failed to resolve game.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={setCurrentRole}
        walletBalance={wallet.availableBalance ?? wallet.balance}
        onOpenWallet={() => {
          if (!currentUser) {
            handleRequireAuth('Please sign in to access your wallet.');
          } else {
            setIsWalletOpen(true);
          }
        }}
        onOpenAuthModal={() => {
          setAuthModalMsg(undefined);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'dashboard' && !currentUser) {
            handleRequireAuth('Please sign in to access your Account Hub.');
            return;
          }
          if (tab === 'seller' && (!currentUser || (currentRole !== 'SELLER' && currentRole !== 'ADMIN'))) {
            if (!currentUser) handleRequireAuth('Please sign in to access Seller Hub.');
            else triggerToast('Seller role required to access Seller Hub.');
            return;
          }
          if (tab === 'admin' && (!currentUser || currentRole !== 'ADMIN')) {
            if (!currentUser) handleRequireAuth('Admin login required.');
            else triggerToast('Admin access restricted to Super Admin role.');
            return;
          }
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
            walletBalance={wallet.availableBalance ?? wallet.balance}
            onRefreshWallet={loadInitialData}
            onDeductWallet={(fee) => {
              const newBal = deductWalletBalance(fee);
              setWallet(prev => ({ ...prev, balance: newBal, availableBalance: Math.max(0, newBal - prev.reservedBalance) }));
              return newBal;
            }}
            onOpenWallet={() => {
              if (!currentUser) handleRequireAuth('Please sign in to access wallet.');
              else setIsWalletOpen(true);
            }}
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

        {activeTab === 'seller' && (currentRole === 'SELLER' || currentRole === 'ADMIN') && (
          <SellerDashboardPage
            games={games}
            onAddGame={handleAddGame}
          />
        )}

        {activeTab === 'admin' && currentRole === 'ADMIN' && (
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

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMessage={authModalMsg}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalMsg(undefined);
          }}
          onSuccess={(user, role) => {
            setCurrentUser(user);
            setCurrentRole(role);
            loadInitialData();
            triggerToast(`Welcome back, ${user.username}!`);
          }}
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
        AddisGigs Games Platform Architecture • Real-Time Notification & RBAC Engine Active
      </footer>

    </div>
  );
}

export default App;
