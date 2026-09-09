import React, { useState, useEffect } from 'react';
import type { Wallet, User, UserStats, Favorite, Notification, Game, HistoryRecord } from '../types';
import { IconTrophy, IconCheck } from '../components/Icons';
import { Eye, EyeOff, Store, Package } from 'lucide-react';
import {
  fetchUserProfileAPI, updateUserProfileAPI, changePasswordAPI,
  fetchFavoritesAPI, fetchUserStatsAPI,
  fetchNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI,
  fetchMyGamesAPI, fetchUserHistoryAPI, applySellerAPI
} from '../services/api';

interface UserDashboardProps {
  wallet: Wallet;
  onOpenWallet: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardProps> = ({
  wallet,
  onOpenWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'my_games' | 'wallet' | 'history' | 'favorites' | 'notifications' | 'settings'>('profile');

  // User Profile state
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // 3-Field Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Eye Toggles for Passwords
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const [historyLogs, setHistoryLogs] = useState<HistoryRecord[]>([]);

  // Games Filter State
  const [gameStatusFilter, setGameStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const prof = await fetchUserProfileAPI();
    const stats = await fetchUserStatsAPI();
    if (prof) {
      setUserProfile(prof);
      setUsername(prof.username || '');
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

    const logs = await fetchUserHistoryAPI();
    setHistoryLogs(logs);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all three password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    const res = await changePasswordAPI(oldPassword, newPassword, confirmPassword);
    if (res.success) {
      setStatusMsg(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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

      {statusMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
          <IconCheck className="w-4 h-4 text-emerald-400" />
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Account Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {(['profile', 'my_games', 'wallet', 'history', 'favorites', 'notifications', 'settings'] as const).map((t) => (
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
                  <span className="text-slate-400 font-medium">Username:</span>
                  <strong className="text-slate-200 font-mono">{userProfile?.username || username}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Email Address:</span>
                  <strong className="text-slate-200 font-mono truncate max-w-[200px]">{userProfile?.email || 'N/A'}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-medium">Phone Number:</span>
                  <strong className="text-slate-200 font-mono">{userProfile?.phoneNumber || 'Not Set'}</strong>
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

      {/* TAB 4: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100">Chronological Audit Log</h3>
          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Activity Event</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">No activity history logs recorded yet.</td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-bold text-slate-200">{log.title}</td>
                      <td className="p-3 text-cyan-400">{log.type}</td>
                      <td className="p-3 text-slate-400">{log.referenceId}</td>
                      <td className="p-3 text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                      <td className={`p-3 text-right font-bold ${log.direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {log.direction === 'CREDIT' ? `+${log.amount}` : `-${log.amount}`} ETB
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

      {/* TAB 7: SETTINGS & PASSWORD WORKFLOW */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="glass-panel p-6 space-y-4 border border-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-base text-slate-100 border-b border-slate-800 pb-2">Personal Profile Details</h3>
            
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

          {/* Secure 3-Field Password Change Workflow */}
          <form onSubmit={handleChangePassword} className="glass-panel p-6 space-y-4 border border-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-base text-slate-100 border-b border-slate-800 pb-2">Password Security Update</h3>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">1. Current Password:</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">2. New Password:</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">3. Confirm New Password:</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider">
              Verify & Update Password →
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
