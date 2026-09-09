import React, { useState, useEffect, useRef } from 'react';
import type { Role, User, Notification as NotificationType } from '../types';
import { Trophy, Wallet, Search, Home, User as UserIcon, Store, ShieldAlert, Bell, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { fetchNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI } from '../services/api';

interface NavbarProps {
  currentRole: Role;
  currentUser?: User | null;
  onRoleChange: (role: Role) => void;
  walletBalance: number;
  onOpenWallet: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onRoleChange: _onRoleChange,
  walletBalance,
  onOpenWallet,
  onOpenAuthModal,
  onLogout,
  activeTab,
  onTabChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click-Outside Listener Hook for Popups & Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const timer = setInterval(() => {
        loadNotifications();
      }, 6000); // Real-time notification polling every 6 seconds
      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    const list = await fetchNotificationsAPI();
    setNotifications(list);
  };

  const handleNotificationItemClick = async (n: NotificationType) => {
    await markNotificationReadAPI(n.id);
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
    setShowNotifMenu(false);

    // Deep-linking contextual routing based on notification event type
    if (n.eventType === 'GAME_EVENT' || n.eventType === 'GAME_WIN' || n.eventType === 'GAME_LOSS') {
      onTabChange('explore');
    } else if (n.eventType === 'DEPOSIT' || n.eventType === 'WITHDRAWAL' || n.eventType === 'REFUND') {
      onTabChange('dashboard');
    } else if (currentRole === 'ADMIN') {
      onTabChange('admin');
    } else {
      onTabChange('dashboard');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAPI();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 glass-panel bg-slate-950/95 border-b border-slate-800/80 px-4 lg:px-8 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Clean Brand Logo */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-1">
              AddisGigs <span className="text-cyan-400">Games</span>
            </h1>
          </div>
        </div>

        {/* Streamlined Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" /> Home
          </button>

          <button
            onClick={() => onTabChange('explore')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" /> Explore
          </button>

          {currentUser && (
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-4 h-4" /> Account Hub
            </button>
          )}

          {(currentRole === 'SELLER' || currentRole === 'ADMIN') && (
            <button
              onClick={() => onTabChange('seller')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'seller'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-4 h-4" /> Seller Hub
            </button>
          )}

          {/* Admin Console Tab strictly visible to ADMIN */}
          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-500/20 to-rose-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Admin Console
            </button>
          )}
        </nav>

        {/* Right Section Header Controls */}
        <div className="flex items-center gap-3">
          
          {/* Wallet Balance Pill */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-cyan-300">{walletBalance.toLocaleString()} ETB</span>
          </button>

          {/* Notifications Dropdown Container with Click-Outside Ref */}
          {currentUser && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-cyan-400 hover:underline font-mono"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No notifications.</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationItemClick(n)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:border-cyan-500/50 ${
                            n.isRead
                              ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                              : 'bg-cyan-950/60 border-cyan-500/40 text-slate-100 font-semibold'
                          }`}
                        >
                          <div className="font-bold">{n.title}</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">{n.message}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] text-cyan-400 font-mono underline">Open →</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Avatar Dropdown Menu Container with Click-Outside Ref */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.username.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="font-bold text-slate-200 hidden sm:inline">{currentUser.username}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs font-medium">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-bold text-slate-100 truncate">{currentUser.username}</div>
                    <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      Role: {currentRole}
                    </div>
                  </div>

                  <button
                    onClick={() => { onTabChange('dashboard'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2 font-bold"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" /> Account Hub
                  </button>

                  {(currentRole === 'SELLER' || currentRole === 'ADMIN') && (
                    <button
                      onClick={() => { onTabChange('seller'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2 font-bold"
                    >
                      <Store className="w-4 h-4 text-purple-400" /> Seller Dashboard
                    </button>
                  )}

                  {currentRole === 'ADMIN' && (
                    <button
                      onClick={() => { onTabChange('admin'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-purple-300 flex items-center gap-2 font-bold"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-400" /> Admin Console
                    </button>
                  )}

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/60 text-rose-300 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
