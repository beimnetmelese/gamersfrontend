import React, { useState } from 'react';
import type { Game } from '../types';
import { TreasureBoxGrid } from '../components/GameEngines/TreasureBoxGrid';
import { LowestUniqueSelector } from '../components/GameEngines/LowestUniqueSelector';
import { HighestCardPicker } from '../components/GameEngines/HighestCardPicker';
import { SecretNumberInput } from '../components/GameEngines/SecretNumberInput';
import { PredictionChallengeInput } from '../components/GameEngines/PredictionChallengeInput';
import { PrecisionTimerWidget } from '../components/GameEngines/PrecisionTimerWidget';
import { GameRulesModal } from '../components/GameRulesModal';
import { joinGameAPI } from '../services/api';
import { IconShield, IconCheck } from '../components/Icons';

interface GameDetailPageProps {
  game: Game;
  onBack: () => void;
  walletBalance: number;
  onRefreshWallet: () => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  game,
  onBack,
  walletBalance,
  onRefreshWallet,
}) => {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(7);
  const [selectedCard, setSelectedCard] = useState<string | null>('A');
  const [predictionAnswer, setPredictionAnswer] = useState<number | null>(28);
  const [timerDeltaMs, setTimerDeltaMs] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleJoinSubmit = async () => {
    if (walletBalance < game.entryFee) {
      setStatusAlert({ type: 'error', text: `Insufficient wallet balance! You need ${game.entryFee} ETB.` });
      return;
    }

    const payload: Record<string, any> = {};
    if (game.gameType === 'TREASURE_BOX') {
      if (!selectedBox) {
        setStatusAlert({ type: 'error', text: 'Please pick a treasure box first!' });
        return;
      }
      payload.selected_box = selectedBox;
    } else if (game.gameType === 'LOWEST_UNIQUE' || game.gameType === 'SECRET_NUMBER') {
      payload.selected_number = selectedNumber;
    } else if (game.gameType === 'HIGHEST_CARD') {
      payload.selected_card = selectedCard;
    } else if (game.gameType === 'PREDICTION') {
      payload.prediction_answer = predictionAnswer;
    } else if (game.gameType === 'PRECISION_TIMER') {
      if (timerDeltaMs === null) {
        setStatusAlert({ type: 'error', text: 'Please complete the timer challenge first!' });
        return;
      }
      payload.timer_delta_ms = timerDeltaMs;
    }

    setIsSubmitting(true);
    const res = await joinGameAPI(game.id, payload);
    setIsSubmitting(false);

    if (res.success) {
      setStatusAlert({ type: 'success', text: res.message });
      onRefreshWallet();
    } else {
      setStatusAlert({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2"
      >
        ← Back to Marketplace
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Product & Game Specs */}
        <div className="space-y-6">
          <div className="glass-panel overflow-hidden border border-slate-800">
            <img
              src={game.product.imageUrl}
              alt={game.product.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-5 space-y-3">
              <span className="badge-pill badge-cyan">{game.product.category}</span>
              <h2 className="font-extrabold text-xl text-slate-100">{game.product.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{game.product.description}</p>
              
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
                <span className="text-slate-400">Estimated Value:</span>
                <strong className="text-amber-400">{game.product.estimatedValue.toLocaleString()} ETB</strong>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Seller:</span>
                <strong className="text-slate-200">{game.sellerName}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2"
          >
            <IconShield className="w-4 h-4 text-cyan-400" />
            View Game Rules & Refund Policy
          </button>
        </div>

        {/* Right Column: Game Engine & Participation Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 border border-cyan-500/30 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-2xl text-slate-100">{game.title}</h3>
                <p className="text-xs text-cyan-400 font-mono">Game Engine: {game.gameType.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Entry Fee</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{game.entryFee} ETB</span>
              </div>
            </div>

            {/* Alert message if any */}
            {statusAlert && (
              <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                statusAlert.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}>
                {statusAlert.type === 'success' ? <IconCheck className="w-4 h-4" /> : '⚠️'}
                {statusAlert.text}
              </div>
            )}

            {/* Dynamic Game Engine Selector Component */}
            <div className="pt-2">
              {game.gameType === 'TREASURE_BOX' && (
                <TreasureBoxGrid
                  totalBoxes={game.totalBoxes || 100}
                  selectedBox={selectedBox}
                  onSelectBox={setSelectedBox}
                />
              )}
              {game.gameType === 'LOWEST_UNIQUE' && (
                <LowestUniqueSelector
                  selectedNumber={selectedNumber}
                  onSelectNumber={setSelectedNumber}
                />
              )}
              {game.gameType === 'HIGHEST_CARD' && (
                <HighestCardPicker
                  selectedCard={selectedCard}
                  onSelectCard={setSelectedCard}
                />
              )}
              {game.gameType === 'SECRET_NUMBER' && (
                <SecretNumberInput
                  selectedNumber={selectedNumber}
                  onSelectNumber={setSelectedNumber}
                />
              )}
              {game.gameType === 'PREDICTION' && (
                <PredictionChallengeInput
                  predictionAnswer={predictionAnswer}
                  onSelectPrediction={setPredictionAnswer}
                />
              )}
              {game.gameType === 'PRECISION_TIMER' && (
                <PrecisionTimerWidget
                  timerDeltaMs={timerDeltaMs}
                  onRecordTimerDelta={setTimerDeltaMs}
                />
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Wallet Balance: <strong className="text-cyan-300 font-mono">{walletBalance} ETB</strong>
              </div>

              <button
                onClick={handleJoinSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
              >
                {isSubmitting ? 'Processing Entry...' : `Confirm & Pay ${game.entryFee} ETB Entry`}
              </button>
            </div>

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
            handleJoinSubmit();
          }}
        />
      )}

    </div>
  );
};
