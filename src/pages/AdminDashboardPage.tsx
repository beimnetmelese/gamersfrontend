import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, ShieldAlert, Users, Store, Package, Flag, Settings,
  BarChart3, ShieldCheck
} from 'lucide-react';
import type {
  Game, PaymentSubmission, WithdrawalRequest, UserAdminRecord,
  Product, Report, AdminPlatformAnalytics
} from '../types';
import { IconShield } from '../components/Icons';
import { AdminActionReasonModal } from '../components/AdminActionReasonModal';
import { FloatingToastBanner } from '../components/FloatingToastBanner';
import {
  fetchAdminDepositsAPI, approveAdminDepositAPI, rejectAdminDepositAPI,
  fetchAdminWithdrawalsAPI, approveAdminWithdrawalAPI, rejectAdminWithdrawalAPI,
  fetchAdminUsersAPI, toggleAdminUserStatusAPI, changeAdminUserRoleAPI,
  fetchPendingSellersAPI, approveAdminSellerAPI, rejectAdminSellerAPI,
  deleteAdminDepositLogAPI, bulkDeleteAdminDepositLogsAPI,
  fetchProductsAPI, approveProductAPI, rejectProductAPI,
  fetchAdminReportsAPI, resolveReportAPI,
  fetchPlatformSettingsAPI, updatePlatformSettingsAPI,
  banUserAPI, unbanUserAPI, fetchAdminPlatformAnalyticsAPI
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
  const [activeTab, setActiveTab] = useState<'games' | 'payments' | 'withdrawals' | 'users' | 'sellers' | 'products' | 'moderation' | 'settings' | 'analytics'>('games');
  const [rejectingGame, setRejectingGame] = useState<Game | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Professional Modal Action State
  const [actionModalConfig, setActionModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    defaultReason?: string;
    placeholder?: string;
    confirmButtonText?: string;
    confirmButtonVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: (reason: string) => void;
  } | null>(null);

  // Live Backend Data States
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<UserAdminRecord[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);

  // Developer 3 Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [productFilter, setProductFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('PENDING');
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});
  const [platformAnalytics, setPlatformAnalytics] = useState<AdminPlatformAnalytics | null>(null);

  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [inspectingDeposit, setInspectingDeposit] = useState<PaymentSubmission | null>(null);

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

    fetchProductsAPI().then(prods => setProducts(prods));
    fetchAdminReportsAPI().then(reps => setReports(reps));
    fetchPlatformSettingsAPI().then(st => {
      const map: Record<string, string> = {};
      st.forEach(item => { map[item.key] = item.value; });
      setSettingValues(map);
    });
    fetchAdminPlatformAnalyticsAPI().then(an => setPlatformAnalytics(an));
  };

  const handleApproveProduct = async (id: number) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await approveProductAPI(id);
    if (res.success) {
      setStatusMsg(res.message);
      fetchProductsAPI().then(prods => setProducts(prods));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRejectProduct = (id: number) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Reject Product Listing',
      subtitle: `Rejecting product listing #${id}`,
      defaultReason: 'Product does not meet platform quality criteria',
      confirmButtonText: 'Confirm Rejection',
      confirmButtonVariant: 'danger',
      onConfirm: async (reason: string) => {
        setActionModalConfig(null);
        setStatusMsg('');
        setErrorMsg('');
        const res = await rejectProductAPI(id, reason);
        if (res.success) {
          setStatusMsg(res.message);
          fetchProductsAPI().then(prods => setProducts(prods));
        } else {
          setErrorMsg(res.message);
        }
      }
    });
  };

  const handleResolveReport = (id: number, actionTaken: string = 'NO_ACTION') => {
    setActionModalConfig({
      isOpen: true,
      title: 'Resolve Moderation Report',
      subtitle: `Resolving report #${id} (${actionTaken})`,
      defaultReason: actionTaken === 'BAN_USER' ? 'Target user banned by moderation team' : 'Ticket verified and closed',
      confirmButtonText: 'Resolve Report',
      confirmButtonVariant: 'primary',
      onConfirm: async (note: string) => {
        setActionModalConfig(null);
        setStatusMsg('');
        setErrorMsg('');
        const res = await resolveReportAPI(id, note, 'RESOLVED', actionTaken);
        if (res.success) {
          setStatusMsg(res.message);
          fetchAdminReportsAPI().then(reps => setReports(reps));
          fetchAdminUsersAPI().then(usrList => setUsers(usrList));
        } else {
          setErrorMsg(res.message);
        }
      }
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    const list = Object.entries(settingValues).map(([key, value]) => ({ key, value }));
    const res = await updatePlatformSettingsAPI(list);
    if (res.success) {
      setStatusMsg(res.message);
      fetchPlatformSettingsAPI().then(st => {
        const map: Record<string, string> = {};
        st.forEach(item => { map[item.key] = item.value; });
        setSettingValues(map);
      });
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleBanUser = (userId: number, username: string) => {
    setActionModalConfig({
      isOpen: true,
      title: `Ban User @${username}`,
      subtitle: `Suspending user account #${userId}`,
      defaultReason: 'Violation of platform terms and competition rules',
      confirmButtonText: 'Ban User Account',
      confirmButtonVariant: 'danger',
      onConfirm: async (reason: string) => {
        setActionModalConfig(null);
        setStatusMsg('');
        setErrorMsg('');
        const res = await banUserAPI(userId, reason);
        if (res.success) {
          setStatusMsg(res.message);
          fetchAdminUsersAPI().then(usrList => setUsers(usrList));
        } else {
          setErrorMsg(res.message);
        }
      }
    });
  };

  const handleUnbanUser = async (userId: number) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await unbanUserAPI(userId);
    if (res.success) {
      setStatusMsg(res.message);
      fetchAdminUsersAPI().then(usrList => setUsers(usrList));
    } else {
      setErrorMsg(res.message);
    }
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
    const res = await approveAdminDepositAPI(id, 'Approved via Web Admin Override');
    if (res.success) {
      setStatusMsg(res.message);
      const updatedList = await fetchAdminDepositsAPI(paymentFilter);
      setPayments(updatedList);
      if (inspectingDeposit?.id === id) {
        setInspectingDeposit(updatedList.find(p => p.id === id) || null);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRejectDeposit = (id: number) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Reject Deposit Submission',
      subtitle: `Rejecting payment deposit request #${id}`,
      defaultReason: 'Invalid transaction reference or proof mismatch',
      confirmButtonText: 'Reject Deposit',
      confirmButtonVariant: 'danger',
      onConfirm: async (note: string) => {
        setActionModalConfig(null);
        setStatusMsg('');
        setErrorMsg('');
        const res = await rejectAdminDepositAPI(id, note);
        if (res.success) {
          setStatusMsg(res.message);
          const updatedList = await fetchAdminDepositsAPI(paymentFilter);
          setPayments(updatedList);
          if (inspectingDeposit?.id === id) {
            setInspectingDeposit(updatedList.find(p => p.id === id) || null);
          }
        } else {
          setErrorMsg(res.message);
        }
      }
    });
  };

  const handleDeleteDepositLog = async (id: number) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await deleteAdminDepositLogAPI(id);
    if (res.success) {
      setStatusMsg(res.message);
      if (inspectingDeposit?.id === id) setInspectingDeposit(null);
      fetchAdminDepositsAPI(paymentFilter).then(list => setPayments(list));
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleBulkDeleteLogs = async () => {
    setStatusMsg('');
    setErrorMsg('');
    const filterVal = paymentFilter === 'ALL' ? undefined : paymentFilter;
    const res = await bulkDeleteAdminDepositLogsAPI(undefined, filterVal);
    if (res.success) {
      setStatusMsg(res.message);
      setInspectingDeposit(null);
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

  const handleRejectWithdrawal = (id: number) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Reject Withdrawal Request',
      subtitle: `Rejecting user withdrawal request #${id}`,
      defaultReason: 'Account details mismatched or payout declined',
      confirmButtonText: 'Reject Withdrawal',
      confirmButtonVariant: 'danger',
      onConfirm: async (note: string) => {
        setActionModalConfig(null);
        setStatusMsg('');
        setErrorMsg('');
        const res = await rejectAdminWithdrawalAPI(id, note);
        if (res.success) {
          setStatusMsg(res.message);
          fetchAdminWithdrawalsAPI(withdrawalFilter).then(list => setWithdrawals(list));
        } else {
          setErrorMsg(res.message);
        }
      }
    });
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

  const handleRejectSeller = (id: number) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Reject Seller Application',
      subtitle: `Rejecting seller application #${id}`,
      defaultReason: 'Store information unverified',
      confirmButtonText: 'Reject Application',
      confirmButtonVariant: 'danger',
      onConfirm: async (reason: string) => {
        setActionModalConfig(null);
        setStatusMsg('');
        setErrorMsg('');
        const res = await rejectAdminSellerAPI(id, reason);
        if (res.success) {
          setStatusMsg(res.message);
          fetchPendingSellersAPI().then(list => setSellers(list));
        } else {
          setErrorMsg(res.message);
        }
      }
    });
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

      <FloatingToastBanner
        statusMsg={statusMsg}
        errorMsg={errorMsg}
        onClearStatus={() => setStatusMsg('')}
        onClearError={() => setErrorMsg('')}
      />

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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'games'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Game Approvals
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Products Queue ({products.filter(p => p.approvalStatus === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Deposit Verification ({payments.filter(p => p.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'withdrawals'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Withdrawals ({withdrawals.filter(w => w.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sellers'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Seller Applications ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'moderation'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Moderation & Reports ({reports.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Settings
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Analytics
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

      {/* Tab 2: Payment Verification Audit Dashboard */}
      {activeTab === 'payments' && (
        <div className="space-y-5">
          {/* Header & Quick-Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-100 flex items-center gap-2">
                💳 Payment Verification Audit & Overrides
              </h3>
              <p className="text-xs text-slate-400 font-mono">Real-time Automated Receipt Audit Logs, Manual Overrides & Maintenance</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                {[
                  { label: 'All', val: 'ALL' },
                  { label: 'Succeeded (Approved)', val: 'APPROVED' },
                  { label: 'Failed (Rejected)', val: 'REJECTED' },
                  { label: 'Pending', val: 'PENDING' }
                ].map(tab => (
                  <button
                    key={tab.val}
                    onClick={() => {
                      setPaymentFilter(tab.val);
                      fetchAdminDepositsAPI(tab.val).then(list => setPayments(list));
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      paymentFilter === tab.val
                        ? 'bg-purple-600 text-white font-extrabold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {payments.length > 0 && (
                <button
                  onClick={handleBulkDeleteLogs}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filtered Logs
                </button>
              )}
            </div>
          </div>

          {/* Verification Request Table */}
          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Bank / Gateway</th>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3 text-right">Audit & Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                      No deposit verification requests found under status '{paymentFilter}'.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const isSucceeded = p.status === 'APPROVED';
                    const isFailed = p.status === 'REJECTED';
                    const isPending = p.status === 'PENDING';

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-sans">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            {p.username}
                            <span className="text-[10px] text-slate-500 font-mono">(ID: #{p.userId})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.userPhone || p.userEmail || 'No contact'}</div>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            p.bank === 'telebirr' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          }`}>
                            {(p.bank || 'cbe').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-purple-300 font-mono">{p.transactionId}</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">{p.amount} ETB</td>
                        <td className="p-3 font-sans">
                          <span className={`badge-pill ${
                            isSucceeded ? 'badge-emerald' : isFailed ? 'badge-rose' : 'badge-amber'
                          }`}>
                            {isSucceeded ? '✓ SUCCEEDED' : isFailed ? '✕ FAILED' : '⏳ PENDING'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          {new Date(p.submittedAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingDeposit(p)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-slate-700"
                          >
                            🔍 Inspect Log
                          </button>

                          {isFailed || isPending ? (
                            <button
                              onClick={() => handleApproveDeposit(p.id)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-[11px]"
                              title="Manually approve and credit wallet"
                            >
                              ✓ Approve
                            </button>
                          ) : null}

                          {isSucceeded || isPending ? (
                            <button
                              onClick={() => handleRejectDeposit(p.id)}
                              className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-lg text-[11px]"
                              title="Manually reject deposit"
                            >
                              ✕ Reject
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleDeleteDepositLog(p.id)}
                            className="px-2 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-[11px]"
                            title="Delete log entry"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
                      <td className="p-3 font-sans font-bold text-slate-100">{s.username || (s.user ? `User #${s.user}` : 'Applicant')}</td>
                      <td className="p-3 text-purple-300 font-bold">{s.business_name || s.businessName || 'Store'}</td>
                      <td className="p-3 text-slate-300">{s.phone_number || s.phoneNumber || 'N/A'}</td>
                      <td className="p-3 text-slate-400">{s.address || 'N/A'}</td>
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
                      {u.banReason && (
                        <div className="text-[10px] text-rose-400 font-sans mt-1 max-w-[150px] truncate" title={u.banReason}>
                          Ban: {u.banReason}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">{new Date(u.dateJoined).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.accountStatus)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/40'
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40'
                        }`}
                      >
                        {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                      {u.accountStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => handleBanUser(u.id, u.username)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600/40"
                        >
                          Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnbanUser(u.id)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/40"
                        >
                          Unban
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

      {/* 6. PRODUCTS APPROVAL QUEUE */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Product Verification & Approval Queue
              </h3>
              <p className="text-xs text-slate-400">
                Review seller-submitted products before they are published to live competitions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setProductFilter(f)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    productFilter === f
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-x-auto border border-slate-800/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Retail Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {products
                  .filter(p => productFilter === 'ALL' || p.approvalStatus === productFilter)
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-900/40">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop'}
                            alt={p.title}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-slate-950"
                          />
                          <div>
                            <div className="font-sans font-bold text-slate-100">{p.title}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300">{p.category}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {p.condition}
                        </span>
                      </td>
                      <td className="p-3 text-cyan-300 font-bold">ETB {p.estimatedValue?.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.approvalStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40' :
                          p.approvalStatus === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-700/40' :
                          'bg-amber-950 text-amber-300 border border-amber-700/40'
                        }`}>
                          {p.approvalStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {p.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveProduct(p.id)}
                              className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 rounded text-[11px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectProduct(p.id)}
                              className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600/40 rounded text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {p.approvalStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleRejectProduct(p.id)}
                            className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-600/30 rounded text-[11px] font-bold"
                          >
                            Revoke
                          </button>
                        )}
                        {p.approvalStatus === 'REJECTED' && (
                          <button
                            onClick={() => handleApproveProduct(p.id)}
                            className="px-3 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/30 rounded text-[11px] font-bold"
                          >
                            Re-Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                {products.filter(p => productFilter === 'ALL' || p.approvalStatus === productFilter).length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-sans">
                      No products found under filter: {productFilter}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. MODERATION & USER REPORTS */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" />
                Moderation Tickets & Reports
              </h3>
              <p className="text-xs text-slate-400">
                Investigate user complaints regarding scam, fraud, inaccurate descriptions, or non-delivery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    reportFilter === f
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-x-auto border border-slate-800/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Target</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {reports
                  .filter(r => reportFilter === 'ALL' || r.status === reportFilter)
                  .map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="p-3">
                        <span className="font-bold text-slate-200">[{r.targetType}] #{r.targetId}</span>
                        {r.targetLabel && <div className="text-[10px] text-slate-400">{r.targetLabel}</div>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                          {r.category}
                        </span>
                      </td>
                      <td className="p-3 font-sans max-w-sm text-slate-300">
                        <div className="line-clamp-2">{r.reason}</div>
                        {r.resolutionNote && (
                          <div className="text-[10px] text-emerald-400 mt-1">Note: {r.resolutionNote}</div>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">@{r.reporterUsername || 'Anonymous'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40' :
                          r.status === 'DISMISSED' ? 'bg-slate-800 text-slate-400' :
                          'bg-rose-950 text-rose-300 border border-rose-700/40'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {r.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleResolveReport(r.id, 'NO_ACTION')}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => handleResolveReport(r.id, 'WARNING_ISSUED')}
                              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-600/40 rounded text-[11px] font-bold"
                            >
                              Resolve
                            </button>
                            {r.targetType === 'USER' && (
                              <button
                                onClick={() => handleResolveReport(r.id, 'BAN_USER')}
                                className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600/40 rounded text-[11px] font-bold"
                              >
                                Ban Target
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {reports.filter(r => reportFilter === 'ALL' || r.status === reportFilter).length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-sans">
                      No reports found under filter: {reportFilter}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Platform Configuration & Financial Rules
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust live fee cuts, payment thresholds, automated approval rules, and contact information.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="glass-card p-6 border border-slate-800/80 rounded-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settingValues['platform_commission_percent'] || '10'}
                  onChange={e => setSettingValues(prev => ({ ...prev, platform_commission_percent: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Commission retained by the platform on completed competitions.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Auto-Approve Products
                </label>
                <select
                  value={settingValues['auto_approve_products'] || 'false'}
                  onChange={e => setSettingValues(prev => ({ ...prev, auto_approve_products: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-cyan-300 font-mono focus:border-purple-500 focus:outline-none"
                >
                  <option value="false">Require Manual Admin Approval</option>
                  <option value="true">Automatically Approve Seller Products</option>
                </select>
                <span className="text-[10px] text-slate-500">Whether new inventory skips the verification queue.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Minimum Deposit (ETB)
                </label>
                <input
                  type="number"
                  value={settingValues['minimum_deposit_etb'] || '50'}
                  onChange={e => setSettingValues(prev => ({ ...prev, minimum_deposit_etb: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Minimum Withdrawal (ETB)
                </label>
                <input
                  type="number"
                  value={settingValues['minimum_withdrawal_etb'] || '100'}
                  onChange={e => setSettingValues(prev => ({ ...prev, minimum_withdrawal_etb: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Maximum Single Withdrawal (ETB)
                </label>
                <input
                  type="number"
                  value={settingValues['maximum_withdrawal_etb'] || '50000'}
                  onChange={e => setSettingValues(prev => ({ ...prev, maximum_withdrawal_etb: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settingValues['support_email'] || 'support@competition.et'}
                  onChange={e => setSettingValues(prev => ({ ...prev, support_email: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Support Phone
                </label>
                <input
                  type="text"
                  value={settingValues['support_phone'] || '+251 911 000 000'}
                  onChange={e => setSettingValues(prev => ({ ...prev, support_phone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Live Platform Announcement
                </label>
                <input
                  type="text"
                  value={settingValues['platform_announcement'] || ''}
                  placeholder="System maintenance or seasonal bonuses..."
                  onChange={e => setSettingValues(prev => ({ ...prev, platform_announcement: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-sans focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                Save Platform Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. REAL PLATFORM ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Live Platform Analytics & Financial Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Database-backed aggregates computed dynamically across users, ledgers, games, and fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold">USER BASE</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-cyan-300">
                {platformAnalytics?.users.total || users.length}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                <div className="flex justify-between"><span>Active:</span><span className="text-emerald-300 font-bold">{platformAnalytics?.users.active ?? users.filter(u => u.accountStatus === 'ACTIVE').length}</span></div>
                <div className="flex justify-between"><span>Banned:</span><span className="text-rose-300 font-bold">{platformAnalytics?.users.banned ?? users.filter(u => u.accountStatus === 'BANNED').length}</span></div>
                <div className="flex justify-between"><span>Verified Sellers:</span><span className="text-purple-300 font-bold">{platformAnalytics?.users.verifiedSellers ?? users.filter(u => u.role === 'SELLER').length}</span></div>
              </div>
            </div>

            <div className="glass-card p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold">COMPETITIONS</span>
                <Store className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-purple-300">
                {platformAnalytics?.competitions.total || games.length}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                <div className="flex justify-between"><span>Active:</span><span className="text-cyan-300 font-bold">{platformAnalytics?.competitions.active ?? games.filter(g => g.status === 'ACTIVE').length}</span></div>
                <div className="flex justify-between"><span>Completed:</span><span className="text-emerald-300 font-bold">{platformAnalytics?.competitions.completed ?? games.filter(g => g.status === 'COMPLETED').length}</span></div>
                <div className="flex justify-between"><span>Total Entries:</span><span className="text-amber-300 font-bold">{platformAnalytics?.competitions.totalEntries ?? 0}</span></div>
              </div>
            </div>

            <div className="glass-card p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold">FINANCIAL VOLUME</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                ETB {(platformAnalytics?.financials.totalDepositsEtb || 0).toLocaleString()}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                <div className="flex justify-between"><span>Deposits Approved:</span><span className="text-emerald-300 font-bold">ETB {(platformAnalytics?.financials.totalDepositsEtb || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Withdrawals Settled:</span><span className="text-rose-300 font-bold">ETB {(platformAnalytics?.financials.totalWithdrawalsEtb || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Competition Flow:</span><span className="text-cyan-300 font-bold">ETB {(platformAnalytics?.financials.platformVolumeEtb || 0).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="glass-card p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold">FULFILLMENT & TRUST</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-amber-300">
                {platformAnalytics?.fulfillment.totalDeliveries || 0}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                <div className="flex justify-between"><span>Delivered:</span><span className="text-emerald-300 font-bold">{platformAnalytics?.fulfillment.completedDeliveries || 0}</span></div>
                <div className="flex justify-between"><span>Pending Delivery:</span><span className="text-amber-300 font-bold">{platformAnalytics?.fulfillment.pendingDeliveries || 0}</span></div>
                <div className="flex justify-between"><span>Pending Reports:</span><span className="text-rose-400 font-bold">{platformAnalytics?.moderation.pendingReports || reports.filter(r => r.status === 'PENDING').length}</span></div>
              </div>
            </div>
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

      {/* Detailed Verification Inspector Modal */}
      <AnimatePresence>
        {inspectingDeposit && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setInspectingDeposit(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-3xl w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setInspectingDeposit(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-3 bg-purple-950 border border-purple-500/40 rounded-2xl">
                  <IconShield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    Payment Verification Inspector
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      inspectingDeposit.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                      inspectingDeposit.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                      'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {inspectingDeposit.status}
                    </span>
                  </h3>
                  <p className="text-xs text-purple-400 font-mono">Reference: {inspectingDeposit.transactionId} • Deposit ID #{inspectingDeposit.id}</p>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">User Profile</span>
                  <div className="font-bold text-slate-100 text-sm">{inspectingDeposit.username}</div>
                  <div className="text-slate-400">User ID: #{inspectingDeposit.userId}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Contact Details</span>
                  <div className="text-slate-200">{inspectingDeposit.userPhone || 'No Phone Registered'}</div>
                  <div className="text-slate-400">{inspectingDeposit.userEmail || 'No Email'}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Current Wallet Balance</span>
                  <div className="font-black text-emerald-400 text-base">{(inspectingDeposit.walletBalance || 0).toLocaleString()} ETB</div>
                </div>
              </div>

              {/* Verification Breakdown Grid */}
              {inspectingDeposit.verificationLogs && inspectingDeposit.verificationLogs.length > 0 ? (
                (() => {
                  const latestLog = inspectingDeposit.verificationLogs[0];
                  return (
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-purple-300">Automated Scraper Flags & Verification Matrix:</h4>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 ${
                          latestLog.referenceVerified ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}>
                          <span className="text-[10px] font-mono uppercase text-slate-400">1. Reference Exists</span>
                          <span className="font-extrabold text-sm">{latestLog.referenceVerified ? '✓ Valid Reference' : '✕ Not Found'}</span>
                        </div>

                        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 ${
                          latestLog.amountVerified ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}>
                          <span className="text-[10px] font-mono uppercase text-slate-400">2. Amount Match</span>
                          <span className="font-extrabold text-sm">{latestLog.amountVerified ? '✓ Exact Match' : '✕ Amount Mismatch'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Req: {latestLog.requestedAmount} | Scraped: {latestLog.verifiedAmount || 'N/A'}</span>
                        </div>

                        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 ${
                          latestLog.receiverVerified ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}>
                          <span className="text-[10px] font-mono uppercase text-slate-400">3. Receiver Match</span>
                          <span className="font-extrabold text-sm">{latestLog.receiverVerified ? '✓ Receiver Match' : '✕ Name Mismatch'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Target: Beiment Melese</span>
                        </div>
                      </div>

                      {/* Raw Receipt Scraper Logs JSON */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-300 block">Raw Receipt Scraper Log JSON:</span>
                        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 max-h-48 overflow-auto leading-tight">
                          {JSON.stringify(latestLog.receiptData || latestLog, null, 2)}
                        </pre>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 text-center">
                  No automated scraper log recorded for this deposit request yet.
                </div>
              )}

              {/* Manual Override Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDeleteDepositLog(inspectingDeposit.id)}
                  className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 font-bold rounded-xl text-xs"
                >
                  🗑️ Delete Log Entry
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRejectDeposit(inspectingDeposit.id)}
                    className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-bold rounded-xl text-xs"
                  >
                    ✕ Manual Reject Override
                  </button>
                  <button
                    onClick={() => handleApproveDeposit(inspectingDeposit.id)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg"
                  >
                    ✓ Manual Approve Override
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Action Reason Modal */}
      {actionModalConfig && (
        <AdminActionReasonModal
          isOpen={actionModalConfig.isOpen}
          title={actionModalConfig.title}
          subtitle={actionModalConfig.subtitle}
          defaultReason={actionModalConfig.defaultReason}
          placeholder={actionModalConfig.placeholder}
          confirmButtonText={actionModalConfig.confirmButtonText}
          confirmButtonVariant={actionModalConfig.confirmButtonVariant}
          onClose={() => setActionModalConfig(null)}
          onConfirm={actionModalConfig.onConfirm}
        />
      )}
    </div>
  );
};
