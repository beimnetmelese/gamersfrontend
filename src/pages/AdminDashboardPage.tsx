import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, ShieldAlert, Users, Store, Package, Flag, Settings,
  BarChart3, TrendingUp, Activity, DollarSign, UserRound,
  CalendarDays, RefreshCw, Trophy, Search, Eye, WalletCards
} from 'lucide-react';
import type {
  Game, PaymentSubmission, WithdrawalRequest, UserAdminRecord,
  Product, Report, AdminPlatformAnalytics, AdminUserDetails
} from '../types';
import { IconShield } from '../components/Icons';
import { AdminActionReasonModal } from '../components/AdminActionReasonModal';
import { FloatingToastBanner } from '../components/FloatingToastBanner';
import {
  fetchAdminDepositsAPI, approveAdminDepositAPI, rejectAdminDepositAPI,
  fetchAdminWithdrawalsAPI, approveAdminWithdrawalAPI, rejectAdminWithdrawalAPI,
  fetchAdminUsersAPI, fetchAdminUserDetailsAPI, toggleAdminUserStatusAPI, changeAdminUserRoleAPI,
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

const formatEtb = (value: number) => `ETB ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const MiniTrendChart: React.FC<{
  data: Array<{ date: string; value: number }>;
  color: string;
  fill: string;
}> = ({ data, color, fill }) => {
  const max = Math.max(...data.map(point => point.value), 1);
  const points = data.map((point, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
    const y = 96 - (point.value / max) * 82;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-28 overflow-visible">
      <polygon points={areaPoints} fill={fill} opacity="0.35" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'USER' | 'SELLER' | 'ADMIN'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ALL');
  const [inspectingUser, setInspectingUser] = useState<AdminUserDetails | null>(null);
  const [inspectingUserId, setInspectingUserId] = useState<number | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userDetailStartDate, setUserDetailStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().slice(0, 10);
  });
  const [userDetailEndDate, setUserDetailEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sellers, setSellers] = useState<any[]>([]);

  // Developer 3 Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [productFilter, setProductFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('PENDING');
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});
  const [platformAnalytics, setPlatformAnalytics] = useState<AdminPlatformAnalytics | null>(null);
  const [analyticsStartDate, setAnalyticsStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().slice(0, 10);
  });
  const [analyticsEndDate, setAnalyticsEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [inspectingDeposit, setInspectingDeposit] = useState<PaymentSubmission | null>(null);

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [analyticsStartDate, analyticsEndDate]);

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
    fetchAdminPlatformAnalyticsAPI(analyticsStartDate, analyticsEndDate).then(an => setPlatformAnalytics(an));
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

  const handleInspectUser = async (userId: number) => {
    setInspectingUserId(userId);
  };

  useEffect(() => {
    if (inspectingUserId === null) return;
    setLoadingUserDetails(true);
    fetchAdminUserDetailsAPI(inspectingUserId, userDetailStartDate, userDetailEndDate).then(details => {
      setInspectingUser(details);
      setLoadingUserDetails(false);
    });
  }, [inspectingUserId, userDetailStartDate, userDetailEndDate]);

  const filteredUsers = users.filter(user => {
    const query = userSearch.trim().toLowerCase();
    const matchesSearch = !query || [user.username, user.email, user.phoneNumber].some(value => (value || '').toLowerCase().includes(query));
    const matchesRole = userRoleFilter === 'ALL' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'ALL' || user.accountStatus === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div><h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> Registered Accounts Administration</h3><p className="text-xs text-slate-500 mt-1">Search identity, filter access state, and inspect wallet-level financial details.</p></div>
            <div className="text-xs font-mono text-slate-500">Showing <span className="text-cyan-300 font-bold">{filteredUsers.length}</span> of {users.length} accounts</div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 p-3 bg-slate-900/70 border border-slate-800 rounded-2xl">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search username, email, or phone number..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" /></div>
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value as typeof userRoleFilter)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"><option value="ALL">All roles</option><option value="USER">Players</option><option value="SELLER">Sellers</option><option value="ADMIN">Admins</option></select>
            <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value as typeof userStatusFilter)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="BANNED">Banned</option></select>
            {(userSearch || userRoleFilter !== 'ALL' || userStatusFilter !== 'ALL') && <button onClick={() => { setUserSearch(''); setUserRoleFilter('ALL'); setUserStatusFilter('ALL'); }} className="px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-950 rounded-xl">Clear filters</button>}
          </div>
          <div className="glass-panel overflow-hidden border border-slate-800 rounded-2xl">
            <div className="overflow-x-auto"><table className="w-full text-left text-xs text-slate-300">
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
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users match the current filters.</td></tr>
                ) : filteredUsers.map((u) => (
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
                      <button onClick={() => handleInspectUser(u.id)} disabled={loadingUserDetails} className="px-2.5 py-1 rounded text-[11px] font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/40 disabled:opacity-50" title="Inspect wallet and activity"><Eye className="inline w-3.5 h-3.5 mr-1" />{loadingUserDetails ? 'Loading' : 'Details'}</button>
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
            </table></div>
          </div>
        </div>
      )}

      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
            <button onClick={() => { setInspectingUser(null); setInspectingUserId(null); }} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
            <div className="flex items-start gap-4 border-b border-slate-800 pb-5 pr-10"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-black text-slate-950">{inspectingUser.user.username.charAt(0).toUpperCase()}</div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-black text-white">{inspectingUser.user.username}</h3><span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 text-[10px] font-bold">{inspectingUser.user.role}</span><span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 text-[10px] font-bold">{inspectingUser.user.accountStatus}</span></div><p className="text-xs text-slate-400 mt-1">{inspectingUser.user.email || 'No email'} {inspectingUser.user.phoneNumber ? `• ${inspectingUser.user.phoneNumber}` : ''}</p><p className="text-[10px] text-slate-600 font-mono mt-1">Joined {new Date(inspectingUser.activity.date_joined).toLocaleString()} • Last login {inspectingUser.activity.last_login ? new Date(inspectingUser.activity.last_login).toLocaleString() : 'Never'}</p></div></div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 p-3 bg-slate-950/70 border border-cyan-500/20 rounded-2xl"><div><div className="text-[10px] text-cyan-300 uppercase font-mono font-bold">User reporting period</div><div className="text-[10px] text-slate-500 mt-1">Wallet balance is current; activity and money movement use this period.</div></div><div className="flex flex-wrap items-end gap-2"><div className="flex gap-1 p-1 bg-slate-900 rounded-xl">{[{ label: 'Today', days: 0 }, { label: 'Week', days: 6 }, { label: 'Month', days: 29 }, { label: 'Year', days: 364 }].map(preset => <button key={preset.label} type="button" onClick={() => { const date = new Date(); date.setDate(date.getDate() - preset.days); setUserDetailStartDate(date.toISOString().slice(0, 10)); setUserDetailEndDate(new Date().toISOString().slice(0, 10)); }} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300">{preset.label}</button>)}</div><label className="text-[9px] text-slate-500 font-mono">From<input type="date" value={userDetailStartDate} max={userDetailEndDate} onChange={e => setUserDetailStartDate(e.target.value)} className="block mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200" /></label><label className="text-[9px] text-slate-500 font-mono">To<input type="date" value={userDetailEndDate} min={userDetailStartDate} onChange={e => setUserDetailEndDate(e.target.value)} className="block mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200" /></label></div></div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20"><div className="text-[10px] text-slate-500 uppercase font-mono">Wallet balance</div><div className="text-2xl font-black font-mono text-emerald-300">{formatEtb(inspectingUser.wallet.balance)}</div><div className="text-[10px] text-slate-500 mt-1">Available {formatEtb(inspectingUser.wallet.available_balance)}</div></div><div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20"><div className="text-[10px] text-slate-500 uppercase font-mono">Reserved balance</div><div className="text-2xl font-black font-mono text-amber-300">{formatEtb(inspectingUser.wallet.reserved_balance)}</div><div className="text-[10px] text-slate-500 mt-1">Held for withdrawals</div></div><div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20"><div className="text-[10px] text-slate-500 uppercase font-mono">Ledger transactions</div><div className="text-2xl font-black font-mono text-cyan-300">{inspectingUser.financials.transaction_count}</div><div className="text-[10px] text-slate-500 mt-1">All wallet movements</div></div></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono"><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Deposits approved</div><div className="text-emerald-300 font-black">{formatEtb(inspectingUser.financials.deposits_approved)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Withdrawals approved</div><div className="text-rose-300 font-black">{formatEtb(inspectingUser.financials.withdrawals_approved)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Game entry spend</div><div className="text-purple-300 font-black">{formatEtb(inspectingUser.financials.entry_spend)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Rewards received</div><div className="text-amber-300 font-black">{formatEtb(inspectingUser.financials.rewards_received)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Pending deposits</div><div className="text-cyan-300 font-black">{formatEtb(inspectingUser.financials.deposits_pending)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Pending withdrawals</div><div className="text-amber-300 font-black">{formatEtb(inspectingUser.financials.withdrawals_pending)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Refunded deposits</div><div className="text-rose-300 font-black">{formatEtb(inspectingUser.financials.deposits_refunded)}</div></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Activity</div><div className="text-cyan-300 font-black">{inspectingUser.activity.game_entries} entries / {inspectingUser.activity.games_won} wins</div></div></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><div className="lg:col-span-2"><h4 className="font-black text-white flex items-center gap-2 mb-3"><WalletCards className="w-4 h-4 text-cyan-400" /> Recent wallet ledger</h4><div className="overflow-x-auto border border-slate-800 rounded-2xl"><table className="w-full text-left text-xs"><thead className="bg-slate-950 text-slate-500 uppercase font-mono"><tr><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead><tbody className="divide-y divide-slate-800">{inspectingUser.recent_transactions.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-slate-500">No wallet transactions.</td></tr> : inspectingUser.recent_transactions.map(tx => <tr key={tx.id}><td className="p-3"><div className="font-bold text-slate-200">{tx.type}</div><div className="text-[10px] text-slate-500">{tx.note || 'Ledger entry'}</div></td><td className={`p-3 font-mono font-bold ${tx.direction === 'CREDIT' ? 'text-emerald-300' : 'text-rose-300'}`}>{tx.direction === 'CREDIT' ? '+' : '-'}{formatEtb(Math.abs(tx.amount))}</td><td className="p-3 text-slate-400">{tx.status}</td><td className="p-3 text-slate-500 font-mono">{new Date(tx.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div><div className="space-y-3"><h4 className="font-black text-white">Account intelligence</h4><div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-xs"><div className="flex justify-between"><span className="text-slate-500">Favorites</span><b className="text-slate-200">{inspectingUser.activity.favorites}</b></div><div className="flex justify-between"><span className="text-slate-500">Unread alerts</span><b className="text-amber-300">{inspectingUser.activity.unread_notifications}</b></div>{inspectingUser.seller ? <><div className="border-t border-slate-800 pt-2 text-purple-300 font-bold">{inspectingUser.seller.business_name}</div><div className="flex justify-between"><span className="text-slate-500">Seller status</span><b className="text-purple-300">{inspectingUser.seller.status}</b></div><div className="text-slate-500">{inspectingUser.seller.address}</div></> : <div className="border-t border-slate-800 pt-2 text-slate-500">No seller profile attached.</div>}</div></div></div>
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
        <div className="space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 p-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl">
            <div>
              <div className="text-[10px] text-emerald-300 font-mono font-bold uppercase tracking-widest">Financial reporting period</div>
              <p className="text-xs text-slate-500 mt-1">All money metrics below are recalculated for the selected dates. Wallet balances are current snapshots.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {[
                  { label: '7D', days: 6 },
                  { label: '30D', days: 29 },
                  { label: '90D', days: 89 },
                  { label: 'YTD', days: Math.max(new Date().getDate() - 1, 0) },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      if (preset.label === 'YTD') date.setMonth(0, 1);
                      else date.setDate(date.getDate() - preset.days);
                      setAnalyticsStartDate(date.toISOString().slice(0, 10));
                      setAnalyticsEndDate(new Date().toISOString().slice(0, 10));
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >{preset.label}</button>
                ))}
              </div>
              <label className="text-[10px] text-slate-500 font-mono">From<input type="date" value={analyticsStartDate} max={analyticsEndDate} onChange={e => setAnalyticsStartDate(e.target.value)} className="block mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200" /></label>
              <label className="text-[10px] text-slate-500 font-mono">To<input type="date" value={analyticsEndDate} min={analyticsStartDate} onChange={e => setAnalyticsEndDate(e.target.value)} className="block mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200" /></label>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-6 sm:p-8 rounded-3xl border border-emerald-500/25 shadow-2xl">
            <div className="absolute right-8 top-6 opacity-10"><BarChart3 className="w-32 h-32 text-emerald-300" /></div>
            <div className="relative space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-[0.2em]"><Activity className="w-4 h-4" /> Executive intelligence center</div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Platform Analytics Command Center</h3>
              <p className="max-w-2xl text-xs sm:text-sm text-slate-400">Live database-backed view of acquisition, marketplace activity, competition demand, cash movement, and platform economics for the selected reporting period.</p>
              <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-500 font-mono"><RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> {platformAnalytics?.financials.periodStart || analyticsStartDate} to {platformAnalytics?.financials.periodEnd || analyticsEndDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: platformAnalytics?.users.total || users.length, detail: `${platformAnalytics?.users.active30d || 0} active in 30d`, icon: Users, color: 'text-cyan-300', border: 'border-cyan-500/30' },
              { label: 'Verified Sellers', value: platformAnalytics?.users.verifiedSellers || 0, detail: `${platformAnalytics?.users.pendingSellers || 0} awaiting review`, icon: Store, color: 'text-purple-300', border: 'border-purple-500/30' },
              { label: 'Game Entries', value: platformAnalytics?.competitions.totalEntries || 0, detail: `${platformAnalytics?.competitions.active || 0} active games`, icon: Trophy, color: 'text-amber-300', border: 'border-amber-500/30' },
              { label: 'Gross Revenue', value: formatEtb(platformAnalytics?.financials.grossRevenueEtb || 0), detail: `${platformAnalytics?.financials.commissionPercent || 0}% commission rate`, icon: DollarSign, color: 'text-emerald-300', border: 'border-emerald-500/30' },
            ].map(card => (
              <div key={card.label} className={`glass-card p-4 border ${card.border} space-y-3`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase"><span>{card.label}</span><card.icon className={`w-4 h-4 ${card.color}`} /></div>
                <div className={`text-2xl sm:text-3xl font-black font-mono ${card.color}`}>{card.value}</div>
                <div className="text-[10px] text-slate-400 font-mono">{card.detail}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 glass-card p-5 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between"><div><h4 className="font-black text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan-400" /> Acquisition & supply growth</h4><p className="text-[11px] text-slate-500 mt-1">Daily new records during the last 30 days</p></div><CalendarDays className="w-5 h-5 text-slate-600" /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Users', data: platformAnalytics?.trends.users || [], color: '#22d3ee', fill: '#164e63' },
                  { label: 'Sellers', data: platformAnalytics?.trends.sellers || [], color: '#c084fc', fill: '#581c87' },
                  { label: 'Games', data: platformAnalytics?.trends.games || [], color: '#fbbf24', fill: '#78350f' },
                ].map(trend => (
                  <div key={trend.label} className="bg-slate-950/60 rounded-2xl border border-slate-800 p-3 space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-300 font-bold">{trend.label}</span><span className="text-slate-500 font-mono">{trend.data.reduce((sum, point) => sum + point.value, 0)} new</span></div><MiniTrendChart data={trend.data} color={trend.color} fill={trend.fill} /><div className="flex justify-between text-[9px] text-slate-600 font-mono"><span>30 days ago</span><span>Today</span></div></div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 border border-slate-800 space-y-4">
              <div><h4 className="font-black text-white flex items-center gap-2"><UserRound className="w-4 h-4 text-emerald-400" /> User health</h4><p className="text-[11px] text-slate-500 mt-1">Activity and 30-day return behavior</p></div>
              <div className="flex items-end gap-3"><span className="text-5xl font-black font-mono text-emerald-300">{platformAnalytics?.users.retentionRate || 0}%</span><span className="pb-1 text-xs text-slate-500">retention rate</span></div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${Math.min(platformAnalytics?.users.retentionRate || 0, 100)}%` }} /></div>
              <div className="space-y-2 text-xs font-mono"><div className="flex justify-between"><span className="text-slate-500">Active users (30d)</span><span className="text-emerald-300 font-bold">{platformAnalytics?.users.active30d || 0}</span></div><div className="flex justify-between"><span className="text-slate-500">Returning users</span><span className="text-cyan-300 font-bold">{platformAnalytics?.users.retainedUsers || 0}</span></div><div className="flex justify-between"><span className="text-slate-500">Eligible cohort</span><span className="text-slate-300 font-bold">{platformAnalytics?.users.retentionEligible || 0}</span></div></div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            <div className="xl:col-span-3 glass-card p-5 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between"><div><h4 className="font-black text-white flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400" /> Daily participants & revenue</h4><p className="text-[11px] text-slate-500 mt-1">Competition demand and game-entry value by day</p></div><span className="text-[10px] font-mono text-slate-500">30D</span></div>
              <div className="h-44 flex items-end gap-1 border-b border-slate-800 px-1">
                {(platformAnalytics?.trends.dailyParticipants || []).map(day => {
                  const max = Math.max(...(platformAnalytics?.trends.dailyParticipants || []).map(item => item.participants), 1);
                  return <div key={day.date} title={`${day.date}: ${day.participants} participants`} className="flex-1 min-w-[3px] bg-gradient-to-t from-amber-600 to-emerald-400 rounded-t-sm hover:opacity-80" style={{ height: `${Math.max((day.participants / max) * 100, day.participants ? 4 : 1)}%` }} />;
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono"><div className="p-3 bg-slate-950/70 rounded-xl"><div className="text-slate-500">Period participants</div><div className="text-amber-300 text-xl font-black">{platformAnalytics?.competitions.totalEntries || 0}</div></div><div className="p-3 bg-slate-950/70 rounded-xl"><div className="text-slate-500">Period game revenue</div><div className="text-emerald-300 text-xl font-black">{formatEtb((platformAnalytics?.trends.dailyParticipants || []).reduce((sum, day) => sum + day.revenue, 0))}</div></div></div>
            </div>
            <div className="xl:col-span-2 glass-card p-5 border border-slate-800 space-y-4"><div><h4 className="font-black text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Financial control room</h4><p className="text-[11px] text-slate-500 mt-1">Approved, pending, rejected, and returned cash</p></div><div className="space-y-2 text-xs font-mono"><div className="flex justify-between p-2.5 bg-emerald-950/30 rounded-lg"><span className="text-slate-400">Deposits approved</span><span className="text-emerald-300 font-bold">{formatEtb(platformAnalytics?.financials.totalDepositsEtb || 0)}</span></div><div className="flex justify-between p-2.5 bg-rose-950/30 rounded-lg"><span className="text-slate-400">Withdrawals approved</span><span className="text-rose-300 font-bold">{formatEtb(platformAnalytics?.financials.totalWithdrawalsEtb || 0)}</span></div><div className="flex justify-between p-2.5 bg-amber-950/30 rounded-lg"><span className="text-slate-400">Refunds issued</span><span className="text-amber-300 font-bold">{formatEtb((platformAnalytics?.financials.refundsEtb || 0) + (platformAnalytics?.financials.refundedDepositsEtb || 0))}</span></div><div className="flex justify-between p-2.5 bg-cyan-950/30 rounded-lg"><span className="text-slate-400">Platform commission</span><span className="text-cyan-300 font-bold">{formatEtb(platformAnalytics?.financials.netCommissionEtb || 0)}</span></div></div><div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500"><span>Pending deposits: <b className="text-amber-300">{platformAnalytics?.financials.pendingDepositsCount || 0}</b></span><span>Pending withdrawals: <b className="text-amber-300">{platformAnalytics?.financials.pendingWithdrawalsCount || 0}</b></span><span>Rejected deposits: <b className="text-rose-300">{platformAnalytics?.financials.rejectedDepositsCount || 0}</b></span><span>Rejected withdrawals: <b className="text-rose-300">{platformAnalytics?.financials.rejectedWithdrawalsCount || 0}</b></span></div></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="glass-card p-5 border border-emerald-500/25 space-y-3"><div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono font-bold"><span>Current wallet liquidity</span><DollarSign className="w-4 h-4 text-emerald-400" /></div><div className="text-2xl font-black font-mono text-emerald-300">{formatEtb(platformAnalytics?.financials.walletBalanceEtb || 0)}</div><div className="space-y-1 text-[10px] font-mono"><div className="flex justify-between text-slate-500"><span>Available</span><b className="text-cyan-300">{formatEtb(platformAnalytics?.financials.availableWalletBalanceEtb || 0)}</b></div><div className="flex justify-between text-slate-500"><span>Reserved</span><b className="text-amber-300">{formatEtb(platformAnalytics?.financials.reservedWalletBalanceEtb || 0)}</b></div></div></div>
            <div className="glass-card p-5 border border-cyan-500/25 space-y-3"><div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono font-bold"><span>Net cash flow</span><Activity className="w-4 h-4 text-cyan-400" /></div><div className={`text-2xl font-black font-mono ${(platformAnalytics?.financials.netCashFlowEtb || 0) >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>{formatEtb(platformAnalytics?.financials.netCashFlowEtb || 0)}</div><div className="text-[10px] text-slate-500 font-mono">Approved deposits minus approved withdrawals</div></div>
            <div className="glass-card p-5 border border-purple-500/25 space-y-3"><div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono font-bold"><span>Net platform profit</span><TrendingUp className="w-4 h-4 text-purple-400" /></div><div className="text-2xl font-black font-mono text-purple-300">{formatEtb(platformAnalytics?.financials.netProfitEtb || 0)}</div><div className="text-[10px] text-slate-500 font-mono">Commission less refunds in period</div></div>
            <div className="glass-card p-5 border border-amber-500/25 space-y-3"><div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono font-bold"><span>Pending exposure</span><Activity className="w-4 h-4 text-amber-400" /></div><div className="text-2xl font-black font-mono text-amber-300">{formatEtb(platformAnalytics?.financials.pendingWithdrawalValueEtb || 0)}</div><div className="text-[10px] text-slate-500 font-mono">Reserved for pending withdrawals</div></div>
          </div>

          <div className="glass-card p-5 border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/20 space-y-5">
            <div><h4 className="font-black text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Profit bridge</h4><p className="text-[11px] text-slate-500 mt-1">How competition money becomes platform profit for the selected period</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20"><div className="text-[10px] text-slate-500 uppercase font-mono">Gross platform profit</div><div className="text-3xl font-black font-mono text-emerald-300">{formatEtb(platformAnalytics?.financials.grossProfitEtb || 0)}</div><div className="text-[10px] text-slate-500 mt-1">{platformAnalytics?.financials.commissionPercent || 0}% of gross game-entry revenue</div></div><div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/20"><div className="text-[10px] text-slate-500 uppercase font-mono">Less refunds</div><div className="text-3xl font-black font-mono text-amber-300">- {formatEtb(platformAnalytics?.financials.refundsEtb || 0)}</div><div className="text-[10px] text-slate-500 mt-1">{(platformAnalytics?.financials.refundRatePercent || 0).toFixed(2)}% refund rate on game volume</div></div><div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20"><div className="text-[10px] text-slate-500 uppercase font-mono">Net platform profit</div><div className={`text-3xl font-black font-mono ${(platformAnalytics?.financials.netProfitEtb || 0) >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>{formatEtb(platformAnalytics?.financials.netProfitEtb || 0)}</div><div className="text-[10px] text-slate-500 mt-1">Before hosting, staff, tax, and payment-provider costs</div></div></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] font-mono"><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Commission margin</div><b className="text-purple-300">{(platformAnalytics?.financials.commissionMarginPercent || 0).toFixed(2)}%</b></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Cash outflow</div><b className="text-rose-300">{formatEtb(platformAnalytics?.financials.cashOutflowEtb || 0)}</b></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Payout ratio</div><b className="text-amber-300">{(platformAnalytics?.financials.payoutRatioPercent || 0).toFixed(2)}%</b></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Deposit approval</div><b className="text-emerald-300">{(platformAnalytics?.financials.depositApprovalRatePercent || 0).toFixed(2)}%</b></div><div className="p-3 bg-slate-950/60 rounded-xl"><div className="text-slate-500">Post-payout liquidity</div><b className={`${(platformAnalytics?.financials.postWithdrawalLiquidityEtb || 0) >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>{formatEtb(platformAnalytics?.financials.postWithdrawalLiquidityEtb || 0)}</b></div></div>
          </div>

          <div className="glass-card p-5 border border-slate-800 space-y-4">
            <div><h4 className="font-black text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Unit economics & payout intelligence</h4><p className="text-[11px] text-slate-500 mt-1">Average transaction sizes and money distribution for the selected period</p></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
              {[
                ['Avg entry', formatEtb(platformAnalytics?.financials.averageEntryFeeEtb || 0), 'text-amber-300'],
                ['Avg deposit', formatEtb(platformAnalytics?.financials.averageDepositEtb || 0), 'text-emerald-300'],
                ['Avg withdrawal', formatEtb(platformAnalytics?.financials.averageWithdrawalEtb || 0), 'text-rose-300'],
                ['Game entries', String(platformAnalytics?.financials.gameEntryCount || 0), 'text-cyan-300'],
                ['Rewards paid', formatEtb(platformAnalytics?.financials.rewardPayoutsEtb || 0), 'text-purple-300'],
                ['Gross profit', formatEtb(platformAnalytics?.financials.grossProfitEtb || 0), 'text-emerald-300'],
                ['Net profit', formatEtb(platformAnalytics?.financials.netProfitEtb || 0), 'text-cyan-300'],
                ['Commission', `${platformAnalytics?.financials.commissionPercent || 0}%`, 'text-purple-300'],
              ].map(([label, value, color]) => <div key={label} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800"><div className="text-[10px] text-slate-500 mb-1">{label}</div><div className={`font-black ${color}`}>{value}</div></div>)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card p-5 border border-slate-800 space-y-4"><div><h4 className="font-black text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-purple-400" /> Most popular game types</h4><p className="text-[11px] text-slate-500 mt-1">Ranked by participant entries</p></div>{(platformAnalytics?.popularGameTypes || []).length === 0 ? <p className="text-xs text-slate-500 py-5">No game activity yet.</p> : <div className="space-y-3">{platformAnalytics?.popularGameTypes.map((item, index) => { const max = Math.max(...(platformAnalytics?.popularGameTypes || []).map(type => type.participants), 1); return <div key={item.type} className="space-y-1"><div className="flex justify-between text-xs"><span className="text-slate-200 font-bold">{index + 1}. {item.type.replace(/_/g, ' ')}</span><span className="text-purple-300 font-mono">{item.participants} entries</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-600 to-cyan-400" style={{ width: `${(item.participants / max) * 100}%` }} /></div><div className="text-[10px] text-slate-500 font-mono">{item.games} competitions</div></div>; })}</div>}</div>
            <div className="glass-card p-5 border border-slate-800 space-y-4"><div><h4 className="font-black text-white flex items-center gap-2"><Package className="w-4 h-4 text-cyan-400" /> Most popular products</h4><p className="text-[11px] text-slate-500 mt-1">Products drawing the most competition demand</p></div>{(platformAnalytics?.popularProducts || []).length === 0 ? <p className="text-xs text-slate-500 py-5">No product activity yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] text-slate-500 uppercase font-mono"><tr><th className="pb-2">Product</th><th className="pb-2 text-right">Games</th><th className="pb-2 text-right">Entries</th></tr></thead><tbody className="divide-y divide-slate-800/70">{platformAnalytics?.popularProducts.map(item => <tr key={item.id}><td className="py-3 pr-3"><div className="font-bold text-slate-200 truncate max-w-[230px]">{item.title}</div><div className="text-[10px] text-cyan-400 font-mono">{item.category}</div></td><td className="py-3 text-right text-purple-300 font-mono">{item.games}</td><td className="py-3 text-right text-amber-300 font-mono font-bold">{item.participants}</td></tr>)}</tbody></table></div>}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono"><div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl"><div className="text-slate-500">Active games</div><div className="text-cyan-300 text-2xl font-black">{platformAnalytics?.competitions.active || 0}</div><div className="text-[10px] text-slate-600">of {platformAnalytics?.competitions.total || 0} total</div></div><div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl"><div className="text-slate-500">Completed games</div><div className="text-emerald-300 text-2xl font-black">{platformAnalytics?.competitions.completed || 0}</div><div className="text-[10px] text-slate-600">resolved competitions</div></div><div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl"><div className="text-slate-500">Approved products</div><div className="text-purple-300 text-2xl font-black">{platformAnalytics?.products.approved || 0}</div><div className="text-[10px] text-slate-600">available to sellers</div></div><div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl"><div className="text-slate-500">Pending moderation</div><div className="text-rose-300 text-2xl font-black">{platformAnalytics?.moderation.pendingReports || 0}</div><div className="text-[10px] text-slate-600">reports requiring action</div></div></div>
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
