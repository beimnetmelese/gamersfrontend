import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { User, Role } from '../types';
import { loginUserAPI, registerUserAPI } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, role: Role) => void;
  initialMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMessage,
}) => {
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status/Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!usernameOrEmail.trim() || !password) {
      setErrorMsg('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    const res = await loginUserAPI(usernameOrEmail, password);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMsg('Login successful!');
      setTimeout(() => {
        onSuccess(res.user!, res.user!.role);
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Invalid username/email or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!registerUsername.trim() || !password) {
      setErrorMsg('Username and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await registerUserAPI(registerUsername, registerEmail, password, role);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMsg('Registration successful! Welcome aboard.');
      setTimeout(() => {
        onSuccess(res.user!, res.user!.role);
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                {isLoginTab ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {isLoginTab ? 'Log in to join games & manage wallet' : 'Register to start competing on AddisGigs'}
              </p>
            </div>
          </div>

          {/* Initial protection message if triggered */}
          {initialMessage && (
            <div className="p-3 bg-amber-950/70 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              {initialMessage}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isLoginTab ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isLoginTab ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium">
              {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {isLoginTab ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Username or Email Address:</label>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. bewnet or gamer_abebe"
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Password:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'SIGN IN →'}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Username:</label>
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="e.g. gamer_alex"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Email Address (Optional):</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Password:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Confirm Password:</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Account Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="USER">Player / User</option>
                  <option value="SELLER">Seller / Game Host (Requires Admin Verification)</option>
                </select>
                {role === 'SELLER' && (
                  <p className="text-[10px] text-amber-400 font-mono mt-1 leading-tight">
                    ℹ️ Account registers as a Player immediately. Your Seller application will be submitted for Admin approval.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 uppercase tracking-wider transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT →'}
              </button>
            </form>
          )}

          {/* Seed admin note */}
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
            Dev Quick Admin Login: <strong className="text-cyan-400">bewnet</strong> or <strong className="text-cyan-400">kun</strong> (Pass: <code className="text-purple-300">admin123</code>)
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
