import React from 'react';
import type { ProductDelivery, DeliveryStatus } from '../types';
import { IconPackage, IconCheck } from './Icons';

interface DeliveryTrackerProps {
  delivery: ProductDelivery;
  onConfirmDelivery?: (id: number) => void;
}

const STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'CONFIRMED', label: 'Confirmed Received' },
];

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  delivery,
  onConfirmDelivery,
}) => {
  const getStepIndex = (status: DeliveryStatus) => {
    return STEPS.findIndex((s) => s.status === status);
  };

  const currentIndex = getStepIndex(delivery.status);

  return (
    <div className="glass-card p-5 border border-cyan-500/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconPackage className="w-5 h-5 text-cyan-400" />
          <h4 className="font-bold text-sm text-slate-100">{delivery.gameTitle}</h4>
        </div>
        <span className="badge-pill badge-cyan">
          {delivery.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative pt-4 pb-2">
        <div className="absolute top-7 left-4 right-4 h-1 bg-slate-800 rounded">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          ></div>
        </div>

        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, idx) => {
            const isPassed = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.status} className="flex flex-col items-center gap-1.5 text-center">
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all
                    ${isCurrent
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/30 scale-110'
                      : isPassed
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }
                  `}
                >
                  {isPassed ? <IconCheck className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[10px] max-w-[60px] font-semibold ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details & Actions */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span>Winner: <strong className="text-white">{delivery.winnerName}</strong></span>
          {delivery.trackingCode && <span className="ml-3 font-mono text-cyan-300">Tracking #: {delivery.trackingCode}</span>}
        </div>

        {delivery.status === 'DELIVERED' && onConfirmDelivery && (
          <button
            onClick={() => onConfirmDelivery(delivery.id)}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
          >
            Confirm Receipt ✓
          </button>
        )}
      </div>
    </div>
  );
};
