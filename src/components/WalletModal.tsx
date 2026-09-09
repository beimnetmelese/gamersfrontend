import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Wallet } from '../types';
import { submitPaymentProof, submitWithdrawalRequestAPI } from '../services/api';
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
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  
  // Deposit form state
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [amount, setAmount] = useState('500');
  const [txId, setTxId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

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
      setErrorMsg('Please enter transaction reference ID.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('payment_method', paymentMethod);
    formData.append('transaction_id', txId.trim());
    formData.append('amount', (parseFloat(amount) || 500).toString());
    if (proofFile) {
      formData.append('proof_image', proofFile);
    }

    const res = await submitPaymentProof(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTxId('');
      setProofFile(null);
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
              <h3 className="font-extrabold text-xl text-slate-100">Wallet & Payments</h3>
              <p className="text-xs text-cyan-400 font-mono">Financial Ledger • Direct Web Deposits & Payouts</p>
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

        {/* Tab 2: Add Money / Deposit Submission */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
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
                <label className="text-slate-400 font-semibold">1. Select Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Telebirr">Telebirr Mobile Money</option>
                  <option value="CBE Birr">CBE Birr Mobile</option>
                  <option value="Bank Transfer">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Awash Birr">Awash Bank</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">2. Deposit Amount (ETB):</label>
                <input
                  type="number"
                  min="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Payment Account Instructions Banner */}
            <div className="p-3 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-300 space-y-1">
              <span className="font-bold text-slate-200 block font-sans">Payment Instructions:</span>
              <div>
                Send exactly <strong>{amount} ETB</strong> to the platform {paymentMethod} account:
              </div>
              <div className="text-cyan-400 font-bold text-sm">
                {paymentMethod === 'Telebirr' && 'Telebirr: 0911223344 (AddisGigs)'}
                {paymentMethod === 'CBE Birr' && 'CBE Birr: 1000123456789'}
                {paymentMethod === 'Bank Transfer' && 'CBE Bank Acc: 1000123456789 (AddisGigs Platform)'}
                {paymentMethod === 'Awash Birr' && 'Awash Bank Acc: 0132099887766'}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-semibold">3. Transaction ID / Reference Number:</label>
              <input
                type="text"
                required
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="e.g. TX987654321 or CBE99821"
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-semibold">4. Upload Payment Screenshot Proof:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="hidden"
                id="deposit-proof-file-input"
              />
              <label
                htmlFor="deposit-proof-file-input"
                className="h-20 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors"
              >
                <IconPlus className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] mt-1 font-semibold text-slate-200">
                  {proofFile ? `Selected: ${proofFile.name}` : 'Click to select receipt screenshot image'}
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting Proof...' : 'Submit Deposit Proof for Verification'}
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
