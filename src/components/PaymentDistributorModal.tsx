import { AlertCircle, Check, CheckCircle2, ChevronRight, Percent, Sparkles, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope, Job, Milestone } from '../types';
import { formatNaira, formatPercent } from '../utils/formatters';

interface PaymentDistributorModalProps {
  job: Job;
  milestone?: Milestone;
  envelopes: Envelope[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayout: (payoutData: {
    jobId: string;
    milestoneId?: string;
    grossAmount: number;
    taxAmount: number;
    netAmount: number;
    allocations: Record<string, number>;
    bufferAmount: number;
  }) => void;
}

export const PaymentDistributorModal: React.FC<PaymentDistributorModalProps> = ({
  job,
  milestone,
  envelopes,
  isOpen,
  onClose,
  onConfirmPayout,
}) => {
  if (!isOpen) return null;

  const grossAmount = milestone ? milestone.amount : job.totalAmount;
  // 10% tax reserved
  const taxAmount = Math.round(grossAmount * 0.1);
  const netAmount = grossAmount - taxAmount;

  // Initial prioritized allocation calculation
  const initialAllocations = useMemo(() => {
    const initial: Record<string, number> = {};
    let remaining = netAmount;

    // Prioritize survival envelopes first
    const sortedEnvelopes = [...envelopes].sort((a, b) => {
      if (a.isEssentialForSurvival && !b.isEssentialForSurvival) return -1;
      if (!a.isEssentialForSurvival && b.isEssentialForSurvival) return 1;
      const defA = Math.max(0, a.monthlyTarget - a.currentBalance);
      const defB = Math.max(0, b.monthlyTarget - b.currentBalance);
      return defB - defA;
    });

    for (const env of sortedEnvelopes) {
      const deficit = Math.max(0, env.monthlyTarget - env.currentBalance);
      if (deficit > 0 && remaining > 0) {
        const allocate = Math.min(deficit, remaining);
        initial[env.id] = allocate;
        remaining -= allocate;
      } else {
        initial[env.id] = 0;
      }
    }

    return initial;
  }, [envelopes, netAmount]);

  // Track allocation per envelope in Naira
  const [allocations, setAllocations] = useState<Record<string, number>>(initialAllocations);

  // Track user-entered percentage per envelope (allows flexible typing like "50", "33.3")
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>(() => {
    const initialPct: Record<string, string> = {};
    for (const env of envelopes) {
      const alloc = initialAllocations[env.id] || 0;
      if (netAmount > 0 && alloc > 0) {
        initialPct[env.id] = ((alloc / netAmount) * 100).toFixed(1).replace(/\.0$/, '');
      } else {
        initialPct[env.id] = '';
      }
    }
    return initialPct;
  });

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const totalAllocatedPct = netAmount > 0 ? (totalAllocated / netAmount) * 100 : 0;
  const unallocatedBuffer = Math.max(0, netAmount - totalAllocated);
  const unallocatedBufferPct = netAmount > 0 ? (unallocatedBuffer / netAmount) * 100 : 0;
  const isOverAllocated = totalAllocated > netAmount;

  // Direct editing of the Need Naira (₦) column
  const handleAllocationChange = (envId: string, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    const safeVal = Math.max(0, val);
    setAllocations((prev) => ({
      ...prev,
      [envId]: safeVal,
    }));

    // Synchronize the percentage column
    if (netAmount > 0 && safeVal > 0) {
      const pct = ((safeVal / netAmount) * 100).toFixed(1).replace(/\.0$/, '');
      setPercentInputs((prev) => ({ ...prev, [envId]: pct }));
    } else {
      setPercentInputs((prev) => ({ ...prev, [envId]: '' }));
    }
  };

  // Editing of the % of Net column (User Issue 3)
  const handlePercentChange = (envId: string, pctStr: string) => {
    setPercentInputs((prev) => ({
      ...prev,
      [envId]: pctStr,
    }));

    if (pctStr.trim() === '') {
      setAllocations((prev) => ({
        ...prev,
        [envId]: 0,
      }));
      return;
    }

    const pct = parseFloat(pctStr);
    if (!isNaN(pct)) {
      // Automatically load into the need Naira column while remaining flexible
      const naira = Math.max(0, Math.round((pct / 100) * netAmount));
      setAllocations((prev) => ({
        ...prev,
        [envId]: naira,
      }));
    }
  };

  // Fill exact remaining deficit for monthly target
  const handleFillNeed = (env: Envelope) => {
    const neededToMax = Math.max(0, env.monthlyTarget - env.currentBalance);
    setAllocations((prev) => ({
      ...prev,
      [env.id]: neededToMax,
    }));

    if (netAmount > 0 && neededToMax > 0) {
      const pct = ((neededToMax / netAmount) * 100).toFixed(1).replace(/\.0$/, '');
      setPercentInputs((prev) => ({ ...prev, [env.id]: pct }));
    } else {
      setPercentInputs((prev) => ({ ...prev, [env.id]: '' }));
    }
  };

  const handleAutoFillSurvival = () => {
    const updatedAlloc: Record<string, number> = {};
    const updatedPct: Record<string, string> = {};
    let remaining = netAmount;

    for (const env of envelopes.filter((e) => e.isEssentialForSurvival)) {
      const deficit = Math.max(0, env.monthlyTarget - env.currentBalance);
      const alloc = Math.min(deficit, remaining);
      updatedAlloc[env.id] = alloc;
      remaining -= alloc;
      updatedPct[env.id] = netAmount > 0 && alloc > 0 ? ((alloc / netAmount) * 100).toFixed(1).replace(/\.0$/, '') : '';
    }

    for (const env of envelopes.filter((e) => !e.isEssentialForSurvival)) {
      const deficit = Math.max(0, env.monthlyTarget - env.currentBalance);
      const alloc = Math.min(deficit, remaining);
      updatedAlloc[env.id] = alloc;
      remaining -= alloc;
      updatedPct[env.id] = netAmount > 0 && alloc > 0 ? ((alloc / netAmount) * 100).toFixed(1).replace(/\.0$/, '') : '';
    }

    setAllocations(updatedAlloc);
    setPercentInputs(updatedPct);
  };

  const handleSendAllToBuffer = () => {
    const zeroedAlloc: Record<string, number> = {};
    const zeroedPct: Record<string, string> = {};
    for (const env of envelopes) {
      zeroedAlloc[env.id] = 0;
      zeroedPct[env.id] = '';
    }
    setAllocations(zeroedAlloc);
    setPercentInputs(zeroedPct);
  };

  const handleConfirm = () => {
    if (isOverAllocated) return;
    onConfirmPayout({
      jobId: job.id,
      milestoneId: milestone?.id,
      grossAmount,
      taxAmount,
      netAmount,
      allocations,
      bufferAmount: unallocatedBuffer,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Payment Received
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {milestone ? `Milestone: ${milestone.title}` : 'Full Job Payout'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{job.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl text-center">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Gross Payment</p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{formatNaira(grossAmount)}</p>
          </div>
          <div className="border-x border-slate-200 dark:border-slate-700 px-2">
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase flex items-center justify-center gap-1">
              10% Tax Reserve
            </p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400">-{formatNaira(taxAmount)}</p>
            <span className="text-[10px] text-slate-400">Locked safely</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Net to Allocate</p>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">{formatNaira(netAmount)}</p>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">90% available</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 mb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Distribute to Envelopes
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Enter a percentage (%) or type amount directly in Naira (₦). Both stay flexible.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFillSurvival}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Deficits
            </button>
            <button
              onClick={handleSendAllToBuffer}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors"
            >
              Put All in Buffer
            </button>
          </div>
        </div>

        {/* Column Headers for clarity */}
        <div className="hidden sm:flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 pb-1 border-b border-slate-100 dark:border-slate-800">
          <span>Envelope &amp; Need</span>
          <div className="flex items-center gap-2">
            <span className="w-20 text-center">% of Net</span>
            <span className="w-28 text-center">Need Naira (₦)</span>
            <span className="w-16 text-center">Action</span>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-1">
          {envelopes.map((env) => {
            const currentAlloc = allocations[env.id] || 0;
            const currentPct = percentInputs[env.id] ?? '';
            const neededToMax = Math.max(0, env.monthlyTarget - env.currentBalance);

            return (
              <div
                key={env.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {env.name}
                    </span>
                    {env.isEssentialForSurvival && (
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                        Survival
                      </span>
                    )}
                    {env.savingsGoal && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]" title={env.savingsGoal.title}>
                        🎯 {env.savingsGoal.title || 'Goal'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Now: {formatNaira(env.currentBalance)}</span>
                    <span>•</span>
                    <span className={neededToMax > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-emerald-600 dark:text-emerald-400'}>
                      {neededToMax > 0 ? `Target gap ${formatNaira(neededToMax)}` : 'Full Target Met'}
                    </span>
                    {env.savingsGoal && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          Goal: {formatPercent(Math.min(100, Math.round(((env.currentBalance + currentAlloc) / env.savingsGoal.targetAmount) * 100)))}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* % of Net Column (User Issue 3) */}
                  <div className="relative w-20">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={currentPct}
                      placeholder="0"
                      onChange={(e) => handlePercentChange(env.id, e.target.value)}
                      className="w-full pl-2 pr-6 py-1.5 text-xs font-semibold text-right bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Enter percentage of Net to allocate"
                    />
                    <span className="absolute right-2 top-2 text-slate-400 text-xs font-semibold pointer-events-none">%</span>
                  </div>

                  {/* Need Naira (₦) Column (Flexible for direct edit) */}
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-semibold pointer-events-none">₦</span>
                    <input
                      type="number"
                      min="0"
                      value={currentAlloc === 0 ? '' : currentAlloc}
                      placeholder="0"
                      onChange={(e) => handleAllocationChange(env.id, e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold text-right bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Allocation amount in Naira (flexible)"
                    />
                  </div>

                  {/* Fill Need Button */}
                  <button
                    type="button"
                    onClick={() => handleFillNeed(env)}
                    className="w-16 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-1.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg transition-colors text-center"
                    title="Fill exactly what's needed for this month's target"
                  >
                    Fill Need
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Total Assigned to Envelopes:</span>
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(totalAllocated)}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5 font-semibold">({formatPercent(Math.round(totalAllocatedPct))} of Net)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              Remaining to Survival Emergency Buffer:
            </span>
            <div className="text-right">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {formatNaira(unallocatedBuffer)}
              </span>
              <span className="text-emerald-600/80 dark:text-emerald-400/80 ml-1.5 font-semibold">({formatPercent(Math.round(unallocatedBufferPct))})</span>
            </div>
          </div>

          {isOverAllocated && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You have allocated {formatNaira(totalAllocated - netAmount)} ({formatPercent(Math.round(totalAllocatedPct))} - exceeds 100%) more than the net payment of {formatNaira(netAmount)}. Please adjust.
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isOverAllocated}
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            Lock In & Distribute Payment
          </button>
        </div>
      </div>
    </div>
  );
};
