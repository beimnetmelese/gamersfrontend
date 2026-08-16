import { useState, useEffect } from 'react';
import type { Role, Game, Product, Wallet } from './types';
import { fetchGames, fetchWallet } from './services/api';
import { Navbar } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { MarketplacePage } from './pages/MarketplacePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('USER');
  const [activeTab, setActiveTab] = useState<string>('marketplace');
  
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const [wallet, setWallet] = useState<Wallet>({ balance: 2500, transactions: [] });
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
  };

  const handleAddProduct = (prod: Partial<Product>) => {
    triggerToast(`Product "${prod.title}" added to inventory (Pending Approval).`);
  };

  const handleAddGame = (newGame: Partial<Game>) => {
    const created: Game = {
      id: games.length + 1,
      product: {
        id: 99,
        title: newGame.title || 'New Product',
        category: 'Smartphones',
        description: 'Seller listed item',
        imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
        condition: 'NEW',
        estimatedValue: 75000,
        location: 'Addis Ababa',
        approvalStatus: 'PENDING'
      },
      sellerName: 'Addis Tech Hub',
      title: newGame.title || 'New Game',
      gameType: newGame.gameType || 'TREASURE_BOX',
      entryFee: newGame.entryFee || 200,
      maxParticipants: newGame.maxParticipants || 100,
      participantsCount: 0,
      durationMinutes: 120,
      rulesDescription: newGame.rulesDescription || 'Standard rules',
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString()
    };

    setGames([created, ...games]);
    triggerToast(`Game "${newGame.title}" submitted to Admin for approval!`);
  };

  const handleApproveGame = (gameId: number) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'ACTIVE' } : g));
    triggerToast('Game approved by admin and is now ACTIVE!');
  };

  const handleResolveGame = (gameId: number) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'COMPLETED', winnerName: 'User_Abebe' } : g));
    triggerToast('🏆 Backend Game Engine resolved game! Winner announced.');
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
        
        {activeTab === 'marketplace' && (
          <MarketplacePage
            games={games.filter(g => g.status === 'ACTIVE' || g.status === 'PENDING_APPROVAL')}
            onSelectGame={handleSelectGame}
          />
        )}

        {activeTab === 'detail' && selectedGame && (
          <GameDetailPage
            game={selectedGame}
            onBack={() => {
              setActiveTab('marketplace');
              setSelectedGame(null);
            }}
            walletBalance={wallet.balance}
            onRefreshWallet={loadInitialData}
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
            onAddProduct={handleAddProduct}
            onAddGame={handleAddGame}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage
            games={games}
            onApproveGame={handleApproveGame}
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        AddisGigs Games Platform Architecture • All rights reserved 2026
      </footer>

    </div>
  );
}

export default App;
