import { AlertCircle, CheckCircle2, RefreshCw, Sparkles, Wallet, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope } from '../types';
import { formatNaira, formatPercent } from '../utils/formatters';

interface BufferReallocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  survivalBufferCash: number;
  envelopes: Envelope[];
  cycleNumber?: number;
  onConfirmReallocation: (allocations: Record<string, number>) => void;
}

export const BufferReallocationModal: React.FC<BufferReallocationModalProps> = ({
  isOpen,
  onClose,
  survivalBufferCash,
  envelopes,
  cycleNumber = 1,
  onConfirmReallocation,
}) => {
  if (!isOpen) return null;

  // Maximum cash available to allocate
  const maxAvailable = Math.max(0, survivalBufferCash);

  // Initial smart allocation suggestion: prioritize survival/essential deficits
  const initialAllocations = useMemo(() => {
    const initial: Record<string, number> = {};
    let remaining = maxAvailable;

    const sortedEnvelopes = [...envelopes].sort((a, b) => {
      if (a.isEssentialForSurvival && !b.isEssentialForSurvival) return -1;
      if (!a.isEssentialForSurvival && b.isEssentialForSurvival) return 1;
      const defA = Math.max(0, a.monthlyTarget - (a.monthlyAllocated || a.currentBalance));
      const defB = Math.max(0, b.monthlyTarget - (b.monthlyAllocated || b.currentBalance));
      return defB - defA;
    });

    for (const env of sortedEnvelopes) {
      const alreadyAllocated = env.monthlyAllocated || env.currentBalance;
      const deficit = Math.max(0, env.monthlyTarget - alreadyAllocated);
      if (deficit > 0 && remaining > 0) {
        const allocate = Math.min(deficit, remaining);
        initial[env.id] = allocate;
        remaining -= allocate;
      } else {
        initial[env.id] = 0;
      }
    }

    return initial;
  }, [envelopes, maxAvailable]);

  const [allocations, setAllocations] = useState<Record<string, number>>(initialAllocations);
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>(() => {
    const pcts: Record<string, string> = {};
    for (const env of envelopes) {
      const alloc = initialAllocations[env.id] || 0;
      if (maxAvailable > 0 && alloc > 0) {
        pcts[env.id] = ((alloc / maxAvailable) * 100).toFixed(1).replace(/\.0$/, '');
      } else {
        pcts[env.id] = '';
      }
    }
    return pcts;
  });

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const totalAllocatedPct = maxAvailable > 0 ? (totalAllocated / maxAvailable) * 100 : 0;
  const remainingBuffer = Math.max(0, maxAvailable - totalAllocated);
  const isOverAllocated = totalAllocated > maxAvailable;

  // Direct editing of the Naira amount
  const handleAllocationChange = (envId: string, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    const safeVal = Math.max(0, val);
    setAllocations((prev) => ({
      ...prev,
      [envId]: safeVal,
    }));

    if (maxAvailable > 0 && safeVal > 0) {
      const pct = ((safeVal / maxAvailable) * 100).toFixed(1).replace(/\.0$/, '');
      setPercentInputs((prev) => ({ ...prev, [envId]: pct }));
    } else {
      setPercentInputs((prev) => ({ ...prev, [envId]: '' }));
    }
  };

  // Editing of the Percentage (%) column
  const handlePercentChange = (envId: string, pctStr: string) => {
    setPercentInputs((prev) => ({ ...prev, [envId]: pctStr }));
    const pct = parseFloat(pctStr);
    if (!isNaN(pct) && pct >= 0 && maxAvailable > 0) {
      const calculatedNaira = Math.round((pct / 100) * maxAvailable);
      setAllocations((prev) => ({
        ...prev,
        [envId]: calculatedNaira,
      }));
    } else if (pctStr === '' || pct === 0) {
      setAllocations((prev) => ({
        ...prev,
        [envId]: 0,
      }));
    }
  };

  const handleFillAllTargets = () => {
    let rem = maxAvailable;
    const nextAlloc: Record<string, number> = {};
    const nextPct: Record<string, string> = {};

    const sorted = [...envelopes].sort((a, b) => {
      if (a.isEssentialForSurvival && !b.isEssentialForSurvival) return -1;
      if (!a.isEssentialForSurvival && b.isEssentialForSurvival) return 1;
      return b.monthlyTarget - a.monthlyTarget;
    });

    for (const env of sorted) {
      const deficit = Math.max(0, env.monthlyTarget - (env.monthlyAllocated || env.currentBalance));
      if (deficit > 0 && rem > 0) {
        const amt = Math.min(deficit, rem);
        nextAlloc[env.id] = amt;
        rem -= amt;
        nextPct[env.id] = maxAvailable > 0 ? ((amt / maxAvailable) * 100).toFixed(1).replace(/\.0$/, '') : '';
      } else {
        nextAlloc[env.id] = 0;
        nextPct[env.id] = '';
      }
    }

    setAllocations(nextAlloc);
    setPercentInputs(nextPct);
  };

  const handleResetAllocations = () => {
    const empty: Record<string, number> = {};
    const emptyPct: Record<string, string> = {};
    envelopes.forEach((e) => {
      empty[e.id] = 0;
      emptyPct[e.id] = '';
    });
    setAllocations(empty);
    setPercentInputs(emptyPct);
  };

  const handleConfirm = () => {
    if (isOverAllocated) return;
    onConfirmReallocation(allocations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Reallocate from Cash in Hand
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  Month Cycle #{cycleNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribute liquid cash from your survival buffer to meet monthly envelope targets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Buffer Cash Overview Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                Available Cash in Hand / Buffer
              </span>
              <span className="text-2xl font-black text-blue-950 dark:text-blue-100">
                {formatNaira(maxAvailable)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillAllTargets}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Prioritize Targets</span>
              </button>
              <button
                type="button"
                onClick={handleResetAllocations}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase px-2">
              <span className="flex-1">Envelope &amp; Target Deficit</span>
              <div className="flex items-center gap-2 w-48 justify-end">
                <span className="w-16 text-center">% Share</span>
                <span className="w-28 text-right">Need Naira (₦)</span>
              </div>
            </div>

            {/* Envelopes list */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-850/40">
              {envelopes.map((env) => {
                const currentMonthAlloc = env.monthlyAllocated || env.currentBalance;
                const deficit = Math.max(0, env.monthlyTarget - currentMonthAlloc);
                const currentVal = allocations[env.id] || 0;
                const willReachTarget = currentMonthAlloc + currentVal >= env.monthlyTarget && env.monthlyTarget > 0;
                const isOverAlloc = currentMonthAlloc + currentVal > env.monthlyTarget && env.monthlyTarget > 0;

                return (
                  <div
                    key={env.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: env.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {env.name}
                          </p>
                          {env.isEssentialForSurvival && (
                            <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Survival
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>Target: {formatNaira(env.monthlyTarget)}</span>
                          <span>•</span>
                          {deficit > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Deficit: {formatNaira(deficit)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Target already met ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inputs: % and Naira */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-16">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={percentInputs[env.id] ?? ''}
                          onChange={(e) => handlePercentChange(env.id, e.target.value)}
                          className="w-full text-right text-xs font-bold py-1.5 pl-1.5 pr-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          %
                        </span>
                      </div>

                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                          ₦
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="0"
                          value={allocations[env.id] || ''}
                          onChange={(e) => handleAllocationChange(env.id, e.target.value)}
                          className={`w-full text-right text-xs font-bold py-1.5 pl-6 pr-2 rounded-lg border focus:outline-none focus:ring-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
                            willReachTarget
                              ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500'
                              : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Summary & Confirmation */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total Allocated: </span>
              <strong className="font-extrabold text-slate-900 dark:text-slate-100">
                {formatNaira(totalAllocated)} ({formatPercent(totalAllocatedPct)})
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Remaining in Buffer: </span>
              <strong
                className={`font-extrabold ${
                  isOverAllocated
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-blue-700 dark:text-blue-300'
                }`}
              >
                {formatNaira(remainingBuffer)}
              </strong>
            </div>
          </div>

          {isOverAllocated && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Total allocated exceeds available cash in hand by {formatNaira(totalAllocated - maxAvailable)}. Please reduce allocations.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isOverAllocated || totalAllocated === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Fund Envelopes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
