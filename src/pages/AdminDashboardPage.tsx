import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldAlert, Image as ImageIcon, Users, Store } from 'lucide-react';
import type { Game, PaymentSubmission, WithdrawalRequest, UserAdminRecord } from '../types';
import { IconShield } from '../components/Icons';
import {
  fetchAdminDepositsAPI, approveAdminDepositAPI, rejectAdminDepositAPI,
  fetchAdminWithdrawalsAPI, approveAdminWithdrawalAPI, rejectAdminWithdrawalAPI,
  fetchAdminUsersAPI, toggleAdminUserStatusAPI, changeAdminUserRoleAPI,
  fetchPendingSellersAPI, approveAdminSellerAPI, rejectAdminSellerAPI
} from '../services/api';

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
  const [activeTab, setActiveTab] = useState<'games' | 'payments' | 'withdrawals' | 'users' | 'sellers'>('games');
  const [rejectingGame, setRejectingGame] = useState<Game | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Live Backend Data States
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<UserAdminRecord[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);

  const [paymentFilter, setPaymentFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const depList = await fetchAdminDepositsAPI(paymentFilter);
    setPayments(depList);

    const wdList = await fetchAdminWithdrawalsAPI(withdrawalFilter);
    setWithdrawals(wdList);

    const usrList = await fetchAdminUsersAPI();
    setUsers(usrList);

    const selList = await fetchPendingSellersAPI();
    setSellers(selList);
  };

  useEffect(() => {
    fetchAdminDepositsAPI(paymentFilter).then(list => setPayments(list));
  }, [paymentFilter]);

  useEffect(() => {
    fetchAdminWithdrawalsAPI(withdrawalFilter).then(list => setWithdrawals(list));
  }, [withdrawalFilter]);

  const handleApproveDeposit = async (id: number) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await approveAdminDepositAPI(id, 'Approved via Web Admin');
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminDepositsAPI(paymentFilter).then(list => setPayments(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRejectDeposit = async (id: number) => {
    const note = window.prompt("Reason for rejecting deposit:", "Invalid transaction reference or proof mismatch");
    if (!note) return;
    setStatusMsg('');
    setErrorMsg('');
    const res = await rejectAdminDepositAPI(id, note);
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminDepositsAPI(paymentFilter).then(list => setPayments(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleApproveWithdrawal = async (id: number) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await approveAdminWithdrawalAPI(id, 'Approved via Web Admin');
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminWithdrawalsAPI(withdrawalFilter).then(list => setWithdrawals(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    const note = window.prompt("Reason for rejecting withdrawal:", "Account details mismatched or payout declined");
    if (!note) return;
    setStatusMsg('');
    setErrorMsg('');
    const res = await rejectAdminWithdrawalAPI(id, note);
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminWithdrawalsAPI(withdrawalFilter).then(list => setWithdrawals(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const res = await toggleAdminUserStatusAPI(userId, newStatus);
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminUsersAPI().then(list => setUsers(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleChangeUserRole = async (userId: number, newRole: string) => {
    const res = await changeAdminUserRoleAPI(userId, newRole);
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminUsersAPI().then(list => setUsers(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleApproveSeller = async (id: number) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await approveAdminSellerAPI(id);
    if (res.success) {
      setStatusMsg(res.message);
      fetchPendingSellersAPI().then(list => setSellers(list));
      fetchAdminUsersAPI().then(list => setUsers(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRejectSeller = async (id: number) => {
    const reason = window.prompt("Reason for rejecting seller request:", "Store information unverified");
    if (!reason) return;
    setStatusMsg('');
    setErrorMsg('');
    const res = await rejectAdminSellerAPI(id, reason);
    if (res.success) {
      setStatusMsg(res.message);
      fetchPendingSellersAPI().then(list => setSellers(list));
    } else {
      setErrorMsg(res.message);
    }
  };

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
            <p className="text-xs text-purple-400 font-mono">Platform Moderation, Direct Web Proof Verification & User Management</p>
          </div>
        </div>

        <div className="px-4 py-2 bg-purple-950/60 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-300">
          Role: Super Admin (bewnet / kun)
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-400" />
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Registered Accounts</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">{users.length}</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Verified Sellers</span>
          <div className="text-2xl font-bold font-mono text-purple-300">{users.filter(u => u.role === 'SELLER').length}</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Pending Web Deposits</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{payments.filter(p => p.status === 'PENDING').length}</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-mono">Pending Withdrawals</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{withdrawals.filter(w => w.status === 'PENDING').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'games'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Game & Product Approvals
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Deposit Verification ({payments.filter(p => p.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'withdrawals'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Withdrawal Requests ({withdrawals.filter(w => w.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sellers'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Seller Applications ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* Tab 1: Games */}
      {activeTab === 'games' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block"></span>
                Pending Seller Posts Queue
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
                            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve & Publish
                          </button>
                          <button
                            onClick={() => {
                              setRejectingGame(g);
                              setRejectionReasonInput('Photo is blurry or item pricing requires review.');
                            }}
                            className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1"
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

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
                Active Live Games Control Center
              </h3>
            </div>

            <div className="glass-panel overflow-hidden border border-cyan-500/30 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-cyan-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Challenge Title</th>
                    <th className="p-3">Seller</th>
                    <th className="p-3">Engine Type</th>
                    <th className="p-3">Entry Fee</th>
                    <th className="p-3">Participants</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {games.filter(g => g.status === 'ACTIVE').map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-bold text-slate-100">{g.title}</td>
                      <td className="p-3 text-slate-400">{g.sellerName}</td>
                      <td className="p-3 text-cyan-400 font-bold">{g.gameType}</td>
                      <td className="p-3 text-emerald-400 font-bold">{g.entryFee} ETB</td>
                      <td className="p-3 text-slate-200">{g.participantsCount} / {g.maxParticipants}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onResolveGame(g.id)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg uppercase"
                        >
                          Trigger Winner Draw 🎲
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Direct Web Deposits */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-100">User Direct Web Payment Submissions</h3>
            <div className="flex gap-1 text-[11px]">
              {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setPaymentFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                    paymentFilter === st ? 'bg-purple-600 text-white font-extrabold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Proof Image</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                      No deposits found under '{paymentFilter}' status.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-bold text-slate-100">{p.username}</td>
                      <td className="p-3 text-cyan-400">{p.paymentMethod}</td>
                      <td className="p-3 text-purple-300 font-bold">{p.transactionId}</td>
                      <td className="p-3 font-bold text-emerald-400">{p.amount} ETB</td>
                      <td className="p-3">
                        {p.proofImageUrl ? (
                          <button
                            onClick={() => setPreviewProofUrl(p.proofImageUrl || null)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg flex items-center gap-1 font-sans text-[11px]"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> View Proof
                          </button>
                        ) : (
                          <span className="text-slate-500 font-sans">No image</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`badge-pill ${p.status === 'APPROVED' ? 'badge-emerald' : p.status === 'REJECTED' ? 'badge-rose' : 'badge-amber'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        {p.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApproveDeposit(p.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs"
                            >
                              ✓ Approve & Credit
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(p.id)}
                              className="px-3 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-lg text-xs"
                            >
                              ✕ Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-sans font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-100">User Withdrawal Payout Requests</h3>
            <div className="flex gap-1 text-[11px]">
              {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setWithdrawalFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                    withdrawalFilter === st ? 'bg-purple-600 text-white font-extrabold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Payout Method</th>
                  <th className="p-3">Account / Phone</th>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                      No withdrawal requests found under '{withdrawalFilter}' status.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-bold text-slate-100">{w.username}</td>
                      <td className="p-3 text-cyan-400">{w.withdrawalMethod}</td>
                      <td className="p-3 text-slate-300">{w.accountNumber} {w.accountName ? `(${w.accountName})` : ''}</td>
                      <td className="p-3 text-purple-300 font-bold">{w.transactionId}</td>
                      <td className="p-3 font-bold text-rose-400">{w.amount} ETB</td>
                      <td className="p-3">
                        <span className={`badge-pill ${w.status === 'APPROVED' ? 'badge-emerald' : w.status === 'REJECTED' ? 'badge-rose' : 'badge-amber'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        {w.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApproveWithdrawal(w.id)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs"
                            >
                              ✓ Approve Payout
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(w.id)}
                              className="px-3 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-lg text-xs"
                            >
                              ✕ Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-sans font-semibold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Seller Applications */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-400" />
            Pending Seller Applications Queue
          </h3>

          <div className="glass-panel overflow-hidden border border-purple-500/30 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-purple-300 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User Applicant</th>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Location / Address</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Admin Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {sellers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                      No pending seller applications waiting for review.
                    </td>
                  </tr>
                ) : (
                  sellers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-sans font-bold text-slate-100">{s.username}</td>
                      <td className="p-3 text-purple-300 font-bold">{s.business_name}</td>
                      <td className="p-3 text-slate-300">{s.phone_number}</td>
                      <td className="p-3 text-slate-400">{s.address}</td>
                      <td className="p-3 text-slate-300 font-sans">{s.description || 'N/A'}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveSeller(s.id)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve Seller Role
                        </button>
                        <button
                          onClick={() => handleRejectSeller(s.id)}
                          className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject Request
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: User Administration */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Registered Accounts Administration
          </h3>
          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-sans font-bold text-slate-100">{u.username}</td>
                    <td className="p-3 text-slate-400">{u.email || 'N/A'}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] font-bold text-cyan-300 focus:outline-none"
                      >
                        <option value="USER">USER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.accountStatus === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(u.dateJoined).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.accountStatus)}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600/40'
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40'
                        }`}
                      >
                        {u.accountStatus === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Proof Preview Modal */}
      <AnimatePresence>
        {previewProofUrl && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setPreviewProofUrl(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="font-extrabold text-base text-white">Payment Proof Screenshot Preview</h4>
              <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                <img src={previewProofUrl} alt="Deposit Proof" className="max-w-full max-h-[55vh] object-contain rounded-lg" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Post Rejection Modal */}
      <AnimatePresence>
        {rejectingGame && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setRejectingGame(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <button
                onClick={() => setRejectingGame(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-3 bg-rose-950 border border-rose-500/40 rounded-2xl">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Reject Seller Post</h3>
                  <p className="text-xs text-slate-400">Specify reason for seller correction</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">Rejection Reason:</label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg uppercase"
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
