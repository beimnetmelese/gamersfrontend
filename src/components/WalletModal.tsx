import React, { useState } from 'react';
import type { Wallet } from '../types';
import { submitPaymentProof } from '../services/api';
import { IconWallet, IconCheck, IconPlus } from './Icons';

interface WalletModalProps {
  wallet: Wallet;
  onClose: () => void;
  onRefreshWallet: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  wallet,
  onClose,
  onRefreshWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit'>('balance');
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [amount, setAmount] = useState('500');
  const [txId, setTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) return;

    setIsSubmitting(true);
    const res = await submitPaymentProof({
      paymentMethod,
      transactionId: txId,
      amount: parseFloat(amount) || 500,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTxId('');
      setTimeout(() => {
        onRefreshWallet();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel max-w-2xl w-full p-6 space-y-6 border border-cyan-500/30">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 rounded-xl border border-cyan-500/30">
              <IconWallet className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-100">Internal User Wallet</h3>
              <p className="text-xs text-cyan-400 font-mono">Secure Financial Ledger & Manual Proof Deposit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        {/* Balance Card Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Current Available Balance</span>
            <span className="text-3xl font-black font-mono text-gradient">{wallet.balance.toLocaleString()} ETB</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'balance'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Ledger History
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deposit'
                  ? 'bg-purple-600 text-white font-extrabold'
                  : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/80 border border-purple-500/30'
              }`}
            >
              + Deposit Funds
            </button>
          </div>
        </div>

        {/* Tab 1: Ledger History */}
        {activeTab === 'balance' && (
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Transaction History Ledger:</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {wallet.transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No transactions recorded yet.</div>
              ) : (
                wallet.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">{tx.note || tx.transactionType}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Ref: {tx.referenceId || 'N/A'} • {new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`font-mono font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ETB
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manual Deposit Submission */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-emerald-400" />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Telebirr">Telebirr (0911-XXXXXX)</option>
                  <option value="CBE Birr">CBE Birr (1000-XXXXXX)</option>
                  <option value="Bank Transfer">Commercial Bank of Ethiopia</option>
                  <option value="Awash Birr">Awash Bank</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Amount (ETB):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-semibold">Transaction ID / Reference Number:</label>
              <input
                type="text"
                required
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="e.g. TX987654321"
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">Each transaction ID is strictly audited to prevent duplicate submissions.</span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-semibold">Upload Payment Screenshot Proof:</label>
              <div className="h-20 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors">
                <IconPlus className="w-5 h-5 text-slate-500" />
                <span className="text-[11px] mt-1">Click to browse or drag receipt image</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting Proof...' : 'Submit Deposit Proof for Admin Verification'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
