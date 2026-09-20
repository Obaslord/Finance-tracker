import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import { Envelope, ExpenseRecord } from '../types';
import { calculateEnvelopeFunding } from '../utils/envelopeFunding';
import { formatNaira } from '../utils/formatters';

interface LowBalanceAlertProps {
  totalLiquidInHand: number;
  runwayDays: number;
  envelopes: Envelope[];
  survivalBufferCash: number;
  unplannedSpendTotal: number;
  expenses?: ExpenseRecord[];
  budgetCycleStartDate?: string;
  onOpenQuickSpend?: () => void;
  onNavigateToJobs?: () => void;
}

export const LowBalanceAlert: React.FC<LowBalanceAlertProps> = ({
  totalLiquidInHand,
  runwayDays,
  envelopes,
  survivalBufferCash,
  unplannedSpendTotal,
  expenses = [],
  budgetCycleStartDate,
  onOpenQuickSpend,
  onNavigateToJobs,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // CRITICAL BUSINESS RULE:
  // Once a target is reached, whether the money has been spent to the least or not,
  // it should NOT be recommended that the envelope is underfunded.
  // Only envelopes that have not been funded up to the target or that have not been funded at all
  // should be recommended for underfunding in the recommendation.
  const criticalFundingStatuses = envelopes
    .filter((e) => e.isEssentialForSurvival && e.monthlyTarget > 0)
    .map((e) => calculateEnvelopeFunding(e, expenses, budgetCycleStartDate))
    .filter((status) => status.isUnderfunded);

  const criticalEnvelopes = criticalFundingStatuses.map((s) => s.envelope);

  // Determine alert level
  const isZeroCash = totalLiquidInHand === 0;
  const isCriticalRunway = runwayDays < 15;
  const hasEmptyEssentials = criticalFundingStatuses.length > 0;

  // If everything is healthy and cash is plenty, show minimal calm reassurance
  const isHealthy = !isZeroCash && runwayDays >= 45 && criticalFundingStatuses.length === 0;

  if (isDismissed) return null;

  if (isHealthy) {
    return (
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 sm:p-4 text-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Resilient Cash Flow:</strong> All essential survival envelopes have reached their monthly targets and your runway covers {runwayDays} days.
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isZeroCash || isCriticalRunway
          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/90 dark:border-rose-800/70 text-rose-950 dark:text-rose-200'
          : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-800/70 text-amber-950 dark:text-amber-200'
      } p-4 sm:p-5 shadow-xs`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isZeroCash || isCriticalRunway
                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300'
            }`}
          >
            {isZeroCash ? (
              <AlertCircle className="w-4 h-4" />
            ) : isCriticalRunway ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">
                {isZeroCash
                  ? 'Cash at Hand is ₦0'
                  : isCriticalRunway
                  ? `Low Balance & Critical Runway (${runwayDays} Days Remaining)`
                  : 'Budget Alert: Essential Buckets Need Funding'}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isZeroCash || isCriticalRunway
                    ? 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200'
                    : 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                }`}
              >
                {isZeroCash ? 'Zero Balance' : isCriticalRunway ? 'Urgent Attention' : 'Action Recommended'}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {isZeroCash
                ? 'No liquid cash recorded yet. Upload your ongoing jobs or log paid milestones to distribute cash to your envelopes and buffer.'
                : `You currently have ${formatNaira(totalLiquidInHand)} in hand. ${
                    criticalFundingStatuses.length > 0
                      ? `${criticalFundingStatuses.length} essential survival bucket${
                          criticalFundingStatuses.length > 1 ? 's have' : ' has'
                        } not yet reached monthly funding targets.`
                      : 'All essential envelopes are funded to target for this cycle.'
                  }`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onNavigateToJobs && (
            <button
              onClick={onNavigateToJobs}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors ${
                isZeroCash || isCriticalRunway
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
              }`}
            >
              <span>{isZeroCash ? '+ Upload / Collect Job' : 'View Job Pipeline'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {criticalFundingStatuses.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded breakdown of underfunded essential envelopes */}
      {isExpanded && criticalFundingStatuses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-800/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {criticalFundingStatuses.map((status) => {
            const env = status.envelope;
            return (
              <div
                key={env.id}
                className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 rounded-xl p-2.5 text-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{env.name}</span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {status.fundingPercentage}% funded
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Funded: {formatNaira(status.totalFundedThisCycle)}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Deficit: {formatNaira(status.targetRemaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
