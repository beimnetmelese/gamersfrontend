import React, { useState } from 'react';
import type { Game, PaymentSubmission } from '../types';
import { IconShield } from '../components/Icons';

interface AdminDashboardProps {
  games: Game[];
  onApproveGame: (gameId: number) => void;
  onResolveGame: (gameId: number) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({
  games,
  onApproveGame,
  onResolveGame,
}) => {
  const [activeTab, setActiveTab] = useState<'games' | 'payments' | 'audit'>('games');

  const [samplePayments, setSamplePayments] = useState<PaymentSubmission[]>([
    {
      id: 1,
      userId: 101,
      username: 'User_Abebe',
      paymentMethod: 'Telebirr',
      transactionId: 'TX8827361',
      amount: 1500,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    },
    {
      id: 2,
      userId: 102,
      username: 'User_Kebede',
      paymentMethod: 'CBE Birr',
      transactionId: 'CBE994821',
      amount: 500,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    }
  ]);

  const handleApprovePayment = (id: number) => {
    setSamplePayments(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
  };

  const auditLogs = [
    { actor: 'Admin_Super', action: 'APPROVE_GAME', details: 'Approved PS5 Treasure Box game listing', time: '10 mins ago' },
    { actor: 'Admin_Super', action: 'APPROVE_PAYMENT', details: 'Approved deposit TX8827361 of 1500 ETB for User_Abebe', time: '25 mins ago' },
    { actor: 'System', action: 'GAME_RESOLVED', details: 'Calculated winner for Lowest Unique Contest #2', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Executive Header */}
      <div className="glass-panel p-6 border border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-950 rounded-xl border border-purple-500/40">
            <IconShield className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Administrator Control Center</h2>
            <p className="text-xs text-purple-400 font-mono">Platform Moderation, Approvals & Game Engine Trigger</p>
          </div>
        </div>

        <div className="px-4 py-2 bg-purple-950/60 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-300">
          Role: Super Admin (RBAC Level 1)
        </div>
      </div>

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Total Users Registered</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">1,248</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Verified Sellers</span>
          <div className="text-2xl font-bold font-mono text-purple-300">42</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Pending Payment Submissions</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{samplePayments.filter(p => p.status === 'PENDING').length}</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Total Revenue Collected</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">485,000 ETB</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'games'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Game & Product Approvals
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Manual Payment Proof Verification ({samplePayments.filter(p => p.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* Tab 1: Game Approvals & Backend Engine Winner Trigger */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100">Product Competition Moderation</h3>
          <div className="glass-panel overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Game Title</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Engine Type</th>
                  <th className="p-3">Entry Fee</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {games.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-sans font-bold text-slate-100">{g.title}</td>
                    <td className="p-3 text-slate-400">{g.sellerName}</td>
                    <td className="p-3 text-cyan-400">{g.gameType}</td>
                    <td className="p-3 text-slate-300">{g.entryFee} ETB</td>
                    <td className="p-3">
                      <span className={`badge-pill ${g.status === 'ACTIVE' ? 'badge-cyan' : 'badge-emerald'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {g.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => onApproveGame(g.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                        >
                          Approve Game
                        </button>
                      )}
                      {g.status === 'ACTIVE' && (
                        <button
                          onClick={() => onResolveGame(g.id)}
                          className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs"
                        >
                          Trigger Winner Draw 🎲
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manual Payment Proof Verification */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100">User Payment Submissions</h3>
          <div className="glass-panel overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {samplePayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-sans font-bold text-slate-100">{p.username}</td>
                    <td className="p-3 text-cyan-400">{p.paymentMethod}</td>
                    <td className="p-3 text-purple-300 font-bold">{p.transactionId}</td>
                    <td className="p-3 font-bold text-emerald-400">{p.amount} ETB</td>
                    <td className="p-3">
                      <span className={`badge-pill ${p.status === 'APPROVED' ? 'badge-emerald' : 'badge-amber'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApprovePayment(p.id)}
                          className="px-3.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs"
                        >
                          ✓ Approve & Credit Wallet
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-sans font-semibold">Credited to User</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100">Security Audit Trail</h3>
          <div className="glass-panel overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action Flag</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="p-3 font-sans font-bold text-purple-300">{log.actor}</td>
                    <td className="p-3 text-cyan-400">{log.action}</td>
                    <td className="p-3 font-sans text-slate-300">{log.details}</td>
                    <td className="p-3 text-right text-slate-500">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
