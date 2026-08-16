import React from 'react';
import type { Role } from '../types';
import { IconTrophy, IconWallet, IconTelegram } from './Icons';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  walletBalance: number;
  onOpenWallet: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  walletBalance,
  onOpenWallet,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('marketplace')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <IconTrophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              AddisGigs <span className="text-gradient">Games</span>
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest">Product Competitions</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onTabChange('marketplace')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Marketplace
          </button>
          
          {currentRole === 'USER' && (
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Games & Activity
            </button>
          )}

          {currentRole === 'SELLER' && (
            <button
              onClick={() => onTabChange('seller')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'seller'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Seller Dashboard
            </button>
          )}

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Control Panel
            </button>
          )}
        </nav>

        {/* Right Section: Role Switcher, Wallet, Telegram */}
        <div className="flex items-center gap-3">
          
          {/* Wallet Button */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-sm hover:shadow-cyan-500/20"
          >
            <IconWallet className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-cyan-300">{walletBalance.toLocaleString()} ETB</span>
          </button>

          {/* Role selector dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            {(['USER', 'SELLER', 'ADMIN'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  onRoleChange(r);
                  if (r === 'USER') onTabChange('marketplace');
                  if (r === 'SELLER') onTabChange('seller');
                  if (r === 'ADMIN') onTabChange('admin');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all ${
                  currentRole === r
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Telegram Notification Ready Indicator */}
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 relative group cursor-pointer" title="Telegram Notifications Active">
            <IconTelegram className="w-4 h-4 text-sky-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>

        </div>
      </div>
    </header>
  );
};
