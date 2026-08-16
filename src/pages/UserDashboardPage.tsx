import React, { useState } from 'react';
import type { Wallet, ProductDelivery } from '../types';
import { DeliveryTracker } from '../components/DeliveryTracker';
import { IconTrophy } from '../components/Icons';

interface UserDashboardProps {
  wallet: Wallet;
  onOpenWallet: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardProps> = ({
  wallet,
  onOpenWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'my_games' | 'wallet_history' | 'achievements'>('my_games');

  // Seed sample user game participations
  const sampleJoinedGames = [
    { id: 1, title: 'PS5 Digital Slim - Treasure Box', type: 'Treasure Box', fee: 500, status: 'ACTIVE', result: 'Pending Draw', box: 42 },
    { id: 2, title: 'iPhone 15 Pro - Lowest Unique', type: 'Lowest Unique', fee: 1000, status: 'COMPLETED', result: 'WON 🏆', number: 7 },
    { id: 3, title: 'Sony Headphones - Precision Timer', type: 'Precision Timer', fee: 200, status: 'COMPLETED', result: 'Lost', delta: '45 ms' },
  ];

  const sampleDeliveries: ProductDelivery[] = [
    {
      id: 1,
      gameTitle: 'iPhone 15 Pro - Lowest Unique',
      winnerName: 'DemoUser',
      sellerName: 'Titanium Electronics',
      deliveryAddress: 'Bole, Addis Ababa, House #402',
      phoneNumber: '+251911223344',
      trackingCode: 'ETH-SHIP-9982',
      status: 'SHIPPED',
      updatedAt: new Date().toISOString()
    }
  ];

  const achievements = [
    { title: 'First Win', desc: 'Won your first product competition game!', icon: '🏆', unlocked: true },
    { title: 'Treasure Hunter', desc: 'Participate in 5 Treasure Box competitions', icon: '📦', unlocked: true },
    { title: 'Prediction Master', desc: 'Win a Prediction Challenge with < 0.5 delta', icon: '🎯', unlocked: false },
    { title: 'Streak Master', desc: 'Win 3 competition games in a single week', icon: '⚡', unlocked: false },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Header Profile Summary */}
      <div className="glass-panel p-6 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-cyan-500/30">
            DU
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Demo User Profile</h2>
            <p className="text-xs text-cyan-400 font-mono">Status: Active Player • ID #88492</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center">
          <div className="px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Games Joined</span>
            <strong className="text-cyan-300 font-mono text-lg">12</strong>
          </div>
          <div className="px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Games Won</span>
            <strong className="text-emerald-400 font-mono text-lg">2 🏆</strong>
          </div>
          <div className="px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Wallet Balance</span>
            <strong className="text-amber-400 font-mono text-lg">{wallet.balance} ETB</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('my_games')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my_games'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          My Games & Deliveries
        </button>
        <button
          onClick={() => setActiveTab('wallet_history')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wallet_history'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Wallet Financial History
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'achievements'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Achievements & Badges
        </button>
      </div>

      {/* Tab Content 1: My Games & Deliveries */}
      {activeTab === 'my_games' && (
        <div className="space-y-6">
          
          {/* Won Game Deliveries Section */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
              <IconTrophy className="w-5 h-5 text-amber-400" />
              Won Product Delivery Tracker
            </h3>
            {sampleDeliveries.map((del) => (
              <DeliveryTracker key={del.id} delivery={del} />
            ))}
          </div>

          {/* Joined Games List */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-lg text-slate-100">Joined Competition History</h3>
            <div className="glass-panel overflow-hidden border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Game Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Entry Fee</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Selection / Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sampleJoinedGames.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-slate-100">{g.title}</td>
                      <td className="p-3 font-mono text-cyan-400">{g.type}</td>
                      <td className="p-3 font-mono text-slate-300">{g.fee} ETB</td>
                      <td className="p-3">
                        <span className={`badge-pill ${g.status === 'ACTIVE' ? 'badge-cyan' : 'badge-emerald'}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {g.result === 'WON 🏆' ? (
                          <span className="text-amber-400 font-extrabold">{g.result} (Selected #{g.number})</span>
                        ) : (
                          <span className="text-slate-400">{g.result}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Wallet Financial Ledger */}
      {activeTab === 'wallet_history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-100">Complete Financial Ledger</h3>
            <button
              onClick={onOpenWallet}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
            >
              + Deposit Funds
            </button>
          </div>

          <div className="glass-panel overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Transaction Note</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-sans font-bold text-slate-200">{tx.note || tx.transactionType}</td>
                    <td className="p-3 text-cyan-400">{tx.transactionType}</td>
                    <td className="p-3 text-slate-400">{tx.referenceId}</td>
                    <td className="p-3 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className={`p-3 text-right font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach, idx) => (
            <div
              key={idx}
              className={`p-4 glass-card border flex items-center gap-4 ${
                ach.unlocked
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-slate-900'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="text-3xl p-3 bg-slate-900 rounded-2xl border border-slate-800">{ach.icon}</div>
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  {ach.title}
                  {ach.unlocked && <span className="badge-pill badge-amber">Unlocked</span>}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
