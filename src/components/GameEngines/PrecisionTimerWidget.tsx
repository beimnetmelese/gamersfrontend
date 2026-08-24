import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Zap, AlertTriangle, Lock, RefreshCw, CheckCircle2, Wallet } from 'lucide-react';

interface PrecisionTimerProps {
  targetTimeSec?: number;
  entryFee: number;
  walletBalance: number;
  isPaid: boolean;
  isGameEnded?: boolean;
  onPayEntryFee: () => Promise<boolean>;
  onAutoSubmitAttempt: (deltaMs: number, recordedTimeSec: number) => Promise<void>;
  onTryAgain: () => Promise<boolean>;
}

export const PrecisionTimerWidget: React.FC<PrecisionTimerProps> = ({
  targetTimeSec = 10.0,
  entryFee,
  walletBalance,
  isPaid,
  isGameEnded = false,
  onPayEntryFee,
  onAutoSubmitAttempt,
  onTryAgain,
}) => {
  const TARGET_MS = Math.round(targetTimeSec * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordedDelta, setRecordedDelta] = useState<number | null>(null);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handlePayClick = async () => {
    if (isGameEnded) return;
    setIsProcessingPay(true);
    await onPayEntryFee();
    setIsProcessingPay(false);
  };

  const handleTryAgainClick = async () => {
    if (isGameEnded) return;
    setIsProcessingPay(true);
    const success = await onTryAgain();
    setIsProcessingPay(false);
    if (success) {
      setHasAttempted(false);
      setRecordedDelta(null);
      setElapsedMs(0);
    }
  };

  const startTimer = () => {
    if (isGameEnded || !isPaid || hasAttempted || isRunning) return;
    setIsRunning(true);
    setElapsedMs(0);
    startTimeRef.current = performance.now();

    const update = () => {
      if (startTimeRef.current !== null) {
        const now = performance.now();
        setElapsedMs(Math.round(now - startTimeRef.current));
        animFrameRef.current = requestAnimationFrame(update);
      }
    };
    animFrameRef.current = requestAnimationFrame(update);
  };

  const stopTimer = async () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    setHasAttempted(true);

    if (startTimeRef.current !== null) {
      const finalMs = Math.round(performance.now() - startTimeRef.current);
      setElapsedMs(finalMs);
      const delta = Math.abs(finalMs - TARGET_MS);
      setRecordedDelta(delta);

      // AUTOMATIC BACKEND SUBMISSION ON FIRST TRY
      setIsSubmittingAttempt(true);
      await onAutoSubmitAttempt(delta, parseFloat((finalMs / 1000).toFixed(3)));
      setIsSubmittingAttempt(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const formatSeconds = (ms: number) => (ms / 1000).toFixed(3);

  return (
    <div className="space-y-4">
      
      {/* Rule & Payment Flow Banner */}
      <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Precision Timer Step-by-Step Rules
        </div>
        <ol className="text-xs text-amber-200/90 leading-relaxed list-decimal list-inside space-y-1">
          <li>Pay entry fee (<strong>{entryFee} ETB</strong>) to unlock your 1-shot timer attempt.</li>
          <li className="flex items-center flex-wrap gap-2 py-0.5">
            <span>Click <strong>START TIMER</strong> and press <strong>STOP NOW!</strong> as close as possible to:</span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-300 bg-amber-950 px-3 py-0.5 rounded-xl border border-amber-500/50 shadow-md">
              🎯 {targetTimeSec.toFixed(3)}s
            </span>
          </li>
          <li>Your attempt is automatically locked & submitted to the backend on your first try.</li>
          <li>Need another attempt? Click <strong>TRY AGAIN</strong> to pay entry fee for a new attempt.</li>
        </ol>
      </div>

      <div className="glass-card p-6 border border-amber-500/30 flex flex-col items-center gap-6 rounded-2xl relative overflow-hidden bg-slate-900/90">
        
        {/* Prominent Big Target Banner */}
        <div className="p-3.5 bg-amber-950/80 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-3 text-amber-300 w-full shadow-lg shadow-amber-950/40 text-center">
          <div className="flex items-center gap-2 text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse fill-amber-400" />
            Precision Stopwatch Target:
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 bg-slate-950 px-4 py-1 rounded-xl border border-amber-400/40 shadow-inner drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
            {targetTimeSec.toFixed(3)}s
          </span>
        </div>

        {/* Stopwatch Display */}
        <motion.div 
          animate={isRunning ? { scale: [1, 1.03, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-mono font-black text-amber-400 tracking-wider drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] my-2"
        >
          {formatSeconds(elapsedMs)}<span className="text-3xl sm:text-4xl text-amber-500 font-bold ml-1">s</span>
        </motion.div>

        {/* GAME ENDED BANNER */}
        {isGameEnded ? (
          <div className="w-full max-w-md p-5 bg-slate-950/90 border border-rose-800/40 rounded-2xl text-center space-y-2 shadow-xl">
            <div className="text-sm font-bold text-rose-400 flex items-center justify-center gap-2 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-rose-400" /> 🔒 Competition Ended (Time Expired)
            </div>
            <p className="text-xs text-slate-400">
              This competition has concluded. Stopwatch attempts and entry payments are locked!
            </p>
          </div>
        ) : (
          <>
            {/* STATE 1: UNPAID -> Pay Entry Fee Button */}
            {!isPaid && !hasAttempted && (
              <div className="w-full max-w-md space-y-3 text-center">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Wallet className="w-4 h-4 text-cyan-400" /> Wallet Balance:
                  </span>
                  <strong className="text-cyan-300 font-mono text-sm">{walletBalance} ETB</strong>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePayClick}
                  disabled={isProcessingPay}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4 fill-slate-950" />
                  {isProcessingPay ? 'Processing Payment...' : `💳 Pay ${entryFee} ETB to Unlock Timer`}
                </motion.button>
              </div>
            )}

            {/* STATE 2: PAID -> Start Timer Button */}
            {isPaid && !hasAttempted && !isRunning && (
              <div className="w-full max-w-md text-center space-y-3">
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Entry Fee Paid! Timer Unlocked (1 Attempt Allowed)
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/40 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider animate-bounce"
                >
                  <Play className="w-5 h-5 fill-slate-950" /> ▶ START TIMER NOW
                </motion.button>
              </div>
            )}

            {/* STATE 3: RUNNING -> Stop Button */}
            {isRunning && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={stopTimer}
                className="w-full max-w-md py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-2xl shadow-xl shadow-rose-500/50 animate-pulse transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider"
              >
                <Square className="w-5 h-5 fill-white" /> ⏹ STOP NOW!
              </motion.button>
            )}

            {/* STATE 4: ATTEMPT COMPLETED & SUBMITTED -> Results + Try Again Button */}
            {hasAttempted && !isRunning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-slate-950/90 border border-amber-500/40 rounded-2xl text-center space-y-4 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  {isSubmittingAttempt ? 'Submitting to Backend...' : 'Attempt Automatically Submitted to Backend!'}
                </div>
                
                <div className="text-3xl font-mono font-black text-white">
                  Stopped at <span className="text-amber-400">{formatSeconds(elapsedMs)}s</span>
                </div>

                <div className="text-xs text-amber-300 font-mono bg-amber-500/10 py-2 px-4 rounded-xl border border-amber-500/30 inline-block font-bold">
                  Delta from target ({targetTimeSec.toFixed(3)}s): <span className="text-white text-sm">+{recordedDelta ?? 0} ms</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Your time is permanently saved on the backend engine.
                </p>

                {/* TRY AGAIN BUTTON: Deducts Fee for New Attempt if Game is Still Active */}
                {!isGameEnded ? (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 block font-semibold">Want to improve your time score?</span>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleTryAgainClick}
                      disabled={isProcessingPay}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                    >
                      <RefreshCw className={`w-4 h-4 ${isProcessingPay ? 'animate-spin' : ''}`} />
                      {isProcessingPay ? 'Deducting Entry Fee...' : `🔄 TRY AGAIN (Deduct ${entryFee} ETB for New Attempt)`}
                    </motion.button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800 text-xs text-rose-400 font-semibold font-mono">
                    🔒 Competition Ended — Additional attempts are locked
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
