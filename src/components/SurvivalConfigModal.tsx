import {
  AlertTriangle,
  Check,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import React from 'react';
import { Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

export interface SurvivalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelopes: Envelope[];
  onToggleEssential: (envelopeId: string) => void;
  onResetToDefault: () => void;
}

export const SurvivalConfigModal: React.FC<SurvivalConfigModalProps> = ({
  isOpen,
  onClose,
  envelopes,
  onToggleEssential,
  onResetToDefault,
}) => {
  if (!isOpen) return null;

  const essentialEnvelopes = envelopes.filter((e) => e.isEssentialForSurvival);
  const monthlyEssentialTotal = essentialEnvelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);
  const dailyEssentialBurn = monthlyEssentialTotal > 0 ? monthlyEssentialTotal / 30 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Core Survival Threshold
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define strictly non-negotiable living expenses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Burn KPI Banner */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-amber-900 dark:text-amber-200 block">
              Core Survival Burn: {formatNaira(monthlyEssentialTotal)}/month
            </span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              ~{formatNaira(Math.round(dailyEssentialBurn))}/day across {essentialEnvelopes.length} core buckets
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
            Runway Anchor
          </span>
        </div>

        {/* Envelopes Toggle List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
          {envelopes.map((env) => (
            <div
              key={env.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: env.color }} />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                    {env.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Target: {formatNaira(env.monthlyTarget)} • {env.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleEssential(env.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  env.isEssentialForSurvival
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {env.isEssentialForSurvival ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Core Essential</span>
                  </>
                ) : (
                  <span>Non-Essential</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
