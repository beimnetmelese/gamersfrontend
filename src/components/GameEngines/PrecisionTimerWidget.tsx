import React, { useState, useEffect, useRef } from 'react';
import { IconTimer } from '../Icons';

interface PrecisionTimerProps {
  timerDeltaMs: number | null;
  onRecordTimerDelta: (deltaMs: number) => void;
}

export const PrecisionTimerWidget: React.FC<PrecisionTimerProps> = ({
  timerDeltaMs,
  onRecordTimerDelta,
}) => {
  const TARGET_MS = 5000; // Target is exactly 5.000 seconds
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startTimer = () => {
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

  const stopTimer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);

    if (startTimeRef.current !== null) {
      const finalMs = Math.round(performance.now() - startTimeRef.current);
      setElapsedMs(finalMs);
      const delta = Math.abs(finalMs - TARGET_MS);
      onRecordTimerDelta(delta);
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
      <div>
        <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <IconTimer className="w-5 h-5 text-amber-400" />
          Precision Timer Challenge
        </h4>
        <p className="text-xs text-slate-400">
          Target time: <strong className="text-amber-300">5.000 seconds</strong>. Press START then STOP as close as possible to 5.000s!
        </p>
      </div>

      <div className="glass-card p-6 border border-amber-500/30 flex flex-col items-center gap-6">
        <div className="text-5xl font-mono font-black text-amber-400 tracking-wider">
          {formatSeconds(elapsedMs)}s
        </div>

        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105"
          >
            ▶ START TIMER
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="px-8 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/40 animate-pulse transition-all transform hover:scale-105"
          >
            ⏹ STOP!
          </button>
        )}

        {timerDeltaMs !== null && !isRunning && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-center space-y-1">
            <div className="text-xs text-amber-300">
              Your Delta: <strong className="text-amber-200 text-sm">{timerDeltaMs} ms</strong> off target ({formatSeconds(elapsedMs)}s)
            </div>
            <p className="text-[11px] text-slate-400">Result recorded! You can retry or confirm entry below.</p>
          </div>
        )}
      </div>
    </div>
  );
};
