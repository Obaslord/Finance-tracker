import { AlertTriangle, Briefcase, Zap } from 'lucide-react';
import React from 'react';
import { Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

export interface LowBalanceAlertProps {
  totalLiquidInHand: number;
  runwayDays: number;
  envelopes: Envelope[];
  survivalBufferCash: number;
  unplannedSpendTotal: number;
  onOpenQuickSpend: () => void;
  onNavigateToJobs: () => void;
}

export const LowBalanceAlert: React.FC<LowBalanceAlertProps> = ({
  totalLiquidInHand,
  runwayDays,
  envelopes,
  survivalBufferCash,
  unplannedSpendTotal,
  onOpenQuickSpend,
  onNavigateToJobs,
}) => {
  // Alert conditions: runway < 14 days or liquid cash < ₦20,000 or essential envelopes underfunded
  const essentialEnvelopes = envelopes.filter((e) => e.isEssentialForSurvival);
  const unfundedEssentials = essentialEnvelopes.filter((e) => e.currentBalance === 0);

  const isLowRunway = runwayDays < 14;
  const isLowBuffer = survivalBufferCash < 10000;
  const hasUnfundedEssentials = unfundedEssentials.length > 0;

  if (!isLowRunway && !isLowBuffer && !hasUnfundedEssentials && unplannedSpendTotal < 20000) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400/40 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 text-amber-950 dark:text-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold">
              {isLowRunway
                ? `Tight Runway Alert (${runwayDays} Days Remaining)`
                : hasUnfundedEssentials
                ? `${unfundedEssentials.length} Essential Survival Bucket${unfundedEssentials.length > 1 ? 's' : ''} Need Funding`
                : 'Cash Flow Caution Advisory'}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
              Active Warning
            </span>
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed max-w-2xl">
            {isLowRunway
              ? `Available cash on hand (${formatNaira(totalLiquidInHand)}) covers approximately ${runwayDays} days of core survival burn. Prioritize closing client milestones or collecting invoices.`
              : hasUnfundedEssentials
              ? `Core envelopes like ${unfundedEssentials.map((e) => e.name).slice(0, 3).join(', ')} currently have ₦0. Allocate payouts immediately to secure survival runway.`
              : `Unplanned spending leaks (${formatNaira(unplannedSpendTotal)}) have accelerated this month. Keep non-essential envelope spending restricted.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenQuickSpend}
          className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Quick Spend</span>
        </button>
        <button
          type="button"
          onClick={onNavigateToJobs}
          className="px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>View Contracts</span>
        </button>
      </div>
    </div>
  );
};
