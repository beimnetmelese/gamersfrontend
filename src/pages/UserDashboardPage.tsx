import React, { useState, useEffect } from 'react';
import type { Wallet, User, UserStats, Favorite, Notification, Game, UserBadgeData } from '../types';
import { IconTrophy } from '../components/Icons';
import { FloatingToastBanner } from '../components/FloatingToastBanner';
import { Store, Package, Trophy, Lock, Crown, Flame, Sparkles, Target, Compass, Banknote, Footprints, Medal } from 'lucide-react';
import {
  fetchUserProfileAPI, updateUserProfileAPI,
  fetchFavoritesAPI, fetchUserStatsAPI,
  fetchNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI,
  fetchMyGamesAPI, applySellerAPI, fetchUserBadgesAPI
} from '../services/api';

const badgeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  sparkles: Sparkles,
  trophy: Trophy,
  target: Target,
  crown: Crown,
  banknote: Banknote,
  flame: Flame,
  compass: Compass,
};

interface UserDashboardProps {
  wallet: Wallet;
  onOpenWallet: () => void;
  sellerApplicationRequest?: number;
}

export const UserDashboardPage: React.FC<UserDashboardProps> = ({
  wallet,
  onOpenWallet,
  sellerApplicationRequest = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'my_games' | 'wallet' | 'badges' | 'favorites' | 'notifications' | 'settings'>('profile');

  // User Profile state
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Seller Application Modal State
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerBusinessName, setSellerBusinessName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerDesc, setSellerDesc] = useState('');

  // Status/Error messaging
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Data states
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [badgeData, setBadgeData] = useState<UserBadgeData | null>(null);

  // Games Filter State
  const [gameStatusFilter, setGameStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (sellerApplicationRequest > 0) setShowSellerModal(true);
  }, [sellerApplicationRequest]);

  const loadAllData = async () => {
    const prof = await fetchUserProfileAPI();
    const stats = await fetchUserStatsAPI();
    if (prof) {
      setUserProfile(prof);
      setUsername(prof.username || '');
      setFirstName(prof.firstName || prof.first_name || '');
      setLastName(prof.lastName || prof.last_name || '');
      setEmail(prof.email || '');
      setBio(prof.bio || '');
      setPhoneNumber(prof.phoneNumber || '');
      setAvatarUrl(prof.avatarUrl || '');
    }
    setUserStats(stats);
    
    const favs = await fetchFavoritesAPI();
    setFavorites(favs);

    const list = await fetchNotificationsAPI();
    setNotifications(list);

    const games = await fetchMyGamesAPI(gameStatusFilter);
    setMyGames(games);

    const badges = await fetchUserBadgesAPI();
    setBadgeData(badges);
  };

  useEffect(() => {
    fetchMyGamesAPI(gameStatusFilter).then(games => setMyGames(games));
  }, [gameStatusFilter]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    const res = await updateUserProfileAPI({
      username,
      firstName,
      lastName,
      email,
      bio,
      phoneNumber,
      avatarUrl
    });
    if (res.success) {
      setStatusMsg("Profile updated successfully!");
      loadAllData();
    } else {
      setErrorMsg(res.message);
    }
  };


  const handleSellerApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    if (!sellerBusinessName.trim() || !sellerPhone.trim() || !sellerAddress.trim()) {
      setErrorMsg("Business name, phone number, and location address are required.");
      return;
    }

    const res = await applySellerAPI(sellerBusinessName, sellerPhone, sellerAddress, sellerDesc);
    if (res.success) {
      setStatusMsg(res.message);
      setShowSellerModal(false);
      loadAllData();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleMarkNotifRead = async (id: number) => {
    await markNotificationReadAPI(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotifsRead = async () => {
    await markAllNotificationsReadAPI();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* User Header Summary */}
      <div className="glass-panel p-6 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-slate-950 shadow-lg shadow-cyan-500/30 overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (username || 'GU').slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-100">{userProfile?.username || 'Gamer Profile'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                {userProfile?.role || 'USER'}
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-mono">
              Email: {userProfile?.email || 'user@addisgigs.et'} • Status: {userProfile?.accountStatus || 'ACTIVE'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-center">
          <div className="px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Available Balance</span>
            <strong className="text-emerald-400 font-mono text-lg">{(wallet.availableBalance ?? wallet.balance).toLocaleString()} ETB</strong>
          </div>
          <button
            onClick={onOpenWallet}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30"
          >
            + Add Money / Withdraw
          </button>
        </div>
      </div>

      <FloatingToastBanner
        statusMsg={statusMsg}
        errorMsg={errorMsg}
        onClearStatus={() => setStatusMsg('')}
        onClearError={() => setErrorMsg('')}
      />

      {/* Main Account Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {(['profile', 'my_games', 'wallet', 'badges', 'favorites', 'notifications', 'settings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === t
                ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.replace('_', ' ')}
            {t === 'notifications' && notifications.filter(n => !n.isRead).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-mono">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE SUMMARY */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Key Game Statistics Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="glass-card p-3.5 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">Games Played</span>
              <strong className="text-xl font-bold font-mono text-cyan-300">{userStats?.gamesPlayed || 0}</strong>
            </div>
            <div className="glass-card p-3.5 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">Games Won</span>
              <strong className="text-xl font-bold font-mono text-amber-400">{userStats?.gamesWon || 0} 🏆</strong>
            </div>
            <div className="glass-card p-3.5 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">Games Lost</span>
              <strong className="text-xl font-bold font-mono text-slate-400">{userStats?.gamesLost || 0}</strong>
            </div>
            <div className="glass-card p-3.5 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">Win Rate</span>
              <strong className="text-xl font-bold font-mono text-emerald-400">{userStats?.winRate || 0}%</strong>
            </div>
            <div className="glass-card p-3.5 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">Total Entries</span>
              <strong className="text-xl font-bold font-mono text-purple-300">{userStats?.totalEntries || 0}</strong>
            </div>
            <div className="glass-card p-3.5 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">Total Spent</span>
              <strong className="text-xl font-bold font-mono text-slate-200">{(userStats?.totalSpent || 0).toLocaleString()} ETB</strong>
            </div>
          </div>

          {/* User Details & Layout Card Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 space-y-4 border border-slate-800 text-xs">
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
                Account Information
              </h3>
              <div className="space-y-3 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">First / Full Name:</span>
                  <strong className="text-slate-200 font-mono">{userProfile?.firstName || userProfile?.first_name || firstName || 'Player'}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Username:</span>
                  <strong className="text-slate-200 font-mono">{userProfile?.username || username}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Email Address:</span>
                  <strong className="text-slate-200 font-mono truncate max-w-[200px]">{userProfile?.email || email || 'N/A'}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Phone Number:</span>
                  <strong className="text-slate-200 font-mono">{userProfile?.phoneNumber || phoneNumber || 'Not Set'}</strong>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium block">Personal Bio:</span>
                  <p className="text-slate-300 leading-relaxed">{userProfile?.bio || 'No bio specified yet.'}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4 border border-slate-800 text-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Account Status & Security
                </h3>
                <div className="space-y-3 font-sans mt-3">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Role Level:</span>
                    <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-lg font-mono font-bold text-xs">
                      {userProfile?.role || 'USER'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Account Status:</span>
                    <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded-lg font-mono font-bold text-xs">
                      {userProfile?.accountStatus || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-medium">Preferred Language:</span>
                    <span className="text-slate-200 font-mono font-bold uppercase">English (EN)</span>
                  </div>
                </div>
              </div>

              {/* Become a Seller Banner for USER role */}
              {userProfile?.role === 'USER' && (
                <div className="p-4 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/30 rounded-2xl space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-purple-400" />
                    <h4 className="font-extrabold text-sm text-white">Become a Verified Seller</h4>
                  </div>
                  <p className="text-[11px] text-slate-300">Host your own game competitions, list tech items, and gain seller capabilities on AddisGigs.</p>
                  <button
                    onClick={() => setShowSellerModal(true)}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider"
                  >
                    Apply to Become a Seller →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY GAMES */}
      {activeTab === 'my_games' && (
        <div className="space-y-6">
          {/* Deliveries Tracker - Render real clean empty state if no deliveries */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
              <IconTrophy className="w-5 h-5 text-amber-400" />
              Won Product Delivery Tracker
            </h3>
            
            <div className="glass-panel p-8 border border-slate-800 text-center space-y-2 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">No Product Deliveries in Progress</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">When you win a product challenge or treasure box, your shipping and courier delivery status will appear here in real-time.</p>
            </div>
          </div>

          {/* Games Category Filter Pills */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-extrabold text-lg text-slate-100">Joined Competitions</h3>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'WON', 'LOST', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setGameStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                      gameStatusFilter === st
                        ? 'bg-cyan-500 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
              {myGames.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400 space-y-2">
                  <div className="font-bold text-slate-300">No active or past games found</div>
                  <p className="text-slate-500">Explore active challenges on the home page and enter your first bid!</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Game Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Entry Fee</th>
                      <th className="p-3">Participants</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {myGames.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-sans font-bold text-slate-100">{g.title}</td>
                        <td className="p-3 text-cyan-400">{g.gameType}</td>
                        <td className="p-3 text-slate-300">{g.entryFee} ETB</td>
                        <td className="p-3 text-slate-400">{g.participantsCount}/{g.maxParticipants}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            g.status === 'ACTIVE' ? 'bg-cyan-950 text-cyan-300' :
                            g.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">
                          {g.winnerName ? (
                            <span className="text-amber-400 font-extrabold">{g.winnerName}</span>
                          ) : (
                            <span className="text-slate-400">In Progress</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WALLET */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-100">Wallet Financial Operations</h3>
            <button
              onClick={onOpenWallet}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30"
            >
              + Add Money / Withdraw
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Available Balance</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{(wallet.availableBalance ?? wallet.balance).toLocaleString()} ETB</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Balance</span>
              <div className="text-2xl font-bold font-mono text-cyan-300">{wallet.balance.toLocaleString()} ETB</div>
            </div>
            <div className="glass-card p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Reserved Payout Balance</span>
              <div className="text-2xl font-bold font-mono text-amber-400">{(wallet.reservedBalance || 0).toLocaleString()} ETB</div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Operation</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {wallet.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">No financial transactions recorded yet.</td>
                  </tr>
                ) : (
                  wallet.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-bold text-slate-200">{tx.note || tx.transactionType}</td>
                      <td className="p-3 text-cyan-400">{tx.transactionType}</td>
                      <td className="p-3 text-slate-400">{tx.referenceId || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${tx.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                          {tx.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className={`p-3 text-right font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ETB
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30">
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5"><div><div className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-[0.2em]">Achievement hall</div><h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Your Player Badges</h3><p className="text-xs text-slate-400 mt-2 max-w-xl">Every badge is calculated from your real competitions, wins, spending, and game variety.</p></div><div className="text-right"><div className="text-[10px] text-slate-500 uppercase font-mono">Player points</div><div className="text-4xl font-black font-mono text-amber-300">{badgeData?.total_points || 0}</div><div className="text-[10px] text-slate-500">{badgeData?.badges.filter(b => b.earned).length || 0} badges unlocked</div></div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { key: 'winners' as const, title: 'Top Winners', subtitle: 'Ranked by competitions won', icon: Trophy, color: 'text-amber-300', empty: 'No winners recorded yet.', unit: 'wins' },
              { key: 'games_played' as const, title: 'Most Active Players', subtitle: 'Ranked by games played', icon: Medal, color: 'text-cyan-300', empty: 'No games played yet.', unit: 'games' },
            ].map(board => {
              const leaderboard = badgeData?.leaderboards?.[board.key];
              return <div key={board.key} className="glass-panel p-5 border border-slate-800 rounded-3xl space-y-4"><div className="flex items-start justify-between"><div><h3 className="font-black text-white flex items-center gap-2"><board.icon className={`w-5 h-5 ${board.color}`} /> {board.title}</h3><p className="text-[11px] text-slate-500 mt-1">{board.subtitle}</p></div><div className="text-right"><div className="text-[9px] text-slate-600 uppercase font-mono">Your rank</div><div className={`text-xl font-black font-mono ${board.color}`}>#{leaderboard?.rank || '-'}</div></div></div><div className="space-y-2">{(!leaderboard?.rows || leaderboard.rows.length === 0) ? <div className="p-5 text-center text-xs text-slate-500">{board.empty}</div> : leaderboard.rows.map(row => <div key={`${board.key}-${row.rank}-${row.username}`} className={`flex items-center gap-3 p-2.5 rounded-xl border ${row.is_current_user ? 'bg-cyan-950/50 border-cyan-500/40' : 'bg-slate-950/60 border-slate-800'}`}><span className={`w-7 text-center font-black font-mono ${row.rank <= 3 ? board.color : 'text-slate-500'}`}>#{row.rank}</span><div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-300">{row.username.slice(0, 2).toUpperCase()}</div><span className={`flex-1 text-xs font-bold ${row.is_current_user ? 'text-cyan-200' : 'text-slate-300'}`}>{row.username}{row.is_current_user ? ' (You)' : ''}</span><span className={`text-xs font-mono font-black ${board.color}`}>{row.score} {board.unit}</span><span className="hidden sm:inline text-[10px] text-slate-600 font-mono">{row.points} pts</span></div>)}</div></div>;
            })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{(badgeData?.badges || []).map(badge => { const Icon = badgeIconMap[badge.icon] || Trophy; const progress = Math.min((badge.progress / badge.threshold) * 100, 100); return <div key={badge.key} className={`text-left p-4 rounded-2xl border ${badge.earned ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10' : 'bg-slate-950/60 border-slate-800 opacity-75'}`}><div className="flex items-start justify-between"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badge.earned ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-600'}`}>{badge.earned ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}</div><span className={`text-[10px] font-mono font-bold ${badge.earned ? 'text-emerald-300' : 'text-slate-600'}`}>{badge.earned ? `+${badge.points}` : 'LOCKED'}</span></div><h4 className={`mt-4 font-black ${badge.earned ? 'text-white' : 'text-slate-400'}`}>{badge.name}</h4><p className="text-[10px] text-slate-500 mt-1 min-h-[30px]">{badge.description}</p><div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${badge.earned ? 'bg-gradient-to-r from-amber-500 to-emerald-400' : 'bg-slate-600'}`} style={{ width: `${progress}%` }} /></div><div className="flex justify-between mt-1 text-[9px] font-mono text-slate-600"><span>{badge.progress}{badge.field === 'spent' ? ' ETB' : badge.field === 'win_rate' ? '%' : ''} / {badge.threshold}{badge.field === 'spent' ? ' ETB' : badge.field === 'win_rate' ? '%' : ''}</span></div></div>; })}</div>
        </div>
      )}

      {/* TAB 5: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100">Saved Favorite Competitions</h3>
          {favorites.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 glass-panel border border-slate-800 rounded-2xl">
              No favorited games yet. Click the heart icon on any competition card to save it here!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((fav) => (
                <div key={fav.id} className="p-4 glass-card border border-slate-800 flex items-center justify-between rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={fav.productImage} alt={fav.gameTitle} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{fav.gameTitle}</h4>
                      <p className="text-xs text-cyan-400 font-mono">Entry: {fav.entryFee} ETB • {fav.gameType}</p>
                    </div>
                  </div>
                  <span className="badge-pill badge-cyan">{fav.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-100">Account Notifications</h3>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllNotifsRead}
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 glass-panel border border-slate-800 rounded-2xl">
                No notifications recorded.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkNotifRead(n.id)}
                  className={`p-4 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between ${
                    n.isRead
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                      : 'bg-cyan-950/40 border-cyan-500/30 text-slate-100 font-semibold'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      {n.title}
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="badge-pill badge-cyan text-[10px]">{n.eventType}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto">
          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="glass-panel p-6 space-y-4 border border-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-base text-slate-100 border-b border-slate-800 pb-2">Personal Profile Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-semibold block">First Name:</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Shadow"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-semibold block">Last Name:</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Player"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">Phone Number:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251911223344"
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">Personal Bio:</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider">
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Seller Application Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative max-w-lg w-full glass-panel bg-slate-900/95 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setShowSellerModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-purple-950 border border-purple-500/40 rounded-2xl">
                <Store className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Seller Registration Application</h3>
                <p className="text-xs text-slate-400">Request store verification from AddisGigs Admins</p>
              </div>
            </div>

            <form onSubmit={handleSellerApplySubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Business / Store Name:</label>
                <input
                  type="text"
                  required
                  value={sellerBusinessName}
                  onChange={(e) => setSellerBusinessName(e.target.value)}
                  placeholder="e.g. Addis Tech Hub Store"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Business Phone Number:</label>
                <input
                  type="text"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="+251911223344"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Store Address / Location:</label>
                <input
                  type="text"
                  required
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  placeholder="Bole Sub-city, Addis Ababa"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Short Business Description:</label>
                <textarea
                  rows={2}
                  value={sellerDesc}
                  onChange={(e) => setSellerDesc(e.target.value)}
                  placeholder="Describe your tech products or game hosting plans..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSellerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg uppercase"
                >
                  Submit Application →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
