import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, Users, Eye, CheckCircle2, Zap, Trophy, UserCheck, Lock, Clock
} from 'lucide-react';
import type { Game, GameStatisticsData } from '../types';
import { TreasureBoxGrid } from '../components/GameEngines/TreasureBoxGrid';
import { LowestUniqueSelector } from '../components/GameEngines/LowestUniqueSelector';
import { HighestCardPicker } from '../components/GameEngines/HighestCardPicker';
import { SecretNumberInput } from '../components/GameEngines/SecretNumberInput';
import { PrecisionTimerWidget } from '../components/GameEngines/PrecisionTimerWidget';
import { CountdownTimer } from '../components/CountdownTimer';
import { GameRulesModal } from '../components/GameRulesModal';
import { ProductModal } from '../components/ProductModal';
import { InsufficientFundsModal } from '../components/InsufficientFundsModal';
import { EntrySuccessModal } from '../components/EntrySuccessModal';
import { ConfirmPaymentModal } from '../components/ConfirmPaymentModal';
import { joinGameAPI, fetchGameStatistics, deductWalletBalance, incrementGameViewsAPI } from '../services/api';

interface GameDetailPageProps {
  game: Game;
  onBack: () => void;
  walletBalance: number;
  onRefreshWallet: () => void;
  onDeductWallet?: (amount: number) => number;
  onOpenWallet: () => void;
  onUpdateGame?: (updatedGame: Game) => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  game,
  onBack,
  walletBalance,
  onRefreshWallet,
  onDeductWallet,
  onOpenWallet,
  onUpdateGame,
}) => {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [pendingSelectionDetails, setPendingSelectionDetails] = useState<string>('');
  const [successModalData, setSuccessModalData] = useState<{
    gameTitle: string;
    entryFee: number;
    gameType: string;
    selectionDetails?: string;
    remainingBalance: number;
  } | null>(null);
  const [stats, setStats] = useState<GameStatisticsData | null>(null);

  // Engine inputs
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(7);
  const [selectedCard, setSelectedCard] = useState<string | null>('A');
  const [timerDeltaMs, setTimerDeltaMs] = useState<number | null>(null);
  const [isTimerPaid, setIsTimerPaid] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isGameEnded, setIsGameEnded] = useState<boolean>(() => {
    const s = (game.status as string) || '';
    if (s === 'COMPLETED' || s === 'ENDED' || s === 'EXPIRED') return true;
    let targetMs: number;
    if (game.endTime) {
      targetMs = new Date(game.endTime).getTime();
    } else if (game.createdAt) {
      targetMs = new Date(game.createdAt).getTime() + ((game.durationMinutes || 120) * 60 * 1000);
    } else {
      targetMs = Date.now() + 120 * 60 * 1000;
    }
    return targetMs <= Date.now();
  });

  useEffect(() => {
    let targetMs: number;
    if (game.endTime) {
      targetMs = new Date(game.endTime).getTime();
    } else if (game.createdAt) {
      targetMs = new Date(game.createdAt).getTime() + ((game.durationMinutes || 120) * 60 * 1000);
    } else {
      targetMs = Date.now() + 120 * 60 * 1000;
    }

    const check = () => {
      const s = (game.status as string) || '';
      const ended = s === 'COMPLETED' || s === 'ENDED' || s === 'EXPIRED' || Date.now() >= targetMs;
      setIsGameEnded(ended);
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [game.status, game.endTime, game.createdAt, game.durationMinutes]);

  const hasIncrementedViewRef = useRef(false);

  useEffect(() => {
    fetchGameStatistics(game.id).then(setStats);
    if (!hasIncrementedViewRef.current) {
      hasIncrementedViewRef.current = true;
      incrementGameViewsAPI(game.id).then((newViews: number) => {
        onUpdateGame?.({ ...game, viewsCount: newViews });
      });
    }
    
    // Load local stored participants for robust page refresh persistence
    try {
      const storageKey = `allin_game_participants_${game.id}`;
      const savedStr = localStorage.getItem(storageKey);
      if (savedStr) {
        const savedList: any[] = JSON.parse(savedStr);
        if (!game.participants) game.participants = [];
        savedList.forEach(sp => {
          const spBox = sp.selectedBox ?? sp.selected_box;
          const exists = game.participants?.some(p => p.id === sp.id || (spBox && (p.selectedBox === spBox || (p as any).selected_box === spBox)));
          if (!exists) {
            game.participants?.push(sp);
          }
        });
        const totalCount = Math.max(game.participantsCount || 0, (game.participants || []).length);
        game.participantsCount = totalCount;
        onUpdateGame?.({ ...game, participantsCount: totalCount, participants: game.participants });
      }
    } catch (e) {}

    if (game.participants && game.participants.length > 0) {
      // Find existing box selection
      const userBoxEntry = [...game.participants].reverse().find(p => p.selectedBox || (p as any).selected_box);
      if (userBoxEntry) {
        const boxVal = userBoxEntry.selectedBox ?? (userBoxEntry as any).selected_box;
        if (boxVal) setSelectedBox(boxVal);
      }
      const userNumEntry = [...game.participants].reverse().find(p => p.selectedNumber || (p as any).selected_number);
      if (userNumEntry) {
        const numVal = userNumEntry.selectedNumber ?? (userNumEntry as any).selected_number;
        if (numVal) setSelectedNumber(numVal);
      }
      const userCardEntry = [...game.participants].reverse().find(p => p.selectedCard || (p as any).selected_card);
      if (userCardEntry) {
        const cardVal = userCardEntry.selectedCard ?? (userCardEntry as any).selected_card;
        if (cardVal) setSelectedCard(cardVal);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [game.id, game.participants]);

  const myParticipants = (game.participants || []).filter(
    (p: any) => p.username === 'You' || p.userId === 1 || p.user_id === 1
  );
  const mySubmittedBoxes = myParticipants
    .map((p: any) => p.selectedBox ?? p.selected_box)
    .filter((b): b is number => b !== undefined && b !== null);

  const mySubmittedNumbers = myParticipants
    .map((p: any) => p.selectedNumber ?? p.selected_number)
    .filter((n): n is number => n !== undefined && n !== null);

  const mySubmittedCards = myParticipants
    .map((p: any) => p.selectedCard ?? p.selected_card)
    .filter((c): c is string => c !== undefined && c !== null);

  const formatPlayingCard = (rawCard: string): string => {
    if (!rawCard) return 'Card';
    const c = rawCard.trim().toUpperCase().replace(/^CARD\s*/i, '');
    if (c === 'A') return 'Ace (A)';
    if (c === 'K') return 'King (K)';
    if (c === 'Q') return 'Queen (Q)';
    if (c === 'J') return 'Jack (J)';
    if (c === '10') return 'Ten (10)';
    if (c === '9') return 'Nine (9)';
    if (c === '8') return 'Eight (8)';
    if (c === '7') return 'Seven (7)';
    if (c === '6') return 'Six (6)';
    if (c === '5') return 'Five (5)';
    if (c === '4') return 'Four (4)';
    if (c === '3') return 'Three (3)';
    if (c === '2') return 'Two (2)';
    
    const rankStr = c.slice(0, -1);
    if (rankStr === 'A') return 'Ace (A)';
    if (rankStr === 'K') return 'King (K)';
    if (rankStr === 'Q') return 'Queen (Q)';
    if (rankStr === 'J') return 'Jack (J)';
    if (rankStr === '10') return 'Ten (10)';
    return `${c}`;
  };

  const getFormattedWinningChoice = (): string => {
    if (game.winningValue && game.winningValue !== 'Winning Pick') {
      let val = game.winningValue;
      
      // Clean up raw card shorthand if gameType is HIGHEST_CARD or val contains shorthand
      if (game.gameType === 'HIGHEST_CARD' || val.startsWith('Card ')) {
        const rawCard = val.replace(/^Card\s*/i, '');
        return `Card: ${formatPlayingCard(rawCard)}`;
      }

      // Format Secret Number guess with secret target
      if (val.includes('Guess') && val.includes('Secret:')) {
        return val.replace('Guess', 'Closest Guess #').replace('(Secret:', '(Secret Target: #');
      }

      if (val.startsWith('Box #') || val.startsWith('Number') || val.startsWith('Guess') || val.startsWith('+')) {
        return val;
      }

      if (game.gameType === 'TREASURE_BOX') return `Box #${val}`;
      if (game.gameType === 'LOWEST_UNIQUE') return `Number #${val}`;
      if (game.gameType === 'SECRET_NUMBER') return `Closest Guess #${val}`;
      if (game.gameType === 'PRECISION_TIMER') return val.includes('ms') ? val : `+${val} ms delta`;
      return val;
    }

    const winnerP = (game.participants || []).find(p => p.username === game.winnerName || (p as any).selected_box !== undefined);
    if (winnerP) {
      const box = winnerP.selectedBox ?? (winnerP as any).selected_box;
      const num = winnerP.selectedNumber ?? (winnerP as any).selected_number;
      const card = winnerP.selectedCard ?? (winnerP as any).selected_card;
      const timerMs = winnerP.timerDeltaMs ?? (winnerP as any).timer_delta_ms;

      if (box !== undefined && box !== null) return `Box #${box}`;
      if (num !== undefined && num !== null) {
        if (game.gameType === 'SECRET_NUMBER') return `Closest Guess #${num}`;
        return `Number #${num}`;
      }
      if (card) return `Card: ${formatPlayingCard(card)}`;
      if (timerMs !== undefined && timerMs !== null) return `+${timerMs} ms delta`;
    }

    if (game.gameType === 'TREASURE_BOX') return 'Box #18';
    if (game.gameType === 'LOWEST_UNIQUE') return 'Number #7';
    if (game.gameType === 'HIGHEST_CARD') return 'Card: Ace of Spades (A♠)';
    if (game.gameType === 'SECRET_NUMBER') return 'Closest Guess #250';
    if (game.gameType === 'PRECISION_TIMER') return '+42 ms delta';
    return 'Winning Choice';
  };

  const occupiedBoxes = (game.participants || [])
    .map((p: any) => p.selectedBox ?? p.selected_box)
    .filter((b): b is number => b !== undefined && b !== null);

  const handleTimerPayEntry = async (): Promise<boolean> => {
    if (walletBalance < game.entryFee) {
      setShowInsufficientFundsModal(true);
      return false;
    }
    setIsSubmitting(true);
    const res = await joinGameAPI(game.id, { game_type: 'PRECISION_TIMER' });
    setIsSubmitting(false);
    if (res.success) {
      setIsTimerPaid(true);
      if (onDeductWallet) onDeductWallet(game.entryFee);
      else deductWalletBalance(game.entryFee);
      onRefreshWallet();
      setStatusAlert({ type: 'success', text: `✓ Entry Fee Paid (${game.entryFee} ETB)! Timer unlocked for 1 attempt.` });
      return true;
    } else {
      setStatusAlert({ type: 'error', text: res.message || 'Payment processing failed.' });
      return false;
    }
  };

  const handleAutoSubmitTimerAttempt = async (deltaMs: number, recordedTimeSec: number) => {
    setTimerDeltaMs(deltaMs);
    setIsSubmitting(true);
    const res = await joinGameAPI(game.id, { timer_delta_ms: deltaMs });
    setIsSubmitting(false);
    if (res.success) {
      if (!game.participants) game.participants = [];
      const newEntry = {
        id: Date.now(),
        gameId: game.id,
        userId: 1,
        username: 'You',
        timerDeltaMs: deltaMs,
        joinedAt: new Date().toISOString()
      };
      const existing = game.participants.find((p: any) => p.username === 'You' || p.userId === 1 || p.user_id === 1);
      if (existing) {
        existing.timerDeltaMs = deltaMs;
        (existing as any).timer_delta_ms = deltaMs;
      } else {
        game.participants.push(newEntry);
      }
      game.participantsCount = game.participants.length;
      onUpdateGame?.({ ...game, participantsCount: game.participants.length, participants: game.participants });

      try {
        const storageKey = `allin_game_participants_${game.id}`;
        const savedStr = localStorage.getItem(storageKey);
        const list = savedStr ? JSON.parse(savedStr) : [];
        list.push(newEntry);
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch (e) {}

      setStatusAlert({ type: 'success', text: `✓ Attempt submitted to backend! Time: ${recordedTimeSec}s (Delta: +${deltaMs}ms)` });
    }
  };

  const handleInitiateJoin = () => {
    if (isGameEnded) {
      setStatusAlert({ type: 'error', text: '⚠️ This competition has ended. Bids can no longer be submitted!' });
      return;
    }

    if (walletBalance < game.entryFee) {
      setShowInsufficientFundsModal(true);
      return;
    }

    let detailStr = '';
    if (game.gameType === 'TREASURE_BOX') {
      if (!selectedBox) {
        setStatusAlert({ type: 'error', text: 'Please pick an available treasure box first!' });
        return;
      }
      detailStr = `Box #${selectedBox}`;
    } else if (game.gameType === 'LOWEST_UNIQUE' || game.gameType === 'SECRET_NUMBER') {
      if (selectedNumber === null || selectedNumber === undefined) {
        setStatusAlert({ type: 'error', text: 'Please choose a target number first!' });
        return;
      }
      if (mySubmittedNumbers.includes(selectedNumber)) {
        setStatusAlert({ 
          type: 'error', 
          text: `⚠️ You already submitted number #${selectedNumber}! Please choose a different number for your new bid.` 
        });
        return;
      }
      detailStr = `Number #${selectedNumber}`;
    } else if (game.gameType === 'HIGHEST_CARD') {
      if (!selectedCard) {
        setStatusAlert({ type: 'error', text: 'Please pick a card first!' });
        return;
      }
      if (mySubmittedCards.includes(selectedCard)) {
        setStatusAlert({ 
          type: 'error', 
          text: `⚠️ You already submitted Card ${selectedCard}! Please pick a different card for your new bid.` 
        });
        return;
      }
      detailStr = `Card ${selectedCard}`;
    } else if (game.gameType === 'PRECISION_TIMER') {
      if (timerDeltaMs === null) {
        setStatusAlert({ type: 'error', text: 'Please complete the precision timer attempt first!' });
        return;
      }
      detailStr = `Timer Attempt`;
    }

    setPendingSelectionDetails(detailStr);
    setShowConfirmPaymentModal(true);
  };

  const executeJoinPayment = async () => {
    setShowConfirmPaymentModal(false);

    const payload: Record<string, any> = {};
    if (game.gameType === 'TREASURE_BOX') {
      payload.selected_box = selectedBox;
    } else if (game.gameType === 'LOWEST_UNIQUE' || game.gameType === 'SECRET_NUMBER') {
      payload.selected_number = selectedNumber;
    } else if (game.gameType === 'HIGHEST_CARD') {
      payload.selected_card = selectedCard;
    } else if (game.gameType === 'PRECISION_TIMER') {
      payload.timer_delta_ms = timerDeltaMs;
    }

    setIsSubmitting(true);
    const res = await joinGameAPI(game.id, payload);
    setIsSubmitting(false);

    if (res.success) {
      const newBal = onDeductWallet ? onDeductWallet(game.entryFee) : deductWalletBalance(game.entryFee);
      onRefreshWallet();

      if (!game.participants) game.participants = [];
      const newEntry = {
        id: Date.now(),
        gameId: game.id,
        userId: 1,
        username: 'You',
        selectedBox: typeof selectedBox === 'number' ? selectedBox : undefined,
        selectedNumber: typeof selectedNumber === 'number' ? selectedNumber : undefined,
        selectedCard: selectedCard || undefined,
        timerDeltaMs: typeof timerDeltaMs === 'number' ? timerDeltaMs : undefined,
        joinedAt: new Date().toISOString()
      };
      game.participants.push(newEntry);
      game.participantsCount = game.participants.length;
      onUpdateGame?.({ ...game, participantsCount: game.participants.length, participants: game.participants });

      try {
        const storageKey = `allin_game_participants_${game.id}`;
        const savedStr = localStorage.getItem(storageKey);
        const list = savedStr ? JSON.parse(savedStr) : [];
        list.push(newEntry);
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch (e) {}

      setSuccessModalData({
        gameTitle: game.title,
        entryFee: game.entryFee,
        gameType: game.gameType || 'TREASURE_BOX',
        selectionDetails: pendingSelectionDetails,
        remainingBalance: newBal,
      });

      setStatusAlert({ 
        type: 'success', 
        text: selectedBox 
          ? `✓ Bid submitted successfully for Box #${selectedBox}! Entry fee (${game.entryFee} ETB) deducted.` 
          : res.message 
      });
      setSelectedBox(null);
      onRefreshWallet();
    } else {
      setStatusAlert({ type: 'error', text: res.message });
    }
  };

  const handleSelectBox = (boxNum: number) => {
    if (isGameEnded || mySubmittedBoxes.includes(boxNum)) return;
    setSelectedBox(prev => prev === boxNum ? null : boxNum);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn py-4">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <Eye className="w-4 h-4 text-cyan-400" /> Views: <strong className="text-white">{game.viewsCount || stats?.viewsCount || 0}</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Users className="w-4 h-4 text-purple-400" /> Players: <strong className="text-white">{game.participantsCount}/{game.maxParticipants}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Product & Seller Metadata Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel overflow-hidden border border-slate-800 rounded-3xl space-y-4">
            <div className="relative group cursor-pointer" onClick={() => setShowProductModal(true)}>
              <img
                src={game.product.imageUrl}
                alt={game.product.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="bg-cyan-500/90 text-slate-950 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  {game.product.condition}
                </span>
                <span className="text-xs bg-slate-900/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
                  Inspect Details ↗
                </span>
              </div>
            </div>

            <div className="p-6 pt-2 space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {game.product.category}
                </span>
                <h2 className="text-xl font-black text-white mt-1 leading-snug">
                  {game.product.title}
                </h2>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Estimated Retail Value</span>
                <strong className="text-amber-400 text-base">{game.product.estimatedValue.toLocaleString()} ETB</strong>
              </div>

              {/* Seller info */}
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    {game.sellerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {game.sellerName} <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">{game.product.location}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRulesModal(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                View Game Rules & Refund Policy
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Game Engine & Entry Interface */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 sm:p-8 border border-cyan-500/30 rounded-3xl space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40 inline-block mb-1">
                  Engine: {(game.gameType || 'TREASURE_BOX').replace(/_/g, ' ')}
                </span>
                <h3 className="text-2xl font-black text-white">{game.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Entry Fee</span>
                <span className="text-3xl font-black font-mono text-emerald-400">{game.entryFee} ETB</span>
              </div>
            </div>

            {isGameEnded && game.participantsCount === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-slate-950/90 border border-rose-600/50 rounded-2xl space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                    <Clock className="w-5 h-5 text-rose-500" />
                    Bidding Period Closed — No Winner
                  </div>
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-600/40 font-bold">
                    ❌ 0 Bids Submitted
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  The bidding timer ended with 0 participant entries submitted. The game closed with no winner.
                </p>
              </motion.div>
            ) : (Boolean(game.winnerName) || (game.status as string) === 'COMPLETED' || (game.status as string) === 'ENDED') ? (
              (game.winnerName === 'User_Abebe' || game.winnerName === 'You' || game.winnerName === 'gamer_alex' || ((game.status as string) === 'COMPLETED' && myParticipants.length > 0)) ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-2 border-amber-400 rounded-3xl space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.4)] relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-amber-500/30 border-2 border-amber-400/80 rounded-2xl text-amber-300 shadow-lg animate-pulse">
                        <Trophy className="w-9 h-9 text-amber-300 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-black text-slate-950 uppercase tracking-widest bg-amber-400 px-3 py-0.5 rounded-full shadow inline-block mb-1">
                          🎉 YOU ARE THE OFFICIAL WINNER! 🏆
                        </span>
                        <h3 className="text-xl font-black text-white">
                          Congratulations! You won the <span className="text-amber-300">{game.product.title}</span>!
                        </h3>
                        <p className="text-xs text-amber-200/80 font-mono mt-0.5">
                          Valued at <strong className="text-amber-300">{game.product.estimatedValue.toLocaleString()} ETB</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right bg-slate-950/90 p-3.5 rounded-2xl border border-amber-400/50 font-mono text-xs shadow-inner">
                      <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-bold">Your Winning Pick</span>
                      <strong className="text-base font-black text-amber-300">{getFormattedWinningChoice()}</strong>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-5 bg-gradient-to-r from-amber-950/80 via-yellow-900/60 to-amber-950/80 border-2 border-amber-500/60 rounded-2xl space-y-2.5 shadow-xl shadow-amber-950/50 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                        <Trophy className="w-7 h-7 text-amber-400 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/30">
                          🏆 Winner Resolved & Announced
                        </span>
                        <h3 className="text-lg font-black text-white mt-0.5">
                          Winner: <span className="text-amber-300 font-mono">{game.winnerName || 'User_Abebe'}</span>
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 font-mono text-xs">
                      <span className="text-[10px] text-slate-400 block">Winning Choice</span>
                      <strong className="text-sm text-amber-300">{getFormattedWinningChoice()}</strong>
                    </div>
                  </div>
                </motion.div>
              )
            ) : isGameEnded ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-950/90 border border-cyan-500/40 rounded-2xl space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                    <Clock className="w-4.5 h-4.5 text-cyan-400 animate-spin" />
                    Bidding Time Ended — Calculating Winner...
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                    ⏳ Resolving Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Bidding is closed. The game engine is calculating unique entries to determine the official winner.
                </p>
              </motion.div>
            ) : null}

            {/* Alert Box */}
            {statusAlert && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-xs flex items-center gap-2 font-semibold ${
                  statusAlert.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/30'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 shadow-lg shadow-rose-950/30'
                }`}
              >
                {statusAlert.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : '⚠️'}
                {statusAlert.text}
              </motion.div>
            )}

            {/* Live Countdown Timer */}
            <CountdownTimer
              createdAt={game.createdAt}
              durationMinutes={game.durationMinutes}
              endTime={game.endTime}
              variant="detail"
            />

            {/* User Recorded Choice & Bid History Panel */}
            {myParticipants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 rounded-2xl space-y-3 shadow-lg shadow-cyan-950/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                    <UserCheck className="w-4.5 h-4.5 text-cyan-400" />
                    Your Submitted Choice History ({myParticipants.length} Bids Recorded)
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                    {isGameEnded ? '🔒 Locked (Game Ended)' : '✓ Confirmed'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {myParticipants.map((p: any, idx: number) => {
                    let label = '';
                    const boxVal = p.selectedBox ?? p.selected_box;
                    const numVal = p.selectedNumber ?? p.selected_number;
                    const cardVal = p.selectedCard ?? p.selected_card;
                    const timerVal = p.timerDeltaMs ?? p.timer_delta_ms ?? (timerDeltaMs !== null ? timerDeltaMs : undefined);

                    if (game.gameType === 'PRECISION_TIMER' || (timerVal !== undefined && timerVal !== null)) {
                      const deltaNum = (timerVal !== undefined && timerVal !== null) ? timerVal : (timerDeltaMs ?? 0);
                      label = `⏱️ Precision Stopwatch (+${deltaNum}ms delta)`;
                    } else if (game.gameType === 'SECRET_NUMBER' && numVal !== undefined && numVal !== null) {
                      label = `🎯 Secret Number Guess #${numVal}`;
                    } else if (game.gameType === 'LOWEST_UNIQUE' && numVal !== undefined && numVal !== null) {
                      label = `🔢 Lowest Unique Pick #${numVal}`;
                    } else if (boxVal !== undefined && boxVal !== null) {
                      label = `📦 Treasure Box #${boxVal}`;
                    } else if (numVal !== undefined && numVal !== null) {
                      label = `🔢 Choice #${numVal}`;
                    } else if (cardVal !== undefined && cardVal !== null) {
                      label = `🃏 Playing Card ${cardVal}`;
                    } else {
                      label = `🎯 Recorded Entry #${idx + 1}`;
                    }

                    return (
                      <div
                        key={p.id || idx}
                        className="px-4 py-2 bg-slate-950/90 border border-cyan-500/40 rounded-xl text-xs font-mono text-cyan-200 flex items-center gap-2 shadow-sm hover:border-cyan-400 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="text-slate-400 font-sans">Bid #{idx + 1}:</span>
                        <strong className="text-white font-bold text-sm">{label}</strong>
                        <span className="text-[10px] text-slate-500 font-sans border-l border-slate-800 pl-2">
                          {new Date(p.joinedAt || p.joined_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Dynamic Game Engine Component */}
            <div className="pt-2">
              {game.gameType === 'TREASURE_BOX' && (
                <TreasureBoxGrid
                  totalBoxes={Math.max(game.totalBoxes || 0, game.maxParticipants || 0, 1)}
                  occupiedBoxes={occupiedBoxes}
                  selectedBox={selectedBox}
                  mySubmittedBoxes={mySubmittedBoxes}
                  isGameEnded={isGameEnded}
                  onSelectBox={handleSelectBox}
                />
              )}
              {game.gameType === 'LOWEST_UNIQUE' && (
                <LowestUniqueSelector
                  selectedNumber={selectedNumber}
                  onSelectNumber={setSelectedNumber}
                  mySubmittedNumbers={mySubmittedNumbers}
                />
              )}
              {game.gameType === 'HIGHEST_CARD' && (
                <HighestCardPicker
                  selectedCard={selectedCard}
                  onSelectCard={setSelectedCard}
                  mySubmittedCards={mySubmittedCards}
                />
              )}
              {game.gameType === 'SECRET_NUMBER' && (
                <SecretNumberInput
                  selectedNumber={selectedNumber}
                  onSelectNumber={setSelectedNumber}
                  mySubmittedNumbers={mySubmittedNumbers}
                />
              )}
              {game.gameType === 'PRECISION_TIMER' && (
                <PrecisionTimerWidget
                  targetTimeSec={game.targetTimeSec}
                  entryFee={game.entryFee}
                  walletBalance={walletBalance}
                  isPaid={isTimerPaid}
                  isGameEnded={isGameEnded}
                  onPayEntryFee={handleTimerPayEntry}
                  onAutoSubmitAttempt={handleAutoSubmitTimerAttempt}
                  onTryAgain={handleTimerPayEntry}
                />
              )}
            </div>

            {/* Action Footer for non-Precision Timer games */}
            {game.gameType !== 'PRECISION_TIMER' && (
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400 font-mono">
                  Your Wallet Balance: <strong className="text-cyan-300 text-sm">{walletBalance} ETB</strong>
                </div>

                <motion.button
                  whileHover={{ scale: isSubmitting || isGameEnded ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting || isGameEnded ? 1 : 0.97 }}
                  onClick={handleInitiateJoin}
                  disabled={isSubmitting || isGameEnded}
                  className={`px-8 py-4 bg-gradient-to-r ${
                    isGameEnded
                      ? 'from-slate-900 to-rose-950/80 text-rose-400 border border-rose-800/40 cursor-not-allowed shadow-none'
                      : 'from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-xl shadow-cyan-500/30'
                  } font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider`}
                >
                  {isGameEnded ? (
                    <>🔒 Competition Ended (Time Expired)</>
                  ) : isSubmitting ? (
                    'Processing Entry...'
                  ) : selectedBox ? (
                    <><Zap className="w-5 h-5 fill-slate-950" /> Confirm & Join Box #{selectedBox} for {game.entryFee} ETB</>
                  ) : (
                    <><Zap className="w-5 h-5 fill-slate-950" /> Confirm & Join for {game.entryFee} ETB</>
                  )}
                </motion.button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <GameRulesModal
          game={game}
          onClose={() => setShowRulesModal(false)}
          onConfirmJoin={() => {
            setShowRulesModal(false);
            handleInitiateJoin();
          }}
        />
      )}

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={game.product}
          sellerName={game.sellerName}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {/* Insufficient Funds Modal */}
      {showInsufficientFundsModal && (
        <InsufficientFundsModal
          entryFee={game.entryFee}
          walletBalance={walletBalance}
          onClose={() => setShowInsufficientFundsModal(false)}
          onGoToWallet={onOpenWallet}
        />
      )}

      {/* Pre-Payment Confirmation Modal */}
      {showConfirmPaymentModal && (
        <ConfirmPaymentModal
          gameTitle={game.title}
          entryFee={game.entryFee}
          selectionDetails={pendingSelectionDetails}
          currentBalance={walletBalance}
          onClose={() => setShowConfirmPaymentModal(false)}
          onConfirmPay={executeJoinPayment}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Entry Success Modal */}
      {successModalData && (
        <EntrySuccessModal
          gameTitle={successModalData.gameTitle}
          entryFee={successModalData.entryFee}
          gameType={successModalData.gameType}
          selectionDetails={successModalData.selectionDetails}
          remainingBalance={successModalData.remainingBalance}
          onClose={() => setSuccessModalData(null)}
        />
      )}

    </div>
  );
};
