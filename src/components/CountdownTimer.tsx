import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  createdAt?: string;
  durationMinutes?: number;
  endTime?: string;
  variant?: 'badge' | 'card' | 'hero' | 'detail';
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  createdAt,
  durationMinutes = 120,
  endTime,
  variant = 'card',
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    // Calculate target end timestamp
    let targetMs: number;
    if (endTime) {
      targetMs = new Date(endTime).getTime();
    } else if (createdAt) {
      targetMs = new Date(createdAt).getTime() + (durationMinutes * 60 * 1000);
    } else {
      targetMs = Date.now() + (durationMinutes * 60 * 1000);
    }

    const calculate = () => {
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [createdAt, durationMinutes, endTime]);

  if (timeLeft.isEnded) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-800/40 ${className}`}>
        <Clock className="w-3 h-3 text-rose-400" /> Game Ended
      </span>
    );
  }

  // Variant 1: Compact Badge
  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30 ${className}`}>
        <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    );
  }

  // Variant 2: Card Pill
  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-300 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Variant 3: Digital Clock (Hero & Detail Pages)
  return (
    <div className={`p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-2 ${className}`}>
      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-amber-400 animate-pulse" /> Time Remaining Until Winner Resolution
      </div>
      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xl sm:text-2xl font-black text-amber-300">{timeLeft.days}</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Days</div>
        </div>
        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xl sm:text-2xl font-black text-amber-300">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Hours</div>
        </div>
        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xl sm:text-2xl font-black text-amber-300">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Mins</div>
        </div>
        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xl sm:text-2xl font-black text-amber-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Secs</div>
        </div>
      </div>
    </div>
  );
};
