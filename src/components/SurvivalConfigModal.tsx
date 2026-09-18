import { Check, RotateCcw, ShieldAlert, X } from 'lucide-react';
import React, { useState } from 'react';
import { Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

interface SurvivalConfigModalProps {
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

  const survivalEnvelopes = envelopes.filter((e) => e.isEssentialForSurvival);
  const monthlySurvivalTotal = survivalEnvelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Survival Baseline Configuration</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select which monthly expenses are vital for survival vs comfort
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Current Survival Burn Rate</p>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5">
              {formatNaira(monthlySurvivalTotal)} per month is your absolute survival threshold. Your runway is measured against this number.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {envelopes.map((env) => (
            <label
              key={env.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={env.isEssentialForSurvival}
                  onChange={() => onToggleEssential(env.id)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{env.name}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{formatNaira(env.monthlyTarget)} / mo</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  env.isEssentialForSurvival
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {env.isEssentialForSurvival ? 'Must-Pay Survival' : 'Comfort / Leisure'}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onResetToDefault}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all to initial defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
