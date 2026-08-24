import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldAlert } from 'lucide-react';
import type { Game, PaymentSubmission } from '../types';
import { IconShield } from '../components/Icons';

interface AdminDashboardProps {
  games: Game[];
  onApproveGame: (gameId: number) => void;
  onRejectGame: (gameId: number, reason: string) => void;
  onResolveGame: (gameId: number) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({
  games,
  onApproveGame,
  onRejectGame,
  onResolveGame,
}) => {
  const [activeTab, setActiveTab] = useState<'games' | 'payments' | 'audit'>('games');
  const [rejectingGame, setRejectingGame] = useState<Game | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

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
        <div className="space-y-8">
          
          {/* SECTION 1: PENDING SELLER POSTS QUEUE (TOP PRIORITY) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block"></span>
                Pending Seller Posts Queue (Needs Admin Approval - Top Priority)
              </h3>
              <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-full font-mono font-bold">
                {games.filter(g => g.status === 'PENDING_APPROVAL').length} Pending Review
              </span>
            </div>

            <div className="glass-panel overflow-hidden border border-amber-500/30 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-amber-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Pending Post / Product</th>
                    <th className="p-3">Seller</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Valuation</th>
                    <th className="p-3">Entry Fee</th>
                    <th className="p-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {games.filter(g => g.status === 'PENDING_APPROVAL').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                        No pending seller posts waiting for approval.
                      </td>
                    </tr>
                  ) : (
                    games.filter(g => g.status === 'PENDING_APPROVAL').map((g) => (
                      <tr key={g.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-sans font-bold text-slate-100 flex items-center gap-3">
                          <img
                            src={g.product.imageUrl}
                            alt={g.title}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="text-sm font-bold text-white line-clamp-1">{g.title}</div>
                            <div className="text-[11px] text-slate-400">{g.product.title}</div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{g.sellerName}</td>
                        <td className="p-3 text-purple-300 font-bold">{g.product.category}</td>
                        <td className="p-3 text-amber-300 font-bold">{g.product.estimatedValue.toLocaleString()} ETB</td>
                        <td className="p-3 text-emerald-400 font-bold">{g.entryFee} ETB</td>
                        <td className="p-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => onApproveGame(g.id)}
                            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 uppercase tracking-wider transition-all flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve & Publish
                          </button>
                          <button
                            onClick={() => {
                              setRejectingGame(g);
                              setRejectionReasonInput('Photo is blurry or item pricing requires review.');
                            }}
                            className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-xl text-xs shadow-lg shadow-rose-950/40 uppercase tracking-wider transition-all flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject Post
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: ACTIVE GAMES CONTROL CENTER */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
                Active Live Games Control Center
              </h3>
              <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full font-mono font-bold">
                {games.filter(g => g.status === 'ACTIVE').length} Running Live
              </span>
            </div>

            <div className="glass-panel overflow-hidden border border-cyan-500/30 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-cyan-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Challenge Title / Product</th>
                    <th className="p-3">Seller Hub</th>
                    <th className="p-3">Engine Type</th>
                    <th className="p-3">Entry Fee</th>
                    <th className="p-3">Participants</th>
                    <th className="p-3 text-right">Engine Winner Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {games.filter(g => g.status === 'ACTIVE').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                        No active live games running. Approve pending seller posts above to launch them live!
                      </td>
                    </tr>
                  ) : (
                    games.filter(g => g.status === 'ACTIVE').map((g) => (
                      <tr key={g.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-sans font-bold text-slate-100 flex items-center gap-3">
                          <img
                            src={g.product.imageUrl}
                            alt={g.title}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="text-sm font-bold text-white line-clamp-1">{g.title}</div>
                            <div className="text-[11px] text-slate-400">{g.product.title}</div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{g.sellerName}</td>
                        <td className="p-3 text-cyan-400 font-bold">{g.gameType.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-emerald-400 font-bold">{g.entryFee} ETB</td>
                        <td className="p-3 text-slate-200">{g.participantsCount} / {g.maxParticipants}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onResolveGame(g.id)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/20 uppercase tracking-wider transition-all"
                          >
                            Trigger Winner Draw 🎲
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: COMPLETED CHALLENGES */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                Completed Challenges & Past Winners Ledger
              </h3>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-mono font-bold">
                {games.filter(g => g.status === 'COMPLETED').length} Completed
              </span>
            </div>

            <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Challenge Title</th>
                    <th className="p-3">Winner Champion</th>
                    <th className="p-3">Winning Score</th>
                    <th className="p-3">Prize Item</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {games.filter(g => g.status === 'COMPLETED').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                        No completed challenges yet.
                      </td>
                    </tr>
                  ) : (
                    games.filter(g => g.status === 'COMPLETED').map((g) => (
                      <tr key={g.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-sans font-bold text-slate-100">{g.title}</td>
                        <td className="p-3 text-amber-300 font-bold">@{g.winnerName || 'gamer_champion'}</td>
                        <td className="p-3 text-slate-200">{g.winningValue || 'Winner Entry'}</td>
                        <td className="p-3 text-slate-400">{g.product.title}</td>
                        <td className="p-3 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            COMPLETED
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

      {/* Admin Post Rejection Modal */}
      <AnimatePresence>
        {rejectingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative max-w-lg w-full glass-panel bg-slate-900/95 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/80 space-y-5"
            >
              <button
                onClick={() => setRejectingGame(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-2xl">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Reject Seller Post</h3>
                  <p className="text-xs text-slate-400">Specify reason so seller can fix & resubmit</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 block">Target Post:</span>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center gap-3">
                  <img src={rejectingGame.product.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div>
                    <div className="text-sm font-bold text-white line-clamp-1">{rejectingGame.title}</div>
                    <div className="text-[11px] text-slate-400">{rejectingGame.product.title}</div>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">Quick Reason Presets:</span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[
                    "Photo is blurry or low quality.",
                    "Estimated valuation does not match market price.",
                    "Rules description is unclear or incomplete.",
                    "Product item condition needs verification."
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReasonInput(preset)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700/80 rounded-lg text-[11px] transition-all text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">Admin Feedback & Rejection Reason:</label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Explain clearly what the seller needs to correct..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingGame(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectionReasonInput.trim()) return;
                    onRejectGame(rejectingGame.id, rejectionReasonInput.trim());
                    setRejectingGame(null);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/50 uppercase tracking-wider transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
