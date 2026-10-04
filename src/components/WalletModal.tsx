import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Wallet } from '../types';
import { submitPaymentDepositAPI, submitWithdrawalRequestAPI } from '../services/api';
import { IconWallet, IconCheck } from './Icons';

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
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  
  // Bank selection state (strictly CBE or Telebirr)
  const [bankChoice, setBankChoice] = useState<'cbe' | 'telebirr'>('cbe');
  const [amount, setAmount] = useState('130');
  const [txId, setTxId] = useState('');

  // Withdrawal form state
  const [wdMethod, setWdMethod] = useState('Telebirr');
  const [wdAccount, setWdAccount] = useState('');
  const [wdAccountName, setWdAccountName] = useState('');
  const [wdAmount, setWdAmount] = useState('500');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) {
      setErrorMsg('Please enter a valid Transaction ID / Reference Number.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid deposit amount greater than 0.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const paymentMethodLabel = bankChoice === 'telebirr' 
      ? 'Telebirr Mobile Money' 
      : 'Commercial Bank of Ethiopia (CBE)';

    const res = await submitPaymentDepositAPI({
      paymentMethod: paymentMethodLabel,
      bank: bankChoice,
      transactionId: txId.trim(),
      amount: parsedAmount
    });
    
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTxId('');
      setTimeout(() => {
        onRefreshWallet();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wdAccount.trim()) {
      setErrorMsg('Please enter account or phone number.');
      return;
    }
    const amt = parseFloat(wdAmount) || 0;
    if (amt < 100) {
      setErrorMsg('Minimum withdrawal amount is 100 ETB.');
      return;
    }
    if (amt > (wallet.availableBalance ?? wallet.balance)) {
      setErrorMsg('Insufficient available balance for this withdrawal.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await submitWithdrawalRequestAPI({
      withdrawalMethod: wdMethod,
      accountNumber: wdAccount.trim(),
      accountName: wdAccountName.trim(),
      amount: amt
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setWdAccount('');
      setWdAccountName('');
      setTimeout(() => {
        onRefreshWallet();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const modalContent = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden"
    >
      <div className="bg-slate-900 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 border border-slate-700/80 rounded-3xl shadow-2xl my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 rounded-xl border border-cyan-500/30">
              <IconWallet className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-100">Wallet & Instant Deposit Verification</h3>
              <p className="text-xs text-cyan-400 font-mono">Direct Automated Verification • Bank & Telebirr Receipts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        {/* Balance Card Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Available Balance</span>
            <span className="text-3xl font-black font-mono text-gradient">{(wallet.availableBalance ?? wallet.balance).toLocaleString()} ETB</span>
            <div className="flex gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Total: <strong className="text-slate-200">{wallet.balance.toLocaleString()} ETB</strong></span>
              <span>Reserved: <strong className="text-amber-400">{(wallet.reservedBalance || 0).toLocaleString()} ETB</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveTab('balance'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'balance'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Ledger
            </button>
            <button
              onClick={() => { setActiveTab('deposit'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deposit'
                  ? 'bg-purple-600 text-white font-extrabold'
                  : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/80 border border-purple-500/30'
              }`}
            >
              + Add Money
            </button>
            <button
              onClick={() => { setActiveTab('withdraw'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-emerald-600 text-white font-extrabold'
                  : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-500/30'
              }`}
            >
              💸 Withdraw
            </button>
          </div>
        </div>

        {/* Tab 1: Ledger History */}
        {activeTab === 'balance' && (
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Recent Wallet Transactions:</h4>
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
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        {tx.note || tx.transactionType}
                        {tx.status && tx.status !== 'COMPLETED' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                            {tx.status}
                          </span>
                        )}
                      </div>
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

        {/* Tab 2: Add Money / Automated Verification */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-semibold">
                <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-rose-950/90 border border-rose-500/50 rounded-2xl text-xs text-rose-200 space-y-2">
                <div className="flex items-start gap-2 font-semibold">
                  <span className="text-rose-400 text-sm">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-rose-900/50 text-[11px]">
                  <span className="text-rose-300 font-sans">Need help verifying your deposit?</span>
                  <a
                    href="https://t.me/AddisGigs1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                    <span>Contact Support @AddisGigs1</span>
                  </a>
                </div>
              </div>
            )}

            {/* Explicit Bank Selection Priority */}
            <div className="space-y-2">
              <label className="text-slate-200 text-xs font-bold uppercase tracking-wider block">
                1. Select Targeted Bank / Payment Gateway:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBankChoice('cbe')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    bankChoice === 'cbe'
                      ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${bankChoice === 'cbe' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'}`}>
                    {bankChoice === 'cbe' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100">Commercial Bank of Ethiopia (CBE)</div>
                    <div className="text-[11px] font-mono text-purple-300 font-semibold">Acc: 1000723053718</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBankChoice('telebirr')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    bankChoice === 'telebirr'
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${bankChoice === 'telebirr' ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'}`}>
                    {bankChoice === 'telebirr' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100">Telebirr Mobile Money</div>
                    <div className="text-[11px] font-mono text-cyan-300 font-semibold">Acc: +251963659350</div>
                  </div>
                </button>
              </div>

              {/* Helper Warning Text */}
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 leading-relaxed font-sans">
                ⚠️ <strong>Important Note:</strong> Select the exact bank you transferred from. Entering a valid Transaction ID with the wrong bank selected will cause verification to fail.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">2. Transferred Amount (ETB):</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                  placeholder="e.g. 130"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">3. Transaction ID / Reference Number:</label>
                <input
                  type="text"
                  required
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder={bankChoice === 'cbe' ? 'e.g. FT26251VNGGM' : 'e.g. DI91KG3JZN'}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Target Account Details Display */}
            <div className="p-3.5 bg-slate-950/90 border border-purple-500/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 font-sans">Official Platform Deposit Accounts:</span>
                <a
                  href="https://t.me/AddisGigs1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono hover:underline"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  <span>Telegram: @AddisGigs1</span>
                </a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-[10px] text-purple-400 font-sans font-bold uppercase">Commercial Bank of Ethiopia (CBE)</div>
                  <div className="text-slate-300 text-[11px]">Holder: <strong className="text-slate-100 font-sans">Beiment Melese</strong></div>
                  <div className="text-slate-300 text-[11px]">Acc No: <strong className="text-amber-300 font-bold">1000723053718</strong></div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-[10px] text-cyan-400 font-sans font-bold uppercase">Telebirr Mobile Money</div>
                  <div className="text-slate-300 text-[11px]">Holder: <strong className="text-slate-100 font-sans">Beiment Melese</strong></div>
                  <div className="text-slate-300 text-[11px]">Acc No: <strong className="text-cyan-300 font-bold">+251963659350</strong></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Receipt...</span>
                  </>
                ) : (
                  'Verify & Instant Credit Wallet'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Withdrawal Request */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-emerald-400" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Withdrawal Payout Method:</label>
                <select
                  value={wdMethod}
                  onChange={(e) => setWdMethod(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Telebirr">Telebirr Mobile Account</option>
                  <option value="CBE Birr">CBE Birr Account</option>
                  <option value="Bank Transfer">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Awash Birr">Awash Bank Account</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Amount to Withdraw (ETB):</label>
                <input
                  type="number"
                  min="100"
                  max={wallet.availableBalance ?? wallet.balance}
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Account / Phone Number:</label>
                <input
                  type="text"
                  required
                  value={wdAccount}
                  onChange={(e) => setWdAccount(e.target.value)}
                  placeholder="e.g. 0911223344 or 100012345678"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Account Holder Name (Optional):</label>
                <input
                  type="text"
                  value={wdAccountName}
                  onChange={(e) => setWdAccountName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <span className="text-[10px] text-slate-500 block">Funds will be safely reserved until admin payout approval.</span>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
